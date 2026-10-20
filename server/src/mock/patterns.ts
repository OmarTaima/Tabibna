import type { AiTerminologyItem, LocalizedText } from "../../../shared/contract.ts";

export type MockTerm = {
  english: string;
  arabic: string;
  kind: AiTerminologyItem["kind"];
  explanation: LocalizedText;
};

export type MockVariant = {
  match: RegExp;
  term: MockTerm;
  normalized: LocalizedText;
};

export type MockClarification = {
  label: LocalizedText;
  question: LocalizedText;
};

export type MockSymptom = {
  key: string;
  match: RegExp;
  term: MockTerm;
  normalized: LocalizedText;
  variants?: MockVariant[];
  clarifications: MockClarification[];
};

export const MOCK_SYMPTOMS: readonly MockSymptom[] = [
  {
    key: "headache",
    match: /(?:صداع|صداعه|وجع في الراس|الم في الراس|راسي بتوجعني|headache|head pain|migraine)/,
    term: {
      english: "Headache",
      arabic: "صداع",
      kind: "symptom",
      explanation: {
        en: "Pain or discomfort in the head.",
        ar: "ألم أو انزعاج في منطقة الرأس.",
      },
    },
    normalized: { en: "headache", ar: "صداع" },
    clarifications: [
      {
        label: { en: "Onset and pattern", ar: "بداية الصداع ونمطه" },
        question: {
          en: "Did the headache start suddenly at its worst, or build up gradually?",
          ar: "هل بدأ الصداع فجأة بأقصى شدة، أم تزايد تدريجيًا؟",
        },
      },
      {
        label: { en: "Associated symptoms", ar: "أعراض مصاحبة" },
        question: {
          en: "Is it accompanied by nausea, light sensitivity, fever, or neck stiffness?",
          ar: "هل يصحبه غثيان أو حساسية للضوء أو حرارة أو تيبس في الرقبة؟",
        },
      },
    ],
  },
  {
    key: "dizziness",
    match:
      /(?:دوخه|دوار|دايخ|دايخه|light-?headed|lightheaded|dizzy|dizziness|vertigo)/,
    term: {
      english: "Dizziness",
      arabic: "دوار",
      kind: "symptom",
      explanation: {
        en: "A sensation of light-headedness, unsteadiness, or spinning.",
        ar: "إحساس بخفة الرأس أو عدم الثبات أو الدوران.",
      },
    },
    normalized: { en: "dizziness", ar: "دوار" },
    variants: [
      {
        match:
          /(?:دوخه|دوار|dizzy|lightheaded|light-headed)[^.!?\n،؛]{0,30}(?:لما اقف|عند الوقوف|وقت الوقوف|when i stand|when standing|standing up|on standing)|(?:لما اقف|when i stand|when standing|standing up)[^.!?\n،؛]{0,30}(?:دوخه|دوار|dizzy|lightheaded|light-headed)/,
        term: {
          english: "Dizziness on standing",
          arabic: "دوار عند الوقوف",
          kind: "symptom",
          explanation: {
            en: "Light-headedness or dizziness that occurs when standing up, as described.",
            ar: "إحساس بخفة الرأس أو دوار يحدث عند الوقوف، وفقًا للوصف.",
          },
        },
        normalized: { en: "dizziness on standing", ar: "دوار عند الوقوف" },
      },
    ],
    clarifications: [
      {
        label: { en: "Type of sensation", ar: "نوع الإحساس" },
        question: {
          en: "Is it a spinning sensation, or more like light-headedness or unsteadiness?",
          ar: "هل هو إحساس بالدوران، أم أقرب إلى خفة الرأس أو عدم الثبات؟",
        },
      },
      {
        label: { en: "Triggers and associated symptoms", ar: "المحفزات والأعراض المصاحبة" },
        question: {
          en: "Does it happen with standing, head movement, hearing changes, or vision changes?",
          ar: "هل يحدث عند الوقوف أو تحريك الرأس أو مع تغيّر في السمع أو الرؤية؟",
        },
      },
    ],
  },
  {
    key: "fever",
    match:
      /(?:حراره|حمي|سخونه|جسمي ساخن|fever|feverish|حرارتي\s*(?:39|40)|(?:temperature|temp)\s*(?:is|of|at)?\s*(?:3[89]|40))/,
    term: {
      english: "Fever",
      arabic: "حرارة",
      kind: "symptom",
      explanation: {
        en: "A body temperature that is higher than usual.",
        ar: "ارتفاع في درجة حرارة الجسم عن المعتاد.",
      },
    },
    normalized: { en: "fever", ar: "حرارة" },
    variants: [
      {
        match:
          /(?:حراره|سخونه|حمي|fever)[^.!?\n،؛]{0,20}(?:عاليه|شديده|مرتفعه|high|39|40)|(?:high|39|40)[^.!?\n،؛]{0,15}(?:fever|حراره|سخونه)|(?:temperature|temp)\s*(?:is|of|at)?\s*(?:39|40)/,
        term: {
          english: "High fever",
          arabic: "حرارة مرتفعة",
          kind: "symptom",
          explanation: {
            en: "A high body temperature as described; no exact measurement was provided.",
            ar: "ارتفاع شديد في درجة حرارة الجسم وفقًا للوصف؛ لم تُذكر قراءة دقيقة.",
          },
        },
        normalized: { en: "high fever", ar: "حرارة مرتفعة" },
      },
      {
        match:
          /(?:حراره|سخونه|حمي|fever)[^.!?\n،؛]{0,20}(?:بسيطه|خفيفه|mild|slight|low[- ]grade)|(?:mild|slight|low[- ]grade)[^.!?\n،؛]{0,15}(?:fever|حراره|سخونه)/,
        term: {
          english: "Low-grade fever",
          arabic: "حرارة خفيفة",
          kind: "symptom",
          explanation: {
            en: "A mildly raised body temperature as described; no exact measurement was provided.",
            ar: "ارتفاع بسيط في درجة حرارة الجسم وفقًا للوصف؛ لم تُذكر قراءة دقيقة.",
          },
        },
        normalized: { en: "mild fever", ar: "حرارة خفيفة" },
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
        label: { en: "Duration and associated symptoms", ar: "المدة والأعراض المصاحبة" },
        question: {
          en: "How long have you had the fever, and do you also have a cough, rash, or severe headache?",
          ar: "منذ متى لديك الحرارة، وهل لديك أيضًا كحة أو طفح جلدي أو صداع شديد؟",
        },
      },
    ],
  },
  {
    key: "fatigue",
    match:
      /(?:تعب|تعبان|تعبانه|ارهاق|خمول|مجهد|مجهود|مش قادر اتحرك من التعب|low energy|fatigue|fatigued|tired|exhausted|exhaustion)/,
    term: {
      english: "General fatigue",
      arabic: "تعب عام",
      kind: "symptom",
      explanation: {
        en: "A general feeling of low energy or tiredness.",
        ar: "شعور عام بانخفاض الطاقة أو الإجهاد.",
      },
    },
    normalized: { en: "general fatigue", ar: "تعب عام" },
    clarifications: [
      {
        label: { en: "Duration and impact", ar: "المدة والتأثير" },
        question: {
          en: "When did the tiredness start, and is it affecting your daily activities?",
          ar: "متى بدأ الإجهاد، وهل يؤثر على أنشطتك اليومية؟",
        },
      },
      {
        label: { en: "Related factors", ar: "عوامل مرتبطة" },
        question: {
          en: "Have you noticed changes in sleep, appetite, or recent illness?",
          ar: "هل لاحظت تغيّرات في النوم أو الشهية أو مرضًا حديثًا؟",
        },
      },
    ],
  },
  {
    key: "sore-throat",
    match:
      /(?:الم|وجع|التهاب|حرقان)\s*(?:في\s*)?(?:الحلق|زوري|حلقي|الزور)|(?:زوري|حلقي)\s*(?:بيوجعني|تعبان|ملتهب|بيحرق)|(?:الم|وجع|صعوبه)\s*(?:عند|في|مع)?\s*(?:البلع|بلع)|sore throat|throat pain|throat is sore|my throat is sore|painful swallowing|odynophagia|hurts when i swallow/,
    term: {
      english: "Sore throat",
      arabic: "ألم في الحلق",
      kind: "symptom",
      explanation: {
        en: "Pain or irritation in the throat.",
        ar: "ألم أو تهيّج في الحلق.",
      },
    },
    normalized: { en: "sore throat", ar: "ألم في الحلق" },
    clarifications: [
      {
        label: { en: "Associated symptoms", ar: "أعراض مصاحبة" },
        question: {
          en: "Do you have fever, cough, runny nose, or swollen neck glands?",
          ar: "هل لديك حرارة أو كحة أو رشح أو تورم في الغدد بالرقبة؟",
        },
      },
      {
        label: { en: "Swallowing", ar: "البلع" },
        question: {
          en: "Can you swallow fluids, and is there any drooling or difficulty opening your mouth?",
          ar: "هل تستطيع بلع السوائل؟ وهل هناك سيلان لعاب أو صعوبة في فتح الفم؟",
        },
      },
    ],
  },
  {
    key: "cough",
    match: /(?:كحه|سعال|بكح|cough)/,
    term: {
      english: "Cough",
      arabic: "كحة",
      kind: "symptom",
      explanation: {
        en: "A repeated reflex that clears the airways, often felt as throat or chest irritation.",
        ar: "منعكس متكرر ينظف مجرى التنفس، وغالبًا يُحس كتهيّج في الحلق أو الصدر.",
      },
    },
    normalized: { en: "cough", ar: "كحة" },
    clarifications: [
      {
        label: { en: "Cough type", ar: "نوع الكحة" },
        question: {
          en: "Is the cough dry, or does it bring up mucus?",
          ar: "هل الكحة جافة، أم يصحبها بلغم؟",
        },
      },
      {
        label: { en: "Duration and warning signs", ar: "المدة وعلامات الإنذار" },
        question: {
          en: "How long have you had it, and is it accompanied by breathlessness, chest pain, or blood?",
          ar: "منذ متى لديك الكحة، وهل يصحبها ضيق في النفس أو ألم في الصدر أو دم؟",
        },
      },
    ],
  },
  {
    key: "shortness-of-breath",
    match:
      /(?:ضيق في النفس|ضيق في التنفس|ضيق النفس|صعوبه في التنفس|مش قادر اتنفس|نفسي مقطوع|shortness of breath|short of breath|difficulty breathing|can'?t breathe|breathless)/,
    term: {
      english: "Shortness of breath",
      arabic: "ضيق في النفس",
      kind: "symptom",
      explanation: {
        en: "A feeling that breathing is harder or less comfortable than usual.",
        ar: "إحساس بأن التنفس أصعب أو أقل راحة من المعتاد.",
      },
    },
    normalized: { en: "shortness of breath", ar: "ضيق في النفس" },
    clarifications: [
      {
        label: { en: "Context", ar: "السياق" },
        question: {
          en: "Does the breathlessness happen at rest, with exertion, or when lying flat?",
          ar: "هل يحدث ضيق النفس في الراحة أو مع المجهود أو عند الاستلقاء؟",
        },
      },
      {
        label: { en: "Associated symptoms", ar: "أعراض مصاحبة" },
        question: {
          en: "Is it accompanied by chest pain, cough, fever, or swelling in the legs?",
          ar: "هل يصحبه ألم في الصدر أو كحة أو حرارة أو تورم في الساقين؟",
        },
      },
    ],
  },
  {
    key: "chest-discomfort",
    match:
      /(?:الم|وجع|تقل|ضيق|كتمه|ضغط)\s*(?:شديده?|قوي|قويه)?\s*(?:في|علي|ب)?\s*(?:الصدر|صدري|القلب|قلبي)|صدري بيوجعني|chest pain|chest tightness|chest pressure|chest discomfort|pain in my chest|pressure in my chest|tightness in my chest|discomfort in my chest|my chest hurts|chest hurts/,
    term: {
      english: "Chest pain or discomfort",
      arabic: "ألم أو انزعاج في الصدر",
      kind: "symptom",
      explanation: {
        en: "Pain, pressure, tightness, or discomfort in the chest area.",
        ar: "ألم أو ضغط أو ضيق أو انزعاج في منطقة الصدر.",
      },
    },
    normalized: { en: "chest pain or discomfort", ar: "ألم أو انزعاج في الصدر" },
    clarifications: [
      {
        label: { en: "Radiation", ar: "امتداد الألم" },
        question: {
          en: "Does the discomfort spread to your arm, jaw, neck, or back?",
          ar: "هل يمتد الانزعاج إلى الذراع أو الفك أو الرقبة أو الظهر؟",
        },
      },
      {
        label: { en: "Associated symptoms", ar: "أعراض مصاحبة" },
        question: {
          en: "Are you also sweating, nauseated, feeling faint, or short of breath?",
          ar: "هل تعاني أيضًا من التعرق أو الغثيان أو الإحساس بالإغماء أو ضيق النفس؟",
        },
      },
    ],
  },
  {
    key: "abdominal-pain",
    match:
      /(?:الم في البطن|وجع في البطن|بطني بتوجعني|مغص|الم في المعده|وجع في المعده|abdominal pain|stomach pain|stomach ache|belly pain|stomach cramps)/,
    term: {
      english: "Abdominal pain",
      arabic: "ألم في البطن",
      kind: "symptom",
      explanation: {
        en: "Pain or discomfort in the abdomen.",
        ar: "ألم أو انزعاج في منطقة البطن.",
      },
    },
    normalized: { en: "abdominal pain", ar: "ألم في البطن" },
    clarifications: [
      {
        label: { en: "Location and pattern", ar: "الموضع والنمط" },
        question: {
          en: "Where is the pain, and is it related to meals, bowel movements, or a particular position?",
          ar: "أين موضع الألم، وهل يرتبط بالطعام أو التبرز أو وضعية معينة؟",
        },
      },
      {
        label: { en: "Bowel and warning symptoms", ar: "الأمعاء وعلامات الإنذار" },
        question: {
          en: "Do you have diarrhea, constipation, vomiting, blood in the stool, or fever?",
          ar: "هل لديك إسهال أو إمساك أو ترجيع أو دم في البراز أو حرارة؟",
        },
      },
    ],
  },
  {
    key: "nausea-vomiting",
    match:
      /(?:غثيان|ترجيع|قيء|بترجع|هستفرغ|nausea|nauseated|vomiting|vomit|throwing up|threw up)/,
    term: {
      english: "Nausea or vomiting",
      arabic: "غثيان أو قيء",
      kind: "symptom",
      explanation: {
        en: "Feeling sick to the stomach, bringing stomach contents up, or both.",
        ar: "إحساس بالغثيان أو إخراج محتويات المعدة أو كليهما.",
      },
    },
    normalized: { en: "nausea or vomiting", ar: "غثيان أو قيء" },
    variants: [
      {
        match:
          /(?:غثيان|nausea)[\s\S]{0,40}(?:ترجيع|قيء|بترجع|هستفرغ|vomit|throwing up)|(?:ترجيع|قيء|بترجع|هستفرغ|vomit|throwing up)[\s\S]{0,40}(?:غثيان|nausea)/,
        term: {
          english: "Nausea and vomiting",
          arabic: "غثيان وقيء",
          kind: "symptom",
          explanation: {
            en: "Feeling sick and bringing stomach contents up.",
            ar: "إحساس بالغثيان مع إخراج محتويات المعدة.",
          },
        },
        normalized: { en: "nausea and vomiting", ar: "غثيان وقيء" },
      },
      {
        match: /(?:ترجيع|قيء|بترجع|هستفرغ|vomiting|vomit|throwing up|threw up)/,
        term: {
          english: "Vomiting",
          arabic: "قيء",
          kind: "symptom",
          explanation: {
            en: "Bringing stomach contents up through the mouth.",
            ar: "إخراج محتويات المعدة عبر الفم.",
          },
        },
        normalized: { en: "vomiting", ar: "قيء" },
      },
      {
        match: /(?:غثيان|nausea|nauseated)/,
        term: {
          english: "Nausea",
          arabic: "غثيان",
          kind: "symptom",
          explanation: {
            en: "A feeling of wanting to vomit.",
            ar: "إحساس بالرغبة في القيء.",
          },
        },
        normalized: { en: "nausea", ar: "غثيان" },
      },
    ],
    clarifications: [
      {
        label: { en: "Frequency and fluids", ar: "التكرار والسوائل" },
        question: {
          en: "How many times have you vomited, and can you keep fluids down?",
          ar: "كم مرة حدث الترجيع، وهل تستطيع الاحتفاظ بالسوائل؟",
        },
      },
      {
        label: { en: "Warning signs", ar: "علامات الإنذار" },
        question: {
          en: "Is there blood in the vomit, severe abdominal pain, or signs of dehydration?",
          ar: "هل يوجد دم في القيء أو ألم شديد في البطن أو علامات جفاف؟",
        },
      },
    ],
  },
  {
    key: "back-pain",
    match:
      /(?:الم|وجع)\s*(?:شديده?|قوي|قويه)?\s*(?:في|علي|ب)?\s*(?:الظهر|الضهر|ظهري|ضهري)|(?:ظهري|ضهري)\s*(?:بيوجعني|بيوجع)|اسفل (?:الظهر|الضهر)|back pain|lower back pain|backache/,
    term: {
      english: "Back pain",
      arabic: "ألم في الظهر",
      kind: "symptom",
      explanation: {
        en: "Pain or discomfort in the back.",
        ar: "ألم أو انزعاج في منطقة الظهر.",
      },
    },
    normalized: { en: "back pain", ar: "ألم في الظهر" },
    clarifications: [
      {
        label: { en: "Radiation and weakness", ar: "الامتداد والضعف" },
        question: {
          en: "Does the pain spread to your leg, or do you have numbness or weakness?",
          ar: "هل يمتد الألم إلى الساق، أو لديك تنميل أو ضعف؟",
        },
      },
      {
        label: { en: "Associated symptoms", ar: "أعراض مصاحبة" },
        question: {
          en: "Was there an injury, and do you have fever or changes in urination?",
          ar: "هل حدثت إصابة، وهل لديك حرارة أو تغيّرات في التبول؟",
        },
      },
    ],
  },
  {
    key: "joint-pain",
    match:
      /(?:الم في المفاصل|وجع في المفاصل|مفاصلي|الركبه|كتفي|كوعي|joint pain|joints? (?:ache|pain)|knee pain|shoulder pain)/,
    term: {
      english: "Joint pain",
      arabic: "ألم في المفاصل",
      kind: "symptom",
      explanation: {
        en: "Pain or discomfort in one or more joints.",
        ar: "ألم أو انزعاج في مفصل واحد أو أكثر.",
      },
    },
    normalized: { en: "joint pain", ar: "ألم في المفاصل" },
    clarifications: [
      {
        label: { en: "Number of joints", ar: "عدد المفاصل" },
        question: {
          en: "Is one joint affected, or several?",
          ar: "هل يتأثر مفصل واحد أم عدة مفاصل؟",
        },
      },
      {
        label: { en: "Inflammation signs", ar: "علامات الالتهاب" },
        question: {
          en: "Is there swelling, redness, warmth, or stiffness, especially in the morning?",
          ar: "هل يوجد تورم أو احمرار أو سخونة أو تيبس، خاصة في الصباح؟",
        },
      },
    ],
  },
  {
    key: "rash",
    match: /(?:طفح|حساسيه|حكه|هرش|بقع حمراء|طفح جلدي|rash|hives|itchy skin|skin rash)/,
    term: {
      english: "Rash",
      arabic: "طفح جلدي",
      kind: "sign",
      explanation: {
        en: "A visible change in the color or texture of the skin.",
        ar: "تغيّر مرئي في لون الجلد أو ملمسه.",
      },
    },
    normalized: { en: "rash", ar: "طفح جلدي" },
    clarifications: [
      {
        label: { en: "Distribution and spread", ar: "التوزيع والانتشار" },
        question: {
          en: "Where did the rash start, and is it spreading?",
          ar: "من أين بدأ الطفح، وهل ينتشر؟",
        },
      },
      {
        label: { en: "Warning signs", ar: "علامات الإنذار" },
        question: {
          en: "Do you have fever, breathing difficulty, or swelling of the lips or tongue?",
          ar: "هل لديك حرارة أو صعوبة في التنفس أو تورم في الشفتين أو اللسان؟",
        },
      },
    ],
  },
];
