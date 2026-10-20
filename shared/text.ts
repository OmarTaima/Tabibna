const ARABIC_DIACRITICS = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const ARABIC_TATWEEL = /\u0640/g;
const ARABIC_INDIC_DIGITS = /[٠-٩]/g;

const DIGIT_MAP: Record<string, string> = {
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
};

const NEGATION_CUE_SOURCE =
  String.raw`\b(?:no|denies?|deny|negative for|free of)\b` +
  String.raw`|\bwithout\b(?!\s+(?:trying|reason|a reason|any reason))` +
  String.raw`|(?:do not have|don't have|does not have|did not have|not (?:having|experiencing|reporting))` +
  String.raw`|(?:مفيش|مافيش|ما فيش|من غير(?!\s*(?:سبب|مبرر))|بدون(?!\s*(?:سبب|مبرر))|لا يوجد|ما عندي|ما عنديش|مش عندي|معنديش|ما عندناش|ما بشتكيش|لا اشكو)`;

const CLAUSE_BOUNDARY =
  /[.!?;\n،؛]|\b(?:but|however|although|yet)\b|(?:^|\s)(?:لكن|بس|الا|إلا)(?=\s|$|[،.؛])/i;

const NEGATED_PHRASES: readonly RegExp[] = [
  /\bnot\s+(?:short of breath|shortness of breath|breathless)\b/gi,
  /\bnot\s+(?:vomiting|coughing up)\s+blood\b/gi,
  /\bnot\s+(?:unconscious|fainting)\b/gi,
  /\bnot\s+(?:suicidal|self-harming)\b/gi,
  /\bnot\s+(?:bleeding heavily|bleeding)\b/gi,
  /\bnot\s+pregnant\b/gi,
  /(?:مش|غير)\s*حامل/g,
];

export function normalizeForMatching(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(ARABIC_DIACRITICS, "")
    .replace(ARABIC_TATWEEL, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[’‘]/g, "'")
    .replace(ARABIC_INDIC_DIGITS, (digit) => DIGIT_MAP[digit] ?? digit)
    .replace(/\s+/g, " ")
    .trim();
}

export function maskNegatedClauses(value: string): string {
  const cuePattern = new RegExp(NEGATION_CUE_SOURCE, "gi");
  let masked = value;
  let cue: RegExpExecArray | null = cuePattern.exec(value);

  while (cue !== null) {
    const start = cue.index;
    const remainder = value.slice(start);
    const boundaryIndex = remainder.search(CLAUSE_BOUNDARY);
    const scopedLength =
      boundaryIndex >= 0
        ? boundaryIndex
        : Math.min(remainder.length, 80);
    const end = Math.min(value.length, start + Math.max(scopedLength, cue[0].length));

    masked = `${masked.slice(0, start)}${" ".repeat(end - start)}${masked.slice(end)}`;
    cuePattern.lastIndex = Math.max(cuePattern.lastIndex, end);
    cue = cuePattern.exec(value);
  }

  return maskNegatedPhrases(masked);
}

function maskNegatedPhrases(value: string): string {
  let masked = value;
  for (const pattern of NEGATED_PHRASES) {
    masked = masked.replace(pattern, (match) => " ".repeat(match.length));
  }
  return masked;
}
