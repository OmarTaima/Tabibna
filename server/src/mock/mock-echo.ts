import type { AiEchoContent, AiEchoTerm, LocalizedText } from "../../../shared/contract.ts";
import { normalizeForMatching } from "../text/normalize.ts";

type MockEchoEntry = {
  match: RegExp;
  term: LocalizedText;
  explanation: LocalizedText;
};

const MOCK_ECHO_TERMS: readonly MockEchoEntry[] = [
  {
    match: /aortic valve area(?: index)?|\bava\b/,
    term: { en: "Aortic valve area", ar: "مساحة الصمام الأبهري" },
    explanation: {
      en: "An estimate of how wide the aortic valve opening is, usually given in square centimetres. A smaller opening lets less blood through with each beat, and clinicians compare the number with reference ranges.",
      ar: "تقدير لمدى اتساع فتحة الصمام الأبهري، ويُذكر عادةً بالسنتيمتر المربع. كلما صغرت الفتحة مرّ دم أقل مع كل نبضة، ويقارن الطبيب الرقم بالمدى المرجعي.",
    },
  },
  {
    match: /peak velocity|max(?:imum)? velocity|peak aortic velocity|\bvmax\b/,
    term: { en: "Peak velocity", ar: "السرعة القصوى" },
    explanation: {
      en: "The highest blood speed measured across a valve or vessel, written as Vmax and usually reported in metres per second. It describes how fast blood moves at that point rather than how severe anything is.",
      ar: "أعلى سرعة لتدفق الدم عبر صمام أو وعاء دموي، وتُكتب Vmax وتُذكر عادةً بالمتر في الثانية. تصف سرعة الدم عند هذه النقطة وليست حكمًا على شدة أي حالة.",
    },
  },
  {
    match: /mean (?:pressure )?gradient|mean pg|\bmpg\b/,
    term: { en: "Mean pressure gradient", ar: "متوسط فرق الضغط" },
    explanation: {
      en: "The average pressure difference across a valve during the measured part of the heartbeat, usually in millimetres of mercury (mmHg). It estimates how much resistance the valve adds to blood flow.",
      ar: "متوسط فرق الضغط عبر الصمام خلال الجزء المقاس من دورة القلب، ويُقاس عادةً بالمليمتر زئبق (mmHg). يقدّر مقدار المقاومة التي يضيفها الصمام لتدفق الدم.",
    },
  },
  {
    match: /left ventricular hypertrophy|ventricular hypertrophy|\blvh\b/,
    term: { en: "Left ventricular hypertrophy (LVH)", ar: "تضخم البطين الأيسر (LVH)" },
    explanation: {
      en: "A thickening of the muscle wall of the left ventricle, the chamber that pumps blood to the body. Reports usually describe it from wall-thickness measurements.",
      ar: "زيادة في سُمك عضلة البطين الأيسر، وهو الحجرة التي تضخ الدم إلى الجسم. يصفه التقرير عادةً اعتمادًا على قياسات سُمك الجدار.",
    },
  },
  {
    match: /ejection fraction|\blvef\b|\bef\b/,
    term: { en: "Ejection fraction (EF)", ar: "الكسر القذفي (EF)" },
    explanation: {
      en: "The percentage of the blood in the left ventricle that is pumped out with each beat. It is a pump-function measurement that clinicians read together with the rest of the report.",
      ar: "نسبة الدم في البطين الأيسر التي تُضخّ مع كل نبضة، وتُذكر كنسبة مئوية. وهو قياس لوظيفة المضخة يقرأه الطبيب مع بقية التقرير.",
    },
  },
  {
    match: /regurgitation|regurgitant|insufficiency|\bmr\b|\bar\b|\btr\b|\bpr\b/,
    term: { en: "Regurgitation", ar: "القلس (ارتجاع الدم)" },
    explanation: {
      en: "Blood flowing backwards through a valve that does not close completely. Reports usually name the valve and add a grade such as mild, moderate, or severe.",
      ar: "رجوع الدم في الاتجاه المعاكس عبر صمام لا يُغلق تمامًا. يذكر التقرير عادةً اسم الصمام ويضيف درجة مثل بسيط أو متوسط أو شديد.",
    },
  },
  {
    match: /stenosis|stenotic/,
    term: { en: "Stenosis", ar: "التضيّق" },
    explanation: {
      en: "A narrowing of a valve opening that can restrict blood flow. The report usually names the valve and describes the narrowing with measurements such as area, velocity, or gradient.",
      ar: "تضيّق في فتحة صمام قد يحدّ من تدفق الدم. يذكر التقرير عادةً اسم الصمام ويصف التضيّق بقياسات مثل المساحة أو السرعة أو فرق الضغط.",
    },
  },
  {
    match: /mitral valve|mitral|\bmv\b/,
    term: { en: "Mitral valve", ar: "الصمام التاجي (المترالي)" },
    explanation: {
      en: "The valve between the left atrium and the left ventricle. It opens so the ventricle can fill with blood and closes to stop blood flowing back.",
      ar: "الصمام الواقع بين الأذين الأيسر والبطين الأيسر. ينفتح ليمتلئ البطين بالدم ويُغلق لمنع رجوع الدم.",
    },
  },
  {
    match: /left atrium|left atrial|\bla\b/,
    term: { en: "Left atrium", ar: "الأذين الأيسر" },
    explanation: {
      en: "The upper left chamber of the heart, which receives oxygen-rich blood from the lungs and passes it to the left ventricle. Reports often give its diameter or volume.",
      ar: "الحجرة العلوية اليسرى في القلب، تستقبل الدم المؤكسج من الرئتين وتمرره إلى البطين الأيسر. يذكر التقرير عادةً قطره أو حجمه.",
    },
  },
  {
    match: /aorta|aortic root|ascending aorta|aortic arch|aortic diameter/,
    term: { en: "Aorta", ar: "الأبهر (الشريان الأورطي)" },
    explanation: {
      en: "The main artery that carries blood from the left ventricle to the body. The report may give the diameter of its root or ascending part in millimetres or centimetres.",
      ar: "الشريان الرئيسي الذي ينقل الدم من البطين الأيسر إلى الجسم. قد يذكر التقرير قطر جذره أو الجزء الصاعد منه بالمليمتر أو السنتيمتر.",
    },
  },
];

