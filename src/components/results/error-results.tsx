import { useId, type RefObject } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n/use-locale";
import type { ApiError, ApiErrorKind } from "@/lib/api";

export type ErrorMessages = {
  title: string;
  network: string;
  timeout: string;
  rateLimit: string;
  dailyQuota: string;
  server: string;
  ai: string;
  invalid: string;
  unexpected: string;
  retry: string;
};

function errorMessage(kind: ApiErrorKind, messages: ErrorMessages) {
  switch (kind) {
    case "network":
      return messages.network;
    case "timeout":
      return messages.timeout;
    case "rate_limit":
      return messages.rateLimit;
    case "daily_quota":
      return messages.dailyQuota;
    case "ai":
      return messages.ai;
    case "invalid":
      return messages.invalid;
    case "unexpected":
      return messages.unexpected;
    case "server":
      return messages.server;
    default:
      return messages.network;
  }
}

type ErrorResultsProps = {
  error: ApiError;
  onRetry: () => void;
  messages?: ErrorMessages;
  headingRef?: RefObject<HTMLHeadingElement | null>;
};

export function ErrorResults({
  error,
  onRetry,
  messages,
  headingRef,
}: ErrorResultsProps) {
  const { copy } = useLocale();
  const headingId = useId();
  const bodyId = useId();
  const text = messages ?? copy.results.errors;

  return (
    <div className="mx-auto w-full max-w-[880px]">
      <div
        role="alert"
        aria-labelledby={headingId}
        aria-describedby={bodyId}
        className="rounded-2xl border border-urgent-border bg-white p-5 shadow-soft sm:p-6"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-urgent-soft text-urgent">
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2
              id={headingId}
              ref={headingRef}
              tabIndex={-1}
              className="scroll-mt-24 rounded-md font-display text-[18px] font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-4 focus-visible:ring-offset-page"
            >
              {text.title}
            </h2>
            <p
              id={bodyId}
              className="mt-1.5 text-[14px] leading-7 text-bodytext"
            >
              {errorMessage(error.kind, text)}
            </p>
            <Button type="button" onClick={onRetry} className="mt-4">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              {text.retry}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
