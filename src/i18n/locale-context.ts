import { createContext } from "react";
import type { Locale } from "@shared/contract";
import type { Copy } from "./copy";

export type LocaleContextValue = {
  locale: Locale;
  dir: "ltr" | "rtl";
  copy: Copy;
  setLocale: (locale: Locale) => void;
};

export const LocaleContext = createContext<LocaleContextValue | null>(null);
