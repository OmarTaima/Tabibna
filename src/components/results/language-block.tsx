import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type LanguageBlockProps = {
  language: "en" | "ar";
  label: string;
  text: string;
  tone?: "panel" | "plain";
  textClassName?: string;
  className?: string;
};

export function LanguageBlock({
  language,
  label,
  text,
  tone = "panel",
  textClassName,
  className,
}: LanguageBlockProps) {
  return (
    <div
      lang={language}
      dir={language === "ar" ? "rtl" : "ltr"}
      className={cn(
        "rounded-xl border border-line bg-[#F8FBFA] p-3.5",
        tone === "plain" && "rounded-none border-0 bg-transparent p-0",
        className,
      )}
    >
      <Badge variant={language === "ar" ? "teal" : "neutral"}>{label}</Badge>
      <p
        className={cn(
          "mt-2 whitespace-pre-wrap break-words text-[14px] leading-7 text-ink",
          textClassName,
        )}
      >
        {text}
      </p>
    </div>
  );
}
