import type { LocalizedText } from "../../../shared/contract.ts";
import { config } from "./env.ts";

export const APP_VERSION = "2.0.0";

export const AI_REQUEST_TIMEOUT_MS = config.aiRequestTimeoutMs;

export const DEMO_NOTICE: LocalizedText = {
  en: "Synthetic demo output: no AI model was used. CardioBridge is showing pattern-based sample content only, not a medical assessment.",
  ar: "مخرجات تجريبية اصطناعية: لم يُستخدم أي نموذج ذكاء اصطناعي. يعرض CardioBridge محتوى تجريبيًا مبنيًا على أنماط فقط، وليس تقييمًا طبيًا.",
};

export const LIVE_NOTICE: LocalizedText = {
  en: "AI-generated assessment. It restates your wording in clinical terms, asks follow-up questions, and suggests a possible explanation. It is not a confirmed diagnosis and does not prescribe. Review it with a qualified healthcare professional.",
  ar: "تقييم مُولَّد بالذكاء الاصطناعي. يعيد صياغة كلامك بمصطلحات سريرية ويطرح أسئلة متابعة ويقترح تفسيرًا محتملًا. وهو ليس تشخيصًا مؤكدًا ولا يصف أدوية. راجعه مع مختص رعاية صحية مؤهل.",
};

export const ECHO_LIVE_NOTICE: LocalizedText = {
  en: "AI-generated glossary. It explains echocardiography report terms in plain language and does not diagnose or prescribe. Review the report itself with a qualified healthcare professional.",
  ar: "شرح مُولَّد بالذكاء الاصطناعي. يوضّح مصطلحات تقرير تخطيط صدى القلب بلغة مبسطة ولا يشخّص ولا يصف أدوية. راجع التقرير نفسه مع مختص رعاية صحية مؤهل.",
};

export const ECHO_PHOTO_LIVE_NOTICE: LocalizedText = {
  en: "AI-generated explanation of text read from your photo on this device. The photo itself was not uploaded. Check the extracted text for accuracy; this is not a diagnosis and does not prescribe. Review the original report with a qualified healthcare professional.",
  ar: "شرح مُولَّد بالذكاء الاصطناعي للنص المقروء من صورتك على هذا الجهاز. لم تُرفع الصورة نفسها. راجع النص المستخرج للتأكد من دقته؛ هذا ليس تشخيصًا ولا يصف أدوية. راجع التقرير الأصلي مع مختص رعاية صحية مؤهل.",
};

export const ECHO_DEMO_NOTICE: LocalizedText = {
  en: "Synthetic demo glossary: no AI model was used. CardioBridge matched known echocardiography keywords and shows generic explanations only, not a medical assessment.",
  ar: "شرح تجريبي اصطناعي: لم يُستخدم أي نموذج ذكاء اصطناعي. يطابق CardioBridge كلمات مفتاحية معروفة في تقارير تخطيط صدى القلب ويعرض تفسيرات عامة فقط، وليس تقييمًا طبيًا.",
};

export const FULL_DISCLAIMER: LocalizedText = {
  en: "CardioBridge provides AI-generated health information, not a confirmed diagnosis. Its assessments are possibilities based on what you reported, they do not replace an assessment by a qualified healthcare professional, and CardioBridge never recommends medication. If you feel very unwell, seek local emergency care.",
  ar: "يقدّم CardioBridge معلومات صحية مُولَّدة بالذكاء الاصطناعي، وليست تشخيصًا مؤكدًا. التقييمات الواردة احتمالات مبنية على ما ذكرته، ولا تُغني عن تقييم مختص رعاية صحية مؤهل، ولا يوصي CardioBridge بأي أدوية. إذا كنت تشعر بتوعك شديد، فاطلب رعاية طارئة محلية.",
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

export const MISSING_ANSWERS_MESSAGE =
  "Please answer the follow-up questions before requesting the assessment.";

export const INTERNAL_ERROR_MESSAGE = "Something went wrong. Please try again.";

export const INVALID_JSON_MESSAGE = "The request body must be valid JSON.";

export const PAYLOAD_TOO_LARGE_MESSAGE = "The request body is too large.";

export const NOT_FOUND_MESSAGE = "The requested endpoint was not found.";
