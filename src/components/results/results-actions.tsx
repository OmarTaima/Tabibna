import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n/use-locale";
import { cn } from "@/lib/utils";

type ResultsActionsProps = {
  onPrint: () => void;
  showHint?: boolean;
  className?: string;
};

export function ResultsActions({
  onPrint,
  showHint = true,
  className,
}: ResultsActionsProps) {
  const { copy } = useLocale();

  return (
    <div
      role="group"
      aria-label={copy.results.actionsLabel}
      className={cn("flex flex-col gap-1.5", className)}
    >
      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        <Button type="button" variant="secondary" size="sm" onClick={onPrint}>
          <Printer className="h-4 w-4" aria-hidden="true" />
          {copy.results.print}
        </Button>
      </div>

      {showHint ? (
        <p className="text-[11.5px] leading-5 text-bodytext md:text-end">
          {copy.results.printHint}
        </p>
      ) : null}
    </div>
  );
}
