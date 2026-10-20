import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n/use-locale";
import type { ApiError, ApiErrorKind } from "@/lib/api";

function errorMessage(kind: ApiErrorKind, copy: ReturnType<typeof useLocale>["copy"]) {
  switch (kind) {
    case "network":
      return copy.results.errors.network;
    case "timeout":
      return copy.results.errors.timeout;
    case "rate_limit":
      return copy.results.errors.rateLimit;
    case "daily_quota":
      return copy.results.errors.dailyQuota;
    case "ai":
      return copy.results.errors.ai;
    case "invalid":
      return copy.results.errors.invalid;
    case "unexpected":
      return copy.results.errors.unexpected;
    case "server":
      return copy.results.errors.server;
    default:
      return copy.results.errors.network;
  }
}

type ErrorResultsProps = {
  error: ApiError;
  onRetry: () => void;
};

export function ErrorResults({ error, onRetry }: ErrorResultsProps) {
  const { copy } = useLocale();

  return (
    <div className="mx-auto w-full max-w-[880px]">
      <div
        role="alert"
        aria-labelledby="analysis-error-title"
        aria-describedby="analysis-error-body"
        className="rounded-2xl border border-urgent-border bg-white p-5 shadow-soft sm:p-6"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-urgent-soft text-urgent">
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2
              id="analysis-error-title"
              className="font-display text-[18px] font-semibold text-ink"
            >
              {copy.results.errors.title}
            </h2>
            <p
              id="analysis-error-body"
              className="mt-1.5 text-[14px] leading-7 text-bodytext"
            >
              {errorMessage(error.kind, copy)}
            </p>
            <Button type="button" onClick={onRetry} className="mt-4">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              {copy.results.errors.retry}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
