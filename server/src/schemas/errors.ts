import type { ErrorRequestHandler, Response } from "express";
import type { ApiError } from "../../../shared/contract.ts";
import {
  INTERNAL_ERROR_MESSAGE,
  INVALID_JSON_MESSAGE,
  PAYLOAD_TOO_LARGE_MESSAGE,
} from "../config/content.ts";

export class AppError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}

export function getRequestId(response: Response): string | undefined {
  const value: unknown = response.locals.requestId;
  return typeof value === "string" ? value : undefined;
}

export function sendError(
  response: Response,
  status: number,
  code: string,
  message: string,
): void {
  const body: ApiError = { error: message, code };
  const requestId = getRequestId(response);
  if (requestId !== undefined) body.requestId = requestId;
  response.status(status).json(body);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

type BodyParserFailure = {
  status: number;
  code: string;
  message: string;
};

function readBodyParserFailure(error: unknown): BodyParserFailure | null {
  if (error instanceof SyntaxError) {
    return { status: 400, code: "INVALID_JSON", message: INVALID_JSON_MESSAGE };
  }
  if (!isRecord(error)) return null;
  if (error.type === "entity.too.large") {
    return { status: 413, code: "PAYLOAD_TOO_LARGE", message: PAYLOAD_TOO_LARGE_MESSAGE };
  }
  if (error.type === "entity.parse.failed") {
    return { status: 400, code: "INVALID_JSON", message: INVALID_JSON_MESSAGE };
  }
  return null;
}

function logServerFailure(response: Response, code: string): void {
  const requestId = getRequestId(response) ?? "unknown";
  console.error(`[server] request failed code=${code} requestId=${requestId}`);
}

export const errorHandler: ErrorRequestHandler = (error, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error instanceof AppError) {
    if (error.status >= 500) logServerFailure(response, error.code);
    sendError(response, error.status, error.code, error.message);
    return;
  }

  const bodyParserFailure = readBodyParserFailure(error);
  if (bodyParserFailure !== null) {
    sendError(
      response,
      bodyParserFailure.status,
      bodyParserFailure.code,
      bodyParserFailure.message,
    );
    return;
  }

  logServerFailure(response, "INTERNAL_ERROR");
  sendError(response, 500, "INTERNAL_ERROR", INTERNAL_ERROR_MESSAGE);
};
