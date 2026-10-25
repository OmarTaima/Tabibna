# VivaValve — Server

Express + TypeScript API for VivaValve 2.0.0. It provides an optional
OpenAI-compatible adapter for two features and a deterministic synthetic demo
mode that never calls an AI provider:

- **FollowUps** — `POST /api/analyze` is an adaptive two-round follow-up flow that
  ends in a specific AI assessment.
- **EchoBridge** — `POST /api/echo` explains echocardiography report terms in
  plain language.

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
| `AI_FALLBACK_MODEL` | empty | Optional second model for retryable upstream failures. |
| `AI_REQUEST_TIMEOUT_MS` | `180000` | Integer, `1000`–`600000`. Timeout for one AI request. Use a lower value on serverless platforms (`50000` on Vercel). |
| `AI_MAX_TOKENS` | `12000` | Completion token budget, including reasoning tokens. |
| `ANALYZE_RATE_LIMIT` | `30` | Requests per IP per 15-minute window, integer `1`–`1000`. Shared by `/api/analyze` and `/api/echo`. |

Invalid numeric ranges or malformed origins/URLs fail startup instead of silently
falling back.

Secrets belong only in `.env` (git-ignored). Never expose `AI_API_KEY` to the
browser bundle.

## Modes

| Mode | Trigger | Behavior |
| --- | --- | --- |
| `mock` | `AI_API_KEY` empty or missing | Builds deterministic synthetic output from local patterns. No network call. `meta.mode` is `mock`, `meta.model` is `synthetic-demo-v1`, and the notice states that no AI was used. |
| `live` | `AI_API_KEY` non-empty | Calls the configured OpenAI-compatible provider, validates the returned JSON, then merges it with the local notices and disclaimer. |

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
  "version": "2.0.0"
}
```

`mode` is `"mock"` or `"live"`. The response is always `200` when the process is
serving traffic.

### `POST /api/analyze` — FollowUps

Adaptive two-round follow-up flow. `MAX_FOLLOW_UP_ROUNDS = 2` and
`MAX_FOLLOW_UP_QUESTIONS = 3` are exported by the shared contract.

Request:

```json
{
  "description": "عندي صداع من امبارح، ودوخة لما أقف، وحرارة بسيطة، وبحس بتعب عام.",
  "locale": "ar",
  "round": 0,
  "answers": []
}
```

- `description`: required, trimmed, 10–2,000 characters.
- `locale`: optional, `"en"` or `"ar"`, defaults to `"en"`. It guides the live AI
  prompt; mock mode ignores it. The output is always bilingual.
- `round`: optional integer `0`–`2`, defaults to `0`.
- `answers`: optional array, at most 6 items. Each item is
  `{ "questionId": string, "question": string, "answer": string }`.

Round rules:

| `round` | `answers` | Server behavior |
| --- | --- | --- |
| `0` | ignored (any answers are discarded) | Ask 2–3 high-yield questions, respond `status: "follow_up"`, `round: 1`. |
| `1` | required, non-empty | Ask the AI whether one more round is needed. `decision: "ask"` → `status: "follow_up"`, `round: 2`. `decision: "final"` → `status: "complete"` with the analysis. |
| `2` | required, non-empty | Force the final analysis. No more questions are ever asked. |

`round > 0` with an empty `answers` array is rejected with
`400 INVALID_INPUT`.

The response is a discriminated union on `status`.

Follow-up response (`200`):

```json
{
  "status": "follow_up",
  "round": 1,
  "questions": [
    {
      "id": "0f0a3d6e-5f0a-4a4e-9d3f-6f4a2f0c9b11",
      "en": "When did the headache start, and was it sudden or gradual?",
      "ar": "متى بدأ الصداع، وهل كان مفاجئًا أم تدريجيًا؟"
    }
  ],
  "meta": {
    "mode": "mock",
    "model": "synthetic-demo-v1",
    "generatedAt": "2026-10-25T21:10:04.120Z",
    "notice": { "en": "Synthetic demo output: no AI model was used. ...", "ar": "..." }
  }
}
```

- `questions`: 1–3 items. `id` is a `randomUUID()` and is the value to send back
  in `answers[].questionId`.
- `meta` uses the same shape as the analysis meta. In live mode it carries
  `LIVE_NOTICE`; in mock mode `DEMO_NOTICE`.

Complete response (`200`):

```json
{
  "status": "complete",
  "analysis": {
    "id": "63fbf65a-ca55-49fc-987d-870a2a47b85b",
    "meta": {
      "mode": "live",
      "model": "gpt-4o-mini",
      "generatedAt": "2026-10-25T21:11:42.873Z",
      "notice": { "en": "AI-generated assessment. ...", "ar": "..." }
    },
    "original": "I have had a headache since yesterday.",
    "detectedLanguage": "en",
    "normalized": { "en": "...", "ar": "..." },
    "terminology": [
      {
        "id": "63fbf65a-ca55-49fc-987d-870a2a47b85b-term-1",
        "english": "Headache",
        "arabic": "صداع",
        "kind": "symptom",
        "origin": "reported",
        "certainty": "stated",
        "explanation": { "en": "...", "ar": "..." }
      }
    ],
    "clarifications": [
      {
        "id": "63fbf65a-ca55-49fc-987d-870a2a47b85b-clarification-1",
        "label": { "en": "Onset", "ar": "البداية" },
        "question": { "en": "When did it start?", "ar": "متى بدأ؟" }
      }
    ],
    "clinicalInterpretations": [
      {
        "id": "63fbf65a-ca55-49fc-987d-870a2a47b85b-interpretation-1",
        "label": { "en": "...", "ar": "..." },
        "detail": { "en": "...", "ar": "..." },
        "basis": { "en": "...", "ar": "..." },
        "confidence": "low"
      }
    ],
    "impression": {
      "primary": { "en": "Tension-type headache", "ar": "الصداع التوتري" },
      "confidence": "moderate",
      "differentials": [
        { "en": "Migraine without aura", "ar": "الشقيقة بدون هالة" }
      ],
      "rationale": {
        "en": "The mild headache worsened by fatigue and the absence of fever ... fit this pattern best.",
        "ar": "..."
      }
    },
    "disclaimer": { "en": "VivaValve provides AI-generated health information, not a confirmed diagnosis. ...", "ar": "..." }
  }
}
```

`impression` is required in 2.0.0:

- `primary`: the single most likely diagnosis in both languages.
- `confidence`: `"low" | "moderate" | "high"`.
- `differentials`: 0–4 alternative diagnoses.
- `rationale`: 1–3 sentences referencing the reported features and the answers.

An AI impression is a probabilistic assessment, **not a confirmed diagnosis**;
`analysis.disclaimer` says so in both languages and must stay visible in the UI.

The final object enforces at most 10 terminology items, 5 clarifications, and 3
clinical interpretations. The AI response schema is narrower (8 / 4 / 3).

### `POST /api/echo` — EchoBridge

Explains echocardiography report terms, values, and abbreviations in plain
language. Same rate limiter as `/api/analyze`.

Request:

```json
{
  "text": "Echocardiography report: LVEF 55%, moderate mitral regurgitation, aortic valve area 1.0 cm2.",
  "locale": "en"
}
```

- `text`: required, trimmed, 10–4,000 characters.
- `locale`: optional, `"en"` or `"ar"`, defaults to `"en"`. Guides the live AI
  prompt; both languages are always returned.

Response (`200`):

```json
{
  "analysis": {
    "id": "9b6f7f5e-6a4c-4f3e-8b2d-5c1a0e9d7f22",
    "meta": {
      "mode": "mock",
      "model": "synthetic-demo-v1",
      "generatedAt": "2026-10-25T21:14:02.004Z",
      "notice": { "en": "Synthetic demo glossary: no AI model was used. ...", "ar": "..." }
    },
    "original": "Echocardiography report: LVEF 55%, moderate mitral regurgitation, aortic valve area 1.0 cm2.",
    "summary": {
      "en": "Synthetic demo output: no AI model was used. The report mentions ejection fraction (EF), ...",
      "ar": "مخرجات تجريبية اصطناعية: لم يُستخدم أي نموذج ذكاء اصطناعي. ..."
    },
    "terms": [
      {
        "id": "3c7f2a1d-8e5b-4c9a-9f10-2d6b8e4a1c33",
        "term": { "en": "Ejection fraction (EF)", "ar": "الكسر القذفي (EF)" },
        "explanation": {
          "en": "The share of blood in the left ventricle that is pumped out with each beat, shown as a percentage.",
          "ar": "نسبة الدم في البطين الأيسر التي تُضخّ مع كل نبضة، وتُعرض كنسبة مئوية."
        }
      }
    ]
  }
}
```

- `summary`: 2–3 sentences (live) in both languages.
- `terms`: 0–15 items. `id` is a `randomUUID()`. Each item explains what the term
  or measurement means in general; it never interprets the patient's value.
- Echo responses never include a diagnosis, a severity grade, or treatment.

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
| `400` | `INVALID_INPUT` | Missing/blank/too-short/too-long description or echo report, unsupported locale, out-of-range round, a follow-up round without answers, or non-object body. |
| `400` | `INVALID_JSON` | Body is not parseable JSON. |
| `413` | `PAYLOAD_TOO_LARGE` | JSON body exceeds 32 kb. |
| `404` | `NOT_FOUND` | Unknown `/api/*` route, or unknown non-API route outside production static mode. |
| `429` | `RATE_LIMITED` | Per-IP limit exceeded for `/api/analyze` or `/api/echo`. Standards-based rate-limit headers are included. |
| `429` | `AI_RATE_LIMITED` | The provider is throttling this account right now. The request was retried before failing. |
| `429` | `AI_DAILY_QUOTA` | The provider's daily free-model allowance is exhausted. The request is not retried, because only the daily reset clears it. |
| `500` | `INTERNAL_ERROR` | Unexpected server failure. Details are logged server-side only. |
| `502` | `AI_ERROR` | Provider network error or non-2xx response in live mode. No mock fallback. |
| `504` | `AI_TIMEOUT` | The provider did not answer within the request timeout. No mock fallback. |
| `502` | `AI_INVALID_OUTPUT` | Provider response was not valid JSON, was truncated, or failed the AI content schema. No mock fallback. |

Client messages are deliberately generic; upstream response bodies and secrets
are never forwarded.

### Provider resilience

Every AI call goes through one generic adapter
(`requestAiJson({ systemPrompt, userPrompt, schema, operation, requestId })`), so
follow-up questions, the follow-up decision, the final analysis, and the echo
glossary share the same behavior:

- per-request timeout (`AI_REQUEST_TIMEOUT_MS`) mapped to `504 AI_TIMEOUT`;
- up to three attempts for retryable upstream statuses (408, 409, 425, 429, 500,
  502, 503, 504), honouring a provider `try again in Ns` hint;
- optional fallback model (`AI_FALLBACK_MODEL`) when the primary model is
  retryable-failed or produced unusable output;
- `finish_reason: "length"` treated as `AI_INVALID_OUTPUT` and retried on the
  fallback model;
- JSON extraction (code fences and surrounding prose tolerated), then strict Zod
  validation;
- diagnostics logging with `operation`, `requestId`, `finishReason`, token
  counts, content length, and Zod issue paths — never the description, answers,
  prompt, response text, or key.

`AI_MAX_TOKENS` (default `12000`) must cover reasoning tokens plus the final
JSON. Too small a budget makes the provider return a truncated body with
`finish_reason: "length"`.

## Synthetic demo mode

Mock output is used only when `AI_API_KEY` is empty. It is deterministic apart
from IDs and timestamps, bilingual, and explicitly labeled as synthetic
(`meta.mode: "mock"`, `meta.model: "synthetic-demo-v1"`, synthetic notice).

`POST /api/analyze` in mock mode:

- `round: 0` returns 3 follow-up questions drawn from the matched symptom
  clarification patterns, padded with generic onset/severity/associated-symptom
  questions.
- `round >= 1` returns a complete mock analysis. Its `impression` is clearly
  synthetic: `primary` is "Synthetic demo — no diagnosis generated",
  `confidence` is `"low"`, `differentials` is empty, and `rationale` states that
  demo mode does not call an AI model.

`POST /api/echo` in mock mode matches 10 echocardiography keywords:

1. Aortic valve area
2. Peak velocity
3. Mean pressure gradient
4. Left ventricular hypertrophy (LVH)
5. Ejection fraction (EF)
6. Regurgitation
7. Stenosis
8. Mitral valve
9. Left atrium
10. Aorta

Each entry has a bilingual plain-language explanation. When nothing matches, the
response says so honestly and returns one generic "Echocardiography report" term
instead of inventing findings.

The 13 recognized symptom patterns are unchanged:

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
- Per-IP rate limits are applied to `POST /api/analyze` and `POST /api/echo`
  (one shared limiter). `GET /api/health` is not limited.
- CORS uses an explicit allowlist, not a reflected wildcard.
- Secrets are loaded from `.env` only. No key, description, echo report, or
  follow-up answer is logged. Server logs contain only lifecycle messages, error
  codes, the AI operation, upstream status, token counts, and request IDs.
- Every prompt treats user text as untrusted JSON data and instructs the model to
  ignore injected instructions, including requests to reveal the prompt or change
  the output format.
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
vivavalve/
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
- A two-round follow-up flow makes up to two AI calls across two requests. Each
  request must stay inside the function duration limit.
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

- `server/tests/smoke.ts` — mock mode: health/version, round 0 follow-up
  questions, round 1 and round 2 completion with a synthetic `impression`, the
  missing-answers guard, answers ignored on round 0, the echo glossary and its
  fallback, invalid echo input/locale/JSON, absence of a safety block, and JSON
  404s.
- `server/tests/failure-paths.ts` — live-mode health, 502 `AI_ERROR` with no
  mock fallback, the shared analyze/echo 429 limit, CORS allowlist behavior, and
  413 payload limits. It points `AI_BASE_URL` at an unreachable local port and
  uses a fake key; no real provider is contacted.
- `server/tests/prompt.ts` — the four system prompts: VivaValve branding,
  untrusted-data rules, follow-up caps, the ask/final decision shape, the
  diagnosis-in-impression rule with the treatment ban, echo plain-language
  rules, and the preserved terminology/Arabic-spelling rules.
- `server/tests/live-ai.ts` — starts a local stub OpenAI-compatible provider that
  distinguishes the follow-up, decision, final, and echo prompts, and verifies
  the live success paths, request shape, Bearer header, Arabic spelling
  correction, absence of a safety block, `502 AI_INVALID_OUTPUT` / `502 AI_ERROR`
  handling for bad JSON, schema-invalid content, and upstream failures, plus
  `429 AI_DAILY_QUOTA` and the truncation fallback. Logs are asserted to contain
  the operation and request ID but never the description, answers, or key.

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
- `/api/analyze` is a state machine driven by `status`. Keep the returned
  question `id`s and send them back in `answers[].questionId` with the same
  `round` the server returned plus one.
- A `follow_up` response has no `analysis`; a `complete` response has no
  `questions`. Branch on `status` before reading either field.
- Handle every non-2xx response using `code`, not by parsing the message text.
  Show `requestId` in support/debug details.
- In mock mode, always display `meta.notice` and avoid wording that implies a
  real AI or a confirmed diagnosis. The model name `synthetic-demo-v1` is
  stable.
- `impression` is an AI assessment, not a confirmed diagnosis. Always show
  `analysis.disclaimer`, and show `impression.confidence` and the differentials
  as possibilities rather than conclusions.
- A `502` from `/api/analyze` or `/api/echo` means the AI provider failed. Show
  the error and offer a retry; there is no automatic mock fallback.
- `locale` defaults to `en` and only influences live prompting. All response
  text is bilingual, so the UI can switch languages without re-requesting.
- The API is stateless and has no authentication or database. Do not assume
  accounts, history, or per-user storage.
- Rate limits are in-memory and per process, and `/api/analyze` and `/api/echo`
  share one bucket. Running multiple instances or behind a proxy requires shared
  storage and explicit `trust proxy` configuration; as shipped, every client
  behind one proxy may share an IP.

## Source layout

```
server/
├── src/
│   ├── ai/                 # provider adapter, prompts, Arabic text correction
│   ├── config/             # env parsing and copy
│   ├── http/               # request IDs and rate limiters
│   ├── mock/               # symptom patterns, analysis builder, echo glossary
│   ├── routes/             # health, analyze, echo, API router
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
- The AI impression can be wrong. It is deliberately labeled as an unconfirmed
  assessment, and the UI must present it that way.
- Mock-mode symptom matching is keyword/pattern based over 13 known patterns,
  and the echo glossary over 10 known keywords. Negation handling covers common
  simple forms, not nested or ambiguous sentences.
- Mock mode never produces a diagnosis; its impression is a synthetic
  placeholder.
- Live output depends on the configured provider supporting an
  OpenAI-compatible `/chat/completions` request with `response_format:
  {"type":"json_object"}`. A provider that rejects that field may return
  `502 AI_ERROR`.
- There is no persistence, authentication, analytics, streaming, or
  multi-instance rate limiting.
