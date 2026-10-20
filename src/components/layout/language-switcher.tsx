import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/use-locale";

export function LanguageSwitcher() {
  const { locale, copy, setLocale } = useLocale();

  const options = [
    {
      value: "en" as const,
      label: copy.header.english,
      shortLabel: copy.header.englishShort,
      lang: "en",
      dir: "ltr" as const,
      ariaLabel: copy.header.switchToEnglish,
    },
    {
      value: "ar" as const,
      label: copy.header.arabic,
      shortLabel: copy.header.arabicShort,
      lang: "ar",
      dir: "rtl" as const,
      ariaLabel: copy.header.switchToArabic,
    },
  ];

  return (
    <div
      role="group"
      aria-label={copy.header.languageGroup}
      className="flex items-center gap-0.5 rounded-xl border border-line bg-brand-soft p-0.5"
    >
      {options.map((option) => {
        const active = locale === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            aria-label={option.ariaLabel}
            lang={option.lang}
            dir={option.dir}
            onClick={() => setLocale(option.value)}
            className={cn(
              "inline-flex min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-[10px] px-2 text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-brand-soft sm:px-3 sm:text-[12.5px]",
              active
                ? "bg-white text-brand shadow-soft"
                : "text-bodytext hover:bg-white/60 hover:text-ink",
            )}
          >
            <span className="hidden sm:inline">{option.label}</span>
            <span className="sm:hidden">{option.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
