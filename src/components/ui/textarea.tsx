import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  ComponentPropsWithoutRef<"textarea">
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[148px] w-full resize-y rounded-xl border border-line bg-white px-4 py-3.5 text-[17px] leading-[1.6] text-ink shadow-none transition-colors placeholder:text-bodytext/55 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[200px]",
      className,
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
