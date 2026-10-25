import {
  MAX_ECHO_TEXT_LENGTH,
  MIN_ECHO_TEXT_LENGTH,
} from "@shared/contract";
import { FileText, HeartPulse, Info, Loader2, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { DemoNotice } from "@/components/results/demo-notice";
import { ErrorResults } from "@/components/results/error-results";
import { useEchoAnalysis } from "@/hooks/use-echo-analysis";
import { useLocale } from "@/i18n/use-locale";
import { cn } from "@/lib/utils";

export function EchoBridgeView() {
  const { locale, copy, dir } = useLocale();
  const { status, analysis, error, analyze, retry, reset } = useEchoAnalysis();

  const [text, setText] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement | null>(null);

  const loading = status === "loading";

  useEffect(() => {
    if (status !== "success") {
      return;
    }

    resultHeadingRef.current?.focus();
    resultHeadingRef.current?.scrollIntoView({ block: "start" });
  }, [status]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (text.trim().length < MIN_ECHO_TEXT_LENGTH) {
      setValidationError(copy.echo.validation);
      textareaRef.current?.focus();
      return;
    }

    setValidationError(null);
    analyze(text, locale);
  };

  const handleSample = () => {
    setText(copy.echo.sampleText);
    setValidationError(null);
    textareaRef.current?.focus();
  };

  const handleStartOver = () => {
    reset();
    setText("");
    setValidationError(null);
    textareaRef.current?.focus();
  };

  const describedBy = [
    "echo-count",
    validationError ? "echo-error" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section aria-labelledby="echo-title" lang={locale} dir={dir}>
      <header>
        <h1
          id="echo-title"
          className="font-display text-[27px] font-bold leading-[34px] tracking-[-0.02em] text-ink sm:text-[34px] sm:leading-[1.15]"
        >
          {copy.echo.title}
        </h1>
        <p className="mt-3 max-w-[620px] text-[15px] leading-7 text-bodytext">
          {copy.echo.subtitle}
        </p>
      </header>

      <form
        noValidate
        aria-labelledby="echo-title"
        aria-busy={loading}
        onSubmit={handleSubmit}
        className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-soft sm:p-6"
      >
        <label
          htmlFor="echo-report"
          className="block font-display text-[17px] font-semibold text-ink sm:text-lg"
        >
          {copy.echo.label}
        </label>

        <Textarea
          id="echo-report"
          ref={textareaRef}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            if (validationError) {
              setValidationError(null);
            }
          }}
          dir="auto"
          maxLength={MAX_ECHO_TEXT_LENGTH}
          placeholder={copy.echo.placeholder}
          disabled={loading}
          aria-invalid={validationError ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "mt-3",
            validationError &&
              "border-urgent focus-visible:border-urgent focus-visible:ring-urgent/20",
          )}
        />

        <div className="mt-2.5 flex flex-col gap-2 text-[11.5px] text-bodytext sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleSample}
            disabled={loading}
            aria-label={`${copy.echo.sample} — ${copy.echo.sampleLabel}`}
            title={copy.echo.sampleLabel}
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            {copy.echo.sample}
          </Button>
          <p
            id="echo-count"
            className="shrink-0 tabular-nums text-bodytext sm:text-end"
            dir="ltr"
            lang="en"
          >
            {copy.echo.charCount(text.length)}
          </p>
        </div>

        {validationError ? (
          <p
            id="echo-error"
            role="alert"
            className="mt-2.5 text-[12.5px] font-medium text-urgent"
          >
            {validationError}
          </p>
        ) : null}

        <Button type="submit" size="lg" disabled={loading} className="mt-5 w-full">
          {loading ? (
            <Loader2
              className="h-4 w-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <HeartPulse className="h-4 w-4" aria-hidden="true" />
          )}
          {loading ? copy.echo.submitting : copy.echo.submit}
        </Button>
      </form>

      {loading ? (
        <div
          role="status"
          aria-live="polite"
          className="mt-6 flex items-start gap-3 rounded-2xl border border-line bg-white p-5 shadow-soft sm:p-6"
        >
          <Loader2
            className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-brand motion-reduce:animate-none"
            aria-hidden="true"
          />
          <p className="text-[14px] leading-7 text-bodytext">{copy.echo.submitting}</p>
        </div>
      ) : null}

      {status === "error" && error ? (
        <div className="mt-6">
          <ErrorResults
            error={error}
            onRetry={retry}
            messages={copy.echo.errors}
          />
        </div>
      ) : null}

      {status === "success" && analysis ? (
        <div className="mt-8 flex flex-col gap-5">
          {analysis.meta.mode === "mock" ? <DemoNotice /> : null}

          <Card className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2
                  ref={resultHeadingRef}
                  tabIndex={-1}
                  className="scroll-mt-24 rounded-md font-display text-[20px] font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-4 focus-visible:ring-offset-page"
                >
                  {copy.echo.summaryTitle}
                </h2>
                <p className="mt-1 text-[12.5px] text-bodytext">
                  {copy.echo.termsCount(analysis.terms.length)}
                </p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={handleStartOver}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                {copy.echo.startOver}
              </Button>
            </div>

            <p
              lang={locale}
              dir={dir}
              className="mt-4 whitespace-pre-wrap break-words rounded-xl border border-line bg-[#F8FBFA] p-4 text-[15px] leading-7 text-ink"
            >
              {analysis.summary[locale]}
            </p>
          </Card>

          <section aria-labelledby="echo-terms-title">
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
              <h3
                id="echo-terms-title"
                className="font-display text-[20px] font-semibold text-ink"
              >
                {copy.echo.termsTitle}
              </h3>
              <Badge variant="teal" className="self-start sm:self-auto">
                {copy.echo.termsCount(analysis.terms.length)}
              </Badge>
            </div>

            {analysis.terms.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-line bg-white p-5 text-[13px] text-bodytext">
                {copy.echo.empty}
              </p>
            ) : (
              <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
                <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-4 border-b border-line bg-brand-soft px-5 py-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-bodytext sm:grid">
                  <p>
                    {copy.echo.termEn} / {copy.echo.termAr}
                  </p>
                  <p>{copy.echo.explanation}</p>
                </div>

                <ul>
                  {analysis.terms.map((term) => (
                    <li
                      key={term.id}
                      className="border-b border-line p-4 last:border-b-0 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] sm:gap-4 sm:p-5"
                    >
                      <div>
                        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-bodytext sm:hidden">
                          {copy.echo.termEn}
                        </p>
                        <p
                          lang="en"
                          dir="ltr"
                          className="text-[15px] font-semibold text-ink"
                        >
                          {term.term.en}
                        </p>
                        <p className="mt-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-bodytext sm:hidden">
                          {copy.echo.termAr}
                        </p>
                        <p
                          lang="ar"
                          dir="rtl"
                          className="text-[15px] font-semibold text-ink"
                        >
                          {term.term.ar}
                        </p>
                      </div>
                      <div className="mt-3 border-t border-line pt-3 sm:mt-0 sm:border-t-0 sm:pt-0">
                        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-bodytext sm:hidden">
                          {copy.echo.explanation}
                        </p>
                        <p
                          lang={locale}
                          dir={dir}
                          className="text-[13.5px] leading-7 text-ink"
                        >
                          {term.explanation[locale]}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <p className="flex items-start gap-2.5 rounded-xl border border-caution-border bg-caution-soft px-4 py-3 text-[12.5px] leading-6 text-caution-ink">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{copy.echo.note}</span>
          </p>
        </div>
      ) : null}
    </section>
  );
}
