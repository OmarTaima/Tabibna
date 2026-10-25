import type { ReactNode } from "react";
import type {
  FollowUpAnswer,
  FollowUpQuestion,
  MedicalAnalysis,
} from "@shared/contract";
import { useLocale } from "@/i18n/use-locale";
import { formatDateTime, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

function ReportSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mt-4 border-t border-line pt-3", className)}>
      <h2 className="break-after-avoid font-display text-[11.5pt] font-semibold text-ink">
        {title}
      </h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

type PrintReportProps = {
  analysis: MedicalAnalysis;
  answers: FollowUpAnswer[];
  questions: FollowUpQuestion[];
};

export function PrintReport({ analysis, answers, questions }: PrintReportProps) {
  const { locale, copy } = useLocale();
  const generated = formatDateTime(analysis.meta.generatedAt, locale);
  const mock = analysis.meta.mode === "mock";
  const localizedDir = locale === "ar" ? "rtl" : "ltr";
  const localizedPrint = locale === "ar" ? "print-text-ar" : "print-text-en";
  const languages: Array<"en" | "ar"> =
    locale === "ar" ? ["ar", "en"] : ["en", "ar"];
  const originalLanguage =
    analysis.detectedLanguage === "en"
      ? "en"
      : analysis.detectedLanguage === "ar" || analysis.detectedLanguage === "ar-EG"
        ? "ar"
        : undefined;
  const questionById = new Map(
    questions.map((question) => [question.id, question]),
  );

  return (
    <article
      className="print-report hidden bg-white text-ink print:block"
      lang={locale}
      dir={localizedDir}
    >
      <header className="border-b border-line pb-5">
        <div className="flex items-start justify-between gap-8">
          <div className="min-w-0">
            <p
              className="font-display text-[13pt] font-bold text-ink"
              lang="en"
              dir="ltr"
            >
              {copy.report.brand}
            </p>
            <h1
              className="mt-3 font-display text-[20pt] font-bold leading-[1.2] text-ink"
              lang="en"
              dir="ltr"
            >
              {copy.report.titleEnglish}
            </h1>
            <p
              className="mt-1 text-[13pt] font-semibold text-ink"
              lang="ar"
              dir="rtl"
            >
              {copy.report.titleArabic}
            </p>
          </div>
          <div className="max-w-[45%] shrink-0 text-end text-[9.5pt] leading-[1.5] text-bodytext">
            <p className="font-semibold text-ink">{copy.report.generated}</p>
            {generated ? (
              <p lang={locale} dir={localizedDir}>
                <time
                  dateTime={analysis.meta.generatedAt}
                  dir="ltr"
                  className="whitespace-nowrap"
                >
                  {generated}
                </time>
              </p>
            ) : null}
          </div>
        </div>

        {mock ? (
          <p
            className="mt-4 rounded border border-caution-border bg-caution-soft px-3 py-2 text-[9.5pt] font-medium text-caution-ink"
            lang={locale}
            dir={localizedDir}
          >
            {copy.report.demo}
          </p>
        ) : null}
      </header>

      <div className="print-body">
        <ReportSection title={copy.report.original}>
          <div className="break-inside-avoid rounded border border-line bg-[#F8FBFA] p-3">
            <p
              className={cn(
                "text-[9pt] font-semibold text-bodytext",
                locale === "en" && "uppercase tracking-[0.12em]",
              )}
              lang={locale}
              dir={localizedDir}
            >
              {copy.results.summary.originalLabel}
            </p>
            <p
              lang={originalLanguage}
              dir={
                originalLanguage === "ar"
                  ? "rtl"
                  : originalLanguage === "en"
                    ? "ltr"
                    : "auto"
              }
              className={cn(
                "mt-1 whitespace-pre-wrap break-words text-ink",
                originalLanguage === "ar" && "print-text-ar",
                originalLanguage === "en" && "print-text-en",
                originalLanguage === undefined && "text-[10.5pt] leading-[1.8]",
              )}
            >
              {analysis.original}
            </p>
          </div>
        </ReportSection>

        <ReportSection title={copy.results.summary.normalizedLabel}>
          <div className="flex flex-col gap-3">
            {languages.map((language) => (
              <div
                key={language}
                lang={language}
                dir={language === "ar" ? "rtl" : "ltr"}
                className="break-inside-avoid rounded border border-line p-3"
              >
                <p className="text-[9pt] font-semibold text-brand">
                  {language === "ar"
                    ? copy.languages.arabic
                    : copy.languages.english}
                </p>
                <p
                  className={cn(
                    "mt-1 text-ink",
                    language === "ar" ? "print-text-ar" : "print-text-en",
                  )}
                >
                  {analysis.normalized[language]}
                </p>
              </div>
            ))}
          </div>
        </ReportSection>

        <ReportSection title={copy.report.impression}>
          <div className="break-inside-avoid rounded border border-line p-3">
            <div
              className="flex flex-wrap items-center justify-between gap-2"
              lang={locale}
              dir={localizedDir}
            >
              <p className="text-[9pt] font-semibold text-brand">
                {copy.impression.primaryLabel}
              </p>
              <p className="text-[8.5pt] font-semibold text-ink">
                {copy.impression.confidence}:{" "}
                {copy.impression.confidenceLevel[analysis.impression.confidence]}
              </p>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-4">
              {languages.map((language) => (
                <div
                  key={language}
                  lang={language}
                  dir={language === "ar" ? "rtl" : "ltr"}
                >
                  <p className="text-[8.5pt] font-semibold text-bodytext">
                    {language === "ar"
                      ? copy.languages.arabic
                      : copy.languages.english}
                  </p>
                  <p
                    className={cn(
                      "font-semibold text-ink",
                      language === "ar" ? "print-text-ar" : "print-text-en",
                    )}
                  >
                    {analysis.impression.primary[language]}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-3 border-t border-line pt-2">
              <p
                lang={locale}
                dir={localizedDir}
                className="text-[9pt] font-semibold text-ink"
              >
                {copy.impression.differentials}
              </p>
              {analysis.impression.differentials.length === 0 ? (
                <p className="mt-1 text-[9pt] text-bodytext">
                  {copy.impression.empty}
                </p>
              ) : (
                <ul className="mt-1 flex flex-col gap-1">
                  {analysis.impression.differentials.map((item, index) => (
                    <li key={index} className="grid grid-cols-2 gap-4">
                      {languages.map((language) => (
                        <p
                          key={language}
                          lang={language}
                          dir={language === "ar" ? "rtl" : "ltr"}
                          className={cn(
                            "text-ink",
                            language === "ar"
                              ? "print-text-ar"
                              : "print-text-en",
                          )}
                        >
                          {item[language]}
                        </p>
                      ))}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-3 border-t border-line pt-2">
              <p
                lang={locale}
                dir={localizedDir}
                className="text-[9pt] font-semibold text-ink"
              >
                {copy.impression.rationale}
              </p>
              <div className="mt-1 grid grid-cols-2 gap-4">
                {languages.map((language) => (
                  <p
                    key={language}
                    lang={language}
                    dir={language === "ar" ? "rtl" : "ltr"}
                    className={cn(
                      "text-ink",
                      language === "ar" ? "print-text-ar" : "print-text-en",
                    )}
                  >
                    {analysis.impression.rationale[language]}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </ReportSection>

        <ReportSection
          title={`${copy.report.terminology} — ${copy.terminology.count(analysis.terminology.length)}`}
        >
          <ol className="flex flex-col gap-3">
            {analysis.terminology.map((term, index) => (
              <li
                key={term.id}
                className="break-inside-avoid rounded border border-line p-3"
              >
                <div
                  className="flex flex-wrap items-center justify-between gap-2 text-[9pt]"
                  lang={locale}
                  dir={localizedDir}
                >
                  <span className="font-semibold text-brand">
                    {copy.terminology.termLabel(index + 1)}
                  </span>
                  <span className="text-bodytext">
                    {copy.terminology.kind[term.kind]} ·{" "}
                    {copy.terminology.origin[term.origin]}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  {languages.map((language) => (
                    <div
                      key={language}
                      lang={language}
                      dir={language === "ar" ? "rtl" : "ltr"}
                    >
                      <p className="text-[8.5pt] font-semibold text-bodytext">
                        {language === "ar"
                          ? copy.languages.arabic
                          : copy.languages.english}
                      </p>
                      <p
                        className={cn(
                          "font-semibold text-ink",
                          language === "ar" ? "print-text-ar" : "print-text-en",
                        )}
                      >
                        {language === "ar" ? term.arabic : term.english}
                      </p>
                      <p
                        className={cn(
                          "mt-1 text-ink",
                          language === "ar" ? "print-text-ar" : "print-text-en",
                        )}
                      >
                        {term.explanation[language]}
                      </p>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </ReportSection>

        {analysis.clarifications.length > 0 ? (
          <ReportSection title={copy.report.clarifications}>
            <ol className="flex flex-col gap-2">
              {analysis.clarifications.map((item, index) => (
                <li
                  key={item.id}
                  className="break-inside-avoid flex items-start gap-2"
                >
                  <span className="text-[10pt] font-semibold tabular-nums text-brand">
                    {formatNumber(index + 1)}.
                  </span>
                  <div>
                    <p
                      lang={locale}
                      dir={localizedDir}
                      className="text-[9pt] font-semibold text-brand"
                    >
                      {item.label[locale]}
                    </p>
                    <p
                      lang={locale}
                      dir={localizedDir}
                      className={cn("mt-0.5 text-ink", localizedPrint)}
                    >
                      {item.question[locale]}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </ReportSection>
        ) : null}

        {analysis.clinicalInterpretations.length > 0 ? (
          <ReportSection title={copy.report.clinical}>
            <ul className="flex flex-col gap-3">
              {analysis.clinicalInterpretations.map((item) => (
                <li
                  key={item.id}
                  className="break-inside-avoid rounded border border-brand/30 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p
                      lang={locale}
                      dir={localizedDir}
                      className="text-[10pt] font-semibold text-ink"
                    >
                      {item.label[locale]}
                    </p>
                    <p
                      lang={locale}
                      dir={localizedDir}
                      className="text-[8.5pt] font-semibold text-brand"
                    >
                      {copy.clinical.confidence}:{" "}
                      {copy.clinical.confidenceLevel[item.confidence]}
                    </p>
                  </div>
                  <p
                    lang={locale}
                    dir={localizedDir}
                    className={cn("mt-1 text-ink", localizedPrint)}
                  >
                    {item.detail[locale]}
                  </p>
                  <p className="mt-1 text-[9pt] leading-[1.5] text-bodytext">
                    <span
                      lang={locale}
                      dir={localizedDir}
                      className="font-semibold text-ink"
                    >
                      {copy.clinical.basis}:
                    </span>{" "}
                    <span
                      lang={locale}
                      dir={localizedDir}
                      className={cn("text-ink", localizedPrint)}
                    >
                      {item.basis[locale]}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          </ReportSection>
        ) : null}

        {answers.length > 0 ? (
          <ReportSection title={copy.report.followUps}>
            <ol className="flex flex-col gap-2">
              {answers.map((item, index) => {
                const question = questionById.get(item.questionId);

                return (
                  <li
                    key={`${item.questionId}-${index}`}
                    className="break-inside-avoid rounded border border-line p-3"
                  >
                    <p className="text-[10pt] font-semibold tabular-nums text-brand">
                      {formatNumber(index + 1)}.
                    </p>

                    {question ? (
                      <div className="mt-1 grid grid-cols-2 gap-4">
                        <div lang="en" dir="ltr">
                          <p className="text-[8.5pt] font-semibold text-bodytext">
                            {copy.languages.english}
                          </p>
                          <p className="print-text-en text-ink">
                            {question.en}
                          </p>
                        </div>
                        <div lang="ar" dir="rtl">
                          <p className="text-[8.5pt] font-semibold text-bodytext">
                            {copy.languages.arabic}
                          </p>
                          <p className="print-text-ar text-ink">
                            {question.ar}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p
                        lang={locale}
                        dir={localizedDir}
                        className={cn("mt-1 text-ink", localizedPrint)}
                      >
                        {item.question}
                      </p>
                    )}

                    <div className="mt-2 border-t border-line pt-2">
                      <p
                        lang={locale}
                        dir={localizedDir}
                        className="text-[8.5pt] font-semibold text-brand"
                      >
                        {copy.report.answerLabel}
                      </p>
                      <p
                        dir="auto"
                        className="mt-0.5 text-[10pt] leading-[1.7] text-ink"
                      >
                        {item.answer}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </ReportSection>
        ) : null}

        <ReportSection title={copy.report.disclaimers}>
          <div className="break-inside-avoid">
            <div>
              <p className="text-[9pt] font-semibold text-ink">
                {copy.disclaimers.productLabel}
              </p>
              <p lang="en" dir="ltr" className="print-text-en text-ink">
                {analysis.disclaimer.en}
              </p>
              <p lang="ar" dir="rtl" className="print-text-ar text-ink">
                {analysis.disclaimer.ar}
              </p>
            </div>
          </div>
        </ReportSection>

        <footer className="mt-6 break-inside-avoid border-t border-line pt-3">
          <p lang="en" dir="ltr" className="print-text-en text-bodytext">
            {copy.report.footerEnglish}
          </p>
          <p lang="ar" dir="rtl" className="print-text-ar text-bodytext">
            {copy.report.footerArabic}
          </p>
        </footer>
      </div>
    </article>
  );
}
