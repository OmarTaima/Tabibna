import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import {
  analyzeRequestSchema,
  analyzeResponseSchema,
  type AiAnalysisContent,
  type AiFollowUpQuestion,
  type AnalysisMeta,
  type FollowUpAnswer,
  type FollowUpQuestion,
  type FollowUpResponse,
  type LocalizedText,
  type MedicalAnalysis,
} from "../../../shared/contract.ts";
import {
  requestAiFinalAnalysis,
  requestAiFollowUpDecision,
  requestAiFollowUpQuestions,
} from "../ai/provider.ts";
import {
  DEMO_NOTICE,
  FULL_DISCLAIMER,
  LIVE_NOTICE,
  MISSING_ANSWERS_MESSAGE,
} from "../config/content.ts";
import { config } from "../config/env.ts";
import { buildMockAnalysis, buildMockFollowUp } from "../mock/mock-analysis.ts";
import { AppError, getRequestId } from "../schemas/errors.ts";
import { parseRequest } from "../schemas/validation.ts";

const MOCK_MODEL = "synthetic-demo-v1";

function buildMeta(live: boolean, notice: LocalizedText): AnalysisMeta {
  return {
    mode: live ? "live" : "mock",
    model: live ? config.aiModel : MOCK_MODEL,
    generatedAt: new Date().toISOString(),
    notice,
  };
}

function toQuestions(questions: readonly AiFollowUpQuestion[]): FollowUpQuestion[] {
  return questions.map((question) => ({
    id: randomUUID(),
    en: question.en,
    ar: question.ar,
  }));
}

function toMedicalAnalysis(
  content: AiAnalysisContent,
  description: string,
  meta: AnalysisMeta,
): MedicalAnalysis {
  const analysisId = randomUUID();

  return {
    id: analysisId,
    meta,
    original: description,
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
    impression: content.impression,
    disclaimer: FULL_DISCLAIMER,
  };
}

function sendFollowUp(
  response: Response,
  round: FollowUpResponse["round"],
  questions: FollowUpQuestion[],
  meta: AnalysisMeta,
): void {
  const body: FollowUpResponse = { status: "follow_up", round, questions, meta };
  response.status(200).json(analyzeResponseSchema.parse(body));
}

export async function analyzeHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = parseRequest(analyzeRequestSchema, request.body);

    if (input.round > 0 && input.answers.length === 0) {
      throw new AppError(400, "INVALID_INPUT", MISSING_ANSWERS_MESSAGE);
    }

    const answers: FollowUpAnswer[] = input.round === 0 ? [] : input.answers;
    const live = config.aiConfigured;
    const requestId = getRequestId(response) ?? "unknown";

    if (input.round === 0) {
      const content = live
        ? await requestAiFollowUpQuestions(input.description, input.locale, requestId)
        : buildMockFollowUp(input.description);

      sendFollowUp(
        response,
        1,
        toQuestions(content.questions),
        buildMeta(live, live ? LIVE_NOTICE : DEMO_NOTICE),
      );
      return;
    }

    if (!live) {
      const analysis = buildMockAnalysis(input.description);
      response.status(200).json(analyzeResponseSchema.parse({ status: "complete", analysis }));
      return;
    }

    if (input.round === 1) {
      const decision = await requestAiFollowUpDecision(
        input.description,
        answers,
        input.locale,
        requestId,
      );

      if (decision.decision === "ask") {
        sendFollowUp(
          response,
          2,
          toQuestions(decision.questions),
          buildMeta(true, LIVE_NOTICE),
        );
        return;
      }

      const analysis = toMedicalAnalysis(
        decision.analysis,
        input.description,
        buildMeta(true, LIVE_NOTICE),
      );
      response.status(200).json(analyzeResponseSchema.parse({ status: "complete", analysis }));
      return;
    }

    const content = await requestAiFinalAnalysis(
      input.description,
      answers,
      input.locale,
      requestId,
    );
    const analysis = toMedicalAnalysis(content, input.description, buildMeta(true, LIVE_NOTICE));
    response.status(200).json(analyzeResponseSchema.parse({ status: "complete", analysis }));
  } catch (error) {
    next(error);
  }
}
