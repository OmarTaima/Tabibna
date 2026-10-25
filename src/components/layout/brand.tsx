import { useLocale } from "@/i18n/use-locale";

export function Brand() {
  const { copy } = useLocale();

  return (
    <div
      className="flex shrink-0 items-center gap-2 sm:gap-2.5"
      role="img"
      aria-label={copy.header.brandLabel}
    >
      <img
        src="/favicon.svg"
        alt=""
        width={28}
        height={28}
        className="h-7 w-7 rounded-lg sm:h-8 sm:w-8"
      />
      <span
        lang="en"
        dir="ltr"
        aria-hidden="true"
        className="font-display text-[15px] font-bold tracking-[-0.01em] text-ink sm:text-[18px]"
      >
        {copy.header.brandWordmark}
        <span className="ms-1 hidden align-middle text-[10px] font-extrabold uppercase tracking-[0.12em] text-brand sm:inline">
          {copy.header.brandAccent}
        </span>
      </span>
    </div>
  );
}
