import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-lg bg-[#E8F0ED] motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}
