import type { AiAnalysisContent } from "../../../shared/contract.ts";

const MISSPELLED_PARESTHESIA = "تنمل";
const PARESTHESIA = "تنميل";

function correctParesthesiaSpelling(value: string): string {
  return value.replaceAll(MISSPELLED_PARESTHESIA, PARESTHESIA);
}

export function correctArabicParesthesiaSpelling(
  content: AiAnalysisContent,
): AiAnalysisContent {
  return {
    ...content,
    normalized: {
      ...content.normalized,
      ar: correctParesthesiaSpelling(content.normalized.ar),
    },
    terminology: content.terminology.map((item) => ({
      ...item,
      arabic: correctParesthesiaSpelling(item.arabic),
      explanation: {
        ...item.explanation,
        ar: correctParesthesiaSpelling(item.explanation.ar),
      },
    })),
    clarifications: content.clarifications.map((item) => ({
      ...item,
      label: {
        ...item.label,
        ar: correctParesthesiaSpelling(item.label.ar),
      },
      question: {
        ...item.question,
        ar: correctParesthesiaSpelling(item.question.ar),
      },
    })),
    clinicalInterpretations: content.clinicalInterpretations.map((item) => ({
      ...item,
      label: {
        ...item.label,
        ar: correctParesthesiaSpelling(item.label.ar),
      },
      detail: {
        ...item.detail,
        ar: correctParesthesiaSpelling(item.detail.ar),
      },
      basis: {
        ...item.basis,
        ar: correctParesthesiaSpelling(item.basis.ar),
      },
    })),
  };
}
