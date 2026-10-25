import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import {
  echoRequestSchema,
  echoResponseSchema,
  type AnalysisMeta,
  type EchoAnalysis,
  type EchoTerm,
} from "../../../shared/contract.ts";
import { requestAiEcho } from "../ai/provider.ts";
import { ECHO_DEMO_NOTICE, ECHO_LIVE_NOTICE } from "../config/content.ts";
import { config } from "../config/env.ts";
import { buildMockEcho } from "../mock/mock-echo.ts";
import { getRequestId } from "../schemas/errors.ts";
import { parseRequest } from "../schemas/validation.ts";

const MOCK_MODEL = "synthetic-demo-v1";

function buildMeta(live: boolean): AnalysisMeta {
  return {
    mode: live ? "live" : "mock",
    model: live ? config.aiModel : MOCK_MODEL,
    generatedAt: new Date().toISOString(),
    notice: live ? ECHO_LIVE_NOTICE : ECHO_DEMO_NOTICE,
  };
}

function toEchoTerms(terms: readonly { term: EchoTerm["term"]; explanation: EchoTerm["explanation"] }[]): EchoTerm[] {
  return terms.map((item) => ({
    id: randomUUID(),
    term: item.term,
    explanation: item.explanation,
  }));
}

export async function echoHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = parseRequest(echoRequestSchema, request.body);
    const live = config.aiConfigured;

    const content = live
      ? await requestAiEcho(input.text, input.locale, getRequestId(response) ?? "unknown")
      : buildMockEcho(input.text);

    const analysis: EchoAnalysis = {
      id: randomUUID(),
      meta: buildMeta(live),
      original: input.text,
      summary: content.summary,
      terms: toEchoTerms(content.terms),
    };

    response.status(200).json(echoResponseSchema.parse({ analysis }));
  } catch (error) {
    next(error);
  }
}
