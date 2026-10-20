import type { Locale, MedicalAnalysis } from "@shared/contract";
import type { Copy } from "@/i18n/copy";
import { formatDateTime, formatNumber } from "./format";

export function buildSummaryText(
  analysis: MedicalAnalysis,
  locale: Locale,
  copy: Copy,
): string {
  const lines: string[] = [];

  lines.push(`${copy.report.brand} — ${copy.report.titleEnglish}`);
  lines.push(copy.report.titleArabic);
  if (analysis.meta.mode === "mock") {
    lines.push(copy.report.demo);
  }

  const generated = formatDateTime(analysis.meta.generatedAt, locale);
  if (generated) {
    lines.push(`${copy.report.generated}: ${generated}`);
  }
  lines.push("");

  lines.push(`${copy.report.original}:`);
  lines.push(analysis.original);
  lines.push("");

  lines.push(`${copy.report.normalizedEnglish}:`);
  lines.push(analysis.normalized.en);
  lines.push("");
  lines.push(`${copy.report.normalizedArabic}:`);
  lines.push(analysis.normalized.ar);
  lines.push("");

  lines.push(`${copy.report.terminology} (${copy.terminology.count(analysis.terminology.length)})`);
  analysis.terminology.forEach((term, index) => {
    lines.push(`${copy.terminology.termLabel(index + 1)} — ${copy.terminology.origin[term.origin]}`);
    lines.push(`${copy.languages.english}: ${term.english}`);
    lines.push(`${copy.languages.arabic}: ${term.arabic}`);
    lines.push(`${copy.languages.english}: ${term.explanation.en}`);
    lines.push(`${copy.languages.arabic}: ${term.explanation.ar}`);
    lines.push("");
  });

  if (analysis.clarifications.length > 0) {
    lines.push(copy.report.clarifications);
    analysis.clarifications.forEach((item, index) => {
      lines.push(
        `${formatNumber(index + 1)}. ${item.label[locale]}: ${item.question[locale]}`,
      );
      lines.push(
        `${copy.languages.english}: ${item.label.en} — ${item.question.en}`,
      );
      lines.push(
        `${copy.languages.arabic}: ${item.label.ar} — ${item.question.ar}`,
      );
    });
    lines.push("");
  }

  if (analysis.clinicalInterpretations.length > 0) {
    lines.push(copy.report.clinical);
    analysis.clinicalInterpretations.forEach((item) => {
      lines.push(
        `${copy.languages.english}: ${item.label.en} — ${item.detail.en}`,
      );
      lines.push(
        `${copy.languages.arabic}: ${item.label.ar} — ${item.detail.ar}`,
      );
      lines.push(`${copy.clinical.confidence}: ${copy.clinical.confidenceLevel[item.confidence]}`);
      lines.push(`${copy.clinical.basis}: ${item.basis[locale]}`);
      lines.push("");
    });
  }

  lines.push(copy.report.disclaimers);
  lines.push(
    `${copy.disclaimers.productLabel} (${copy.languages.english}): ${analysis.disclaimer.en}`,
  );
  lines.push(
    `${copy.disclaimers.productLabel} (${copy.languages.arabic}): ${analysis.disclaimer.ar}`,
  );
  lines.push("");
  lines.push(copy.report.footerEnglish);
  lines.push(copy.report.footerArabic);

  return lines.join("\n");
}
