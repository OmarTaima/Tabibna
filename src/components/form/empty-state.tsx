import { BookOpen, Languages, MessageCircleQuestion } from "lucide-react";
import { useLocale } from "@/i18n/use-locale";
import { cn } from "@/lib/utils";

export function EmptyState() {
  const { copy } = useLocale();

  const items = [
    { icon: Languages, label: copy.empty.terms },
    { icon: BookOpen, label: copy.empty.explanations },
    { icon: MessageCircleQuestion, label: copy.empty.safety },
  ];

  return (
    <section
      aria-labelledby="what-you-get"
      className="mt-4 rounded-2xl border border-[#DCE9E5] bg-brand-soft px-5 py-4"
    >
      <h2
        id="what-you-get"
        className="font-display text-[13px] font-semibold text-ink"
      >
        {copy.empty.title}
      </h2>
      <ul className="mt-2.5 flex flex-col sm:grid sm:grid-cols-3">
        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <li
              key={item.label}
              className={cn(
                "flex items-start gap-2.5 py-2.5 text-[13px] leading-6 text-bodytext sm:py-0",
                index > 0 && "border-t border-[#DCE9E5] sm:border-t-0 sm:border-s sm:ps-4",
                index < items.length - 1 && "sm:pe-4",
              )}
            >
              <Icon
                className="mt-0.5 h-[18px] w-[18px] shrink-0 text-brand"
                aria-hidden="true"
              />
              <span>{item.label}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
