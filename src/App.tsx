import { MAX_FOLLOW_UP_ROUNDS, type FollowUpAnswer } from "@shared/contract";
import {
  BellRing,
  HeartPulse,
  MessagesSquare,
  type LucideIcon,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { EchoBridgeView } from "@/components/echo/echo-bridge-view";
import { EmptyState } from "@/components/form/empty-state";
import { SymptomForm } from "@/components/form/symptom-form";
import { FollowUpPanel } from "@/components/followups/follow-up-panel";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AlarmOverlay } from "@/components/reminders/alarm-overlay";
import { RemindersView } from "@/components/reminders/reminders-view";
import { LoadingResults } from "@/components/results/loading-results";
import { PrintReport } from "@/components/results/print-report";
import { ResultsPanel } from "@/components/results/results-panel";
import { LiveRegion } from "@/components/ui/live-region";
import { useAnalysisMode } from "@/hooks/use-analysis-mode";
import { useAnnouncer } from "@/hooks/use-announcer";
import { useReminders } from "@/hooks/use-reminders";
import { useSymptomAnalysis } from "@/hooks/use-symptom-analysis";
import { useLocale } from "@/i18n/use-locale";
import { cn } from "@/lib/utils";

type AppView = "followups" | "echo" | "reminders";

const VIEW_ORDER: AppView[] = ["followups", "echo", "reminders"];

const TAB_ICONS: Record<AppView, LucideIcon> = {
  followups: MessagesSquare,
  echo: HeartPulse,
  reminders: BellRing,
};

const TAB_COPY_KEYS: Record<AppView, "followUps" | "echo" | "reminders"> = {
  followups: "followUps",
  echo: "echo",
  reminders: "reminders",
};

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
      "inline-flex h-10 min-w-0 items-center justify-center gap-1.5 rounded-lg px-1.5 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:gap-2 sm:px-3.5 sm:text-[13px]",
      isActive
        ? "bg-brand text-white"
        : "text-bodytext hover:bg-brand-soft hover:text-ink",
    );

  return (
    <nav aria-label={copy.nav.label}>
      <div
        role="tablist"
        aria-label={copy.nav.label}
        className="grid w-full grid-cols-3 gap-1 rounded-xl border border-line bg-white p-1 shadow-soft sm:inline-flex sm:w-auto"
      >
        {VIEW_ORDER.map((id) => {
          const Icon = TAB_ICONS[id];
          const isActive = view === id;

          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-controls={`panel-${id}`}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(id)}
              onKeyDown={handleKeyDown}
              ref={(node) => {
                tabRefs.current[id] = node;
              }}
              className={tabClassName(isActive)}
            >
              <Icon
                className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4"
                aria-hidden="true"
              />
              <span className="truncate">{copy.nav[TAB_COPY_KEYS[id]]}</span>
            </button>
          );
        })}
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
    questions,
    questionHistory,
    round,
    answers,
    meta,
    error,
    submitted,
    requestId,
    analyze,
    submitAnswers,
    retry,
    reset,
  } = useSymptomAnalysis();

  const [description, setDescription] = useState("");
  const [focusSignal, setFocusSignal] = useState(0);
  const [view, setView] = useState<AppView>("followups");

  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const lastFocusedResult = useRef<string | null>(null);

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

  const handleSubmitAnswers = useCallback(
    (nextAnswers: FollowUpAnswer[]) => {
      submitAnswers(nextAnswers);
    },
    [submitAnswers],
  );

  const handleStartOver = useCallback(() => {
    reset();
    setFocusSignal((current) => current + 1);
  }, [reset]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleContinue = useCallback(() => {
    setFocusSignal((current) => current + 1);
    announce(copy.clarifications.focusAnnounce);
  }, [announce, copy.clarifications.focusAnnounce]);

  const followUpKey = questions
    ? `${round}-${questions.map((question) => question.id).join("-")}`
    : "followup";

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
            id="panel-followups"
            aria-labelledby="tab-followups"
            hidden={view !== "followups"}
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

              {questions && (status === "questions" || status === "loading") ? (
                <div className="mt-10 sm:mt-12">
                  <FollowUpPanel
                    key={followUpKey}
                    questions={questions}
                    round={round}
                    totalRounds={MAX_FOLLOW_UP_ROUNDS}
                    meta={meta}
                    submitting={status === "loading"}
                    onSubmit={handleSubmitAnswers}
                    onStartOver={handleStartOver}
                  />
                </div>
              ) : null}

              {status === "loading" && !questions ? (
                <div className="mt-14 sm:mt-16">
                  <LoadingResults />
                </div>
              ) : null}

              {status === "success" || status === "error" ? (
                <div className="mt-14 sm:mt-16">
                  <ResultsPanel
                    status={status}
                    analysis={analysis}
                    error={error}
                    edited={edited}
                    headingRef={headingRef}
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
            id="panel-echo"
            aria-labelledby="tab-echo"
            hidden={view !== "echo"}
          >
            <div className="mx-auto w-full max-w-[880px] px-5 pt-10 sm:px-6 sm:pt-12 lg:px-8">
              <EchoBridgeView />
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

      {analysis ? (
        <PrintReport
          analysis={analysis}
          answers={answers}
          questions={questionHistory}
        />
      ) : null}

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
