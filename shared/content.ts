import type { LocalizedText } from "./contract.ts";

export const DEMO_NOTICE: LocalizedText = {
  en: "Demo mode: this is a curated synthetic sample. Your description was not analyzed by AI.",
  ar: "وضع تجريبي: هذا نموذج اصطناعي مُعدّ مسبقًا. لم يُحلَّل وصفك بواسطة الذكاء الاصطناعي.",
};

export const LIVE_NOTICE: LocalizedText = {
  en: "AI-assisted terminology mapping. It standardizes wording; it does not diagnose or prescribe.",
  ar: "ربط للمصطلحات بمساعدة الذكاء الاصطناعي. يعيد صياغة الكلام ولا يشخّص ولا يصف أدوية.",
};

export const FULL_DISCLAIMER: LocalizedText = {
  en: "Tabibna AI is a medical terminology assistant, not a diagnosis or treatment service. It does not replace a consultation with a qualified healthcare professional and never prescribes medication. If symptoms are severe, sudden, or worsening, seek urgent medical care.",
  ar: "طبيبنا AI أداة مساعدة في المصطلحات الطبية، وليست خدمة تشخيص أو علاج. لا تُغني عن استشارة مختص رعاية صحية مؤهل، ولا تصف أي أدوية. إذا كانت الأعراض شديدة أو مفاجئة أو تزداد سوءًا، اطلب رعاية طبية عاجلة.",
};
