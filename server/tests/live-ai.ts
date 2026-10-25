import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

type StubReply = {
  status: number;
  content?: string;
  finishReason?: string;
};

type Operation =
  | "follow_up_questions"
  | "follow_up_decision"
  | "final_analysis"
  | "echo_glossary";

const followUpContent = {
  questions: [
    {
      en: "When did the headache start, and was it sudden or gradual?",
      ar: "متى بدأ الصداع، وهل كان مفاجئًا أم تدريجيًا؟",
    },
    {
      en: "How severe is the headache at its worst, and what makes it better or worse?",
      ar: "ما مدى شدة الصداع في أسوأ حالاته، وما الذي يخففه أو يزيده؟",
    },
  ],
};

const finalContent = {
  detectedLanguage: "en",
  normalized: {
    en: "Reported symptom: headache since yesterday, worse with fatigue.",
    ar: "العرض المذكور: صداع منذ يوم أمس، يزداد مع التعب.",
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
  clarifications: [
    {
      label: { en: "Onset", ar: "البداية" },
      question: { en: "When did it start?", ar: "متى بدأ؟" },
    },
  ],
  clinicalInterpretations: [],
  impression: {
    primary: { en: "Tension-type headache", ar: "الصداع التوتري" },
    confidence: "moderate",
    differentials: [
      { en: "Migraine without aura", ar: "الشقيقة بدون هالة" },
      { en: "Viral illness with headache", ar: "عدوى فيروسية مصحوبة بصداع" },
    ],
    rationale: {
      en: "The mild headache worsened by fatigue and the absence of fever or light sensitivity reported in the answers fit this pattern best.",
      ar: "الصداع الخفيف الذي يزداد مع التعب وعدم وجود حرارة أو حساسية للضوء كما ورد في الإجابات يناسب هذا النمط أكثر من غيره.",
    },
  },
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
  impression: {
    primary: { en: "Lumbar radiculopathy", ar: "اعتلال جذر عصبي قطني مع تنمل" },
    confidence: "low",
    differentials: [{ en: "Muscular back strain", ar: "شد عضلي في الظهر مع تنمل" }],
    rationale: {
      en: "Back pain with paresthesia reported in the answers fits this pattern best.",
      ar: "ألم الظهر المصحوب بالتنمل كما ورد في الإجابات يناسب هذا النمط أكثر من غيره.",
    },
  },
};

const echoContent = {
  summary: {
    en: "This report records ultrasound measurements of the heart's chambers, valves, and blood flow. The terms below explain what each item means in general.",
    ar: "يسجّل هذا التقرير قياسات بالموجات فوق الصوتية لحجرات القلب وصماماته وتدفق الدم. وتوضّح المصطلحات أدناه معنى كل عنصر بشكل عام.",
  },
  terms: [
    {
      term: { en: "Ejection fraction (EF)", ar: "الكسر القذفي (EF)" },
      explanation: {
        en: "The share of blood in the left ventricle that is pumped out with each beat, shown as a percentage.",
        ar: "نسبة الدم في البطين الأيسر التي تُضخّ مع كل نبضة، وتُعرض كنسبة مئوية.",
      },
    },
    {
      term: { en: "Mitral regurgitation", ar: "قلس الصمام التاجي" },
      explanation: {
        en: "Blood flowing backwards through the mitral valve because it does not close completely.",
        ar: "رجوع الدم عبر الصمام التاجي لأنه لا يُغلق تمامًا.",
      },
    },
  ],
};

const SENTINELS = [
  "BAD_JSON_SENTINEL",
  "INVALID_SCHEMA_SENTINEL",
  "UPSTREAM_ERROR_SENTINEL",
  "DAILY_QUOTA_SENTINEL",
  "TRUNCATED_SENTINEL",
  "ARABIC_SPELLING_SENTINEL",
  "DECISION_SPELLING_SENTINEL",
  "ASK_MORE_SENTINEL",
] as const;

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

function readMessage(messages: unknown, role: string): string {
  if (!Array.isArray(messages)) return "";
  for (const message of messages) {
    if (typeof message !== "object" || message === null) continue;
    const record = message as Record<string, unknown>;
    if (record.role === role && typeof record.content === "string") return record.content;
  }
  return "";
}

function readOperation(systemPrompt: string): Operation | null {
  if (systemPrompt.includes("STAGE: follow-up questions")) return "follow_up_questions";
  if (systemPrompt.includes("STAGE: follow-up decision")) return "follow_up_decision";
  if (systemPrompt.includes("STAGE: final assessment")) return "final_analysis";
  if (systemPrompt.includes("STAGE: echocardiography glossary")) return "echo_glossary";
  return null;
}

function contentFor(operation: Operation): unknown {
  switch (operation) {
    case "follow_up_questions":
      return followUpContent;
    case "follow_up_decision":
      return { decision: "final", analysis: finalContent };
    case "final_analysis":
      return finalContent;
    case "echo_glossary":
      return echoContent;
  }
}

function chooseReply(systemPrompt: string, userPrompt: string, model: string): StubReply {
  const operation = readOperation(systemPrompt);
  if (operation === null) {
    return { status: 400 };
  }

  const sentinel = SENTINELS.find((item) => userPrompt.includes(item));
  switch (sentinel) {
    case "BAD_JSON_SENTINEL":
      return { status: 200, content: "not json at all" };
    case "INVALID_SCHEMA_SENTINEL":
      return { status: 200, content: JSON.stringify({ detectedLanguage: "en" }) };
    case "UPSTREAM_ERROR_SENTINEL":
      return { status: 500 };
    case "DAILY_QUOTA_SENTINEL":
      return { status: 429 };
    case "TRUNCATED_SENTINEL":
      return {
        status: 200,
        content: JSON.stringify(contentFor(operation)),
        finishReason: model === "stub-model" ? "length" : "stop",
      };
    case "ARABIC_SPELLING_SENTINEL":
      return { status: 200, content: JSON.stringify(arabicSpellingContent) };
    case "DECISION_SPELLING_SENTINEL":
      return {
        status: 200,
        content: JSON.stringify(
          operation === "follow_up_decision"
            ? { decision: "final", analysis: arabicSpellingContent }
            : contentFor(operation),
        ),
      };
    case "ASK_MORE_SENTINEL":
      return {
        status: 200,
        content: JSON.stringify(
          operation === "follow_up_decision"
            ? { decision: "ask", questions: followUpContent.questions }
            : contentFor(operation),
        ),
      };
    default:
      return { status: 200, content: JSON.stringify(contentFor(operation)) };
  }
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

    const systemPrompt = readMessage(body.messages, "system");
    const userPrompt = readMessage(body.messages, "user");
    const reply = chooseReply(systemPrompt, userPrompt, typeof body.model === "string" ? body.model : "");

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

const { createApp } = await import("../src/app.ts");
const { analyzeResponseSchema, apiErrorSchema, echoResponseSchema } = await import(
  "../../shared/contract.ts"
);
type AnalyzeResponse = import("../../shared/contract.ts").AnalyzeResponse;
type FollowUpAnswer = import("../../shared/contract.ts").FollowUpAnswer;
type FollowUpResponse = import("../../shared/contract.ts").FollowUpResponse;
type MedicalAnalysis = import("../../shared/contract.ts").MedicalAnalysis;

const app = createApp();
const server = app.listen(0);
await once(server, "listening");

const address = server.address();
assert.ok(address !== null && typeof address === "object", "server should expose an address");
const baseUrl = `http://127.0.0.1:${address.port}`;

async function postJson(path: string, payload: unknown) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  return { status: response.status, body: JSON.parse(text) as unknown };
}

type AnalyzePayload = {
  description: string;
  locale?: "en" | "ar";
  round?: number;
  answers?: FollowUpAnswer[];
};

function postAnalyze(payload: AnalyzePayload) {
  return postJson("/api/analyze", { locale: "en", round: 0, answers: [], ...payload });
}

function postEcho(payload: { text: string; locale: "en" | "ar" }) {
  return postJson("/api/echo", payload);
}

async function postAnalyzeWithLogs(payload: AnalyzePayload) {
  const lines: string[] = [];
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  console.error = (...args: unknown[]) => {
    lines.push(args.map((value) => String(value)).join(" "));
  };
  console.warn = (...args: unknown[]) => {
    lines.push(args.map((value) => String(value)).join(" "));
  };
  try {
    const result = await postAnalyze(payload);
    return { result, lines };
  } finally {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  }
}

function lastRequest(): Record<string, unknown> {
  const request = receivedRequests[receivedRequests.length - 1];
  assert.ok(request !== undefined, "the stub should have received a request");
  return request;
}

function messagesOf(request: Record<string, unknown>): { system: string; user: string } {
  return {
    system: readMessage(request.messages, "system"),
    user: readMessage(request.messages, "user"),
  };
}

function expectFollowUp(body: AnalyzeResponse): FollowUpResponse {
  assert.equal(body.status, "follow_up");
  if (body.status !== "follow_up") throw new Error("expected a follow_up response");
  return body;
}

function expectComplete(body: AnalyzeResponse): MedicalAnalysis {
  assert.equal(body.status, "complete");
  if (body.status !== "complete") throw new Error("expected a complete response");
  return body.analysis;
}

function passed(name: string): void {
  console.log(`ok - ${name}`);
}

try {
  const description = "I have had a headache since yesterday, and it gets worse when I am tired.";

  const firstRound = await postAnalyze({ description, locale: "en", round: 0, answers: [] });
  assert.equal(firstRound.status, 200);
  const followUp = expectFollowUp(analyzeResponseSchema.parse(firstRound.body));
  assert.equal(followUp.round, 1);
  assert.equal(followUp.questions.length, 2);
  assert.ok(followUp.questions[0].id.length > 0);
  assert.equal(followUp.meta.mode, "live");
  assert.equal(followUp.meta.model, "stub-model");
  assert.ok(followUp.meta.notice.en.includes("AI-generated"));
  assert.equal("analysis" in followUp, false, "a follow-up response must not carry an analysis");

  const sentFollowUp = lastRequest();
  assert.equal(sentFollowUp.model, "stub-model");
  assert.equal(sentFollowUp.temperature, 0.1);
  assert.equal(sentFollowUp.max_tokens, 12000);
  assert.deepEqual(sentFollowUp.reasoning, { enabled: true });
  assert.equal(sentFollowUp.reasoning_effort, undefined);
  assert.deepEqual(sentFollowUp.response_format, { type: "json_object" });
  assert.equal(sentFollowUp.stream, false);
  assert.equal(receivedAuthorizations[receivedAuthorizations.length - 1], "Bearer stub-key-not-real");

  const followUpMessages = messagesOf(sentFollowUp);
  assert.ok(followUpMessages.system.includes("STAGE: follow-up questions"));
  assert.ok(followUpMessages.system.includes("You are VivaValve"));
  assert.ok(followUpMessages.user.includes(description));
  assert.ok(followUpMessages.user.includes('"interfaceLocale":"en"'));
  passed("live round 0 asks the AI for follow-up questions and returns them");

  const answers: FollowUpAnswer[] = followUp.questions.map((question) => ({
    questionId: question.id,
    question: question.en,
    answer: "It started yesterday evening, mild, and there is no fever or light sensitivity.",
  }));

  const completeRun = await postAnalyze({ description, locale: "en", round: 1, answers });
  assert.equal(completeRun.status, 200);
  const analysis = expectComplete(analyzeResponseSchema.parse(completeRun.body));
  assert.equal(analysis.meta.mode, "live");
  assert.equal(analysis.meta.model, "stub-model");
  assert.equal(analysis.original, description);
  assert.equal(analysis.detectedLanguage, "en");
  assert.equal(analysis.terminology.length, 1);
  assert.ok(analysis.terminology[0].id.startsWith(`${analysis.id}-term-`));
  assert.ok(analysis.clarifications[0].id.startsWith(`${analysis.id}-clarification-`));
  assert.equal(analysis.impression.primary.en, "Tension-type headache");
  assert.equal(analysis.impression.confidence, "moderate");
  assert.equal(analysis.impression.differentials.length, 2);
  assert.ok(analysis.impression.rationale.en.includes("answers"));
  assert.ok(analysis.meta.notice.en.includes("AI-generated"));
  assert.ok(analysis.disclaimer.en.includes("not a confirmed diagnosis"));

  const rawAnalysis = (completeRun.body as { analysis: Record<string, unknown> }).analysis;
  assert.equal("safety" in rawAnalysis, false, "analysis must not include a safety block");
  assert.equal(
    "safetySourceVersion" in (rawAnalysis.meta as Record<string, unknown>),
    false,
    "analysis meta must not include a safety source version",
  );

  const decisionMessages = messagesOf(lastRequest());
  assert.ok(decisionMessages.system.includes("STAGE: follow-up decision"));
  assert.ok(decisionMessages.user.includes(description));
  assert.ok(decisionMessages.user.includes('"answer":"It started yesterday evening'));
  passed("live round 1 finalises the assessment with a specific impression");

  const askDescription = "ASK_MORE_SENTINEL: I have had a headache since yesterday.";
  const askRound = await postAnalyze({
    description: askDescription,
    locale: "en",
    round: 1,
    answers: [
      { questionId: "q1", question: "When did it start?", answer: "Yesterday evening." },
    ],
  });
  assert.equal(askRound.status, 200);
  const secondRound = expectFollowUp(analyzeResponseSchema.parse(askRound.body));
  assert.equal(secondRound.round, 2);
  assert.equal(secondRound.questions.length, 2);
  assert.equal(secondRound.meta.mode, "live");
  passed("live round 1 can ask one more round of questions");

  const finalRun = await postAnalyze({ description, locale: "en", round: 2, answers });
  assert.equal(finalRun.status, 200);
  const finalAnalysis = expectComplete(analyzeResponseSchema.parse(finalRun.body));
  assert.equal(finalAnalysis.impression.primary.en, "Tension-type headache");
  const finalMessages = messagesOf(lastRequest());
  assert.ok(finalMessages.system.includes("STAGE: final assessment"));
  assert.ok(finalMessages.user.includes('"answer":"It started yesterday evening'));
  passed("live round 2 forces the final assessment prompt");

  const spellingDescription = "ARABIC_SPELLING_SENTINEL: I have back pain with numbness.";
  const spellingRun = await postAnalyze({
    description: spellingDescription,
    locale: "ar",
    round: 2,
    answers: [
      { questionId: "q1", question: "هل يوجد تنمل في الساق؟", answer: "نعم، تنمل في الساق." },
    ],
  });
  assert.equal(spellingRun.status, 200);
  const spellingAnalysis = expectComplete(analyzeResponseSchema.parse(spellingRun.body));
  assert.equal(spellingAnalysis.original, spellingDescription);
  assert.equal(spellingAnalysis.normalized.ar, "ألم في الظهر مع تنميل.");
  assert.equal(spellingAnalysis.terminology[0]?.arabic, "تنميل");
  assert.equal(
    spellingAnalysis.terminology[0]?.explanation.ar,
    "إحساس غير طبيعي في الجلد مثل التنميل.",
  );
  assert.equal(spellingAnalysis.clarifications[0]?.label.ar, "نمط التنميل");
  assert.equal(spellingAnalysis.clarifications[0]?.question.ar, "أين تشعر بالتنميل؟");
  assert.equal(spellingAnalysis.clinicalInterpretations[0]?.label.ar, "احتمال التنميل");
  assert.equal(
    spellingAnalysis.clinicalInterpretations[0]?.detail.ar,
    "قد يشير ألم الظهر المصحوب بالتنميل إلى تأثر الأعصاب، لكن هذه ملاحظة لنمط الأعراض وليست تشخيصًا.",
  );
  assert.equal(spellingAnalysis.clinicalInterpretations[0]?.basis.ar, "يذكر الوصف التنميل.");
  assert.equal(
    spellingAnalysis.impression.primary.ar,
    "اعتلال جذر عصبي قطني مع تنميل",
  );
  assert.equal(
    spellingAnalysis.impression.differentials[0]?.ar,
    "شد عضلي في الظهر مع تنميل",
  );
  assert.equal(
    spellingAnalysis.impression.rationale.ar,
    "ألم الظهر المصحوب بالتنميل كما ورد في الإجابات يناسب هذا النمط أكثر من غيره.",
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
    spellingAnalysis.impression.primary.ar,
    ...spellingAnalysis.impression.differentials.map((item) => item.ar),
    spellingAnalysis.impression.rationale.ar,
  ];

  assert.equal(correctedArabicFields.length, 11);
  for (const field of correctedArabicFields) {
    assert.ok(field.includes("تنميل"), `expected corrected spelling in: ${field}`);
    assert.ok(!field.includes("تنمل"), `expected no misspelling in: ${field}`);
  }
  passed("AI-generated Arabic paresthesia spelling is corrected in the final analysis");

  const decisionSpellingRun = await postAnalyze({
    description: "DECISION_SPELLING_SENTINEL: I have back pain with numbness.",
    locale: "ar",
    round: 1,
    answers: [
      { questionId: "q1", question: "هل يوجد تنمل في الساق؟", answer: "نعم، تنمل في الساق." },
    ],
  });
  assert.equal(decisionSpellingRun.status, 200);
  const decisionSpellingAnalysis = expectComplete(
    analyzeResponseSchema.parse(decisionSpellingRun.body),
  );
  assert.equal(decisionSpellingAnalysis.normalized.ar, "ألم في الظهر مع تنميل.");
  assert.equal(
    decisionSpellingAnalysis.impression.rationale.ar,
    "ألم الظهر المصحوب بالتنميل كما ورد في الإجابات يناسب هذا النمط أكثر من غيره.",
  );
  assert.ok(!decisionSpellingAnalysis.impression.rationale.ar.includes("تنمل"));
  passed("Arabic spelling is corrected when round 1 finalises the assessment too");

  const echoReport =
    "Echocardiography report: LVEF 55% with mild mitral regurgitation and a normal aortic valve area.";
  const echoRun = await postEcho({ text: echoReport, locale: "en" });
  assert.equal(echoRun.status, 200);
  const echoAnalysis = echoResponseSchema.parse(echoRun.body).analysis;
  assert.equal(echoAnalysis.meta.mode, "live");
  assert.equal(echoAnalysis.meta.model, "stub-model");
  assert.equal(echoAnalysis.original, echoReport);
  assert.equal(echoAnalysis.summary.en.includes("ultrasound"), true);
  assert.equal(echoAnalysis.terms.length, 2);
  assert.ok(echoAnalysis.terms[0].id.length > 0);
  assert.equal(echoAnalysis.terms[0].term.en, "Ejection fraction (EF)");
  assert.ok(echoAnalysis.meta.notice.en.includes("AI-generated"));
  const rawEcho = (echoRun.body as { analysis: Record<string, unknown> }).analysis;
  assert.equal("safety" in rawEcho, false, "echo analysis must not include a safety block");

  const echoMessages = messagesOf(lastRequest());
  assert.ok(echoMessages.system.includes("STAGE: echocardiography glossary"));
  assert.ok(echoMessages.user.includes('"report":"Echocardiography report'));
  assert.equal(receivedAuthorizations[receivedAuthorizations.length - 1], "Bearer stub-key-not-real");
  passed("live echo returns a validated bilingual glossary for a report");

  const badJsonRun = await postAnalyzeWithLogs({
    description: "BAD_JSON_SENTINEL: I have a headache since yesterday.",
    locale: "en",
    round: 0,
  });
  assert.equal(badJsonRun.result.status, 502);
  assert.equal(apiErrorSchema.parse(badJsonRun.result.body).code, "AI_INVALID_OUTPUT");
  assert.equal("analysis" in (badJsonRun.result.body as object), false);

  const invalidSchemaRun = await postAnalyzeWithLogs({
    description: "INVALID_SCHEMA_SENTINEL: I have a headache since yesterday.",
    locale: "en",
    round: 0,
  });
  assert.equal(invalidSchemaRun.result.status, 502);
  assert.equal(apiErrorSchema.parse(invalidSchemaRun.result.body).code, "AI_INVALID_OUTPUT");

  const decisionSchemaRun = await postAnalyzeWithLogs({
    description: "INVALID_SCHEMA_SENTINEL: I have a headache since yesterday.",
    locale: "en",
    round: 1,
    answers: [
      { questionId: "q1", question: "When did it start?", answer: "ANSWER_SECRET_SENTINEL" },
    ],
  });
  assert.equal(decisionSchemaRun.result.status, 502);
  assert.equal(
    apiErrorSchema.parse(decisionSchemaRun.result.body).code,
    "AI_INVALID_OUTPUT",
  );

  const badJsonLog = badJsonRun.lines.join("\n");
  assert.ok(badJsonLog.includes('"reason":"json_parse"'), "should log the parse failure reason");
  assert.ok(badJsonLog.includes('"parseError":"syntax_error"'), "should log a parse error marker");
  assert.ok(badJsonLog.includes('"finishReason":"stop"'), "should log finishReason");
  assert.ok(badJsonLog.includes('"contentLength":'), "should log content length");
  assert.ok(badJsonLog.includes('"completionTokens":'), "should log completion tokens");
  assert.ok(badJsonLog.includes('"reasoningTokens":'), "should log reasoning tokens");
  assert.ok(badJsonLog.includes('"requestId":"'), "should log the requestId");
  assert.ok(
    badJsonLog.includes('"operation":"follow_up_questions"'),
    "should log the operation",
  );
  assert.ok(!badJsonLog.includes("not json at all"), "must never log response content");
  assert.ok(!badJsonLog.includes("BAD_JSON_SENTINEL"), "must never log the description");
  assert.ok(!badJsonLog.includes("stub-key-not-real"), "must never log the API key");

  const invalidSchemaLog = invalidSchemaRun.lines.join("\n");
  assert.ok(invalidSchemaLog.includes('"reason":"schema"'), "should log the schema reason");
  assert.ok(invalidSchemaLog.includes('"path":"questions"'), "should log the failing field path");
  assert.ok(invalidSchemaLog.includes('"code":"invalid_type"'), "should log the Zod issue code");
  assert.ok(
    !invalidSchemaLog.includes("INVALID_SCHEMA_SENTINEL"),
    "must never log the description",
  );
  assert.ok(!invalidSchemaLog.includes("stub-key-not-real"), "must never log the API key");

  const decisionSchemaLog = decisionSchemaRun.lines.join("\n");
  assert.ok(
    decisionSchemaLog.includes('"operation":"follow_up_decision"'),
    "decision failures should log their operation",
  );
  assert.ok(
    !decisionSchemaLog.includes("ANSWER_SECRET_SENTINEL"),
    "must never log the follow-up answers",
  );
  assert.ok(!decisionSchemaLog.includes("stub-key-not-real"), "must never log the API key");
  passed("invalid AI JSON and schema failures return 502 and log no user data or key");

  const upstreamError = await postAnalyze({
    description: "UPSTREAM_ERROR_SENTINEL: I have a headache since yesterday.",
    locale: "en",
    round: 0,
  });
  assert.equal(upstreamError.status, 502);
  assert.equal(apiErrorSchema.parse(upstreamError.body).code, "AI_ERROR");

  const echoUpstreamError = await postEcho({
    text: "UPSTREAM_ERROR_SENTINEL: LVEF 55% with mild mitral regurgitation.",
    locale: "en",
  });
  assert.equal(echoUpstreamError.status, 502);
  assert.equal(apiErrorSchema.parse(echoUpstreamError.body).code, "AI_ERROR");
  assert.ok(!JSON.stringify(echoUpstreamError.body).includes("stub-key-not-real"));
  passed("upstream errors map to 502 AI_ERROR for analyze and echo without key leakage");

  const dailyQuota = await postAnalyze({
    description: "DAILY_QUOTA_SENTINEL: I have a headache since yesterday.",
    locale: "en",
    round: 0,
  });
  assert.equal(dailyQuota.status, 429);
  assert.equal(apiErrorSchema.parse(dailyQuota.body).code, "AI_DAILY_QUOTA");
  assert.equal("questions" in (dailyQuota.body as object), false);
  passed("upstream daily quota exhaustion returns 429 AI_DAILY_QUOTA, not 502");

  const truncated = await postAnalyze({
    description: "TRUNCATED_SENTINEL: I have a headache since yesterday.",
    locale: "en",
    round: 0,
  });
  assert.equal(truncated.status, 200);
  const truncatedFollowUp = expectFollowUp(analyzeResponseSchema.parse(truncated.body));
  assert.equal(truncatedFollowUp.questions.length, 2);
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
