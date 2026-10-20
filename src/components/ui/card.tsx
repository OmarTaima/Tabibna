import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("rounded-2xl border border-line bg-white shadow-soft", className)}
      {...props}
    />
  );
}
