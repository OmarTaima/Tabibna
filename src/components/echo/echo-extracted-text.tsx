import { AlertTriangle, Loader2, ScanText } from "lucide-react";
import type { RefObject } from "react";
import { MAX_ECHO_TEXT_LENGTH } from "@shared/contract";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useLocale } from "@/i18n/use-locale";
import { cn } from "@/lib/utils";

type EchoExtractedTextProps = {
  value: string;
  lowConfidence: boolean;
  trimmed: boolean;
  error: string | null;
  submitting: boolean;
  disabled: boolean;
  cardRef: RefObject<HTMLDivElement | null>;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onChange: (value: string) => void;
};

export function EchoExtractedText({
  value,
  lowConfidence,
  trimmed,
  error,
  submitting,
  disabled,
  cardRef,
  textareaRef,
  onChange,
}: EchoExtractedTextProps) {
  const { copy } = useLocale();

  const describedBy = [
    "echo-extracted-help",
    lowConfidence ? "echo-extracted-low-confidence" : null,
    trimmed ? "echo-extracted-trimmed" : null,
    "echo-extracted-count",
    error ? "echo-extracted-error" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={cardRef} className="mt-4 scroll-mt-24">
      <Card className="animate-fade-up p-5 motion-reduce:animate-none sm:p-6">
        <section aria-labelledby="echo-extracted-title">
          <h2
            id="echo-extracted-title"
            className="font-display text-[17px] font-semibold text-ink sm:text-lg"
          >
            {copy.echo.photo.extractedTitle}
          </h2>
          <p
            id="echo-extracted-help"
            className="mt-1.5 text-[13px] leading-6 text-bodytext"
          >
            {copy.echo.photo.extractedHelp}
          </p>

          {lowConfidence || trimmed ? (
            <div className="mt-4 flex flex-col gap-2">
              {lowConfidence ? (
                <p
                  id="echo-extracted-low-confidence"
                  className="flex items-start gap-2.5 rounded-xl border border-caution-border bg-caution-soft px-4 py-3 text-[12.5px] leading-6 text-caution-ink"
                >
                  <AlertTriangle
                    className="mt-0.5 h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{copy.echo.photo.lowConfidence}</span>
                </p>
              ) : null}
              {trimmed ? (
                <p
                  id="echo-extracted-trimmed"
                  className="flex items-start gap-2.5 rounded-xl border border-caution-border bg-caution-soft px-4 py-3 text-[12.5px] leading-6 text-caution-ink"
                >
                  <AlertTriangle
                    className="mt-0.5 h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{copy.echo.photo.trimmed}</span>
                </p>
              ) : null}
            </div>
          ) : null}

          <label
            htmlFor="echo-extracted-text"
            className="mt-4 block text-[13px] font-semibold text-ink"
          >
            {copy.echo.photo.extractedLabel}
          </label>
          <Textarea
            id="echo-extracted-text"
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            dir="auto"
            maxLength={MAX_ECHO_TEXT_LENGTH}
            placeholder={copy.echo.photo.extractedPlaceholder}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              "mt-2 min-h-[180px] sm:min-h-[220px]",
              error &&
                "border-urgent focus-visible:border-urgent focus-visible:ring-urgent/20",
            )}
          />

          <div className="mt-2 flex items-center justify-between gap-3">
            <p
              id="echo-extracted-count"
              className="text-[11.5px] tabular-nums text-bodytext sm:text-end"
              dir="ltr"
              lang="en"
            >
              {copy.echo.charCount(value.length)}
            </p>
          </div>

          {error ? (
            <p
              id="echo-extracted-error"
              role="alert"
              className="mt-2 text-[12.5px] font-medium text-urgent"
            >
              {error}
            </p>
          ) : null}

          <Button type="submit" size="lg" disabled={disabled} className="mt-5 w-full">
            {submitting ? (
              <Loader2
                className="h-4 w-4 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : (
              <ScanText className="h-4 w-4" aria-hidden="true" />
            )}
            {submitting ? copy.echo.photo.submitting : copy.echo.photo.submit}
          </Button>
        </section>
      </Card>
    </div>
  );
}
