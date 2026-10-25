import type { ZodType } from "zod";
import {
  aiAnalysisContentSchema,
  aiEchoContentSchema,
  aiFollowUpContentSchema,
  aiFollowUpDecisionSchema,
  type AiAnalysisContent,
  type AiEchoContent,
  type AiFollowUpContent,
  type AiFollowUpDecision,
  type FollowUpAnswer,
  type Locale,
} from "../../../shared/contract.ts";
import {
  AI_DAILY_QUOTA_MESSAGE,
  AI_ERROR_MESSAGE,
  AI_INVALID_OUTPUT_MESSAGE,
  AI_REQUEST_TIMEOUT_MS,
  AI_TIMEOUT_MESSAGE,
  AI_UPSTREAM_RATE_LIMIT_MESSAGE,
} from "../config/content.ts";
import { config } from "../config/env.ts";
import { AppError } from "../schemas/errors.ts";
import { correctArabicParesthesiaSpelling } from "./arabic-text.ts";
import {
  AI_ECHO_SYSTEM_PROMPT,
  AI_FINAL_SYSTEM_PROMPT,
  AI_FOLLOW_UP_DECISION_SYSTEM_PROMPT,
  AI_FOLLOW_UP_SYSTEM_PROMPT,
  buildEchoUserPrompt,
  buildFinalUserPrompt,
  buildFollowUpDecisionUserPrompt,
  buildFollowUpUserPrompt,
} from "./prompt.ts";

export type AiOperation =
  | "follow_up_questions"
  | "follow_up_decision"
  | "final_analysis"
  | "echo_glossary";

type ChatCompletionChoice = {
  content: string | null;
  finishReason: string | null;
};

type TokenUsage = {
  completionTokens: number | null;
  reasoningTokens: number | null;
};

type ZodIssueSummary = {
  path: string;
  code: string;
};

type InvalidOutputDiagnostics = {
  requestId: string;
  operation: AiOperation;
  reason: "response_json" | "missing_content" | "finish_length" | "json_parse" | "schema";
  finishReason: string | null;
  completionTokens: number | null;
  reasoningTokens: number | null;
  contentLength: number;
  parseError: string | null;
  issues: ZodIssueSummary[] | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readFirstChoice(payload: unknown): ChatCompletionChoice | null {
  if (!isRecord(payload) || !Array.isArray(payload.choices)) return null;
  const choice: unknown = payload.choices[0];
  if (!isRecord(choice)) return null;

  const message = choice.message;
  const content = isRecord(message) && typeof message.content === "string" ? message.content : null;
  const finishReason = typeof choice.finish_reason === "string" ? choice.finish_reason : null;

  return { content, finishReason };
}

function readTokenCount(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) return null;
  return value;
}

function readTokenUsage(payload: unknown): TokenUsage {
  if (!isRecord(payload) || !isRecord(payload.usage)) {
    return { completionTokens: null, reasoningTokens: null };
  }

  const usage = payload.usage;
  const details = isRecord(usage.completion_tokens_details) ? usage.completion_tokens_details : {};

  return {
    completionTokens: readTokenCount(usage.completion_tokens),
    reasoningTokens:
      readTokenCount(details.reasoning_tokens) ?? readTokenCount(usage.reasoning_tokens),
  };
}

function stripCodeFence(content: string): string {
  const trimmed = content.trim();
  if (!trimmed.startsWith("```")) return trimmed;
  return trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

function jsonCandidates(content: string): string[] {
  const stripped = stripCodeFence(content);
  const candidates = [stripped];

  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start !== -1 && end > start) {
    const narrowed = stripped.slice(start, end + 1);
    if (narrowed !== stripped) candidates.push(narrowed);
  }

  return candidates;
}

function parseJsonObject(content: string): unknown {
  for (const candidate of jsonCandidates(content)) {
    try {
      const parsed: unknown = JSON.parse(candidate);
      if (isRecord(parsed)) return parsed;
    } catch {
      continue;
    }
  }
  return undefined;
}

function invalidOutput(diagnostics: InvalidOutputDiagnostics): AppError {
  console.error(`[ai] invalid output ${JSON.stringify(diagnostics)}`);
  return new AppError(502, "AI_INVALID_OUTPUT", AI_INVALID_OUTPUT_MESSAGE);
}

