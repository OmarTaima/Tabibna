import type { LocalizedText } from "../../../shared/contract";
import { config } from "./env";

export const APP_VERSION = "1.0.0";

export const AI_REQUEST_TIMEOUT_MS = config.aiRequestTimeoutMs;

export const DEMO_NOTICE: LocalizedText = {
  en: "Synthetic demo output: no AI model was used. This is a terminology demonstration only and is not for medical decisions.",
  ar: "مخرجات تجريبية اصطناعية: لم يُستخدم أي نموذج ذكاء اصطناعي. هذا عرض توضيحي للمصطلحات فقط وليس لاتخاذ قرارات طبية.",
};

export const LIVE_NOTICE: LocalizedText = {
  en: "AI-generated analysis. It standardizes the wording you provided and does not diagnose or prescribe. Review it with a qualified healthcare professional.",
  ar: "تحليل مُولَّد بالذكاء الاصطناعي. يعيد صياغة ما كتبته بمصطلحات معيارية ولا يشخّص ولا يصف أدوية. راجعه مع مختص رعاية صحية مؤهل.",
};

export const FULL_DISCLAIMER: LocalizedText = {
  en: "Tabibna AI is a medical terminology assistant, not a diagnosis or treatment service. It does not replace an assessment by a qualified healthcare professional and never recommends medication. If you are very unwell, seek local emergency care.",
  ar: "طبيبنا AI أداة مساعدة في المصطلحات الطبية، وليست خدمة تشخيص أو علاج. لا تُغني عن تقييم مختص رعاية صحية مؤهل، ولا توصي بأي أدوية. إذا كنت تشعر بتوعك شديد، فاطلب رعاية طارئة محلية.",
};

export const AI_ERROR_MESSAGE =
  "We couldn't finish the AI analysis just now. Please try again in a moment, and seek local emergency care if you feel very unwell.";

export const AI_INVALID_OUTPUT_MESSAGE =
  "The AI service returned an answer we couldn't verify. Please try again in a moment, and seek local emergency care if you feel very unwell.";

export const AI_UPSTREAM_RATE_LIMIT_MESSAGE =
  "The AI service is busy right now and is limiting requests. Please wait a minute and try again, and seek local emergency care if you feel very unwell.";

export const AI_DAILY_QUOTA_MESSAGE =
  "The free AI service has reached its daily request limit, so new analyses are paused until the daily reset. Please try again later, and seek local emergency care if you feel very unwell.";

export const AI_TIMEOUT_MESSAGE =
  "The analysis took longer than the service can wait for. Please try again in a moment, and seek local emergency care if you feel very unwell.";

export const RATE_LIMITED_ANALYZE_MESSAGE =
  "Too many analysis requests. Please wait a few minutes and try again.";

export const INTERNAL_ERROR_MESSAGE = "Something went wrong. Please try again.";

export const INVALID_JSON_MESSAGE = "The request body must be valid JSON.";

export const PAYLOAD_TOO_LARGE_MESSAGE = "The request body is too large.";

export const NOT_FOUND_MESSAGE = "The requested endpoint was not found.";
