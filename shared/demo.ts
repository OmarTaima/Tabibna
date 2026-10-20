import type {
  AiAnalysisContent,
  DetectedLanguage,
  LocalizedText,
  MedicalAnalysis,
} from "./contract.ts";
import { DEMO_NOTICE, FULL_DISCLAIMER } from "./content.ts";

type DemoCase = {
  key: string;
  title: LocalizedText;
  description: string;
  detectedLanguage: DetectedLanguage;
  content: AiAnalysisContent;
};

function makeId(prefix: string): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return `${prefix}_${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

const HEADACHE: DemoCase = {
  key: "headache",
  title: { en: "Severe headache", ar: "صداع شديد" },
  description:
    "عندي صداع فظيع من امبارح وبيزيد مع النور، وحاسس إن دماغي بتلف، ومش قادر أركز.",
  detectedLanguage: "ar-EG",
  content: {
    detectedLanguage: "ar-EG",
    normalized: {
      en: "Severe headache since yesterday, worsening with light exposure, with a sensation of light-headedness and difficulty concentrating.",
      ar: "صداع شديد منذ يوم أمس، يزداد مع التعرض للضوء، مصحوب بشعور بالدوار وصعوبة في التركيز.",
    },
    terminology: [
      {
        english: "Headache",
        arabic: "صداع",
        kind: "symptom",
        origin: "reported",
        certainty: "stated",
        evidence: "صداع",
        explanation: {
          en: "Pain or discomfort in the head.",
          ar: "ألم أو انزعاج في منطقة الرأس.",
        },
      },
      {
        english: "Severe pain intensity",
        arabic: "شدة عالية للألم",
        kind: "symptom",
        origin: "reported",
        certainty: "stated",
        evidence: "فظيع",
        explanation: {
          en: "The person describes the pain as very intense.",
          ar: "وصف الشخص الألم بأنه شديد جدًا.",
        },
      },
      {
        english: "Acute onset",
        arabic: "بداية حادة",
        kind: "context",
        origin: "interpretation",
        certainty: "inferred",
        evidence: "من امبارح",
        explanation: {
          en: "Symptoms that began recently — here, about a day ago.",
          ar: "أعراض بدأت حديثًا — هنا منذ نحو يوم.",
        },
      },
      {
        english: "Light-triggered worsening",
        arabic: "تفاقم مع الضوء",
        kind: "context",
        origin: "reported",
        certainty: "stated",
        evidence: "بيزيد مع النور",
        explanation: {
          en: "Symptoms become worse with light exposure, based on your description.",
          ar: "تزداد الأعراض سوءًا عند التعرض للضوء، وفقًا لوصفك.",
        },
      },
      {
        english: "Dizziness",
        arabic: "دوار",
        kind: "symptom",
        origin: "reported",
        certainty: "inferred",
        evidence: "دماغي بتلف",
        explanation: {
          en: "A sensation of spinning or light-headedness.",
          ar: "إحساس بالدوران أو بخفة في الرأس.",
        },
      },
      {
        english: "Impaired concentration",
        arabic: "صعوبة في التركيز",
        kind: "symptom",
        origin: "reported",
        certainty: "stated",
        evidence: "مش قادر أركز",
        explanation: {
          en: "More difficulty than usual focusing or thinking clearly.",
          ar: "صعوبة أكبر من المعتاد في التركيز أو التفكير بوضوح.",
        },
      },
    ],
    clarifications: [
      {
        label: { en: "Headache pattern", ar: "نمط الصداع" },
        question: {
          en: "Did the headache start suddenly at its worst, or build up gradually?",
          ar: "هل بدأ الصداع فجأة وبأقصى شدة، أم تزايد تدريجيًا؟",
        },
      },
      {
        label: { en: "Pain characteristics", ar: "خصائص الألم" },
        question: {
          en: "Is the pain throbbing, pressing, or sharp, and where is it located?",
          ar: "هل الألم نابض أم ضاغط أم حاد، وأين موضعه؟",
        },
      },
      {
        label: { en: "Associated symptoms", ar: "أعراض مصاحبة" },
        question: {
          en: "Have you had nausea, vomiting, fever, neck stiffness, or changes in vision?",
          ar: "هل صاحب ذلك غثيان أو قيء أو حرارة أو تيبس في الرقبة أو تغيّر في الرؤية؟",
        },
      },
    ],
    clinicalInterpretations: [
      {
        label: { en: "Acute headache presentation", ar: "صداع حاد الظهور" },
        detail: {
          en: "The description suggests a recent-onset headache with light-triggered worsening and difficulty concentrating. This is a symptom pattern, not a diagnosis.",
          ar: "يشير الوصف إلى صداع حديث الظهور يتفاقم مع الضوء ويصحبه صعوبة في التركيز. هذا نمط للأعراض وليس تشخيصًا.",
        },
        basis: {
          en: "Based only on the reported timing, light sensitivity, and concentration difficulty.",
          ar: "بناءً على التوقيت المذكور والتفاقم مع الضوء وصعوبة التركيز فقط.",
        },
        confidence: "moderate",
      },
    ],
  },
};

const ABDOMINAL: DemoCase = {
  key: "abdominal",
  title: { en: "Abdominal pain", ar: "ألم في البطن" },
  description:
    "بطني بتوجعني من يومين، الوجع تحت الصرة وبييجي ويروح، وعندي إسهال خفيف وغازات.",
  detectedLanguage: "ar-EG",
  content: {
    detectedLanguage: "ar-EG",
    normalized: {
      en: "Abdominal pain since two days ago, located below the navel, intermittent, accompanied by mild diarrhea and bloating.",
      ar: "ألم في البطن منذ يومين، أسفل السرة، متقطع، مصحوب بإسهال خفيف وانتفاخ.",
    },
    terminology: [
      {
        english: "Abdominal pain",
        arabic: "ألم البطن",
        kind: "symptom",
        origin: "reported",
        certainty: "stated",
        evidence: "بطني بتوجعني",
        explanation: {
          en: "Pain or discomfort in the abdomen.",
          ar: "ألم أو انزعاج في منطقة البطن.",
        },
      },
      {
        english: "Intermittent pain",
        arabic: "ألم متقطع",
        kind: "symptom",
        origin: "reported",
        certainty: "stated",
        evidence: "بييجي ويروح",
        explanation: {
          en: "Pain that comes and goes rather than staying constant.",
          ar: "ألم يأتي ويذهب بدلًا من أن يكون مستمرًا.",
        },
      },
      {
        english: "Infraumbilical location",
        arabic: "موضع أسفل السرة",
        kind: "context",
        origin: "reported",
        certainty: "stated",
        evidence: "تحت الصرة",
        explanation: {
          en: "The area below the navel.",
          ar: "المنطقة الواقعة أسفل السرة.",
        },
      },
      {
        english: "Mild diarrhea",
        arabic: "إسهال خفيف",
        kind: "symptom",
        origin: "reported",
        certainty: "stated",
        evidence: "إسهال خفيف",
        explanation: {
          en: "Looser or more frequent stools than usual, described here as mild.",
          ar: "براز ألين أو أكثر تكرارًا من المعتاد، وُصف هنا بأنه خفيف.",
        },
      },
      {
        english: "Bloating",
        arabic: "انتفاخ أو غازات",
        kind: "symptom",
        origin: "reported",
        certainty: "stated",
        evidence: "غازات",
        explanation: {
          en: "A feeling of fullness or gas in the abdomen.",
          ar: "إحساس بالامتلاء أو الغازات في البطن.",
        },
      },
    ],
    clarifications: [
      {
        label: { en: "Pain relationship", ar: "علاقة الألم بالطعام" },
        question: {
          en: "Is the pain related to meals, bowel movements, or a particular position?",
          ar: "هل يرتبط الألم بالطعام أو التبرز أو وضعية معينة؟",
        },
      },
      {
        label: { en: "Bowel details", ar: "تفاصيل الإسهال" },
        question: {
          en: "How many times a day are you having diarrhea, and is there any blood or mucus?",
          ar: "كم مرة يحدث الإسهال يوميًا، وهل يوجد دم أو مخاط؟",
        },
      },
      {
        label: { en: "Warning symptoms", ar: "أعراض تحذيرية" },
        question: {
          en: "Do you also have fever, persistent vomiting, severe pain, or blood in the stool? Could you be pregnant?",
          ar: "هل لديك حرارة أو ترجيع مستمر أو ألم شديد أو دم في البراز؟ وهل هناك احتمال أنك حامل؟",
        },
      },
    ],
    clinicalInterpretations: [
      {
        label: { en: "Intermittent abdominal discomfort", ar: "انزعاج بطني متقطع" },
        detail: {
          en: "The description centres on intermittent lower abdominal discomfort with mild bowel changes. No cause can be inferred from these words alone.",
          ar: "يتمحور الوصف حول انزعاج بطني متقطع في الجزء السفلي مع تغيّرات بسيطة في الأمعاء. لا يمكن استنتاج سبب من هذه الكلمات وحدها.",
        },
        basis: {
          en: "Based only on the reported location, intermittent pattern, diarrhea, and bloating.",
          ar: "بناءً على الموضع المذكور والنمط المتقطع والإسهال والانتفاخ فقط.",
        },
        confidence: "low",
      },
    ],
  },
};

const CHEST: DemoCase = {
  key: "chest",
  title: { en: "Chest tightness", ar: "ضيق في الصدر" },
  description:
    "I've had chest tightness since this morning, and I feel short of breath and a bit dizzy.",
  detectedLanguage: "en",
  content: {
    detectedLanguage: "en",
    normalized: {
      en: "Chest tightness since this morning, accompanied by shortness of breath and mild dizziness.",
      ar: "تقل أو ضيق في الصدر منذ صباح اليوم، مصحوب بضيق في النفس ودوار خفيف.",
    },
    terminology: [
      {
        english: "Chest tightness",
        arabic: "تقل أو ضيق في الصدر",
        kind: "symptom",
        origin: "reported",
        certainty: "stated",
        evidence: "chest tightness",
        explanation: {
          en: "A feeling of pressure, squeezing, or constriction in the chest.",
          ar: "إحساس بضغط أو عصر أو انقباض في الصدر.",
        },
      },
      {
        english: "Shortness of breath",
        arabic: "ضيق في النفس",
        kind: "symptom",
        origin: "reported",
        certainty: "stated",
        evidence: "short of breath",
        explanation: {
          en: "An uncomfortable awareness of breathing that feels harder than usual.",
          ar: "إحساس مزعج بأن التنفس أصعب من المعتاد.",
        },
      },
      {
        english: "Dizziness",
        arabic: "دوار",
        kind: "symptom",
        origin: "reported",
        certainty: "stated",
        evidence: "a bit dizzy",
        explanation: {
          en: "A sensation of light-headedness or unsteadiness.",
          ar: "إحساس بخفة الرأس أو بعدم الثبات.",
        },
      },
      {
        english: "Acute onset",
        arabic: "بداية حادة",
        kind: "context",
        origin: "interpretation",
        certainty: "inferred",
        evidence: "since this morning",
        explanation: {
          en: "Symptoms that began recently, within the last day.",
          ar: "أعراض بدأت حديثًا، خلال اليوم الماضي.",
        },
      },
    ],
    clarifications: [
      {
        label: { en: "Chest discomfort details", ar: "تفاصيل انزعاج الصدر" },
        question: {
          en: "Does the tightness spread to your arm, jaw, or back, and is it constant or intermittent?",
          ar: "هل يمتد الضغط إلى الذراع أو الفك أو الظهر، وهل هو مستمر أم متقطع؟",
        },
      },
      {
        label: { en: "Associated symptoms", ar: "أعراض مصاحبة" },
        question: {
          en: "Are you sweating, nauseated, or feeling faint? Have you noticed palpitations?",
          ar: "هل تعاني من التعرق أو الغثيان أو الإحساس بالإغماء؟ وهل لاحظت خفقانًا في القلب؟",
        },
      },
      {
        label: { en: "Relevant history", ar: "تاريخ صحي ذو صلة" },
        question: {
          en: "Do you have a history of heart or lung disease, or a recent illness or long trip?",
          ar: "هل لديك تاريخ مرضي متعلق بالقلب أو الرئة، أو مرض حديث أو سفر طويل؟",
        },
      },
    ],
    clinicalInterpretations: [
      {
        label: { en: "Cardiopulmonary symptom pattern", ar: "نمط أعراض قلبي رئوي" },
        detail: {
          en: "Chest tightness reported together with breathlessness and dizziness forms a cardiopulmonary symptom pattern. The description does not establish a cause.",
          ar: "الانزعاج في الصدر مع ضيق النفس والدوار يشكّل نمط أعراض قلبي رئوي. والوصف لا يحدد سببًا.",
        },
        basis: {
          en: "Based only on the reported chest tightness, shortness of breath, dizziness, and this-morning onset.",
          ar: "بناءً على ضيق الصدر وضيق النفس والدوار والبداية هذا الصباح كما وردت فقط.",
        },
        confidence: "moderate",
      },
    ],
  },
};

const THROAT: DemoCase = {
  key: "throat",
  title: { en: "Sore throat", ar: "ألم في الحلق" },
  description:
    "My throat has been sore since yesterday and it hurts when I swallow. I also feel a bit feverish.",
  detectedLanguage: "en",
  content: {
    detectedLanguage: "en",
    normalized: {
      en: "Sore throat since yesterday, painful swallowing, and a subjective feeling of fever.",
      ar: "ألم في الحلق منذ يوم أمس، مع ألم عند البلع وشعور بالحرارة.",
    },
    terminology: [
      {
        english: "Sore throat",
        arabic: "ألم في الحلق",
        kind: "symptom",
        origin: "reported",
        certainty: "stated",
        evidence: "throat has been sore",
        explanation: {
          en: "Pain or irritation in the throat.",
          ar: "ألم أو تهيّج في الحلق.",
        },
      },
      {
        english: "Odynophagia",
        arabic: "ألم عند البلع",
        kind: "symptom",
        origin: "reported",
        certainty: "stated",
        evidence: "hurts when I swallow",
        explanation: {
          en: "Pain caused by swallowing.",
          ar: "ألم يحدث عند البلع.",
        },
      },
      {
        english: "Subjective fever",
        arabic: "إحساس بالحرارة",
        kind: "symptom",
        origin: "reported",
        certainty: "stated",
        evidence: "feel a bit feverish",
        explanation: {
          en: "A feeling of being feverish without a measured temperature being provided.",
          ar: "إحساس بأن الجسم ساخن دون ذكر قياس فعلي للحرارة.",
        },
      },
      {
        english: "Acute onset",
        arabic: "بداية حادة",
        kind: "context",
        origin: "interpretation",
        certainty: "inferred",
        evidence: "since yesterday",
        explanation: {
          en: "Symptoms that began recently, about a day ago.",
          ar: "أعراض بدأت حديثًا، منذ نحو يوم.",
        },
      },
    ],
    clarifications: [
      {
        label: { en: "Measured temperature", ar: "قياس الحرارة" },
        question: {
          en: "Have you measured your temperature? If so, what was the reading?",
          ar: "هل قست حرارتك؟ وإذا قستها، فما القراءة؟",
        },
      },
      {
        label: { en: "Associated symptoms", ar: "أعراض مصاحبة" },
        question: {
          en: "Do you have a cough, runny nose, ear pain, or swollen neck glands?",
          ar: "هل لديك كحة أو رشح أو ألم في الأذن أو تورم في الغدد بالرقبة؟",
        },
      },
      {
        label: { en: "Swallowing and fluids", ar: "البلع والسوائل" },
        question: {
          en: "Are you able to swallow fluids, and is there any drooling or difficulty opening your mouth?",
          ar: "هل تستطيع بلع السوائل؟ وهل هناك سيلان لعاب أو صعوبة في فتح الفم؟",
        },
      },
    ],
    clinicalInterpretations: [],
  },
};

const CASES: DemoCase[] = [HEADACHE, ABDOMINAL, CHEST, THROAT];

export const DEMO_EXAMPLES = [
  {
    key: "headache",
    label: { en: "Headache · Egyptian Arabic", ar: "صداع · مصري" },
    description: HEADACHE.description,
  },
  {
    key: "abdominal",
    label: { en: "Stomach pain · Egyptian Arabic", ar: "ألم بطن · مصري" },
    description: ABDOMINAL.description,
  },
  {
    key: "chest",
    label: { en: "Chest tightness · English", ar: "ضيق صدر · إنجليزي" },
    description: CHEST.description,
  },
] as const;

function selectDemoCase(description: string): DemoCase {
  const normalized = description.trim();
  const exact = CASES.find((item) => item.description === normalized);
  if (exact) return exact;

  if (/chest|breath|صدر|نفس|كتمة|كتمه|قلب/i.test(normalized)) return CHEST;
  if (/headache|migraine|صداع|دماغ/i.test(normalized)) return HEADACHE;
  if (/abdom|stomach|belly|diarrh|بطن|معدة|معد|إسهال|اسهال|مغص/i.test(normalized)) {
    return ABDOMINAL;
  }
  if (/throat|swallow|sore|زور|حلق|بلع/i.test(normalized)) return THROAT;

  return /[\u0600-\u06FF]/.test(normalized) ? HEADACHE : THROAT;
}

export function buildDemoAnalysis(description: string): MedicalAnalysis {
  const demo = selectDemoCase(description);

  return {
    id: makeId("demo"),
    meta: {
      mode: "mock",
      model: null,
      generatedAt: new Date().toISOString(),
      notice: DEMO_NOTICE,
    },
    original: demo.description,
    detectedLanguage: demo.detectedLanguage,
    normalized: demo.content.normalized,
    terminology: demo.content.terminology.map((term, index) => ({
      ...term,
      id: `${demo.key}-term-${index + 1}`,
    })),
    clarifications: demo.content.clarifications.map((item, index) => ({
      ...item,
      id: `${demo.key}-clarification-${index + 1}`,
    })),
    clinicalInterpretations: demo.content.clinicalInterpretations.map((item, index) => ({
      ...item,
      id: `${demo.key}-interpretation-${index + 1}`,
    })),
    disclaimer: FULL_DISCLAIMER,
  };
}

export function getDemoCaseLabel(description: string): LocalizedText {
  return selectDemoCase(description).title;
}