/**
 * Providers disagree on how reasoning is requested: OpenRouter accepts a
 * `reasoning: { enabled: true }` object, while Groq and OpenAI-style APIs
 * reject that property and expect `reasoning_effort`.
 */
function buildReasoningParams(): Record<string, unknown> {
  if (config.aiReasoningEffort !== "") {
    return { reasoning_effort: config.aiReasoningEffort };
  }
  if (config.aiReasoningEnabled) {
    return { reasoning: { enabled: true } };
  }
  return {};
}

function buildRequestHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${config.aiApiKey}`,
  };

  if (config.aiSiteUrl !== "") headers["HTTP-Referer"] = config.aiSiteUrl;
  if (config.aiAppName !== "") headers["X-Title"] = config.aiAppName;

  return headers;
}

const RETRYABLE_UPSTREAM_STATUS = new Set([408, 409, 425, 429, 500, 502, 503, 504]);
const MAX_UPSTREAM_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 2_000;

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    if (signal.aborted) {
      onAbort();
      return;
    }
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

type UpstreamFailure = {
  status: number;
  body: string;
  isDailyQuota: boolean;
  isTooLarge: boolean;
  resetAt: number | null;
};

function readResetAt(headers: Headers): number | null {
  const raw = headers.get("x-ratelimit-reset");
  if (raw === null) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function detectDailyQuota(status: number, body: string, headers: Headers): boolean {
  if (status !== 429) return false;

  try {
    const parsed: unknown = JSON.parse(body);
    if (isRecord(parsed) && isRecord(parsed.error)) {
      const error = parsed.error;
      const metadata = isRecord(error.metadata) ? error.metadata : null;
      if (metadata?.limit_source === "openrouter_free_tier_daily") return true;
      const message = typeof error.message === "string" ? error.message : "";
      if (message.includes("free-models-per-day")) return true;
    }
  } catch {
    // fall through to header-based detection
  }

  return headers.get("x-ratelimit-remaining") === "0";
}

/**
 * Providers such as Groq return a concrete "try again in Ns" hint inside a
 * 429 body. Honouring it avoids hammering the endpoint while it is still
 * cooling down, but the wait is capped so a request cannot stall for a
 * minute; beyond the cap the fallback model is used instead.
 */
const MAX_RETRY_DELAY_MS = 20_000;

function readRetryHintMs(body: string): number | null {
  const match = /try again in\s+([\d.]+)\s*s/i.exec(body);
  if (match === null) return null;
  const seconds = Number(match[1]);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return Math.min(Math.ceil(seconds * 1000), MAX_RETRY_DELAY_MS);
}

/**
 * A request that is larger than the provider allows will fail identically on
 * every retry, so it must go straight to the fallback model instead.
 */
function isRequestTooLarge(body: string): boolean {
  return /request too large|expected output tokens exceed/i.test(body);
}

type UpstreamAttempt = {
  failure: UpstreamFailure;
  attempts: number;
  model: string;
};

async function sendUpstreamRequest(
  model: string,
  body: string,
  signal: AbortSignal,
  operation: AiOperation,
  requestId: string,
): Promise<UpstreamAttempt> {
  let lastFailure: UpstreamFailure | null = null;
  let attempts = 0;

  for (let attempt = 1; attempt <= MAX_UPSTREAM_ATTEMPTS; attempt += 1) {
    attempts = attempt;
    const response = await fetch(`${config.aiBaseUrl}/chat/completions`, {
      method: "POST",
      headers: buildRequestHeaders(),
      body,
      signal,
    });

    if (response.ok) {
      const responseBody = await response.text().catch(() => "");
      return {
        failure: {
          status: response.status,
          body: responseBody,
          isDailyQuota: false,
          isTooLarge: false,
          resetAt: null,
        },
        attempts: attempt,
        model,
      };
    }

    const responseBody = await response.text().catch(() => "");
    const failure: UpstreamFailure = {
      status: response.status,
      body: responseBody,
      isDailyQuota: detectDailyQuota(response.status, responseBody, response.headers),
      isTooLarge: isRequestTooLarge(responseBody),
      resetAt: readResetAt(response.headers),
    };
    lastFailure = failure;

    const canRetry =
      attempt < MAX_UPSTREAM_ATTEMPTS &&
      RETRYABLE_UPSTREAM_STATUS.has(response.status) &&
      !failure.isDailyQuota &&
      !failure.isTooLarge;

    if (!canRetry) {
      break;
    }

    const delay = readRetryHintMs(responseBody) ?? RETRY_BASE_DELAY_MS * attempt;
    console.warn(
      `[ai] upstream status=${response.status} operation=${operation} model=${model} attempt=${attempt} retrying in ${delay}ms requestId=${requestId}`,
    );
    await sleep(delay, signal);
  }

  if (lastFailure === null) {
    throw new AppError(502, "AI_ERROR", AI_ERROR_MESSAGE);
  }

  return { failure: lastFailure, attempts, model };
}

type AiRequestInput<T> = {
  systemPrompt: string;
  userPrompt: string;
  schema: ZodType<T>;
  operation: AiOperation;
  requestId: string;
};

type ModelOutcome<T> =
  | {
      kind: "ok";
      content: T;
      model: string;
      finishReason: string | null;
      usage: TokenUsage;
      contentLength: number;
    }
  | { kind: "http"; failure: UpstreamFailure; attempts: number; model: string }
  | {
      kind: "invalid";
      reason: InvalidOutputDiagnostics["reason"];
      model: string;
      finishReason: string | null;
      usage: TokenUsage;
      contentLength: number;
      issues: ZodIssueSummary[] | null;
    };

export async function requestAiJson<T>({
  systemPrompt,
  userPrompt,
  schema,
  operation,
  requestId,
}: AiRequestInput<T>): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);
  const startedAt = Date.now();

  try {
    const buildBody = (model: string) =>
      JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.1,
        max_tokens: config.aiMaxTokens,
        ...buildReasoningParams(),
        response_format: { type: "json_object" },
        stream: false,
      });

    const fallbackModels = [config.aiFallbackModel].filter(
      (model): model is string => model !== "" && model !== config.aiModel,
    );

    const runModel = async (model: string): Promise<ModelOutcome<T>> => {
      const { failure, attempts: modelAttempts } = await sendUpstreamRequest(
        model,
        buildBody(model),
        controller.signal,
        operation,
        requestId,
      );

      if (failure.status !== 200) {
        return { kind: "http", failure, attempts: modelAttempts, model };
      }

      let payload: unknown;
      try {
        payload = JSON.parse(failure.body);
      } catch {
        return {
          kind: "invalid",
          reason: "response_json",
          model,
          finishReason: null,
          usage: { completionTokens: null, reasoningTokens: null },
          contentLength: 0,
          issues: null,
        };
      }

      const choice = readFirstChoice(payload);
      const usage = readTokenUsage(payload);
      const content = choice?.content ?? "";
      const contentLength = content.length;
      const finishReason = choice?.finishReason ?? null;

      if (choice === null || choice.content === null || choice.content.trim() === "") {
        return {
          kind: "invalid",
          reason: "missing_content",
          model,
          finishReason,
          usage,
          contentLength,
          issues: null,
        };
      }

      if (finishReason === "length") {
        return {
          kind: "invalid",
          reason: "finish_length",
          model,
          finishReason,
          usage,
          contentLength,
          issues: null,
        };
      }

      const parsed = parseJsonObject(content);
      if (parsed === undefined) {
        return {
          kind: "invalid",
          reason: "json_parse",
          model,
          finishReason,
          usage,
          contentLength,
          issues: null,
        };
      }

      const result = schema.safeParse(parsed);
      if (!result.success) {
        return {
          kind: "invalid",
          reason: "schema",
          model,
          finishReason,
          usage,
          contentLength,
          issues: result.error.issues.map((issue) => ({
            path: issue.path.join("."),
            code: issue.code,
          })),
        };
      }

      return {
        kind: "ok",
        content: result.data,
        model,
        finishReason,
        usage,
        contentLength,
      };
    };

    let outcome = await runModel(config.aiModel);

    for (const fallbackModel of fallbackModels) {
      if (outcome.kind === "ok") break;
      if (outcome.kind === "http") {
        if (outcome.failure.isDailyQuota) break;
        if (!RETRYABLE_UPSTREAM_STATUS.has(outcome.failure.status)) break;
      }

      console.warn(
        `[ai] model ${outcome.model} produced unusable output (${outcome.kind}) operation=${operation} falling back to ${fallbackModel} requestId=${requestId}`,
      );
      outcome = await runModel(fallbackModel);
    }

    if (outcome.kind === "http") {
      const { failure, attempts, model } = outcome;
      if (failure.isDailyQuota) {
        console.error(
          `[ai] request failed reason=daily_quota operation=${operation} model=${model} attempts=${attempts} resetAt=${failure.resetAt} requestId=${requestId}`,
        );
        throw new AppError(429, "AI_DAILY_QUOTA", AI_DAILY_QUOTA_MESSAGE);
      }
      if (failure.status === 429) {
        console.error(
          `[ai] request failed reason=upstream_rate_limit operation=${operation} model=${model} attempts=${attempts} requestId=${requestId}`,
        );
        throw new AppError(429, "AI_RATE_LIMITED", AI_UPSTREAM_RATE_LIMIT_MESSAGE);
      }
      console.error(
        `[ai] request failed reason=status status=${failure.status} operation=${operation} model=${model} attempts=${attempts} requestId=${requestId}`,
      );
      throw new AppError(502, "AI_ERROR", AI_ERROR_MESSAGE);
    }

    if (outcome.kind === "invalid") {
      throw invalidOutput({
        requestId,
        operation,
        reason: outcome.reason,
        finishReason: outcome.finishReason,
        ...outcome.usage,
        contentLength: outcome.contentLength,
        parseError: outcome.reason === "json_parse" ? "syntax_error" : null,
        issues: outcome.issues,
      });
    }

    const { content: validatedContent, model, finishReason, usage, contentLength } = outcome;

    console.log(
      `[ai] ok operation=${operation} requestId=${requestId} model=${model} finishReason=${finishReason} completionTokens=${usage.completionTokens} reasoningTokens=${usage.reasoningTokens} contentLength=${contentLength} durationMs=${Date.now() - startedAt}`,
    );

    return validatedContent;
  } catch (error) {
    if (error instanceof AppError) throw error;
    const isAbort =
      error instanceof Error &&
      (error.name === "AbortError" || error.name === "TimeoutError");
    if (isAbort) {
      console.error(`[ai] request failed reason=timeout operation=${operation} requestId=${requestId}`);
      throw new AppError(504, "AI_TIMEOUT", AI_TIMEOUT_MESSAGE);
    }
    console.error(`[ai] request failed reason=network operation=${operation} requestId=${requestId}`);
    throw new AppError(502, "AI_ERROR", AI_ERROR_MESSAGE);
  } finally {
    clearTimeout(timeout);
  }
}

export function requestAiFollowUpQuestions(
  description: string,
  locale: Locale,
  requestId: string,
): Promise<AiFollowUpContent> {
  return requestAiJson({
    systemPrompt: AI_FOLLOW_UP_SYSTEM_PROMPT,
    userPrompt: buildFollowUpUserPrompt(description, locale),
    schema: aiFollowUpContentSchema,
    operation: "follow_up_questions",
    requestId,
  });
}

export async function requestAiFollowUpDecision(
  description: string,
  answers: readonly FollowUpAnswer[],
  locale: Locale,
  requestId: string,
): Promise<AiFollowUpDecision> {
  const decision = await requestAiJson({
    systemPrompt: AI_FOLLOW_UP_DECISION_SYSTEM_PROMPT,
    userPrompt: buildFollowUpDecisionUserPrompt(description, answers, locale),
    schema: aiFollowUpDecisionSchema,
    operation: "follow_up_decision",
    requestId,
  });

  if (decision.decision === "final") {
    return { decision: "final", analysis: correctArabicParesthesiaSpelling(decision.analysis) };
  }

  return decision;
}

export async function requestAiFinalAnalysis(
  description: string,
  answers: readonly FollowUpAnswer[],
  locale: Locale,
  requestId: string,
): Promise<AiAnalysisContent> {
  const content = await requestAiJson({
    systemPrompt: AI_FINAL_SYSTEM_PROMPT,
    userPrompt: buildFinalUserPrompt(description, answers, locale),
    schema: aiAnalysisContentSchema,
    operation: "final_analysis",
    requestId,
  });

  return correctArabicParesthesiaSpelling(content);
}

export function requestAiEcho(
  text: string,
  locale: Locale,
  requestId: string,
): Promise<AiEchoContent> {
  return requestAiJson({
    systemPrompt: AI_ECHO_SYSTEM_PROMPT,
    userPrompt: buildEchoUserPrompt(text, locale),
    schema: aiEchoContentSchema,
    operation: "echo_glossary",
    requestId,
  });
}
