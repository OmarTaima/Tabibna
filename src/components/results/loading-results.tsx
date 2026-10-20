import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/i18n/use-locale";

function SummarySkeleton() {
  return (
    <div className="mt-6">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-4 w-40" />
      <Skeleton className="mt-4 h-20 w-full" />
      <Skeleton className="mt-4 h-3 w-32" />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}

function TermSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-soft sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-32 rounded-full" />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
      <Skeleton className="mt-4 h-px w-full" />
      <Skeleton className="mt-4 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-11/12" />
    </div>
  );
}

export function LoadingResults() {
  const { copy } = useLocale();
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), 8_000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="mx-auto w-full max-w-[880px]" aria-busy="true">
      <div className="min-h-[520px]">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-soft sm:p-6">
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="flex items-start gap-3"
          >
            <Loader2
              className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-brand motion-reduce:animate-none"
              aria-hidden="true"
            />
            <div>
              <p className="font-display text-[16px] font-semibold text-ink">
                {copy.results.loadingTitle}
              </p>
              <p className="mt-1 text-[13px] leading-6 text-bodytext">
                {copy.results.loadingBody}
              </p>
              {slow ? (
                <p className="mt-2 text-[12px] font-medium text-bodytext">
                  {copy.results.stillWorking}
                </p>
              ) : null}
            </div>
          </div>

          <SummarySkeleton />
        </div>
        <div className="mt-5 grid gap-4">
          <TermSkeleton />
          <TermSkeleton />
        </div>
      </div>
    </div>
  );
}
