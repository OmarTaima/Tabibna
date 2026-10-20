import type { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { RATE_LIMITED_ANALYZE_MESSAGE } from "../config/content.ts";
import { config } from "../config/env.ts";
import { sendError } from "../schemas/errors.ts";

function createLimiter(limit: number, message: string) {
  return rateLimit({
    windowMs: config.rateLimitWindowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (_request: Request, response: Response) => {
      sendError(response, 429, "RATE_LIMITED", message);
    },
  });
}

export const analyzeRateLimiter = createLimiter(
  config.analyzeRateLimit,
  RATE_LIMITED_ANALYZE_MESSAGE,
);
