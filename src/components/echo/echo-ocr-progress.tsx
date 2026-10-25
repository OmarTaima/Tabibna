import { Check, Loader2 } from "lucide-react";
import type { RefObject } from "react";
import { useLocale } from "@/i18n/use-locale";
import type { OcrStage } from "@/lib/ocr";
import { cn } from "@/lib/utils";

type EchoOcrProgressProps = {
  stage: OcrStage | null;
  percent: number | null;
  progressRef: RefObject<HTMLDivElement | null>;
};

export function EchoOcrProgress({
  stage,
  percent,
  progressRef,
}: EchoOcrProgressProps) {
  const { copy } = useLocale();

  const stages: Array<{ id: OcrStage; label: string }> = [
    { id: "engine", label: copy.echo.photo.progressEngine },
    { id: "language", label: copy.echo.photo.progressLanguage },
    { id: "recognizing", label: copy.echo.photo.progressLabel },
  ];

  const currentIndex = stage ? stages.findIndex((item) => item.id === stage) : 0;
  const determinate = stage === "recognizing" && percent !== null;

  const headerText =
    stage === "recognizing"
      ? copy.echo.photo.progressLabel
      : stage === "language"
        ? copy.echo.photo.loadingLanguage
        : copy.echo.photo.preparing;

  const valueText = determinate
    ? copy.echo.photo.progressRecognizing(percent)
    : stage === "language"
      ? copy.echo.photo.progressLanguage
      : stage === "recognizing"
        ? copy.echo.photo.progressLabel
        : copy.echo.photo.progressEngine;

  return (
    <div
      ref={progressRef}
      role="group"
      tabIndex={-1}
      aria-labelledby="echo-ocr-progress-label"
      className="mt-4 rounded-xl border border-line bg-brand-soft p-4 focus-visible:outline-none sm:p-5"
    >
      <p id="echo-ocr-progress-label" className="sr-only">
        {copy.echo.photo.progressLabel}
      </p>

      <div className="flex items-center gap-2">
        <Loader2
          className="h-4 w-4 animate-spin text-brand motion-reduce:animate-none"
          aria-hidden="true"
        />
        <p className="text-[13.5px] font-semibold text-ink">{headerText}</p>
      </div>

      <ul aria-hidden="true" className="mt-3 space-y-1.5 text-[12px]">
        {stages.map((item, index) => {
          const done = index < currentIndex;
          const current = index === currentIndex;

          return (
            <li
              key={item.id}
              className={cn(
                "flex items-center gap-1.5",
                current ? "font-semibold text-ink" : "text-bodytext",
              )}
            >
              {done ? (
                <Check className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden="true" />
              ) : current ? (
                <Loader2
                  className="h-3.5 w-3.5 shrink-0 animate-spin text-brand motion-reduce:animate-none"
                  aria-hidden="true"
                />
              ) : (
                <span className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              )}
              <span>{item.label}</span>
            </li>
          );
        })}
      </ul>

      <div
        role="progressbar"
        aria-labelledby="echo-ocr-progress-label"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={determinate ? percent : undefined}
        aria-valuetext={valueText}
        className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white"
      >
        <div
          className={cn(
            "h-full rounded-full",
            determinate
              ? "bg-brand transition-[width] duration-300 motion-reduce:transition-none"
              : "w-full animate-pulse bg-brand/20 motion-reduce:animate-none",
          )}
          style={determinate ? { width: `${percent}%` } : undefined}
        />
      </div>

      {determinate ? (
        <p className="mt-2 text-[11.5px] tabular-nums text-bodytext">
          {copy.echo.photo.recognizing(percent)}
        </p>
      ) : null}

      <p className="mt-1 text-[11.5px] leading-5 text-bodytext">
        {copy.echo.photo.progressHint}
      </p>
    </div>
  );
}
