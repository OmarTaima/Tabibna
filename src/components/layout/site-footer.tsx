import { useLocale } from "@/i18n/use-locale";

export function SiteFooter() {
  const { copy } = useLocale();

  return (
    <footer className="border-t border-line bg-white/60">
      <div className="mx-auto max-w-[1120px] px-5 py-8 sm:px-6 sm:py-10 lg:px-8">
        <p className="max-w-[720px] text-[13px] leading-6 text-bodytext">
          {copy.footer.disclaimer}
        </p>
        <p className="mt-3 font-display text-[12px] font-semibold text-ink">
          {copy.footer.brand}
        </p>
      </div>
    </footer>
  );
}
