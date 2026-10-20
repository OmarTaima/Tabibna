import type { DetectedLanguage } from "../../../shared/contract.ts";
import { normalizeForMatching } from "./normalize.ts";

const ARABIC_SCRIPT = /[\u0600-\u06FF]/;
const LATIN_SCRIPT = /[A-Za-z]/;

const EGYPTIAN_MARKERS =
  /(?:^|\s)(?:مش|مافيش|مفيش|عندي|عندك|امبارح|امبارحه|دلوقتي|دلوقت|كده|كويس|قوي|اوي|بحس|بتعب|بتوجعني|بيوجعني|بيتقفل|بتقفل|وارم|منتفخ|حاسس|حاسه|عايز|عايزه|فايق|فايقه|ازاي|ليه|عشان|علشان|بتاع|بتاعتي|خالص|شويه|برضه|برضو|لسه|لسا|يعني|بقى|بقي|معلش|حاجه|ايوه|زوري|حلقي)(?=\s|$|[،.!?])/;

export function detectLanguage(description: string): DetectedLanguage {
  const hasArabic = ARABIC_SCRIPT.test(description);
  const hasLatin = LATIN_SCRIPT.test(description);

  if (hasArabic && hasLatin) return "mixed";
  if (hasArabic) {
    return EGYPTIAN_MARKERS.test(normalizeForMatching(description)) ? "ar-EG" : "ar";
  }
  if (hasLatin) return "en";
  return "unknown";
}
