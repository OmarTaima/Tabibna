import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

type StubReply = {
  status: number;
  content?: string;
  finishReason?: string;
};

const validContent = {
  detectedLanguage: "en",
  normalized: {
    en: "Reported symptom: headache.",
    ar: "العرض المذكور: صداع.",
  },
  terminology: [
    {
      english: "Headache",
      arabic: "صداع",
      kind: "symptom",
      origin: "reported",
      explanation: {
        en: "Pain or discomfort in the head.",
        ar: "ألم أو انزعاج في منطقة الرأس.",
      },
      certainty: "stated",
    },
  ],
  clarifications: [],
  clinicalInterpretations: [],
};

const arabicSpellingContent = {
  detectedLanguage: "ar-EG",
  normalized: {
    en: "Back pain with paresthesia.",
    ar: "ألم في الظهر مع تنمل.",
  },
  terminology: [
    {
      english: "Paresthesia",
      arabic: "تنمل",
      kind: "symptom",
      origin: "reported",
      explanation: {
        en: "Abnormal skin sensation such as tingling or numbness.",
        ar: "إحساس غير طبيعي في الجلد مثل التنمل.",
      },
      certainty: "stated",
    },
  ],
  clarifications: [
    {
      label: { en: "Numbness pattern", ar: "نمط التنمل" },
      question: { en: "Where do you feel the numbness?", ar: "أين تشعر بالتنمل؟" },
    },
  ],
  clinicalInterpretations: [
    {
      label: { en: "Possible nerve involvement", ar: "احتمال التنمل" },
      detail: {
        en: "Back pain combined with paresthesia may reflect nerve involvement, but this is a pattern observation, not a diagnosis.",
        ar: "قد يشير ألم الظهر المصحوب بالتنمل إلى تأثر الأعصاب، لكن هذه ملاحظة لنمط الأعراض وليست تشخيصًا.",
      },
      basis: {
        en: "The description mentions paresthesia.",
        ar: "يذكر الوصف التنمل.",
      },
      confidence: "low",
    },
  ],
};

const receivedRequests: Record<string, unknown>[] = [];
const receivedAuthorizations: Array<string | null> = [];

function readBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    request.on("data", (chunk: Buffer) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    request.on("error", reject);
  });
}

function chooseReply(description: string, model: string): StubReply {
  if (description.includes("BAD_JSON_SENTINEL")) {
    return { status: 200, content: "not json at all" };
  }
  if (description.includes("INVALID_SCHEMA_SENTINEL")) {
    return { status: 200, content: JSON.stringify({ detectedLanguage: "en" }) };
  }
  if (description.includes("UPSTREAM_ERROR_SENTINEL")) {
    return { status: 500 };
  }
  if (description.includes("DAILY_QUOTA_SENTINEL")) {
    return { status: 429 };
  }
  if (description.includes("TRUNCATED_SENTINEL") && model === "stub-model") {
    return { status: 200, content: JSON.stringify(validContent), finishReason: "length" };
  }
  if (description.includes("ARABIC_SPELLING_SENTINEL")) {
    return { status: 200, content: JSON.stringify(arabicSpellingContent) };
  }
  return { status: 200, content: JSON.stringify(validContent) };
}

const stub = createServer((request: IncomingMessage, response: ServerResponse) => {
  void (async () => {
    if (request.method !== "POST" || request.url !== "/v1/chat/completions") {
      response.writeHead(404).end();
      return;
    }

    const rawBody = await readBody(request);
    const parsed: unknown = JSON.parse(rawBody);
    if (typeof parsed !== "object" || parsed === null) {
      response.writeHead(400).end();
      return;
    }

    const body = parsed as Record<string, unknown>;
    receivedRequests.push(body);
    receivedAuthorizations.push(request.headers.authorization ?? null);

    const messages = body.messages;
    let description = "";
    if (Array.isArray(messages)) {
      for (const message of messages) {
        if (
          typeof message === "object" &&
          message !== null &&
          (message as Record<string, unknown>).role === "user" &&
          typeof (message as Record<string, unknown>).content === "string"
        ) {
          description = (message as Record<string, unknown>).content as string;
        }
      }
    }

    const reply = chooseReply(description, typeof body.model === "string" ? body.model : "");
    if (reply.status === 429) {
      response.writeHead(429, {
        "Content-Type": "application/json",
        "x-ratelimit-limit": "50",
        "x-ratelimit-remaining": "0",
        "x-ratelimit-reset": "1792540800000",
      });
      response.end(
        JSON.stringify({
          error: {
            message:
              "Rate limit exceeded: free-models-per-day. Add 10 credits to unlock 1000 free model requests per day",
            code: 429,
            metadata: { limit_source: "openrouter_free_tier_daily" },
          },
        }),
      );
      return;
    }
    if (reply.status !== 200) {
      response.writeHead(reply.status, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "stub upstream failure" }));
      return;
    }

    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({
        choices: [
          {
            message: { role: "assistant", content: reply.content },
            finish_reason: reply.finishReason ?? "stop",
          },
        ],
      }),
    );
  })().catch(() => {
    if (!response.headersSent) response.writeHead(500);
    response.end();
  });
});

