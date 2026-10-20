import type { Clarification } from "@shared/contract";
import { PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocale } from "@/i18n/use-locale";
import { formatNumber } from "@/lib/format";

type ClarificationsCardProps = {
  clarifications: Clarification[];
  onContinue: () => void;
};

export function ClarificationsCard({
  clarifications,
  onContinue,
}: ClarificationsCardProps) {
  const { locale, copy } = useLocale();

  if (clarifications.length === 0) {
    return null;
  }

  return (
    <Card className="p-5 sm:p-6">
      <h3 className="font-display text-[18px] font-semibold text-ink">
        {copy.clarifications.title}
      </h3>
      <p className="mt-1 text-[13px] leading-6 text-bodytext">
        {copy.clarifications.helper}
      </p>

      <ol className="mt-4 flex flex-col gap-4">
        {clarifications.map((item, index) => (
          <li key={item.id} className="flex items-start gap-3">
            <span
              className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-soft text-[12px] font-semibold tabular-nums text-brand"
              aria-hidden="true"
            >
              {formatNumber(index + 1)}
            </span>
            <div>
              <p className="text-[11px] font-semibold text-brand">
                {item.label[locale]}
              </p>
              <p className="mt-0.5 text-[15px] leading-7 text-ink">
                {item.question[locale]}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <Button
        type="button"
        variant="secondary"
        onClick={onContinue}
        className="mt-5"
      >
        <PenLine className="h-4 w-4" aria-hidden="true" />
        {copy.clarifications.continue}
      </Button>
    </Card>
  );
}
