import assert from "node:assert/strict";
import { once } from "node:events";

process.env.NODE_ENV = "test";
process.env.AI_API_KEY = "";
process.env.ALLOWED_ORIGINS = "http://localhost:5173";
process.env.ANALYZE_RATE_LIMIT = "1000";

const { createApp } = await import("../src/app.ts");
const { analyzeResponseSchema, apiErrorSchema, echoResponseSchema, healthResponseSchema } =
  await import("../../shared/contract.ts");
type AnalyzeResponse = import("../../shared/contract.ts").AnalyzeResponse;
type FollowUpResponse = import("../../shared/contract.ts").FollowUpResponse;
type MedicalAnalysis = import("../../shared/contract.ts").MedicalAnalysis;
type FollowUpQuestion = import("../../shared/contract.ts").FollowUpQuestion;

type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const app = createApp();
const server = app.listen(0);
await once(server, "listening");

const address = server.address();
assert.ok(address !== null && typeof address === "object", "server should expose an address");
const baseUrl = `http://127.0.0.1:${address.port}`;

async function request(path: string, options: RequestOptions = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const text = await response.text();
  let body: unknown = null;

  if (text.length > 0) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  return { status: response.status, body, headers: response.headers };
}

function postJson(path: string, payload: unknown) {
  return request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function passed(name: string): void {
  console.log(`ok - ${name}`);
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

function answersFor(questions: readonly FollowUpQuestion[]) {
  return questions.map((question) => ({
    questionId: question.id,
    question: question.en,
    answer: "It started two days ago and it is moderate.",
  }));
}

try {
  const health = await request("/api/health");
  assert.equal(health.status, 200);
  assert.deepEqual(healthResponseSchema.parse(health.body), {
    status: "ok",
    mode: "mock",
    aiConfigured: false,
    version: "2.0.0",
  });
  assert.ok(health.headers.get("x-request-id"), "health should return a request id");
  assert.ok(health.headers.get("x-content-type-options"), "helmet headers should be present");
  passed("GET /api/health returns mock health for CardioBridge 2.0.0");

  const arabicExample =
    "عندي صداع من امبارح، ودوخة لما أقف، وحرارة بسيطة، وبحس بتعب عام.";

  const followUpResponse = await postJson("/api/analyze", {
    description: arabicExample,
    locale: "ar",
    round: 0,
    answers: [],
  });
  assert.equal(followUpResponse.status, 200);
  const followUp = expectFollowUp(analyzeResponseSchema.parse(followUpResponse.body));
  assert.equal(followUp.round, 1);
  assert.ok(
    followUp.questions.length >= 2 && followUp.questions.length <= 3,
    "the first round should ask 2 to 3 questions",
  );
  for (const question of followUp.questions) {
    assert.match(question.id, UUID_PATTERN, "question ids should be UUIDs");
    assert.ok(question.en.length > 0 && question.ar.length > 0, "questions should be bilingual");
  }
  assert.equal(followUp.meta.mode, "mock");
  assert.equal(followUp.meta.model, "synthetic-demo-v1");
  assert.ok(followUp.meta.notice.en.includes("Synthetic"));
  assert.ok(followUp.meta.notice.en.includes("no AI model"));
  assert.equal("analysis" in followUp, false, "a follow-up response must not carry an analysis");
  passed("POST /api/analyze round 0 returns 2-3 mock follow-up questions");

  const firstRoundAnswers = answersFor(followUp.questions);
  const completeResponse = await postJson("/api/analyze", {
    description: arabicExample,
    locale: "ar",
    round: 1,
    answers: firstRoundAnswers,
  });
  assert.equal(completeResponse.status, 200);
  const analysis = expectComplete(analyzeResponseSchema.parse(completeResponse.body));

  assert.equal(analysis.meta.mode, "mock");
  assert.equal(analysis.meta.model, "synthetic-demo-v1");
  assert.equal(analysis.original, arabicExample);
  assert.equal(analysis.detectedLanguage, "ar-EG");
  assert.ok(analysis.terminology.some((term) => term.english === "Headache"));
  assert.ok(analysis.terminology.some((term) => term.english === "Dizziness on standing"));
  assert.ok(analysis.terminology.some((term) => term.english === "Low-grade fever"));
  assert.ok(analysis.meta.notice.en.includes("Synthetic"));
  assert.ok(analysis.disclaimer.en.includes("not a confirmed diagnosis"));

  assert.equal(analysis.impression.confidence, "low");
  assert.ok(
    analysis.impression.primary.en.includes("Synthetic demo"),
    "the mock impression must be clearly synthetic",
  );
  assert.equal(analysis.impression.differentials.length, 0);
  assert.ok(analysis.impression.rationale.en.includes("Demo mode"));

  const rawAnalysis = (completeResponse.body as { analysis: Record<string, unknown> }).analysis;
  assert.equal("safety" in rawAnalysis, false, "analysis must not include a safety block");
  assert.equal(
    "safetySourceVersion" in (rawAnalysis.meta as Record<string, unknown>),
    false,
    "analysis meta must not include a safety source version",
  );
  passed("POST /api/analyze round 1 returns a complete mock analysis with a synthetic impression");

  const finalRoundResponse = await postJson("/api/analyze", {
    description: arabicExample,
    locale: "ar",
    round: 2,
    answers: firstRoundAnswers,
  });
  assert.equal(finalRoundResponse.status, 200);
  const finalRoundAnalysis = expectComplete(analyzeResponseSchema.parse(finalRoundResponse.body));
  assert.equal(finalRoundAnalysis.impression.confidence, "low");
  passed("POST /api/analyze round 2 forces the complete analysis");

  const missingAnswers = await postJson("/api/analyze", {
    description: arabicExample,
    locale: "ar",
    round: 1,
    answers: [],
  });
  assert.equal(missingAnswers.status, 400);
  const missingAnswersError = apiErrorSchema.parse(missingAnswers.body);
  assert.equal(missingAnswersError.code, "INVALID_INPUT");
  assert.ok(missingAnswersError.requestId);
  passed("POST /api/analyze rejects a follow-up round without answers with 400");

  const answersIgnored = await postJson("/api/analyze", {
    description: arabicExample,
    locale: "ar",
    round: 0,
    answers: firstRoundAnswers,
  });
  assert.equal(answersIgnored.status, 200);
  const ignoredFollowUp = expectFollowUp(analyzeResponseSchema.parse(answersIgnored.body));
  assert.equal(ignoredFollowUp.round, 1);
  passed("POST /api/analyze round 0 ignores submitted answers");

  const englishExample =
    "I have chest pain and I feel short of breath since this morning.";
  const englishFollowUpResponse = await postJson("/api/analyze", {
    description: englishExample,
    locale: "en",
    round: 0,
  });
  assert.equal(englishFollowUpResponse.status, 200);
  const englishFollowUp = expectFollowUp(
    analyzeResponseSchema.parse(englishFollowUpResponse.body),
  );
  assert.equal(englishFollowUp.round, 1);

  const chestResponse = await postJson("/api/analyze", {
    description: englishExample,
    locale: "en",
    round: 2,
    answers: answersFor(englishFollowUp.questions),
  });
  assert.equal(chestResponse.status, 200);
  const chestAnalysis = expectComplete(analyzeResponseSchema.parse(chestResponse.body));
  assert.ok(
    chestAnalysis.terminology.some((term) => term.english === "Chest pain or discomfort"),
  );
  assert.ok(chestAnalysis.terminology.some((term) => term.english === "Shortness of breath"));
  assert.equal(chestAnalysis.impression.differentials.length, 0);
  passed("POST /api/analyze returns chest terminology without a safety block");

  const genericResponse = await postJson("/api/analyze", {
    description: "I feel strange today and I am not sure what is happening.",
    locale: "en",
    round: 2,
    answers: [
      { questionId: "q1", question: "When did it start?", answer: "Today." },
    ],
  });
  assert.equal(genericResponse.status, 200);
  const genericAnalysis = expectComplete(analyzeResponseSchema.parse(genericResponse.body));
  assert.equal(genericAnalysis.terminology.length, 0);
  assert.ok(genericAnalysis.normalized.en.includes("No standardized symptom term"));
  assert.ok(genericAnalysis.clarifications.length >= 2);
  passed("POST /api/analyze returns a no-term fallback for unmatched text");

  const invalidDescription = await postJson("/api/analyze", { description: "too short" });
  assert.equal(invalidDescription.status, 400);
  assert.equal(apiErrorSchema.parse(invalidDescription.body).code, "INVALID_INPUT");
  passed("POST /api/analyze rejects a short description with 400");

  const invalidLocale = await postJson("/api/analyze", {
    description: "I have a headache since yesterday.",
    locale: "fr",
  });
  assert.equal(invalidLocale.status, 400);
  assert.equal(apiErrorSchema.parse(invalidLocale.body).code, "INVALID_INPUT");
  passed("POST /api/analyze rejects an unsupported locale with 400");

  const invalidRound = await postJson("/api/analyze", {
    description: "I have a headache since yesterday.",
    locale: "en",
    round: 5,
  });
  assert.equal(invalidRound.status, 400);
  assert.equal(apiErrorSchema.parse(invalidRound.body).code, "INVALID_INPUT");
  passed("POST /api/analyze rejects an out-of-range round with 400");

  const echoReport =
    "Echocardiography report: LVEF 55%. Moderate mitral regurgitation. Aortic valve area 1.0 cm2, peak velocity 3.2 m/s, mean pressure gradient 12 mmHg. Mild LVH. Left atrium 4.1 cm. Aortic root 3.3 cm.";
  const echoResponse = await postJson("/api/echo", { text: echoReport, locale: "en" });
  assert.equal(echoResponse.status, 200);
  const echoAnalysis = echoResponseSchema.parse(echoResponse.body).analysis;
  assert.equal(echoAnalysis.meta.mode, "mock");
  assert.equal(echoAnalysis.meta.model, "synthetic-demo-v1");
  assert.equal(echoAnalysis.source, "text");
  assert.equal(echoAnalysis.original, echoReport);
  assert.ok(echoAnalysis.summary.en.includes("Synthetic"));
  assert.ok(echoAnalysis.meta.notice.en.includes("Synthetic"));
  assert.ok(echoAnalysis.meta.notice.en.includes("no AI model"));
  assert.ok(echoAnalysis.terms.length >= 8, "the glossary should match most echo keywords");
  assert.ok(echoAnalysis.terms.length <= 15);

  const echoTermNames = echoAnalysis.terms.map((item) => item.term.en);
  for (const expected of [
    "Ejection fraction (EF)",
    "Mitral valve",
    "Regurgitation",
    "Aortic valve area",
    "Peak velocity",
    "Mean pressure gradient",
    "Left ventricular hypertrophy (LVH)",
    "Left atrium",
    "Aorta",
  ]) {
    assert.ok(echoTermNames.includes(expected), `expected the glossary to explain ${expected}`);
  }
  for (const term of echoAnalysis.terms) {
    assert.match(term.id, UUID_PATTERN, "echo term ids should be UUIDs");
    assert.ok(term.explanation.en.length > 0 && term.explanation.ar.length > 0);
  }
  const rawEcho = (echoResponse.body as { analysis: Record<string, unknown> }).analysis;
  assert.equal("safety" in rawEcho, false, "echo analysis must not include a safety block");
  passed("POST /api/echo returns a bilingual mock glossary for an echo report");

  const echoFallback = await postJson("/api/echo", {
    text: "The patient was seen in clinic today and the study was reviewed.",
    locale: "en",
  });
  assert.equal(echoFallback.status, 200);
  const echoFallbackAnalysis = echoResponseSchema.parse(echoFallback.body).analysis;
  assert.equal(echoFallbackAnalysis.terms.length, 1);
  assert.ok(echoFallbackAnalysis.summary.en.includes("could not match"));
  assert.equal(echoFallbackAnalysis.terms[0].term.en, "Echocardiography report");
  passed("POST /api/echo returns a fallback glossary when nothing matches");

  const echoPhotoResponse = await postJson("/api/echo", {
    text: echoReport,
    locale: "en",
    source: "photo",
  });
  assert.equal(echoPhotoResponse.status, 200);
  const echoPhotoAnalysis = echoResponseSchema.parse(echoPhotoResponse.body).analysis;
  assert.equal(echoPhotoAnalysis.source, "photo");
  assert.equal(echoPhotoAnalysis.meta.mode, "mock");
  assert.equal(echoPhotoAnalysis.meta.model, "synthetic-demo-v1");
  assert.equal(echoPhotoAnalysis.original, echoReport);
  assert.ok(echoPhotoAnalysis.meta.notice.en.includes("Synthetic"));
  assert.ok(echoPhotoAnalysis.meta.notice.en.includes("no AI model"));
  assert.ok(echoPhotoAnalysis.summary.en.includes("Synthetic"));
  assert.deepEqual(
    echoPhotoAnalysis.terms.map((item) => item.term.en),
    echoAnalysis.terms.map((item) => item.term.en),
    "the mock glossary must not depend on the source",
  );
  passed("POST /api/echo accepts source photo in mock mode and keeps the demo notice");

  const shortEcho = await postJson("/api/echo", { text: "short" });
  assert.equal(shortEcho.status, 400);
  const shortEchoError = apiErrorSchema.parse(shortEcho.body);
  assert.equal(shortEchoError.code, "INVALID_INPUT");
  assert.ok(shortEchoError.requestId);
  passed("POST /api/echo rejects a short report with 400");

  const longEcho = await postJson("/api/echo", { text: "a".repeat(4001) });
  assert.equal(longEcho.status, 400);
  assert.equal(apiErrorSchema.parse(longEcho.body).code, "INVALID_INPUT");
  passed("POST /api/echo rejects an oversized report with 400");

  const invalidEchoLocale = await postJson("/api/echo", {
    text: "LVEF 55% with mild mitral regurgitation.",
    locale: "fr",
  });
  assert.equal(invalidEchoLocale.status, 400);
  assert.equal(apiErrorSchema.parse(invalidEchoLocale.body).code, "INVALID_INPUT");
  passed("POST /api/echo rejects an unsupported locale with 400");

  const invalidEchoSource = await postJson("/api/echo", {
    text: "LVEF 55% with mild mitral regurgitation.",
    locale: "en",
    source: "image",
  });
  assert.equal(invalidEchoSource.status, 400);
  const invalidEchoSourceError = apiErrorSchema.parse(invalidEchoSource.body);
  assert.equal(invalidEchoSourceError.code, "INVALID_INPUT");
  assert.ok(invalidEchoSourceError.requestId);
  passed("POST /api/echo rejects an unsupported source with 400");

  const invalidJson = await request("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });
  assert.equal(invalidJson.status, 400);
  assert.equal(apiErrorSchema.parse(invalidJson.body).code, "INVALID_JSON");

  const invalidEchoJson = await request("/api/echo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });
  assert.equal(invalidEchoJson.status, 400);
  assert.equal(apiErrorSchema.parse(invalidEchoJson.body).code, "INVALID_JSON");
  passed("POST /api/analyze and /api/echo reject malformed JSON with 400");

  const unknownApi = await request("/api/not-a-route");
  assert.equal(unknownApi.status, 404);
  const unknownApiError = apiErrorSchema.parse(unknownApi.body);
  assert.equal(unknownApiError.code, "NOT_FOUND");
  assert.ok(unknownApiError.requestId);
  passed("Unknown API route returns JSON 404");

  const unknownPage = await request("/not-a-route");
  assert.equal(unknownPage.status, 404);
  assert.equal(apiErrorSchema.parse(unknownPage.body).code, "NOT_FOUND");
  passed("Unknown non-API route returns JSON 404 in development/test");

  console.log("All server smoke tests passed.");
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  const closed = new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  server.closeAllConnections();
  await closed;
}
