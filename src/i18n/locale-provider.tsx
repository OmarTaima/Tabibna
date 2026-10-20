import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "@shared/contract";
import { dictionaries } from "./copy";
import { LocaleContext, type LocaleContextValue } from "./locale-context";

const STORAGE_KEY = "tabibna.locale";

function readInitialLocale(): Locale {
  if (typeof window === "undefined") {
    return "en";
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "ar") {
      return stored;
    }
  } catch {
    // Storage may be unavailable in private contexts; language detection still works.
  }

  const browserLanguages =
    navigator.languages.length > 0 ? navigator.languages : [navigator.language];

  return browserLanguages.some((language) => language.toLowerCase().startsWith("ar"))
    ? "ar"
    : "en";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale);
  const copy = dictionaries[locale];
  const dir = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = dir;
    document.title = copy.meta.title;

    const description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    description?.setAttribute("content", copy.meta.description);

    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // Persisting the choice is a progressive enhancement.
    }
  }, [copy, dir, locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, dir, copy, setLocale }),
    [copy, dir, locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
