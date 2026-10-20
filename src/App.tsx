import { BellRing, SearchCheck } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { EmptyState } from "@/components/form/empty-state";
import { SymptomForm } from "@/components/form/symptom-form";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AlarmOverlay } from "@/components/reminders/alarm-overlay";
import { RemindersView } from "@/components/reminders/reminders-view";
import { LiveRegion } from "@/components/ui/live-region";
import { PrintReport } from "@/components/results/print-report";
import { ResultsPanel } from "@/components/results/results-panel";
import { useAnalysisMode } from "@/hooks/use-analysis-mode";
import { useAnnouncer } from "@/hooks/use-announcer";
import { useCopyToClipboard } from "@/hooks/use-clipboard";
import { useReminders } from "@/hooks/use-reminders";
import { useSymptomAnalysis } from "@/hooks/use-symptom-analysis";
import { useLocale } from "@/i18n/use-locale";
import { buildSummaryText } from "@/lib/summary-text";
import { cn } from "@/lib/utils";

type AppView = "analyze" | "reminders";

const VIEW_ORDER: AppView[] = ["analyze", "reminders"];

type ViewSwitcherProps = {
  view: AppView;
  onChange: (view: AppView) => void;
};

function ViewSwitcher({ view, onChange }: ViewSwitcherProps) {
  const { copy, dir } = useLocale();
  const tabRefs = useRef<Partial<Record<AppView, HTMLButtonElement | null>>>({});

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = VIEW_ORDER.indexOf(view);
    const nextKey = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const previousKey = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    let nextIndex = index;

    if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = VIEW_ORDER.length - 1;
    } else if (event.key === nextKey) {
      nextIndex = (index + 1) % VIEW_ORDER.length;
    } else if (event.key === previousKey) {
      nextIndex = (index - 1 + VIEW_ORDER.length) % VIEW_ORDER.length;
    } else {
      return;
    }

    event.preventDefault();
    const next = VIEW_ORDER[nextIndex];
    onChange(next);
    tabRefs.current[next]?.focus();
  };

  const tabClassName = (isActive: boolean) =>
    cn(
      "inline-flex h-10 items-center gap-2 rounded-lg px-3.5 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-white",
      isActive
        ? "bg-brand text-white"
        : "text-bodytext hover:bg-brand-soft hover:text-ink",
    );

  return (
    <nav aria-label={copy.nav.label}>
      <div
        role="tablist"
        aria-label={copy.nav.label}
        className="inline-flex gap-1 rounded-xl border border-line bg-white p-1 shadow-soft"
      >
        <button
          type="button"
          role="tab"
          id="tab-analyze"
          aria-controls="panel-analyze"
          aria-selected={view === "analyze"}
          tabIndex={view === "analyze" ? 0 : -1}
          onClick={() => onChange("analyze")}
          onKeyDown={handleKeyDown}
          ref={(node) => {
            tabRefs.current.analyze = node;
          }}
          className={tabClassName(view === "analyze")}
        >
          <SearchCheck className="h-4 w-4" aria-hidden="true" />
          {copy.nav.analyze}
        </button>
        <button
          type="button"
          role="tab"
          id="tab-reminders"
          aria-controls="panel-reminders"
          aria-selected={view === "reminders"}
          tabIndex={view === "reminders" ? 0 : -1}
          onClick={() => onChange("reminders")}
          onKeyDown={handleKeyDown}
          ref={(node) => {
            tabRefs.current.reminders = node;
          }}
          className={tabClassName(view === "reminders")}
        >
          <BellRing className="h-4 w-4" aria-hidden="true" />
          {copy.nav.reminders}
        </button>
      </div>
    </nav>
  );
}

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
  const [view, setView] = useState<AppView>("analyze");

  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const lastFocusedResult = useRef<string | null>(null);

  const { status: copyStatus, copy: copyToClipboard } = useCopyToClipboard();
  const { announcement: politeAnnouncement, announce } = useAnnouncer();
  const {
    reminders,
    addReminder,
    updateReminder,
    removeReminder,
    toggleEnabled,
    setSnooze,
    acknowledge,
    ringing,
    dismissRinging,
    permission,
    requestPermission,
  } = useReminders();

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

  useEffect(() => {
    if (!ringing) {
      return;
    }

    const dose = ringing.dose
      ? ` ${copy.reminders.alarmDose(ringing.dose)}`
      : "";

    announce(
      `${copy.reminders.alarmTitle}. ${copy.reminders.alarmBody(ringing.medicine)}.${dose}`,
    );
  }, [announce, copy.reminders, ringing]);

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
          <div className="mx-auto w-full max-w-[1120px] px-5 pt-6 sm:px-6 lg:px-8">
            <ViewSwitcher view={view} onChange={setView} />
          </div>

          <div
            role="tabpanel"
            id="panel-analyze"
            aria-labelledby="tab-analyze"
            hidden={view !== "analyze"}
          >
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
          </div>

          <div
            role="tabpanel"
            id="panel-reminders"
            aria-labelledby="tab-reminders"
            hidden={view !== "reminders"}
          >
            <div className="mx-auto w-full max-w-[820px] px-5 pt-10 sm:px-6 sm:pt-12 lg:px-8">
              <RemindersView
                reminders={reminders}
                permission={permission}
                onAdd={addReminder}
                onUpdate={updateReminder}
                onRemove={removeReminder}
                onToggle={toggleEnabled}
                onRequestPermission={() => {
                  void requestPermission();
                }}
              />
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>

      {analysis ? <PrintReport analysis={analysis} /> : null}

      {ringing ? (
        <AlarmOverlay
          reminder={ringing}
          onTaken={() => acknowledge(ringing.id)}
          onSnooze={() => setSnooze(ringing.id, 10)}
          onDismiss={dismissRinging}
        />
      ) : null}
    </>
  );
}
