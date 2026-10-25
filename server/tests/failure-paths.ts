import assert from "node:assert/strict";
import { once } from "node:events";

process.env.NODE_ENV = "test";
process.env.AI_API_KEY = "test-key-not-real";
process.env.AI_BASE_URL = "http://127.0.0.1:9/v1";
process.env.ALLOWED_ORIGINS = "http://localhost:5173";
process.env.ANALYZE_RATE_LIMIT = "2";

const { createApp } = await import("../src/app.ts");
const { apiErrorSchema, healthResponseSchema } = await import("../../shared/contract.ts");

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
    mode: "live",
    aiConfigured: true,
    version: "2.0.0",
  });
  passed("health reports live mode when an AI key is configured");

  const description = "I have had a headache since yesterday and feel dizzy when I stand up.";

  const firstFailure = await postJson("/api/analyze", {
    description,
    locale: "en",
    round: 0,
  });
  assert.equal(firstFailure.status, 502);
  assert.equal("analysis" in (firstFailure.body as object), false, "must not fall back to mock");
  assert.equal("questions" in (firstFailure.body as object), false);
  const firstError = apiErrorSchema.parse(firstFailure.body);
  assert.equal(firstError.code, "AI_ERROR");
  assert.ok(firstError.requestId);
  assert.ok(!JSON.stringify(firstFailure.body).includes("test-key-not-real"));
  passed("AI transport failure returns 502 AI_ERROR without mock fallback or key leakage");

  const secondFailure = await postJson("/api/analyze", { description, locale: "en", round: 0 });
  assert.equal(secondFailure.status, 502);
  assert.equal(apiErrorSchema.parse(secondFailure.body).code, "AI_ERROR");

  const limitedAnalyze = await postJson("/api/analyze", { description, locale: "en", round: 0 });
  assert.equal(limitedAnalyze.status, 429);
  assert.equal(apiErrorSchema.parse(limitedAnalyze.body).code, "RATE_LIMITED");
  assert.ok(apiErrorSchema.parse(limitedAnalyze.body).requestId);
  passed("the shared analyze/echo rate limit returns 429 RATE_LIMITED after the configured limit");

  const limitedEcho = await postJson("/api/echo", {
    text: "Echocardiography report: LVEF 55% with mild mitral regurgitation.",
    locale: "en",
  });
  assert.equal(limitedEcho.status, 429);
  assert.equal(apiErrorSchema.parse(limitedEcho.body).code, "RATE_LIMITED");
  passed("POST /api/echo shares the analyze rate limiter");

  const allowedCors = await request("/api/health", {
    headers: { Origin: "http://localhost:5173" },
  });
  assert.equal(allowedCors.status, 200);
  assert.equal(
    allowedCors.headers.get("access-control-allow-origin"),
    "http://localhost:5173",
  );

  const blockedCors = await request("/api/health", {
    headers: { Origin: "http://evil.example" },
  });
  assert.equal(blockedCors.status, 200);
  assert.equal(blockedCors.headers.get("access-control-allow-origin"), null);
  passed("CORS allowlist reflects the allowed origin and rejects unknown origins");

  const oversized = await request("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description: "a".repeat(40_000) }),
  });
  assert.equal(oversized.status, 413);
  assert.equal(apiErrorSchema.parse(oversized.body).code, "PAYLOAD_TOO_LARGE");
  passed("oversized JSON body returns 413 PAYLOAD_TOO_LARGE");

  console.log("All server failure-path tests passed.");
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
