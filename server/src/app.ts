import { existsSync } from "node:fs";
import path from "node:path";
import cors, { type CorsOptions } from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { NOT_FOUND_MESSAGE } from "./config/content.ts";
import { config } from "./config/env.ts";
import { requestIdMiddleware } from "./http/request-id.ts";
import { createApiRouter } from "./routes/index.ts";
import { errorHandler, sendError } from "./schemas/errors.ts";

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    const allowed =
      origin === undefined ||
      config.allowedOrigins.includes("*") ||
      config.allowedOrigins.includes(origin);
    callback(null, allowed);
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Accept"],
  exposedHeaders: ["X-Request-ID"],
  maxAge: 86_400,
  optionsSuccessStatus: 204,
};

function mountProductionStatic(app: Express): void {
  const distDirectory = path.join(config.projectRoot, "dist");
  const indexFile = path.join(distDirectory, "index.html");

  if (!existsSync(indexFile)) {
    console.warn("[server] production build not found; static serving is disabled");
    return;
  }

  app.use(
    express.static(distDirectory, {
      index: false,
      setHeaders(response, filePath) {
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          response.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          return;
        }
        response.setHeader("Cache-Control", "public, max-age=3600");
      },
    }),
  );

  app.get("*", (request, response, next) => {
    if (request.path.startsWith("/api")) {
      next();
      return;
    }
    response.setHeader("Cache-Control", "no-store");
    response.sendFile(indexFile, (error) => {
      if (error) next(error);
    });
  });
}

export function createApp(): Express {
  const app = express();
  app.disable("x-powered-by");

  app.use(
    helmet({
      contentSecurityPolicy: config.isProduction
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
              fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
              imgSrc: ["'self'", "data:"],
              connectSrc: ["'self'"],
              objectSrc: ["'none'"],
              baseUri: ["'self'"],
              frameAncestors: ["'none'"],
              formAction: ["'self'"],
              upgradeInsecureRequests: null,
            },
          }
        : false,
      crossOriginEmbedderPolicy: false,
      referrerPolicy: { policy: "no-referrer" },
    }),
  );

  app.use(requestIdMiddleware);
  app.use(cors(corsOptions));
  app.use("/api", express.json({ limit: "32kb" }));
  app.use("/api", createApiRouter());

  // On Vercel the function bundle has no built SPA: the static output is
  // served by the platform, so Express must not try to mount it.
  if (config.isProduction && !config.isVercel) mountProductionStatic(app);

  app.use((_request, response) => {
    sendError(response, 404, "NOT_FOUND", NOT_FOUND_MESSAGE);
  });
  app.use(errorHandler);

  return app;
}
