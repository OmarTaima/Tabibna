import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
  {
    variants: {
      variant: {
        neutral: "border-line bg-brand-soft text-bodytext",
        teal: "border-[#C7E3DE] bg-brand-soft text-brand",
        outline: "border-line bg-transparent text-ink",
        amber: "border-caution-border bg-caution-soft text-caution",
        urgent: "border-urgent-border bg-urgent-soft text-urgent",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export type BadgeProps = ComponentPropsWithoutRef<"span"> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
