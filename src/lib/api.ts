import {
  analyzeResponseSchema,
  apiErrorSchema,
  echoResponseSchema,
  healthResponseSchema,
  type FollowUpAnswer,
  type HealthResponse,
  type Locale,
} from "@shared/contract";
import type { ZodType } from "zod";

export type ApiErrorKind =
  | "network"
  | "timeout"
  | "aborted"
  | "rate_limit"
  | "daily_quota"
  | "invalid"
  | "server"
  | "ai"
  | "unexpected";

export type ApiError = {
  ok: false;
  kind: ApiErrorKind;
  status: number | null;
  code: string;
};

export type ApiResult<T> = { ok: true; data: T } | ApiError;

type RequestOptions = {
  method: "GET" | "POST";
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs: number;
};

const rawApiBaseUrl: unknown = import.meta.env.VITE_API_BASE_URL;

// Empty when unset: requests stay relative to the current origin (same-origin API).
const API_BASE_URL =
  typeof rawApiBaseUrl === "string" ? rawApiBaseUrl.trim().replace(/\/+$/, "") : "";

function resolveApiUrl(path: string): string {
  if (!API_BASE_URL) {
    return path;
  }
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function mapHttpError(status: number, code: string | null): ApiErrorKind {
  if (code === "AI_DAILY_QUOTA") {
    return "daily_quota";
  }
  if (status === 429) {
    return "rate_limit";
  }
  if (status === 408 || status === 504) {
    return "timeout";
  }
  if (status === 400 || status === 422) {
    return "invalid";
  }
  if (status >= 500) {
    return code && /ai|model|provider|completion/i.test(code) ? "ai" : "server";
  }
  return "server";
}

async function requestJson<T>(
  path: string,
  schema: ZodType<T>,
  options: RequestOptions,
): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const external = options.signal;
  let timedOut = false;

  const timer = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, options.timeoutMs);

  const onAbort = () => controller.abort();

  if (external) {
    if (external.aborted) {
      controller.abort();
    } else {
      external.addEventListener("abort", onAbort, { once: true });
    }
  }

  try {
    const response = await fetch(resolveApiUrl(path), {
      method: options.method,
      headers:
        options.body === undefined
          ? { Accept: "application/json" }
          : { Accept: "application/json", "Content-Type": "application/json" },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const payload: unknown = await response.json().catch(() => null);
      const parsedError = apiErrorSchema.safeParse(payload);
      const code = parsedError.success ? parsedError.data.code : null;

      return {
        ok: false,
        kind: mapHttpError(response.status, code),
        status: response.status,
        code: code ?? `http_${response.status}`,
      };
    }

    const payload: unknown = await response.json().catch(() => null);
    const parsed = schema.safeParse(payload);

    if (!parsed.success) {
      return {
        ok: false,
        kind: "unexpected",
        status: response.status,
        code: "invalid_response",
      };
    }

    return { ok: true, data: parsed.data };
  } catch {
    if (timedOut) {
      return { ok: false, kind: "timeout", status: null, code: "timeout" };
    }
    if (external?.aborted) {
      return { ok: false, kind: "aborted", status: null, code: "aborted" };
    }
    return { ok: false, kind: "network", status: null, code: "network" };
  } finally {
    window.clearTimeout(timer);
    external?.removeEventListener("abort", onAbort);
  }
}

export function getHealth(signal?: AbortSignal): Promise<ApiResult<HealthResponse>> {
  return requestJson("/api/health", healthResponseSchema, {
    method: "GET",
    signal,
    timeoutMs: 8_000,
  });
}

export function analyzeSymptoms(
  description: string,
  locale: Locale,
  round: number,
  answers: FollowUpAnswer[],
  signal?: AbortSignal,
) {
  return requestJson("/api/analyze", analyzeResponseSchema, {
    method: "POST",
    body: { description, locale, round, answers },
    signal,
    timeoutMs: 210_000,
  });
}

export function analyzeEcho(text: string, locale: Locale, signal?: AbortSignal) {
  return requestJson("/api/echo", echoResponseSchema, {
    method: "POST",
    body: { text, locale },
    signal,
    timeoutMs: 210_000,
  });
}
