import { FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/i18n/use-locale";

export function DemoNotice() {
  const { copy } = useLocale();

  return (
    <section
      aria-labelledby="demo-notice-title"
      className="rounded-2xl border border-caution-border bg-caution-soft p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <FlaskConical
          className="mt-0.5 h-5 w-5 shrink-0 text-caution"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <Badge variant="amber">{copy.results.demo.badge}</Badge>
          <h3
            id="demo-notice-title"
            className="mt-2 font-display text-[15px] font-semibold text-caution-ink"
          >
            {copy.results.demo.title}
          </h3>
          <p className="mt-1 text-[13px] leading-6 text-caution-ink">
            {copy.results.demo.body}
          </p>
        </div>
      </div>
    </section>
  );
}
