import type { Request, Response } from "express";
import { healthResponseSchema, type HealthResponse } from "../../../shared/contract.ts";
import { APP_VERSION } from "../config/content.ts";
import { config } from "../config/env.ts";

export function healthHandler(_request: Request, response: Response): void {
  const body: HealthResponse = {
    status: "ok",
    mode: config.mode,
    aiConfigured: config.aiConfigured,
    version: APP_VERSION,
  };
  response.status(200).json(healthResponseSchema.parse(body));
}
