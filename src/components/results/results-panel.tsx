import type { RefObject } from "react";
import type { MedicalAnalysis } from "@shared/contract";
import { useLocale } from "@/i18n/use-locale";
import type { CopyStatus } from "@/hooks/use-clipboard";
import type { AnalysisStatus } from "@/hooks/use-symptom-analysis";
import type { ApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { ClarificationsCard } from "./clarifications-card";
import { ClinicalContextCard } from "./clinical-context-card";
import { DemoNotice } from "./demo-notice";
import { Disclaimers } from "./disclaimers";
import { ErrorResults } from "./error-results";
import { LoadingResults } from "./loading-results";
import { ResultsActions } from "./results-actions";
import { ResultsHeader } from "./results-header";
import { SummaryCard } from "./summary-card";
import { TerminologySection } from "./terminology-section";

type ResultsPanelProps = {
  status: AnalysisStatus;
  analysis: MedicalAnalysis | null;
  error: ApiError | null;
  edited: boolean;
  copyStatus: CopyStatus;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onCopy: () => void;
  onPrint: () => void;
  onRetry: () => void;
  onContinue: () => void;
};

export function ResultsPanel({
  status,
  analysis,
  error,
  edited,
  copyStatus,
  headingRef,
  onCopy,
  onPrint,
  onRetry,
  onContinue,
}: ResultsPanelProps) {
  const { locale, copy } = useLocale();

  if (status === "idle") {
    return null;
  }

  if (status === "loading") {
    return <LoadingResults />;
  }

  if (status === "error") {
    if (!error) {
      return null;
    }

    return <ErrorResults error={error} onRetry={onRetry} />;
  }

  if (!analysis) {
    return null;
  }

  const generated = formatDateTime(analysis.meta.generatedAt, locale);

  return (
    <div className="mx-auto w-full max-w-[880px] animate-fade-up motion-reduce:animate-none">
      <ResultsHeader
        analysis={analysis}
        headingRef={headingRef}
        edited={edited}
        copyStatus={copyStatus}
        onCopy={onCopy}
        onPrint={onPrint}
      />

      <div className="mt-6 flex flex-col gap-5">
        {analysis.meta.mode === "mock" ? <DemoNotice /> : null}
        <SummaryCard analysis={analysis} />
        <TerminologySection terms={analysis.terminology} />
        <ClinicalContextCard interpretations={analysis.clinicalInterpretations} />
        <ClarificationsCard
          clarifications={analysis.clarifications}
          onContinue={onContinue}
        />
        <Disclaimers analysis={analysis} />
      </div>

      {generated ? (
        <p className="mt-4 text-[11.5px] text-bodytext">
          {copy.results.generated}:{" "}
          <time
            dateTime={analysis.meta.generatedAt}
            lang={locale}
            dir="ltr"
            className="whitespace-nowrap"
          >
            {generated}
          </time>
        </p>
      ) : null}

      <div className="mt-4 md:hidden">
        <ResultsActions
          copyStatus={copyStatus}
          onCopy={onCopy}
          onPrint={onPrint}
          showHint={false}
          className="items-stretch"
        />
      </div>
    </div>
  );
}
