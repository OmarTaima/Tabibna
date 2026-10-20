# Tabibna AI — Server

Express + TypeScript API for Tabibna AI. It provides an optional
OpenAI-compatible analysis adapter and a deterministic synthetic demo mode that
never calls an AI provider.

All request and response shapes are defined by `../shared/contract.ts`. Response
bodies are parsed with those Zod schemas before they are sent.

## Contents

- [Run](#run)
- [Configuration](#configuration)
- [Modes](#modes)
- [API contract](#api-contract)
- [Errors](#errors)
- [Synthetic demo mode](#synthetic-demo-mode)
- [Security](#security)
- [Production serving](#production-serving)
- [Deploying to Vercel](#deploying-to-vercel)
- [Tests](#tests)
- [Integration notes](#integration-notes)
- [Source layout](#source-layout)
- [Known limitations](#known-limitations)

## Run

From the repository root:

```bash
npm install
cp .env.example .env
npm run dev:server
```

The API listens on `http://localhost:8787` by default. Vite proxies `/api` from
`http://localhost:5173` to this server. `npm run dev` starts both.

Node.js 20+ is recommended (the server uses global `fetch` and
`AbortController`).

## Configuration

Environment variables are read once at startup. `dotenv` loads `.env` from the
repository root, and real process environment variables take precedence.

| Variable | Default | Notes |
| --- | --- | --- |
| `PORT` | `8787` | Integer, `1`–`65535`. |
| `NODE_ENV` | `development` | `production` enables static serving and the production CSP. |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | Comma-separated absolute origins. `*` is accepted but should only be used for local experiments. Paths are rejected. |
| `AI_API_KEY` | empty | Empty means synthetic demo mode. Any non-empty value enables live mode. |
| `AI_BASE_URL` | `https://api.openai.com/v1` | Absolute `http`/`https` URL. A trailing slash is stripped. |
| `AI_MODEL` | `gpt-4o-mini` | Sent as the provider's `model` field and echoed in live responses. |
| `AI_REQUEST_TIMEOUT_MS` | `180000` | Integer, `1000`–`600000`. Timeout for one AI request. Use a lower value on serverless platforms (`50000` on Vercel). |
| `ANALYZE_RATE_LIMIT` | `30` | Requests per IP per 15-minute window, integer `1`–`1000`. |

Invalid numeric ranges or malformed origins/URLs fail startup instead of silently
falling back.

Secrets belong only in `.env` (git-ignored). Never expose `AI_API_KEY` to the
browser bundle.

## Modes

| Mode | Trigger | Behavior |
| --- | --- | --- |
| `mock` | `AI_API_KEY` empty or missing | Builds deterministic synthetic output from local patterns. No network call. `meta.mode` is `mock`, `meta.model` is `synthetic-demo-v1`, and the notice states that no AI was used. |
| `live` | `AI_API_KEY` non-empty | Calls the configured OpenAI-compatible provider, validates the returned JSON, then merges it with the local disclaimers. |

Live mode never falls back to mock output. Provider failures return `502` with
`AI_ERROR` or `AI_INVALID_OUTPUT`.

## API contract

Base URL in development: `http://localhost:8787`.

Every response includes an `X-Request-ID` header. Error responses repeat it as
`requestId`.

### `GET /api/health`

Unrestricted by rate limiting. Use it to show the active mode and whether an AI
provider is configured.

```json
{
  "status": "ok",
  "mode": "mock",
  "aiConfigured": false,
  "version": "1.0.0"
}
```

`mode` is `"mock"` or `"live"`. The response is always `200` when the process is
serving traffic.

### `POST /api/analyze`

Returns the full bilingual analysis. In mock mode it is built locally; in live
mode it comes from the AI provider and is merged with the local disclaimers.

Request:

```json
{
  "description": "عندي صداع من امبارح، ودوخة لما أقف، وحرارة بسيطة، وبحس بتعب عام.",
  "locale": "ar"
}
```

- `description`: required, trimmed, 10–2,000 characters.
- `locale`: optional, `"en"` or `"ar"`, defaults to `"en"`. It guides the live AI
  prompt; mock mode ignores it. The output is always bilingual.

Response (`200`) in mock mode, with arrays shortened here:

```json
{
  "analysis": {
    "id": "63fbf65a-ca55-49fc-987d-870a2a47b85b",
    "meta": {
      "mode": "mock",
      "model": "synthetic-demo-v1",
      "generatedAt": "2026-10-20T19:13:30.872Z",
      "notice": {
        "en": "Synthetic demo output: no AI model was used. ...",
        "ar": "مخرجات تجريبية اصطناعية: لم يُستخدم أي نموذج ذكاء اصطناعي. ..."
      }
    },
    "original": "عندي صداع من امبارح، ودوخة لما أقف، وحرارة بسيطة، وبحس بتعب عام.",
    "detectedLanguage": "ar-EG",
    "normalized": {
      "en": "Reported symptoms: headache, dizziness on standing, mild fever, and general fatigue.",
      "ar": "الأعراض المذكورة: صداع، دوار عند الوقوف، حرارة خفيفة، وتعب عام."
    },
    "terminology": [
      {
        "id": "63fbf65a-ca55-49fc-987d-870a2a47b85b-term-1",
        "english": "Headache",
        "arabic": "صداع",
        "kind": "symptom",
        "origin": "reported",
        "explanation": {
          "en": "Pain or discomfort in the head.",
          "ar": "ألم أو انزعاج في منطقة الرأس."
        },
        "certainty": "stated"
      }
    ],
    "clarifications": [
      {
        "id": "63fbf65a-ca55-49fc-987d-870a2a47b85b-clarification-1",
        "label": { "en": "Onset and pattern", "ar": "بداية الصداع ونمطه" },
        "question": {
          "en": "Did the headache start suddenly at its worst, or build up gradually?",
          "ar": "هل بدأ الصداع فجأة بأقصى شدة، أم تزايد تدريجيًا؟"
        }
      }
    ],
    "clinicalInterpretations": [],
    "disclaimer": {
      "en": "Tabibna AI is a medical terminology assistant, not a diagnosis or treatment service. ...",
      "ar": "طبيبنا AI أداة مساعدة في المصطلحات الطبية، وليست خدمة تشخيص أو علاج. ..."
    }
  }
}
```

`detectedLanguage` is `ar-EG | ar | en | mixed | unknown`. `mixed` means both
Arabic and Latin script were present. `clinicalInterpretations` may be empty in
mock mode; live mode returns at most 3.

The final object enforces at most 10 terminology items, 5 clarifications, and 3
clinical interpretations. The AI response schema is narrower (8 / 4 / 3).

The `analyze` rate limit applies (default 30 requests / 15 minutes / IP).

### CORS preflight

`OPTIONS` requests are handled by the CORS middleware with
`Access-Control-Allow-Methods: GET, POST, OPTIONS`, allowed headers
`Content-Type, Accept`, and exposed header `X-Request-ID`. Requests from origins
outside the allowlist receive no CORS response headers; browsers block them.
The server does not return a `403` for a disallowed browser origin.

## Errors

All non-2xx API responses use:

```json
{
  "error": "Too many analysis requests. Please wait a few minutes and try again.",
  "code": "RATE_LIMITED",
  "requestId": "74e0012b-f04b-48d5-ad04-92e4a018fd6c"
}
```

`requestId` is omitted only if the request never reached the request-ID
middleware.

| Status | `code` | When |
| --- | --- | --- |
| `400` | `INVALID_INPUT` | Missing/blank/too-short/too-long description, unsupported locale, or non-object body. |
| `400` | `INVALID_JSON` | Body is not parseable JSON. |
| `413` | `PAYLOAD_TOO_LARGE` | JSON body exceeds 32 kb. |
| `404` | `NOT_FOUND` | Unknown `/api/*` route, or unknown non-API route outside production static mode. |
| `429` | `RATE_LIMITED` | Per-IP analyze limit exceeded. Standards-based rate-limit headers are included. |
| `429` | `AI_RATE_LIMITED` | The provider is throttling this account right now. The request was retried before failing. |
| `429` | `AI_DAILY_QUOTA` | The provider's daily free-model allowance is exhausted. The request is not retried, because only the daily reset clears it. |
| `500` | `INTERNAL_ERROR` | Unexpected server failure. Details are logged server-side only. |
| `502` | `AI_ERROR` | Provider network error or non-2xx response in live mode. No mock fallback. |
| `504` | `AI_TIMEOUT` | The provider did not answer within the request timeout. No mock fallback. |
| `502` | `AI_INVALID_OUTPUT` | Provider response was not valid JSON, was truncated, or failed the AI content schema. No mock fallback. |

Client messages are deliberately generic; upstream response bodies and secrets
are never forwarded.

### Provider resilience

`AI_MODEL` is the primary model. `AI_FALLBACK_MODEL` is optional and is used
only when the primary model fails with a retryable upstream status (429 or a
provider 5xx). A daily-quota exhaustion is not retried and does not fall back,
because no other free model shares that allowance.

`AI_MAX_TOKENS` (default `12000`) must cover reasoning tokens plus the final
JSON. Too small a budget makes the provider return a truncated body with
`finish_reason: "length"`, which surfaces as `AI_INVALID_OUTPUT`.

## Synthetic demo mode

Mock output is used only when `AI_API_KEY` is empty. It is deterministic apart
from IDs and timestamps, bilingual, and explicitly labeled as synthetic
(`meta.mode: "mock"`, `meta.model: "synthetic-demo-v1"`, synthetic notice).

The 13 recognized symptom patterns are:

1. Headache
2. Dizziness (including dizziness on standing)
3. Fever (including high and low-grade variants)
4. General fatigue
5. Sore throat
6. Cough
7. Shortness of breath
8. Chest pain or discomfort
9. Abdominal pain
10. Nausea or vomiting
11. Back pain
12. Joint pain
13. Rash

Each pattern has Arabic and English triggers, a bilingual standardized term,
explanation, and up to two clarifications. Matching is done on normalized text
after masking negated clauses. At most 8 terms and 4 unique clarifications are
returned.

If no pattern matches, the response is honest about it: `terminology` is empty,
`normalized` says no standardized term could be extracted, and generic
clarification questions are returned. The server does not invent symptoms,
measurements, diagnoses, or medications.

## Security

- `helmet` is enabled; CSP is applied in production and allows self-hosted
  scripts, inline styles, and Google Fonts. COEP is disabled for compatibility.
- JSON bodies under `/api` are limited to 32 kb.
- Per-IP rate limits are applied to `POST /api/analyze`. `GET /api/health` is not
  limited.
- CORS uses an explicit allowlist, not a reflected wildcard.
- Secrets are loaded from `.env` only. No key or user description is logged.
  Server logs contain only lifecycle messages, error codes, upstream status,
  and request IDs.
- Unknown API routes and unexpected failures return the JSON error shape, not
  HTML or stack traces.
- Graceful shutdown on `SIGINT`/`SIGTERM`, with a 10-second forced-exit
  fallback.

## Production serving

When `NODE_ENV=production` and `dist/index.html` exists, the server:

- serves `dist` assets with immutable caching for `/assets/*`;
- serves `index.html` for client-side routes (SPA fallback);
- never swallows `/api/*` 404s — those still return the JSON error shape.

If `dist/index.html` is missing, the server logs a warning and serves the API
only. Run `npm run build` before `npm start`.

## Deploying to Vercel

The repository is a single Vercel project that serves the SPA and the API
together:

```
tabibna-ai/
├── api/[...path].ts   # Vercel serverless function → every /api/* route
├── server/src/        # Express app (used by the function and by npm start)
├── src/               # Vite SPA, published from dist/
├── shared/            # Zod request/response contract
└── vercel.json        # build settings and SPA fallback rewrite
```

`api/[...path].ts` imports `createApp` from `server/src/app` and exports the
Express app as its default export. It never calls `listen()`; importing
`server/src/index.ts` would start a listener and keep the function alive. The
function declares `maxDuration: 60`, so one AI call has up to 60 seconds.

`vercel.json` runs `npm run build` (`tsc --noEmit && vite build`), publishes
`dist`, and rewrites every path that is not `/api/*` to `/index.html` so
client-side routes survive a refresh. API routes are matched by the function
first and are never swallowed by the SPA fallback.

Inside Vercel the function bundle contains no built SPA, so the Express static
middleware is skipped there (`VERCEL` is detected at startup) and the SPA is
served by the platform's static output.

### Environment variables

Set these in the Vercel project settings (Settings → Environment Variables) for
production and preview deployments:

| Variable | Example | Notes |
| --- | --- | --- |
| `AI_API_KEY` | `sk-...` | Required for live mode. Set it **only** in Vercel project settings — never in the repo, never in a client bundle. |
| `AI_BASE_URL` | `https://api.openai.com/v1` | OpenAI-compatible provider base URL. |
| `AI_MODEL` | `gpt-4o-mini` | Primary model. |
| `AI_FALLBACK_MODEL` | `gpt-4o-mini` | Optional second model for retryable upstream failures. |
| `AI_REASONING_EFFORT` | `low` | Optional. `low`, `medium`, or `high`. |
| `AI_MAX_TOKENS` | `12000` | Completion token budget, including reasoning tokens. |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` | The deployed frontend origin. Comma-separated for several origins. |
| `AI_REQUEST_TIMEOUT_MS` | `50000` | Must stay below the function limit (60s) so the server returns `504 AI_TIMEOUT` instead of being killed mid-request. |

If `AI_API_KEY` is missing, the deployment serves clearly labeled synthetic
demo output.

### Caveats

- `maxDuration: 60` is safe on every plan. On classic (non-fluid) projects the
  ceiling is 60s (Hobby) and 300s (Pro); with fluid compute — the default for
  new projects — it is 300s (Hobby) and 800s (Pro, 1800s in beta). Raise
  `maxDuration` in `api/[...path].ts` and `AI_REQUEST_TIMEOUT_MS` together
  when the plan allows it.
- The build command runs `tsc --noEmit && vite build`, so the build needs the
  dev dependencies (`typescript`, `vite`). Do not set `NODE_ENV=production` as
  a Vercel project environment variable: npm would then skip dev dependencies
  during `npm ci` and the build would fail.
- Cold starts add latency to the first request after an idle period.
- Rate limits are in-memory per function instance: they reset on cold start
  and do not aggregate across instances.
- The function is stateless; there is no shared storage between instances.

## Tests

From the repository root:

```bash
npm run typecheck:server
npm run test:server
```

`test:server` runs four suites:

- `server/tests/smoke.ts` — health, both required analyze examples, mock
  labeling, absence of a safety block, generic fallback, invalid
  description/locale/JSON, and JSON 404s.
- `server/tests/failure-paths.ts` — live-mode health, 502 `AI_ERROR` with no
  mock fallback, the 429 analyze limit, CORS allowlist behavior, and 413
  payload limits. It points `AI_BASE_URL` at an unreachable local port and uses
  a fake key; no real provider is contacted.
- `server/tests/prompt.ts` — the system prompt contract: phrasing rules,
  terminology precision, output limits, and the ban on emergency numbers,
  first aid, and model-invented safety advice.
- `server/tests/live-ai.ts` — starts a local stub OpenAI-compatible provider
  and verifies the live success path, request shape, Bearer header, absence of
  a safety block, and `502 AI_INVALID_OUTPUT` / `502 AI_ERROR` handling for bad
  JSON, schema-invalid content, and upstream failures. No real provider is
  contacted.

The suites bind an ephemeral port; they do not require a running server.

Manual checks performed:

- UTF-8 Arabic requests and responses through `curl.exe`.
- Production static `/`, SPA fallback, `/api/health`, and JSON `/api` 404 on a
  separate port.
- Server stopped cleanly and both test ports released.

## Integration notes

- Send `Content-Type: application/json`. Requests with other content types will
  not have a parsed JSON body and will fail validation.
- Call `GET /api/health` on load if the UI needs a mock/live badge. Treat
  `aiConfigured: false` as synthetic demo mode.
- Handle every non-2xx response using `code`, not by parsing the message text.
  Show `requestId` in support/debug details.
- In mock mode, always display `meta.notice` and avoid wording that implies a
  real AI or a diagnosis. The model name `synthetic-demo-v1` is stable.
- A `502` from `/api/analyze` means the AI provider failed. Show the error and
  offer a retry; there is no automatic mock fallback.
- `locale` defaults to `en` and only influences live prompting. All response
  text is bilingual, so the UI can switch languages without re-requesting.
- The API is stateless and has no authentication or database. Do not assume
  accounts, history, or per-user storage.
- Rate limits are in-memory and per process. Running multiple instances or
  behind a proxy requires shared storage and explicit `trust proxy`
  configuration; as shipped, every client behind one proxy may share an IP.

## Source layout

```
server/
├── src/
│   ├── ai/                 # provider adapter and prompt
│   ├── config/             # env parsing and copy
│   ├── http/               # request IDs and rate limiters
│   ├── mock/               # 13 synthetic patterns and analysis builder
│   ├── routes/             # health, analyze, API router
│   ├── schemas/            # validation and error handling
│   ├── text/               # normalization and language detection
│   ├── app.ts              # Express app, middleware, production static
│   └── index.ts            # HTTP server, signals, startup
├── tests/
│   ├── smoke.ts
│   ├── failure-paths.ts
│   ├── prompt.ts
│   └── live-ai.ts
└── README.md

api/[...path].ts            # Vercel serverless entry (imports ../server/src/app)
```

## Known limitations

- The API performs no red-flag triage and returns no safety screening. The
  server and the model both omit emergency numbers, first aid, and safety
  advice; only the shared bilingual disclaimer is returned. Urgent guidance
  must come from the user themselves contacting a healthcare professional.
- Mock-mode symptom matching is keyword/pattern based over 13 known patterns.
  Negation handling covers common simple forms, not nested or ambiguous
  sentences.
- Mock mode recognizes 13 symptom patterns only. Unmatched input gets the honest
  generic fallback, not fabricated content.
- Live output depends on the configured provider supporting an
  OpenAI-compatible `/chat/completions` request with `response_format:
  {"type":"json_object"}`. A provider that rejects that field may return
  `502 AI_ERROR`.
- There is no persistence, authentication, analytics, streaming, or
  multi-instance rate limiting.
