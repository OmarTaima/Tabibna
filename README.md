# Tabibna AI

**Medical language, made clear.**

Tabibna AI is a bilingual medical language assistant. It turns informal Egyptian Arabic, standard Arabic, or English symptom descriptions into clear, standardized medical terminology in Arabic and English — with plain-language explanations and missing-information prompts.

It is **not** a diagnostic or treatment tool, and it is not a chatbot. The experience is a single, focused translation workflow: describe, analyze, review, share.

## Features

- Egyptian Arabic, Modern Standard Arabic, and English input
- Standardized English and Arabic medical terms with bilingual explanations
- Clear separation between reported symptoms and cautious clinical interpretation
- Missing-information questions without invented assumptions
- Full English LTR and Arabic RTL interfaces
- Copyable bilingual summary and print/PDF healthcare report
- Medicine reminders with an alarm sound, a browser notification, and an in-app alarm overlay
- Loading, empty, invalid-input, API-error, and mock-mode states
- Clearly labeled synthetic demo mode when no AI provider is configured

## Stack

- React, TypeScript, Vite
- Tailwind CSS and local shadcn/ui-style primitives
- React Hook Form + Zod
- Lucide React
- Express + Zod API
- OpenAI-compatible chat completions adapter (server-only key)

## Project structure

```
tabibna-ai/
├── src/
│   ├── components/       # layout, form, results, print report, UI primitives
│   ├── hooks/            # language state and symptom-analysis flow
│   ├── lib/              # API client, i18n dictionary, copy and report helpers
│   ├── App.tsx
│   └── index.css
├── shared/
│   └── contract.ts       # Zod request/response and medical data contracts
├── server/
│   └── src/              # API, AI provider adapter, mock output
├── docs/design-spec.md
└── .env.example
```

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` to the Express server on port `8787`.

### Modes

| Mode | Trigger | Behavior |
| --- | --- | --- |
| Synthetic demo | `AI_API_KEY` empty or missing | Clearly labeled, deterministic synthetic output. No AI model is called. |
| Live AI | `AI_API_KEY` present | Server calls an OpenAI-compatible API. Output is validated with Zod before returning. |

Configure the server through `.env`:

```dotenv
PORT=8787
ALLOWED_ORIGINS=http://localhost:5173
AI_API_KEY=
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
```

The API key is only read by the Express server. It is never included in client code.

### OpenRouter and reasoning models

The provider adapter works with any OpenAI-compatible chat completions API. For Groq:

```dotenv
AI_BASE_URL=https://api.groq.com/openai/v1
AI_MODEL=openai/gpt-oss-120b
AI_FALLBACK_MODEL=openai/gpt-oss-20b
AI_REASONING_EFFORT=low
AI_MAX_TOKENS=8000
```

`AI_REASONING_EFFORT` sends `reasoning_effort`, which Groq and OpenAI-style APIs accept. OpenRouter instead expects `reasoning: { enabled: true }`, so set `AI_REASONING_ENABLED=true` and leave `AI_REASONING_EFFORT` empty when using it. The two are mutually exclusive: setting an effort takes precedence.

`AI_FALLBACK_MODEL` is optional and is used only when the primary model fails with a retryable upstream error, or returns a truncated or unparseable response. A daily-quota exhaustion is not retried and does not fall back, because no other free model shares that allowance.

`AI_MAX_TOKENS` must leave room for both the reasoning tokens and the final JSON. A budget that is too small makes the provider return a truncated response with `finish_reason: "length"`. The server request timeout is 180 seconds and the browser waits 210 seconds. If a live call fails or returns unverifiable JSON, the app shows an error state and never silently substitutes synthetic data.

Provider rate limits are honoured rather than ignored: a `429` with a "try again in Ns" hint waits for that long (capped at 20 seconds) before retrying, and provider-specific quota errors are reported as accurate `429` responses rather than a generic failure.

## Production

Self-hosted (Express serves the Vite build from `dist` and exposes `/api/*`):

```bash
npm run build
npm start
```

### Vercel

The repository deploys to Vercel as a single project that serves both the SPA
and the API: `api/[...path].ts` runs the Express app as a serverless function
for every `/api/*` route, and Vercel's static output serves the Vite build from
`dist`. Set `AI_API_KEY` and the other variables in the Vercel project
settings — never in the repo.

See [server/README.md → Deploying to Vercel](./server/README.md#deploying-to-vercel)
for the full setup, the required environment variables, and the serverless
caveats (function timeout, cold starts, in-memory rate limiting).

## Safety

- The product provides medical terminology assistance, not diagnosis or treatment.
- The app never claims the user has a disease and never recommends medication or dosage.
- The server and the model both omit emergency numbers, first aid, and safety advice. The app surfaces a bilingual disclaimer that directs the user to a qualified healthcare professional, but it does not triage or screen for warning signs.
- Synthetic demo output is never presented as a real AI analysis.

If you are very unwell or symptoms are severe or worsening, contact your local emergency number. In Egypt, ambulance: **123**; the European emergency number **112** applies in many countries.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Service status and active mode |
| POST | `/api/analyze` | Full medical language analysis |

All requests and responses are validated against `shared/contract.ts`. Errors use `{ error, code, requestId? }`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run API + web app together |
| `npm run dev:web` | Vite frontend only |
| `npm run dev:server` | Express API only (watch mode) |
| `npm run typecheck` | TypeScript check for app + server |
| `npm run build` | Typecheck and build the frontend |
| `npm run test:server` | Server smoke, failure-path, prompt, and live-AI tests |
| `npm run test:client` | Reminder and notification unit tests |
| `npm test` | Run the server and client test suites together |
| `npm start` | Run the production server |

## Medicine reminders

The **Reminders** tab stores reminders locally in the browser (`localStorage`, key `tabibna.reminders.v1`). Nothing is uploaded and no account is required.

- **Schedule**: repeat every N hours (1–24, with presets 4 / 6 / 8 / 12 / 24), or a fixed time each day.
- **Alarm**: a Web Audio two-tone beep, a browser notification, and a full-screen in-app overlay with **Taken**, **Snooze 10 minutes**, and **Dismiss**. The overlay is an `alertdialog`, closes on Escape, and is announced to screen readers.
- **Missed alarms** are caught up once when the page is reopened, then the fixed cadence resumes.
- **Notifications** are delivered through a minimal Service Worker (`public/sw.js`) because Chrome Android blocks the plain `new Notification()` constructor. The worker never caches anything and never intercepts `fetch`.
- **Sound requires a user gesture**: the browser blocks audio until the user interacts with the page, so the alarm is unlocked when a reminder is saved or notifications are enabled.

Limitations worth knowing:

- The alarm only fires while a tab of the app is running. A closed browser cannot ring; that needs Web Push with a server-side subscription store, which this project deliberately does not have.
- Browsers throttle timers in background tabs to roughly once a minute, so the reminder may fire a little late; it is never skipped.
- If notification permission is denied, the in-app overlay and the sound still work, and the UI says so.

Tabibna does not give dosing advice. Reminders only repeat the schedule the user enters, which should follow their doctor or pharmacist.

## Scope

No accounts, database, analytics dashboard, chat history, voice input, or speech output. This is a focused medical language utility.
