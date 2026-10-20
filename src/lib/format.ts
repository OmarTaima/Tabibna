import type { Locale } from "@shared/contract";

const countFormatter = new Intl.NumberFormat("en-US");
const termNumberFormatter = new Intl.NumberFormat("en-US", {
  minimumIntegerDigits: 2,
  useGrouping: false,
});

export function formatNumber(value: number): string {
  return countFormatter.format(value);
}

export function formatTermNumber(value: number): string {
  return termNumberFormatter.format(value);
}

export function formatDateTime(value: string, locale: Locale): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const formatted = new Intl.DateTimeFormat(
    locale === "ar" ? "ar-EG-u-nu-latn" : "en-GB",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);

  return formatted.replace(/[\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, "");
}
