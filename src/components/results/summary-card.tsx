import type { MedicalAnalysis } from "@shared/contract";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useLocale } from "@/i18n/use-locale";
import { LanguageBlock } from "./language-block";

export function SummaryCard({ analysis }: { analysis: MedicalAnalysis }) {
  const { locale, copy } = useLocale();
  const languages: Array<"en" | "ar"> =
    locale === "ar" ? ["ar", "en"] : ["en", "ar"];

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-[18px] font-semibold text-ink">
            {copy.results.summary.title}
          </h3>
          <p className="mt-1 text-[12.5px] text-bodytext">
            {copy.results.summary.originalHelp}
          </p>
        </div>
        <Badge variant="outline">{copy.results.summary.originalChip}</Badge>
      </div>

      <div className="mt-4 rounded-xl border border-line bg-[#F8FBFA] p-4">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-bodytext">
          {copy.results.summary.originalLabel}
        </p>
        <p
          dir="auto"
          className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-7 text-ink"
        >
          {analysis.original}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-display text-[15px] font-semibold text-ink">
            {copy.results.summary.normalizedLabel}
          </h4>
          <p className="mt-1 text-[12.5px] text-bodytext">
            {copy.results.summary.normalizedHelp}
          </p>
        </div>
        <Badge variant="teal">{copy.results.summary.normalizedChip}</Badge>
      </div>

      <div className="mt-3 grid gap-3">
        {languages.map((language) => (
          <LanguageBlock
            key={language}
            language={language}
            label={copy.languages[language === "ar" ? "arabic" : "english"]}
            text={analysis.normalized[language]}
            textClassName="text-[15px]"
          />
        ))}
      </div>

      <div className="mt-5 border-t border-line pt-4 text-[12.5px] leading-6 text-bodytext">
        <p>{copy.results.summary.notDiagnosisLine}</p>
      </div>
    </Card>
  );
}
