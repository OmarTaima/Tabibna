import type { TerminologyItem } from "@shared/contract";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/i18n/use-locale";
import { LanguageBlock } from "./language-block";

type TerminologySectionProps = {
  terms: TerminologyItem[];
};

export function TerminologySection({ terms }: TerminologySectionProps) {
  const { locale, copy } = useLocale();
  const languages: Array<"en" | "ar"> =
    locale === "ar" ? ["ar", "en"] : ["en", "ar"];

  return (
    <section aria-labelledby="terminology-heading">
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div>
          <h3
            id="terminology-heading"
            className="font-display text-[20px] font-semibold text-ink"
          >
            {copy.terminology.title}
          </h3>
          <p className="mt-1 max-w-[620px] text-[13px] leading-6 text-bodytext">
            {copy.terminology.helper}
          </p>
        </div>
        <p className="shrink-0 text-[12px] font-semibold text-brand">
          {copy.terminology.count(terms.length)}
        </p>
      </div>

      {terms.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-line bg-white p-5 text-[13px] text-bodytext">
          {copy.terminology.empty}
        </p>
      ) : (
        <ol className="mt-4 flex flex-col gap-4">
          {terms.map((term, index) => (
            <li
              key={term.id}
              className="rounded-2xl border border-line bg-white p-5 shadow-soft sm:p-6"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-brand">
                  {copy.terminology.termLabel(index + 1)}
                </p>
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-line" />
                <p className="text-[11px] text-bodytext">
                  {copy.terminology.kind[term.kind]}
                </p>
                <div className="ms-auto">
                  <Badge
                    variant={term.origin === "reported" ? "teal" : "outline"}
                  >
                    {copy.terminology.origin[term.origin]}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {languages.map((language) => (
                  <LanguageBlock
                    key={language}
                    language={language}
                    label={copy.languages[language === "ar" ? "arabic" : "english"]}
                    text={language === "en" ? term.english : term.arabic}
                    textClassName="text-[16px] font-semibold leading-7"
                  />
                ))}
              </div>

              <div className="mt-4 border-t border-line pt-4">
                <div className="grid gap-4">
                  {languages.map((language) => (
                    <LanguageBlock
                      key={language}
                      language={language}
                      label={copy.languages[language === "ar" ? "arabic" : "english"]}
                      text={term.explanation[language]}
                      tone="plain"
                      textClassName="text-[14px] leading-7 text-ink"
                    />
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
