import { FlaskConical } from "lucide-react";
import type { AnalysisMode } from "@shared/contract";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/i18n/use-locale";
import { Brand } from "./brand";
import { LanguageSwitcher } from "./language-switcher";

function DemoIndicator() {
  const { copy } = useLocale();

  return (
    <Badge
      variant="amber"
      title={copy.header.demo.label}
      aria-label={copy.header.demo.label}
      className="max-w-[7.5rem] truncate px-2 py-1.5 text-[10.5px] sm:max-w-none sm:px-2.5 sm:text-[11px]"
    >
      <FlaskConical className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span className="hidden sm:inline">{copy.header.demo.full}</span>
      <span className="sm:hidden">{copy.header.demo.short}</span>
    </Badge>
  );
}

export function SiteHeader({ mode }: { mode: AnalysisMode | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1120px] items-center gap-2 px-5 sm:h-16 sm:gap-3 sm:px-6 lg:px-8">
        <Brand />
        {mode === "mock" ? <DemoIndicator /> : null}
        <div className="ms-auto">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
