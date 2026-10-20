import { Check, Copy, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n/use-locale";
import { cn } from "@/lib/utils";
import type { CopyStatus } from "@/hooks/use-clipboard";

type ResultsActionsProps = {
  copyStatus: CopyStatus;
  onCopy: () => void;
  onPrint: () => void;
  showHint?: boolean;
  className?: string;
};

export function ResultsActions({
  copyStatus,
  onCopy,
  onPrint,
  showHint = true,
  className,
}: ResultsActionsProps) {
  const { copy } = useLocale();

  const copyLabel =
    copyStatus === "copied"
      ? copy.results.copied
      : copyStatus === "error"
        ? copy.results.copyFailed
        : copy.results.copy;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        <Button type="button" variant="secondary" size="sm" onClick={onCopy}>
          {copyStatus === "copied" ? (
            <Check className="h-4 w-4 text-brand" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          {copyLabel}
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onPrint}>
          <Printer className="h-4 w-4" aria-hidden="true" />
          {copy.results.print}
        </Button>
      </div>

      {copyStatus === "error" ? (
        <p className="text-[11.5px] leading-5 text-urgent md:text-end">
          {copy.results.copyAnnounceError}
        </p>
      ) : showHint ? (
        <p className="text-[11.5px] leading-5 text-bodytext md:text-end">
          {copy.results.printHint}
        </p>
      ) : null}
    </div>
  );
}