stub.listen(0, "127.0.0.1");
await once(stub, "listening");
const stubAddress = stub.address();
assert.ok(stubAddress !== null && typeof stubAddress === "object");
const stubPort = stubAddress.port;

process.env.NODE_ENV = "test";
process.env.AI_API_KEY = "stub-key-not-real";
process.env.AI_BASE_URL = `http://127.0.0.1:${stubPort}/v1`;
process.env.AI_MODEL = "stub-model";
process.env.AI_FALLBACK_MODEL = "stub-fallback-model";
process.env.AI_REASONING_ENABLED = "true";
process.env.AI_REASONING_EFFORT = "";
process.env.AI_MAX_TOKENS = "12000";
process.env.ALLOWED_ORIGINS = "http://localhost:5173";
process.env.ANALYZE_RATE_LIMIT = "1000";

const { createApp } = await import("../src/app");
const { analyzeResponseSchema, apiErrorSchema } = await import("../../shared/contract");

const app = createApp();
const server = app.listen(0);
await once(server, "listening");

const address = server.address();
assert.ok(address !== null && typeof address === "object", "server should expose an address");
const baseUrl = `http://127.0.0.1:${address.port}`;

async function postAnalyze(description: string) {
  const response = await fetch(`${baseUrl}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description, locale: "en" }),
  });
  const text = await response.text();
  return { status: response.status, body: JSON.parse(text) as unknown };
}

async function postAnalyzeWithLogs(description: string) {
  const lines: string[] = [];
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    lines.push(args.map((value) => String(value)).join(" "));
  };
  try {
    const result = await postAnalyze(description);
    return { result, lines };
  } finally {
    console.error = originalConsoleError;
  }
}

function passed(name: string): void {
  console.log(`ok - ${name}`);
}

try {
  const description = "I have had a headache since yesterday.";
  const success = await postAnalyze(description);
  assert.equal(success.status, 200);
  const analysis = analyzeResponseSchema.parse(success.body).analysis;

  assert.equal(analysis.meta.mode, "live");
  assert.equal(analysis.meta.model, "stub-model");
  assert.equal(analysis.original, description);
  assert.equal(analysis.detectedLanguage, "en");
  assert.equal(analysis.terminology.length, 1);
  assert.ok(analysis.terminology[0].id.startsWith(`${analysis.id}-term-`));
  const rawAnalysis = (success.body as { analysis: Record<string, unknown> }).analysis;
  assert.equal("safety" in rawAnalysis, false, "analysis must not include a safety block");
  assert.equal(
    "safetySourceVersion" in (rawAnalysis.meta as Record<string, unknown>),
    false,
    "analysis meta must not include a safety source version",
  );
  assert.ok(analysis.meta.notice.en.includes("AI-generated"));
  assert.ok(analysis.disclaimer.en.includes("not a diagnosis"));

  const sent = receivedRequests[0];
  assert.ok(sent !== undefined);
  assert.equal(sent.model, "stub-model");
  assert.equal(sent.temperature, 0.1);
  assert.equal(sent.max_tokens, 12000);
  assert.deepEqual(sent.reasoning, { enabled: true });
  assert.equal(sent.reasoning_effort, undefined);
  assert.deepEqual(sent.response_format, { type: "json_object" });
  assert.equal(sent.stream, false);
  assert.equal(receivedAuthorizations[0], "Bearer stub-key-not-real");
  passed("live mode returns validated AI content without a safety block");

  const spellingDescription = "ARABIC_SPELLING_SENTINEL: I have back pain with numbness.";
  const spelling = await postAnalyze(spellingDescription);
  assert.equal(spelling.status, 200);
  const spellingAnalysis = analyzeResponseSchema.parse(spelling.body).analysis;

  assert.equal(spellingAnalysis.original, spellingDescription);
  assert.equal(spellingAnalysis.normalized.en, "Back pain with paresthesia.");
  assert.equal(spellingAnalysis.normalized.ar, "ألم في الظهر مع تنميل.");
  assert.equal(spellingAnalysis.terminology[0]?.arabic, "تنميل");
  assert.equal(
    spellingAnalysis.terminology[0]?.explanation.ar,
    "إحساس غير طبيعي في الجلد مثل التنميل.",
  );
  assert.equal(
    spellingAnalysis.terminology[0]?.explanation.en,
    "Abnormal skin sensation such as tingling or numbness.",
  );
  assert.equal(spellingAnalysis.clarifications[0]?.label.ar, "نمط التنميل");
  assert.equal(spellingAnalysis.clarifications[0]?.question.ar, "أين تشعر بالتنميل؟");
  assert.equal(spellingAnalysis.clinicalInterpretations[0]?.label.ar, "احتمال التنميل");
  assert.equal(
    spellingAnalysis.clinicalInterpretations[0]?.detail.ar,
    "قد يشير ألم الظهر المصحوب بالتنميل إلى تأثر الأعصاب، لكن هذه ملاحظة لنمط الأعراض وليست تشخيصًا.",
  );
  assert.equal(
    spellingAnalysis.clinicalInterpretations[0]?.basis.ar,
    "يذكر الوصف التنميل.",
  );

  const correctedArabicFields = [
    spellingAnalysis.normalized.ar,
    ...spellingAnalysis.terminology.flatMap((item) => [item.arabic, item.explanation.ar]),
    ...spellingAnalysis.clarifications.flatMap((item) => [item.label.ar, item.question.ar]),
    ...spellingAnalysis.clinicalInterpretations.flatMap((item) => [
      item.label.ar,
      item.detail.ar,
      item.basis.ar,
    ]),
  ];

  assert.equal(correctedArabicFields.length, 8);
  for (const field of correctedArabicFields) {
    assert.ok(field.includes("تنميل"), `expected corrected spelling in: ${field}`);
    assert.ok(!field.includes("تنمل"), `expected no misspelling in: ${field}`);
  }
  passed("AI-generated Arabic paresthesia spelling is corrected after validation");

  const badJsonRun = await postAnalyzeWithLogs(
    "BAD_JSON_SENTINEL: I have a headache since yesterday.",
  );
  assert.equal(badJsonRun.result.status, 502);
  assert.equal(apiErrorSchema.parse(badJsonRun.result.body).code, "AI_INVALID_OUTPUT");
  assert.equal("analysis" in (badJsonRun.result.body as object), false);

  const invalidSchemaRun = await postAnalyzeWithLogs(
    "INVALID_SCHEMA_SENTINEL: I have a headache since yesterday.",
  );
  assert.equal(invalidSchemaRun.result.status, 502);
  assert.equal(apiErrorSchema.parse(invalidSchemaRun.result.body).code, "AI_INVALID_OUTPUT");

  const badJsonLog = badJsonRun.lines.join("\n");
  assert.ok(badJsonLog.includes('"reason":"json_parse"'), "should log the parse failure reason");
  assert.ok(badJsonLog.includes('"parseError":"syntax_error"'), "should log a parse error marker");
  assert.ok(badJsonLog.includes('"finishReason":"stop"'), "should log finishReason");
  assert.ok(badJsonLog.includes('"contentLength":'), "should log content length");
  assert.ok(badJsonLog.includes('"completionTokens":'), "should log completion tokens");
  assert.ok(badJsonLog.includes('"reasoningTokens":'), "should log reasoning tokens");
  assert.ok(badJsonLog.includes('"requestId":"'), "should log the requestId");
  assert.ok(!badJsonLog.includes("not json at all"), "must never log response content");
  assert.ok(!badJsonLog.includes("BAD_JSON_SENTINEL"), "must never log the description");
  assert.ok(!badJsonLog.includes("stub-key-not-real"), "must never log the API key");

  const invalidSchemaLog = invalidSchemaRun.lines.join("\n");
  assert.ok(invalidSchemaLog.includes('"reason":"schema"'), "should log the schema reason");
  assert.ok(
    invalidSchemaLog.includes('"path":"normalized"'),
    "should log the failing field path",
  );
  assert.ok(
    invalidSchemaLog.includes('"code":"invalid_type"'),
    "should log the Zod issue code",
  );
  assert.ok(
    !invalidSchemaLog.includes("INVALID_SCHEMA_SENTINEL"),
    "must never log the description",
  );
  assert.ok(!invalidSchemaLog.includes("stub-key-not-real"), "must never log the API key");

  const upstreamError = await postAnalyze(
    "UPSTREAM_ERROR_SENTINEL: I have a headache since yesterday.",
  );
  assert.equal(upstreamError.status, 502);
  assert.equal(apiErrorSchema.parse(upstreamError.body).code, "AI_ERROR");
  passed("invalid AI JSON, schema failures, and upstream errors return 502 without fallback");

  const dailyQuota = await postAnalyze(
    "DAILY_QUOTA_SENTINEL: I have a headache since yesterday.",
  );
  assert.equal(dailyQuota.status, 429);
  assert.equal(apiErrorSchema.parse(dailyQuota.body).code, "AI_DAILY_QUOTA");
  assert.equal("analysis" in (dailyQuota.body as object), false);
  passed("upstream daily quota exhaustion returns 429 AI_DAILY_QUOTA, not 502");

  const truncated = await postAnalyze(
    "TRUNCATED_SENTINEL: I have a headache since yesterday.",
  );
  assert.equal(truncated.status, 200);
  const truncatedAnalysis = analyzeResponseSchema.parse(truncated.body).analysis;
  assert.equal(truncatedAnalysis.terminology.length, 1);
  const truncatedModels = receivedRequests.map((request) => request.model);
  assert.ok(
    truncatedModels.includes("stub-model") && truncatedModels.includes("stub-fallback-model"),
    "a truncated response should fall back to the secondary model",
  );
  passed("a truncated response falls back to the secondary model and still returns content");

  console.log("All server live-AI tests passed.");
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  const appClosed = new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  server.closeAllConnections();
  await appClosed;

  const stubClosed = new Promise<void>((resolve, reject) => {
    stub.close((error) => (error ? reject(error) : resolve()));
  });
  stub.closeAllConnections();
  await stubClosed;
}