const FALLBACK_SUMMARY: LocalizedText = {
  en: "This demo could not match any known echocardiography term in the pasted text. The live version explains report terms and measurements in plain language.",
  ar: "لم يتمكن هذا العرض التجريبي من مطابقة أي مصطلح معروف من مصطلحات تخطيط صدى القلب في النص الملصق. تشرح النسخة المباشرة مصطلحات التقرير والقياسات بلغة مبسطة.",
};

const FALLBACK_TERM: AiEchoTerm = {
  term: { en: "Echocardiography report", ar: "تقرير تخطيط صدى القلب" },
  explanation: {
    en: "An echocardiography report records ultrasound measurements of the heart's chambers, valves, and blood flow. Demo mode shows generic explanations only and does not interpret your specific values.",
    ar: "يسجّل تقرير تخطيط صدى القلب قياسات بالموجات فوق الصوتية لحجرات القلب وصماماته وتدفق الدم. يعرض الوضع التجريبي تفسيرات عامة فقط ولا يفسّر قيمك الخاصة.",
  },
};

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

function selectTerms(text: string): AiEchoTerm[] {
  const matchableText = normalizeForMatching(text);

  return MOCK_ECHO_TERMS.flatMap((entry) => {
    const match = entry.match.exec(matchableText);
    if (match === null) return [];
    return [{ index: match.index, term: entry.term, explanation: entry.explanation }];
  })
    .sort((first, second) => first.index - second.index)
    .slice(0, 15)
    .map((item) => ({ term: item.term, explanation: item.explanation }));
}

export function buildMockEcho(text: string): AiEchoContent {
  const terms = selectTerms(text);

  if (terms.length === 0) {
    return { summary: FALLBACK_SUMMARY, terms: [FALLBACK_TERM] };
  }

  const english = terms.map((item) => item.term.en);
  const arabic = terms.map((item) => item.term.ar);

  return {
    summary: {
      en: `Synthetic demo output: no AI model was used. The report mentions ${joinEnglish(english)}; the explanations below describe what each item means in general, not what your own values mean for you.`,
      ar: `مخرجات تجريبية اصطناعية: لم يُستخدم أي نموذج ذكاء اصطناعي. يذكر التقرير ${joinArabic(arabic)}؛ والتفسيرات أدناه توضّح معنى كل عنصر بشكل عام، وليس معنى قيمك أنت.`,
    },
    terms,
  };
}
