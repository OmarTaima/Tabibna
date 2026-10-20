import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

export const projectRoot = path.resolve(currentDirectory, "../../..");

dotenv.config({ path: path.join(projectRoot, ".env") });

export type AnalysisMode = "live" | "mock";

export type AppConfig = {
  nodeEnv: string;
  isProduction: boolean;
  isTest: boolean;
  port: number;
  allowedOrigins: string[];
  aiApiKey: string;
  aiBaseUrl: string;
  aiModel: string;
  aiFallbackModel: string;
  aiSiteUrl: string;
  aiAppName: string;
  aiReasoningEnabled: boolean;
  aiReasoningEffort: string;
  aiMaxTokens: number;
  aiRequestTimeoutMs: number;
  aiConfigured: boolean;
  mode: AnalysisMode;
  analyzeRateLimit: number;
  rateLimitWindowMs: number;
  isVercel: boolean;
  projectRoot: string;
};

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_AI_REQUEST_TIMEOUT_MS = 180_000;

function readString(name: string, fallback: string): string {
  const raw = process.env[name];
  if (typeof raw !== "string" || raw.trim() === "") return fallback;
  return raw.trim();
}

function readInteger(name: string, fallback: number, min: number, max: number): number {
  const raw = process.env[name];
  if (typeof raw !== "string" || raw.trim() === "") return fallback;
  const value = Number.parseInt(raw.trim(), 10);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}.`);
  }
  return value;
}

function readBoolean(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (typeof raw !== "string" || raw.trim() === "") return fallback;
  const value = raw.trim().toLowerCase();
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  throw new Error(`${name} must be true or false.`);
}

/**
 * Treats any non-empty value as true. Platform markers such as `VERCEL`
 * are set to "1" by the platform and must never abort startup.
 */
function readFlag(name: string): boolean {
  const raw = process.env[name];
  return typeof raw === "string" && raw.trim() !== "";
}

function readOrigins(): string[] {
  const raw = process.env.ALLOWED_ORIGINS;
  if (typeof raw !== "string" || raw.trim() === "") return ["http://localhost:5173"];

  const origins = raw
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter((origin) => origin.length > 0);

  if (origins.length === 0) return ["http://localhost:5173"];

  for (const origin of origins) {
    if (origin === "*") continue;
    let parsed: URL;
    try {
      parsed = new URL(origin);
    } catch {
      throw new Error("ALLOWED_ORIGINS must contain valid absolute origins.");
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("ALLOWED_ORIGINS must use http or https.");
    }
    if (parsed.origin !== origin) {
      throw new Error("ALLOWED_ORIGINS entries must be origins without paths.");
    }
  }

  return origins;
}

function readBaseUrl(): string {
  const raw = readString("AI_BASE_URL", "https://api.openai.com/v1");
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error("AI_BASE_URL must be a valid absolute URL.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("AI_BASE_URL must use http or https.");
  }
  return raw.replace(/\/+$/, "");
}

const port = readInteger("PORT", 8787, 1, 65535);
const nodeEnv = readString("NODE_ENV", "development");
const aiApiKey = readString("AI_API_KEY", "");
const aiConfigured = aiApiKey.length > 0;

export const config: AppConfig = {
  nodeEnv,
  isProduction: nodeEnv === "production",
  isTest: nodeEnv === "test",
  port,
  allowedOrigins: readOrigins(),
  aiApiKey,
  aiBaseUrl: readBaseUrl(),
  aiModel: readString("AI_MODEL", "gpt-4o-mini"),
  aiFallbackModel: readString("AI_FALLBACK_MODEL", ""),
  aiSiteUrl: readString("AI_SITE_URL", ""),
  aiAppName: readString("AI_APP_NAME", ""),
  aiReasoningEnabled: readBoolean("AI_REASONING_ENABLED", false),
  aiReasoningEffort: readString("AI_REASONING_EFFORT", ""),
  aiMaxTokens: readInteger("AI_MAX_TOKENS", 12000, 2000, 32000),
  aiRequestTimeoutMs: readInteger(
    "AI_REQUEST_TIMEOUT_MS",
    DEFAULT_AI_REQUEST_TIMEOUT_MS,
    1_000,
    600_000,
  ),
  aiConfigured,
  mode: aiConfigured ? "live" : "mock",
  analyzeRateLimit: readInteger("ANALYZE_RATE_LIMIT", 30, 1, 1000),
  rateLimitWindowMs: RATE_LIMIT_WINDOW_MS,
  isVercel: readFlag("VERCEL"),
  projectRoot,
};
