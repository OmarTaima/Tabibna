import type { ClinicalInterpretation } from "@shared/contract";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/i18n/use-locale";

export function ClinicalContextCard({
  interpretations,
}: {
  interpretations: ClinicalInterpretation[];
}) {
  const { locale, copy } = useLocale();

  if (interpretations.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="clinical-context-heading"
      className="rounded-2xl border border-brand/25 bg-[#F7FBFA] p-5 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <Info
          className="mt-0.5 h-5 w-5 shrink-0 text-brand"
          aria-hidden="true"
        />
        <div>
          <h3
            id="clinical-context-heading"
            className="font-display text-[17px] font-semibold text-ink"
          >
            {copy.clinical.title}
          </h3>
          <p className="mt-1 text-[13px] leading-6 text-bodytext">
            {copy.clinical.intro}
          </p>
        </div>
      </div>

      <ul className="mt-4 border-t border-line">
        {interpretations.map((item) => (
          <li
            key={item.id}
            className="border-b border-line py-4 last:border-b-0 last:pb-0"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h4 className="font-display text-[15px] font-semibold text-ink">
                {item.label[locale]}
              </h4>
              <Badge variant="outline">
                {copy.clinical.confidence}:{" "}
                {copy.clinical.confidenceLevel[item.confidence]}
              </Badge>
            </div>
            <p className="mt-2 text-[14px] leading-7 text-ink">
              {item.detail[locale]}
            </p>
            <p className="mt-2 text-[12.5px] leading-6 text-bodytext">
              <span className="font-semibold text-ink">
                {copy.clinical.basis}:
              </span>{" "}
              {item.basis[locale]}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
