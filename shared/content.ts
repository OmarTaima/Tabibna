import type { LocalizedText } from "./contract.ts";

export const DEMO_NOTICE: LocalizedText = {
  en: "Demo mode: this is a curated synthetic sample. Your description was not analyzed by AI.",
  ar: "وضع تجريبي: هذا نموذج اصطناعي مُعدّ مسبقًا. لم يُحلَّل وصفك بواسطة الذكاء الاصطناعي.",
};

export const LIVE_NOTICE: LocalizedText = {
  en: "AI-generated assessment. It restates your wording in clinical terms, asks follow-up questions, and suggests a possible explanation. It is not a confirmed diagnosis and does not prescribe.",
  ar: "تقييم مُولَّد بالذكاء الاصطناعي. يعيد صياغة كلامك بمصطلحات سريرية ويطرح أسئلة متابعة ويقترح تفسيرًا محتملًا. وهو ليس تشخيصًا مؤكدًا ولا يصف أدوية.",
};

export const FULL_DISCLAIMER: LocalizedText = {
  en: "CardioBridge provides AI-generated health information, not a confirmed diagnosis. Its assessments are possibilities based on what you reported, they do not replace an assessment by a qualified healthcare professional, and CardioBridge never recommends medication. If you feel very unwell, seek local emergency care.",
  ar: "يقدّم CardioBridge معلومات صحية مُولَّدة بالذكاء الاصطناعي، وليست تشخيصًا مؤكدًا. التقييمات الواردة احتمالات مبنية على ما ذكرته، ولا تُغني عن تقييم مختص رعاية صحية مؤهل، ولا يوصي CardioBridge بأي أدوية. إذا كنت تشعر بتوعك شديد، فاطلب رعاية طارئة محلية.",
};
