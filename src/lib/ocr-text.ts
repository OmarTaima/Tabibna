import { MAX_ECHO_TEXT_LENGTH } from "@shared/contract";
import { formatNumber } from "@/lib/format";

export const REDACTED_PLACEHOLDER = "[redacted]";

const EMAIL_PATTERN = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[\p{L}]{2,}/gu;

const HONORIFIC_PATTERN =
  /(?:\b(?:Dr|Prof|Mr|Mrs|Ms|Miss)\.[ \t]*|\b(?:Dr|Prof)[ \t]+)[\p{Lu}][\p{L}'’.-]*(?:[ \t]+[\p{Lu}][\p{L}'’.-]*){0,3}|(?:أ\.?[ \t]?د\.|د\.|الدكتور(?:ة)?|الأستاذ[ \t]+الدكتور)[ \t]*[\p{L}][\p{L}'’.-]*(?:[ \t]+[\p{L}][\p{L}'’.-]*){0,3}/gu;

const EN_LABELED_FIELD_PATTERN =
  /\b((?:patient[ \t]+name|full[ \t]+name|patient[ \t]+id|medical[ \t]+record(?:[ \t]+(?:number|no\.?))?|mrn|national[ \t]+id|id[ \t]+(?:number|no\.?)|phone(?:[ \t]+(?:number|no\.?))?|mobile(?:[ \t]+(?:number|no\.?))?|address|date[ \t]+of[ \t]+birth|dob|referring[ \t]+physician|operator|physician|doctor|patient|name|age|sex|gender|date)[ \t]*[:#][ \t]*)([^\n]{1,120}?)(?=[ \t]{2,}|\n|$)/gi;

const AR_LABELED_FIELD_PATTERN =
  /((?:الاسم|اسم[ \t]+المريض|اسم[ \t]+المريضة|اسم[ \t]+الطبيب|اسم|العمر|السن|النوع|الجنس|رقم[ \t]+الملف|رقم[ \t]+المريض|رقم[ \t]+الهوية|الرقم[ \t]+القومي|رقم[ \t]+الهاتف|رقم[ \t]+الموبايل|الهاتف|الموبايل|العنوان|تاريخ[ \t]+الميلاد|التاريخ)[ \t]*[:：]?[ \t]*)([^\n:：]{1,120}?)(?=[ \t]{2,}|\n|$)/g;

const KB = 1024;
const MB = KB * 1024;

export type TruncatedOcrText = {
  text: string;
  truncated: boolean;
};

export function truncateOcrText(
  raw: string,
  maxLength: number = MAX_ECHO_TEXT_LENGTH,
): TruncatedOcrText {
  if (raw.length <= maxLength) {
    return { text: raw.trim(), truncated: false };
  }

  const head = raw.slice(0, maxLength);
  const lastBreak = head.lastIndexOf("\n");
  const kept = lastBreak > 0 ? head.slice(0, lastBreak) : head;

  return { text: kept.trim(), truncated: true };
}

export function redactPersonalData(text: string): string {
  if (text.length === 0) {
    return text;
  }

  return text
    .replace(EMAIL_PATTERN, REDACTED_PLACEHOLDER)
    .replace(HONORIFIC_PATTERN, REDACTED_PLACEHOLDER)
    .replace(
      EN_LABELED_FIELD_PATTERN,
      (_match: string, label: string) => `${label}${REDACTED_PLACEHOLDER}`,
    )
    .replace(
      AR_LABELED_FIELD_PATTERN,
      (_match: string, label: string) => `${label}${REDACTED_PLACEHOLDER}`,
    );
}

export function formatFileSize(bytes: number): string {
  if (bytes >= MB) {
    return `${(bytes / MB).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / KB))} KB`;
}

export function formatDimensions(width: number, height: number): string {
  return `${formatNumber(width)} × ${formatNumber(height)} px`;
}
