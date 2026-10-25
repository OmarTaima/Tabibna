import type { Impression } from "@shared/contract";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useLocale } from "@/i18n/use-locale";
import { LanguageBlock } from "./language-block";

const confidenceVariant: Record<
  Impression["confidence"],
  "amber" | "outline" | "teal"
> = {
  low: "amber",
  moderate: "outline",
  high: "teal",
};

export function ImpressionCard({ impression }: { impression: Impression }) {
  const { locale, copy } = useLocale();
  const languages: Array<"en" | "ar"> =
    locale === "ar" ? ["ar", "en"] : ["en", "ar"];

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-[18px] font-semibold text-ink">
            {copy.impression.title}
          </h3>
          <p className="mt-1 max-w-[560px] text-[12.5px] leading-6 text-bodytext">
            {copy.impression.subtitle}
          </p>
        </div>
        <Badge variant={confidenceVariant[impression.confidence]}>
          {copy.impression.confidence}:{" "}
          {copy.impression.confidenceLevel[impression.confidence]}
        </Badge>
      </div>

      <div className="mt-4 rounded-xl border border-brand/25 bg-brand-soft p-4">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-brand">
          {copy.impression.primaryLabel}
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {languages.map((language) => (
            <LanguageBlock
              key={language}
              language={language}
              label={copy.languages[language === "ar" ? "arabic" : "english"]}
              text={impression.primary[language]}
              textClassName="text-[17px] font-semibold leading-7"
            />
          ))}
        </div>
      </div>

      <div className="mt-5">
        <h4 className="font-display text-[15px] font-semibold text-ink">
          {copy.impression.differentials}
        </h4>
        {impression.differentials.length === 0 ? (
          <p className="mt-2 text-[13px] text-bodytext">{copy.impression.empty}</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {impression.differentials.map((item, index) => (
              <li
                key={index}
                className="rounded-xl border border-line bg-[#F8FBFA] p-3.5"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {languages.map((language) => (
                    <div
                      key={language}
                      lang={language}
                      dir={language === "ar" ? "rtl" : "ltr"}
                    >
                      <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-bodytext">
                        {copy.languages[language === "ar" ? "arabic" : "english"]}
                      </p>
                      <p className="mt-1 text-[14px] leading-7 text-ink">
                        {item[language]}
                      </p>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <h4 className="font-display text-[15px] font-semibold text-ink">
          {copy.impression.rationale}
        </h4>
        <div className="mt-3 grid gap-3">
          {languages.map((language) => (
            <LanguageBlock
              key={language}
              language={language}
              label={copy.languages[language === "ar" ? "arabic" : "english"]}
              text={impression.rationale[language]}
              tone="plain"
              textClassName="text-[13.5px] leading-7 text-ink"
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
