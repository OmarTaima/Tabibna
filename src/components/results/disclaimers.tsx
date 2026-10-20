import type { MedicalAnalysis } from "@shared/contract";
import { Info } from "lucide-react";
import { useLocale } from "@/i18n/use-locale";

export function Disclaimers({ analysis }: { analysis: MedicalAnalysis }) {
  const { locale, copy } = useLocale();

  return (
    <section
      aria-labelledby="disclaimers-heading"
      className="rounded-2xl border border-line bg-white p-5 sm:p-6"
    >
      <h3
        id="disclaimers-heading"
        className="font-display text-[16px] font-semibold text-ink"
      >
        {copy.disclaimers.title}
      </h3>

      <div className="mt-4">
        <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ink">
          <Info className="h-4 w-4 text-brand" aria-hidden="true" />
          {copy.disclaimers.productLabel}
        </p>
        <p className="mt-2 text-[12.5px] leading-6 text-bodytext">
          {analysis.disclaimer[locale]}
        </p>
      </div>
    </section>
  );
}
