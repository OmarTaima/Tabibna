import { useCallback, useEffect, useRef, useState } from "react";
import { EmptyState } from "@/components/form/empty-state";
import { SymptomForm } from "@/components/form/symptom-form";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { LiveRegion } from "@/components/ui/live-region";
import { PrintReport } from "@/components/results/print-report";
import { ResultsPanel } from "@/components/results/results-panel";
import { useAnalysisMode } from "@/hooks/use-analysis-mode";
import { useAnnouncer } from "@/hooks/use-announcer";
import { useCopyToClipboard } from "@/hooks/use-clipboard";
import { useSymptomAnalysis } from "@/hooks/use-symptom-analysis";
import { useLocale } from "@/i18n/use-locale";
import { buildSummaryText } from "@/lib/summary-text";
import { cn } from "@/lib/utils";

export default function App() {
  const { locale, copy } = useLocale();
  const mode = useAnalysisMode();
  const {
    status,
    analysis,
    error,
    submitted,
    requestId,
    analyze,
    retry,
  } = useSymptomAnalysis();

  const [description, setDescription] = useState("");
  const [focusSignal, setFocusSignal] = useState(0);

  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const lastFocusedResult = useRef<string | null>(null);

  const { status: copyStatus, copy: copyToClipboard } = useCopyToClipboard();
  const { announcement: politeAnnouncement, announce } = useAnnouncer();

  const edited =
    status === "success" &&
    submitted !== null &&
    description.trim() !== submitted.description;

  useEffect(() => {
    if (status !== "success" || !analysis) {
      return;
    }

    const resultKey = `${requestId}:${analysis.id}`;
    if (lastFocusedResult.current === resultKey) {
      return;
    }

    lastFocusedResult.current = resultKey;
    headingRef.current?.focus();
    headingRef.current?.scrollIntoView({ block: "start" });
    announce(
      copy.results.readyAnnounce(
        analysis.terminology.length,
        analysis.clarifications.length,
      ),
    );
  }, [analysis, announce, copy.results, requestId, status]);

  const handleAnalyze = useCallback(
    (value: string) => {
      analyze(value, locale);
    },
    [analyze, locale],
  );

  const handleCopy = useCallback(async () => {
    if (!analysis) {
      return;
    }

    const text = buildSummaryText(analysis, locale, copy);
    const copied = await copyToClipboard(text);
    announce(copied ? copy.results.copyAnnounce : copy.results.copyAnnounceError);
  }, [analysis, announce, copy, copyToClipboard, locale]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleContinue = useCallback(() => {
    setFocusSignal((current) => current + 1);
    announce(copy.clarifications.focusAnnounce);
  }, [announce, copy.clarifications.focusAnnounce]);

  return (
    <>
      <div
        className={cn(
          "flex min-h-screen flex-col",
          analysis && "print:hidden",
        )}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-xl focus:border focus:border-brand focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-brand focus:shadow-lift"
        >
          {copy.skipLink}
        </a>

        <LiveRegion announcement={politeAnnouncement} />

        <SiteHeader mode={mode} />

        <main id="main-content" className="flex-1 pb-16 sm:pb-20">
          <div className="mx-auto w-full max-w-[1120px] px-5 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20">
            <div className="mx-auto w-full max-w-[760px]">
              <section aria-labelledby="hero-title" className="text-center">
                <p
                  lang="en"
                  dir="ltr"
                  className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-brand"
                >
                  {copy.hero.overline}
                </p>
                <h1
                  id="hero-title"
                  className="mx-auto mt-4 max-w-[720px] text-balance font-display text-[29px] font-bold leading-[34px] tracking-[-0.02em] text-ink sm:text-[40px] sm:leading-[1.12] lg:text-[44px]"
                >
                  {copy.hero.title}
                </h1>
                <p className="mx-auto mt-4 max-w-[620px] text-[15px] leading-7 text-bodytext sm:text-base">
                  {copy.hero.description}
                </p>
              </section>

              <div className="mt-8 sm:mt-10">
                <SymptomForm
                  loading={status === "loading"}
                  onSubmit={handleAnalyze}
                  onDescriptionChange={setDescription}
                  focusSignal={focusSignal}
                />
                {status === "idle" ? <EmptyState /> : null}
              </div>
            </div>

            {status !== "idle" ? (
              <div className="mt-14 sm:mt-16">
                <ResultsPanel
                  status={status}
                  analysis={analysis}
                  error={error}
                  edited={edited}
                  copyStatus={copyStatus}
                  headingRef={headingRef}
                  onCopy={handleCopy}
                  onPrint={handlePrint}
                  onRetry={retry}
                  onContinue={handleContinue}
                />
              </div>
            ) : null}
          </div>
        </main>

        <SiteFooter />
      </div>

      {analysis ? <PrintReport analysis={analysis} /> : null}
    </>
  );
}
