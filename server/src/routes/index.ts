import { Router } from "express";
import { NOT_FOUND_MESSAGE } from "../config/content.ts";
import { analyzeRateLimiter } from "../http/rate-limit.ts";
import { sendError } from "../schemas/errors.ts";
import { analyzeHandler } from "./analyze.ts";
import { healthHandler } from "./health.ts";

export function createApiRouter(): Router {
  const router = Router();

  router.use((_request, response, next) => {
    response.setHeader("Cache-Control", "no-store");
    next();
  });

  router.get("/health", healthHandler);
  router.post("/analyze", analyzeRateLimiter, analyzeHandler);

  router.use((_request, response) => {
    sendError(response, 404, "NOT_FOUND", NOT_FOUND_MESSAGE);
  });

  return router;
}
