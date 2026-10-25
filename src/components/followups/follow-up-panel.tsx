import type {
  AnalysisMeta,
  FollowUpAnswer,
  FollowUpQuestion,
} from "@shared/contract";
import { FlaskConical, Loader2, RotateCcw, Send } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LiveRegion } from "@/components/ui/live-region";
import { Textarea } from "@/components/ui/textarea";
import { useAnnouncer } from "@/hooks/use-announcer";
import { useLocale } from "@/i18n/use-locale";
import { cn } from "@/lib/utils";

type FollowUpPanelProps = {
  questions: FollowUpQuestion[];
  round: number;
  totalRounds: number;
  meta: AnalysisMeta | null;
  submitting: boolean;
  onSubmit: (answers: FollowUpAnswer[]) => void;
  onStartOver: () => void;
};

export function FollowUpPanel({
  questions,
  round,
  totalRounds,
  meta,
  submitting,
  onSubmit,
  onStartOver,
}: FollowUpPanelProps) {
  const { locale, copy, dir } = useLocale();
  const { announcement, announce } = useAnnouncer();
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(questions.map((question) => [question.id, ""])),
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const firstRef = useRef<HTMLTextAreaElement | null>(null);
  const fieldRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  useEffect(() => {
    firstRef.current?.focus();
    firstRef.current?.scrollIntoView({ block: "center" });
    announce(copy.followUps.readyAnnounce(round, totalRounds));
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const answers = questions.map((question) => ({
      questionId: question.id,
      question: question[locale],
      answer: (values[question.id] ?? "").trim(),
    }));

    const missing = answers.find((answer) => answer.answer.length === 0);

    if (missing) {
      setValidationError(copy.followUps.validation);
      fieldRefs.current[missing.questionId]?.focus();
      return;
    }

    setValidationError(null);
    onSubmit(answers);
  };

  return (
    <Card className="mx-auto w-full max-w-[880px] p-5 sm:p-6">
      <LiveRegion announcement={announcement} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2
            id="followup-title"
            className="font-display text-[20px] font-semibold text-ink sm:text-[22px]"
          >
            {copy.followUps.title}
          </h2>
          <p className="mt-1.5 max-w-[560px] text-[13px] leading-6 text-bodytext">
            {copy.followUps.subtitle}
          </p>
        </div>
        <Badge variant="teal">
          {copy.followUps.roundLabel(round, totalRounds)}
        </Badge>
      </div>

      {meta?.mode === "mock" ? (
        <p className="mt-4 flex items-start gap-2.5 rounded-xl border border-caution-border bg-caution-soft px-3.5 py-3 text-[12.5px] leading-6 text-caution-ink">
          <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{copy.followUps.demoNotice}</span>
        </p>
      ) : null}

      <form
        noValidate
        aria-labelledby="followup-title"
        aria-busy={submitting}
        onSubmit={handleSubmit}
        className="mt-5"
      >
        <ol className="flex flex-col gap-5">
          {questions.map((question, index) => {
            const fieldId = `followup-question-${index}`;
            const labelId = `${fieldId}-label`;
            const questionId = `${fieldId}-text`;
            const isMissing =
              validationError !== null &&
              (values[question.id] ?? "").trim() === "";

            return (
              <li key={question.id}>
                <label
                  id={labelId}
                  htmlFor={fieldId}
                  className="block text-[10.5px] font-semibold uppercase tracking-[0.14em] text-brand"
                >
                  {copy.followUps.questionLabel(index + 1)}
                </label>
                <p
                  id={questionId}
                  lang={locale}
                  dir={dir}
                  className="mt-1.5 text-[14.5px] leading-7 text-ink"
                >
                  {question[locale]}
                </p>
                <Textarea
                  id={fieldId}
                  ref={(node) => {
                    fieldRefs.current[question.id] = node;
                    if (index === 0) {
                      firstRef.current = node;
                    }
                  }}
                  value={values[question.id] ?? ""}
                  onChange={(event) => {
                    setValues((current) => ({
                      ...current,
                      [question.id]: event.target.value,
                    }));
                    if (validationError) {
                      setValidationError(null);
                    }
                  }}
                  dir="auto"
                  maxLength={1000}
                  placeholder={copy.followUps.answerPlaceholder}
                  disabled={submitting}
                  aria-labelledby={`${labelId} ${questionId}`}
                  aria-invalid={isMissing ? true : undefined}
                  aria-describedby={validationError ? "followup-error" : undefined}
                  className={cn(
                    "mt-2.5 min-h-[110px] text-[15px] sm:min-h-[120px]",
                    isMissing &&
                      "border-urgent focus-visible:border-urgent focus-visible:ring-urgent/20",
                  )}
                />
              </li>
            );
          })}
        </ol>

        {validationError ? (
          <p
            id="followup-error"
            role="alert"
            className="mt-3 text-[12.5px] font-medium text-urgent"
          >
            {validationError}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <Loader2
                className="h-4 w-4 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
            {submitting ? copy.followUps.submitting : copy.followUps.submit}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={submitting}
            onClick={onStartOver}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {copy.followUps.startOver}
          </Button>
        </div>
      </form>
    </Card>
  );
}
