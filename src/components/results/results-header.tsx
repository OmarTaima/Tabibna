import type { RefObject } from "react";
import type { MedicalAnalysis } from "@shared/contract";
import { Info } from "lucide-react";
import { useLocale } from "@/i18n/use-locale";
import { ResultsActions } from "./results-actions";

type ResultsHeaderProps = {
  analysis: MedicalAnalysis;
  headingRef: RefObject<HTMLHeadingElement | null>;
  edited: boolean;
  onPrint: () => void;
};

export function ResultsHeader({
  analysis,
  headingRef,
  edited,
  onPrint,
}: ResultsHeaderProps) {
  const { copy } = useLocale();

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-8">
      <div className="min-w-0">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="scroll-mt-24 rounded-md font-display text-[24px] font-bold leading-tight text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-4 focus-visible:ring-offset-page sm:text-[28px]"
        >
          {copy.results.heading}
        </h2>

        <ul className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px] text-bodytext">
          <li>
            {copy.results.detectedLabel}:{" "}
            <span className="font-medium text-ink">
              {copy.results.detected[analysis.detectedLanguage]}
            </span>
          </li>
          <li aria-hidden="true" className="text-line">
            ·
          </li>
          <li>{copy.results.termCount(analysis.terminology.length)}</li>
          <li aria-hidden="true" className="text-line">
            ·
          </li>
          <li className="font-medium text-brand">{copy.results.notDiagnosis}</li>
        </ul>

        {edited ? (
          <p className="mt-3 flex items-start gap-1.5 text-[12px] leading-5 text-bodytext">
            <Info
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-caution"
              aria-hidden="true"
            />
            <span>{copy.form.editedNote}</span>
          </p>
        ) : null}
      </div>

      <ResultsActions
        onPrint={onPrint}
        className="w-full md:w-auto md:shrink-0 md:pt-1"
      />
    </div>
  );
}
