import { randomUUID } from "node:crypto";
import type {
  Clarification,
  LocalizedText,
  MedicalAnalysis,
  TerminologyItem,
} from "../../../shared/contract.ts";
import { DEMO_NOTICE, FULL_DISCLAIMER } from "../config/content.ts";
import { detectLanguage } from "../text/language.ts";
import { maskNegatedClauses, normalizeForMatching } from "../text/normalize.ts";
import { MOCK_SYMPTOMS, type MockClarification, type MockTerm } from "./patterns.ts";

type SelectedSymptom = {
  term: MockTerm;
  normalized: LocalizedText;
  index: number;
  clarifications: MockClarification[];
};

const FALLBACK_NORMALIZED: LocalizedText = {
  en: "No standardized symptom term could be extracted from the provided description.",
  ar: "لم يمكن استخراج مصطلح عرض معياري من الوصف المقدم.",
};

const FALLBACK_CLARIFICATIONS: readonly MockClarification[] = [
  {
    label: { en: "Main symptom", ar: "العرض الرئيسي" },
    question: {
      en: "Which symptom bothers you most, and where do you feel it?",
      ar: "ما العرض الذي يزعجك أكثر، وأين تشعر به؟",
    },
  },
  {
    label: { en: "Timing", ar: "التوقيت" },
    question: {
      en: "When did it start, and is it getting better or worse?",
      ar: "متى بدأ، وهل يتحسن أم يزداد سوءًا؟",
    },
  },
  {
    label: { en: "Associated symptoms", ar: "أعراض مصاحبة" },
    question: {
      en: "Do you also have breathing difficulty, chest discomfort, fainting, or sudden weakness?",
      ar: "هل لديك أيضًا صعوبة في التنفس أو انزعاج في الصدر أو إغماء أو ضعف مفاجئ؟",
    },
  },
];

function joinEnglish(items: readonly string[]): string {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function joinArabic(items: readonly string[]): string {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} و${items[1]}`;
  return `${items.slice(0, -1).join("، ")}، و${items[items.length - 1]}`;
}

function formatNormalized(selected: readonly SelectedSymptom[]): LocalizedText {
  if (selected.length === 0) return FALLBACK_NORMALIZED;

  const english = selected.map((item) => item.normalized.en);
  const arabic = selected.map((item) => item.normalized.ar);

  return {
    en:
      selected.length === 1
        ? `Reported symptom: ${joinEnglish(english)}.`
        : `Reported symptoms: ${joinEnglish(english)}.`,
    ar:
      selected.length === 1
        ? `العرض المذكور: ${joinArabic(arabic)}.`
        : `الأعراض المذكورة: ${joinArabic(arabic)}.`,
  };
}

function collectClarifications(selected: readonly SelectedSymptom[]): MockClarification[] {
  const candidates = [
    ...selected.flatMap((item) => item.clarifications),
    ...(selected.length === 0 ? FALLBACK_CLARIFICATIONS : []),
  ];
  const seen = new Set<string>();

  return candidates
    .filter((item) => {
      const key = item.label.en.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 4);
}

function selectSymptoms(description: string): SelectedSymptom[] {
  const matchableText = maskNegatedClauses(normalizeForMatching(description));

  return MOCK_SYMPTOMS.flatMap((symptom) => {
    const baseMatch = symptom.match.exec(matchableText);
    if (baseMatch === null) return [];

    const variant = symptom.variants?.find((item) => item.match.test(matchableText));
    return [
      {
        term: variant?.term ?? symptom.term,
        normalized: variant?.normalized ?? symptom.normalized,
        index: baseMatch.index,
        clarifications: symptom.clarifications,
      },
    ];
  })
    .sort((first, second) => first.index - second.index)
    .slice(0, 8);
}

export function buildMockAnalysis(description: string): MedicalAnalysis {
  const analysisId = randomUUID();
  const selected = selectSymptoms(description);

  const terminology: TerminologyItem[] = selected.map((item, index) => ({
    id: `${analysisId}-term-${index + 1}`,
    english: item.term.english,
    arabic: item.term.arabic,
    kind: item.term.kind,
    origin: "reported",
    explanation: item.term.explanation,
    certainty: "stated",
  }));

  const clarifications: Clarification[] = collectClarifications(selected).map((item, index) => ({
    id: `${analysisId}-clarification-${index + 1}`,
    label: item.label,
    question: item.question,
  }));

  return {
    id: analysisId,
    meta: {
      mode: "mock",
      model: "synthetic-demo-v1",
      generatedAt: new Date().toISOString(),
      notice: DEMO_NOTICE,
    },
    original: description,
    detectedLanguage: detectLanguage(description),
    normalized: formatNormalized(selected),
    terminology,
    clarifications,
    clinicalInterpretations: [],
    disclaimer: FULL_DISCLAIMER,
  };
}
