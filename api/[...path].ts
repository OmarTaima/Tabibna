import { createApp } from "../server/src/app";

/**
 * Vercel serverless entrypoint for every `/api/*` route.
 *
 * The Express app is exported directly (Vercel accepts an Express app as the
 * default export) and no HTTP listener is started, because the platform owns
 * the request lifecycle. `server/src/index.ts` must not be imported here: it
 * calls `server.listen()` and would keep the function alive.
 */
export const config = {
  runtime: "nodejs",
  maxDuration: 60,
};

const app = createApp();

export default app;
