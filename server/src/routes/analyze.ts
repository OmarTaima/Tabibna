import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import {
  analyzeRequestSchema,
  analyzeResponseSchema,
  type MedicalAnalysis,
} from "../../../shared/contract";
import { requestAiAnalysis } from "../ai/provider";
import { FULL_DISCLAIMER, LIVE_NOTICE } from "../config/content";
import { config } from "../config/env";
import { buildMockAnalysis } from "../mock/mock-analysis";
import { getRequestId } from "../schemas/errors";
import { parseRequest } from "../schemas/validation";

export async function analyzeHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = parseRequest(analyzeRequestSchema, request.body);

    if (!config.aiConfigured) {
      const analysis = buildMockAnalysis(input.description);
      response.status(200).json(analyzeResponseSchema.parse({ analysis }));
      return;
    }

    const content = await requestAiAnalysis(
      input.description,
      input.locale,
      getRequestId(response) ?? "unknown",
    );
    const analysisId = randomUUID();
    const analysis: MedicalAnalysis = {
      id: analysisId,
      meta: {
        mode: "live",
        model: config.aiModel,
        generatedAt: new Date().toISOString(),
        notice: LIVE_NOTICE,
      },
      original: input.description,
      detectedLanguage: content.detectedLanguage,
      normalized: content.normalized,
      terminology: content.terminology.map((item, index) => ({
        ...item,
        id: `${analysisId}-term-${index + 1}`,
      })),
      clarifications: content.clarifications.map((item, index) => ({
        ...item,
        id: `${analysisId}-clarification-${index + 1}`,
      })),
      clinicalInterpretations: content.clinicalInterpretations.map((item, index) => ({
        ...item,
        id: `${analysisId}-interpretation-${index + 1}`,
      })),
      disclaimer: FULL_DISCLAIMER,
    };

    response.status(200).json(analyzeResponseSchema.parse({ analysis }));
  } catch (error) {
    next(error);
  }
}
