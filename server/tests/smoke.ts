import assert from "node:assert/strict";
import { once } from "node:events";

process.env.NODE_ENV = "test";
process.env.AI_API_KEY = "";
process.env.ALLOWED_ORIGINS = "http://localhost:5173";
process.env.ANALYZE_RATE_LIMIT = "1000";

const { createApp } = await import("../src/app.ts");
const { analyzeResponseSchema, apiErrorSchema, healthResponseSchema } = await import(
  "../../shared/contract.ts"
);

type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};

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

try {
  const health = await request("/api/health");
  assert.equal(health.status, 200);
  assert.deepEqual(healthResponseSchema.parse(health.body), {
    status: "ok",
    mode: "mock",
    aiConfigured: false,
    version: "1.0.0",
  });
  assert.ok(health.headers.get("x-request-id"), "health should return a request id");
  assert.ok(health.headers.get("x-content-type-options"), "helmet headers should be present");
  passed("GET /api/health returns mock health");

  const arabicExample =
    "عندي صداع من امبارح، ودوخة لما أقف، وحرارة بسيطة، وبحس بتعب عام.";
  const arabicAnalysisResponse = await postJson("/api/analyze", {
    description: arabicExample,
    locale: "ar",
  });
  assert.equal(arabicAnalysisResponse.status, 200);
  const arabicAnalysis = analyzeResponseSchema.parse(arabicAnalysisResponse.body).analysis;
  assert.equal(arabicAnalysis.meta.mode, "mock");
  assert.equal(arabicAnalysis.meta.model, "synthetic-demo-v1");
  assert.equal(arabicAnalysis.original, arabicExample);
  assert.equal(arabicAnalysis.detectedLanguage, "ar-EG");
  assert.ok(arabicAnalysis.terminology.some((term) => term.english === "Headache"));
  assert.ok(
    arabicAnalysis.terminology.some((term) => term.english === "Dizziness on standing"),
  );
  assert.ok(arabicAnalysis.terminology.some((term) => term.english === "Low-grade fever"));
  assert.ok(arabicAnalysis.terminology.some((term) => term.english === "General fatigue"));
  assert.ok(arabicAnalysis.meta.notice.en.includes("Synthetic"));
  assert.ok(arabicAnalysis.meta.notice.en.includes("no AI model"));
  assert.ok(arabicAnalysis.disclaimer.en.includes("not a diagnosis"));
  passed("POST /api/analyze returns schema-valid mock output for the Egyptian example");

  const englishExample =
    "I've had a headache since yesterday and feel dizzy when I stand up. I also have a mild fever.";
  const englishAnalysisResponse = await postJson("/api/analyze", {
    description: englishExample,
    locale: "en",
  });
  assert.equal(englishAnalysisResponse.status, 200);
  const englishAnalysis = analyzeResponseSchema.parse(englishAnalysisResponse.body).analysis;
  assert.equal(englishAnalysis.meta.mode, "mock");
  assert.equal(englishAnalysis.detectedLanguage, "en");
  assert.ok(englishAnalysis.terminology.some((term) => term.english === "Headache"));
  assert.ok(
    englishAnalysis.terminology.some((term) => term.english === "Dizziness on standing"),
  );
  assert.ok(englishAnalysis.terminology.some((term) => term.english === "Low-grade fever"));
  passed("POST /api/analyze returns schema-valid mock output for the English example");

  const chestAnalysisResponse = await postJson("/api/analyze", {
    description: "I have chest pain and I feel short of breath.",
    locale: "en",
  });
  assert.equal(chestAnalysisResponse.status, 200);
  const chestAnalysis = analyzeResponseSchema.parse(chestAnalysisResponse.body).analysis;
  const chestRaw = chestAnalysisResponse.body as { analysis: Record<string, unknown> };
  assert.equal("safety" in chestRaw.analysis, false, "analysis must not include a safety block");
  assert.equal(
    "safetySourceVersion" in (chestRaw.analysis.meta as Record<string, unknown>),
    false,
    "analysis meta must not include a safety source version",
  );
  assert.ok(
    chestAnalysis.terminology.some((term) => term.english === "Chest pain or discomfort"),
  );
  assert.ok(
    chestAnalysis.terminology.some((term) => term.english === "Shortness of breath"),
  );
  passed("POST /api/analyze returns terminology without a safety block for mock content");

  const genericResponse = await postJson("/api/analyze", {
    description: "I feel strange today and I am not sure what is happening.",
    locale: "en",
  });
  assert.equal(genericResponse.status, 200);
  const genericAnalysis = analyzeResponseSchema.parse(genericResponse.body).analysis;
  assert.equal(genericAnalysis.terminology.length, 0);
  assert.ok(genericAnalysis.normalized.en.includes("No standardized symptom term"));
  assert.ok(genericAnalysis.clarifications.length >= 2);
  passed("POST /api/analyze returns a no-term fallback for unmatched text");

  const invalidDescription = await postJson("/api/analyze", { description: "too short" });
  assert.equal(invalidDescription.status, 400);
  const invalidDescriptionError = apiErrorSchema.parse(invalidDescription.body);
  assert.equal(invalidDescriptionError.code, "INVALID_INPUT");
  assert.ok(invalidDescriptionError.requestId);
  passed("POST /api/analyze rejects a short description with 400");

  const invalidLocale = await postJson("/api/analyze", {
    description: "I have a headache since yesterday.",
    locale: "fr",
  });
  assert.equal(invalidLocale.status, 400);
  assert.equal(apiErrorSchema.parse(invalidLocale.body).code, "INVALID_INPUT");
  passed("POST /api/analyze rejects an unsupported locale with 400");

  const invalidJson = await request("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });
  assert.equal(invalidJson.status, 400);
  assert.equal(apiErrorSchema.parse(invalidJson.body).code, "INVALID_JSON");
  passed("POST /api/analyze rejects malformed JSON with 400");

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
