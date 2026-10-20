import type { Locale } from "@shared/contract";
import { formatNumber, formatTermNumber } from "@/lib/format";

const en = {
  meta: {
    title: "Tabibna AI — Medical language, made clear",
    description:
      "Translate everyday Egyptian Arabic or English symptom descriptions into clear, standardized medical terminology in Arabic and English. Not a diagnosis.",
  },
  skipLink: "Skip to main content",
  languages: {
    english: "English",
    arabic: "العربية",
  },
  header: {
    brandWordmark: "Tabibna",
    brandAccent: "AI",
    brandLabel: "Tabibna AI",
    languageGroup: "Language",
    english: "English",
    arabic: "العربية",
    englishShort: "EN",
    arabicShort: "عربي",
    switchToEnglish: "Switch to English",
    switchToArabic: "Switch to Arabic",
    demo: {
      full: "Synthetic demo",
      short: "Demo mode",
      label: "Synthetic demo mode: sample output only, no AI is used.",
    },
  },
  hero: {
    overline: "TABIBNA AI · MEDICAL LANGUAGE",
    title: "Your symptoms, translated into medical language.",
    description:
      "Describe what you are feeling in everyday Egyptian Arabic or English. Tabibna structures it into standardized medical terms — it is not a diagnosis.",
  },
  form: {
    regionLabel: "Symptom description form",
    label: "Describe your symptoms",
    helper:
      "Everyday Egyptian Arabic or English is fine. Include when it started and what makes it better or worse.",
    placeholder: "For example: a headache since yesterday, dizzy when I stand, a mild fever…",
    privacy: "No account needed. Avoid names or personal identifiers.",
    examplesLabel: "Try an example",
    exampleArabicLabel: "Egyptian Arabic",
    exampleArabicText: "عندي صداع من امبارح، ودوخة لما أقف، وحرارة بسيطة، وبحس بتعب عام.",
    exampleEnglishLabel: "English",
    exampleEnglishText:
      "I've had a headache since yesterday and feel dizzy when I stand up. I also have a mild fever.",
    submit: "Analyze symptoms",
    submitting: "Analyzing…",
    shortcut: "Ctrl or ⌘ + Enter to analyze",
    charCount: (count: number) => `${formatNumber(count)} / 2,000`,
    charCountLabel: (count: number) =>
      `${formatNumber(count)} of 2,000 characters used.`,
    errorMin: "Please describe your symptoms in at least 10 characters.",
    errorMax: "Please keep your description under 2,000 characters.",
    editedNote: "You edited the text — analyze again to update these results.",
  },
  empty: {
    title: "What you'll get",
    terms: "Standardized terms in English and Arabic",
    explanations: "Plain-language explanations for each term",
    safety: "Plain-language terms and clarifications",
  },
  results: {
    heading: "Your medical language summary",
    actionsLabel: "Summary actions",
    detectedLabel: "Language detected",
    detected: {
      "ar-EG": "Egyptian Arabic",
      ar: "Arabic",
      en: "English",
      mixed: "Arabic and English",
      unknown: "Not identified",
    },
    termCount: (count: number) =>
      `${formatNumber(count)} ${count === 1 ? "term" : "terms"}`,
    notDiagnosis: "Not a diagnosis",
    copy: "Copy summary",
    copied: "Copied",
    copyFailed: "Copy failed",
    copyAnnounce: "Summary copied to clipboard.",
    copyAnnounceError:
      "Could not copy the summary. You can select the text and copy it manually.",
    print: "Print / Save PDF",
    printHint: "Choose 'Save as PDF' in the print dialog.",
    loadingTitle: "Analyzing your description…",
    loadingBody: "Preparing clinical terminology and clarifications.",
    stillWorking: "Still working…",
    readyAnnounce: (terms: number, questions: number) =>
      `Results ready. ${formatNumber(terms)} ${terms === 1 ? "term" : "terms"} and ${formatNumber(questions)} ${
        questions === 1 ? "missing detail" : "missing details"
      }.`,
    generated: "Generated",
    demo: {
      badge: "Synthetic demo",
      title: "Sample output — not a real analysis",
      body: "This summary is synthetic sample content generated without AI. It does not analyze your description. Real results are available only in live mode.",
    },
    summary: {
      title: "Your description",
      originalLabel: "Your words",
      originalChip: "Original",
      originalHelp: "Kept exactly as you wrote it.",
      normalizedLabel: "Clinical description",
      normalizedChip: "Clinical",
      normalizedHelp:
        "A concise clinical restatement in both languages, using standardized terms. Not a diagnosis.",
      notDiagnosisLine:
        "This summary is not a diagnosis. If you have severe or worsening symptoms, contact a healthcare professional.",
    },
    errors: {
      title: "We couldn't complete the analysis",
      network:
        "There seems to be a connection problem. Check your internet connection and try again.",
      timeout: "The analysis took longer than expected. Please try again.",
      rateLimit: "Too many requests in a short time. Please wait a moment and try again.",
      dailyQuota:
        "The free analysis service has used its daily request allowance, so new analyses are paused until the daily reset. Please try again later.",
      server:
        "Something went wrong on our side while analyzing your description. Please try again shortly.",
      ai: "The analysis service is unavailable right now. Please try again shortly.",
      invalid: "The description couldn't be accepted. Please edit it and try again.",
      unexpected: "The service returned an unexpected response. Please try again.",
      retry: "Try again",
    },
  },
  terminology: {
    title: "Standardized terminology",
    helper:
      "The medical language for what you described, in both languages, with a plain-language explanation.",
    count: (count: number) =>
      `${formatNumber(count)} ${count === 1 ? "term" : "terms"}`,
    termLabel: (position: number) => `Term ${formatTermNumber(position)}`,
    origin: {
      reported: "From your description",
      interpretation: "Clinical interpretation — not a diagnosis",
    },
    kind: {
      symptom: "Symptom",
      sign: "Sign",
      finding: "Finding",
      context: "Context",
    },
    empty: "No standardized terms were identified in this description.",
  },
  clinical: {
    title: "Possible clinical context — not a diagnosis",
    intro:
      "These are possibilities suggested by the wording, not conclusions. A clinician interprets them.",
    confidence: "Confidence",
    confidenceLevel: {
      low: "Low",
      moderate: "Moderate",
    },
    basis: "Basis",
  },
  clarifications: {
    title: "Missing information",
    helper: "Answering these can make the summary more precise.",
    continue: "Continue describing",
    focusAnnounce: "Description field focused.",
  },
  disclaimers: {
    title: "Safety and limitations",
    productLabel: "About this tool",
  },
  footer: {
    disclaimer:
      "Tabibna AI is a medical terminology aid, not a diagnosis or treatment. If you feel very unwell, seek local emergency help.",
    brand: "Tabibna AI — clear medical language, in both languages.",
  },
  report: {
    titleEnglish: "Medical language summary",
    titleArabic: "ملخص اللغة الطبية",
    brand: "Tabibna AI",
    demo: "DEMO — synthetic sample output; no AI was used.",
    generated: "Generated",
    original: "Original description",
    normalizedEnglish: "Clinical description — English",
    normalizedArabic: "Clinical description — Arabic",
    terminology: "Terminology",
    clarifications: "Missing information",
    clinical: "Possible clinical context — not a diagnosis",
    disclaimers: "Disclaimers",
    footerEnglish:
      "Tabibna AI is a medical terminology aid, not a diagnosis or treatment.",
    footerArabic: "طبيبنا AI مساعد للمصطلحات الطبية، مش تشخيص أو علاج.",
  },
};

export type Copy = typeof en;

const ar: Copy = {
  meta: {
    title: "طبيبنا AI — لغتك الطبية بشكل أوضح",
    description:
      "حوّل وصف أعراضك بالعامية المصرية أو الإنجليزية إلى مصطلحات طبية موحدة بالعربي والإنجليزي. ده مش تشخيص.",
  },
  skipLink: "تخطَّ إلى المحتوى الرئيسي",
  languages: {
    english: "English",
    arabic: "العربية",
  },
  header: {
    brandWordmark: "Tabibna",
    brandAccent: "AI",
    brandLabel: "طبيبنا AI",
    languageGroup: "اللغة",
    english: "English",
    arabic: "العربية",
    englishShort: "EN",
    arabicShort: "عربي",
    switchToEnglish: "التبديل إلى الإنجليزية",
    switchToArabic: "التبديل إلى العربية",
    demo: {
      full: "عرض تجريبي",
      short: "وضع تجريبي",
      label: "وضع العرض التجريبي: ناتج عيّنة فقط، وبدون استخدام ذكاء اصطناعي.",
    },
  },
  hero: {
    overline: "TABIBNA AI · MEDICAL LANGUAGE",
    title: "حوّل وصف أعراضك إلى مصطلحات طبية واضحة.",
    description:
      "اوصف اللي حاسس بيه بالعامية المصرية أو الإنجليزية. طبيبنا بيرتبه في مصطلحات طبية موحدة — وده مش تشخيص.",
  },
  form: {
    regionLabel: "نموذج وصف الأعراض",
    label: "اوصف أعراضك",
    helper:
      "العامية المصرية أو الإنجليزية عادي. اذكر إمتى بدأ، وإيه اللي بيخففه أو بيزيده.",
    placeholder: "مثال: صداع من امبارح، ودوخة لما أقف، وحرارة بسيطة…",
    privacy: "مش محتاج حساب. تجنّب الأسماء أو البيانات الشخصية.",
    examplesLabel: "جرّب مثال",
    exampleArabicLabel: "عامية مصرية",
    exampleArabicText: "عندي صداع من امبارح، ودوخة لما أقف، وحرارة بسيطة، وبحس بتعب عام.",
    exampleEnglishLabel: "إنجليزي",
    exampleEnglishText:
      "I've had a headache since yesterday and feel dizzy when I stand up. I also have a mild fever.",
    submit: "حلّل الأعراض",
    submitting: "جاري التحليل…",
    shortcut: "Ctrl أو ⌘ + Enter للتحليل",
    charCount: (count: number) => `${formatNumber(count)} / 2,000`,
    charCountLabel: (count: number) =>
      `${formatNumber(count)} من 2,000 حرف مستخدم.`,
    errorMin: "اوصف أعراضك في 10 حروف على الأقل.",
    errorMax: "خلي الوصف أقل من 2,000 حرف.",
    editedNote: "غيّرت النص — حلّل تاني لتحديث النتائج.",
  },
  empty: {
    title: "اللي هتحصله",
    terms: "مصطلحات موحدة بالإنجليزي والعربي",
    explanations: "شرح مبسط لكل مصطلح",
    safety: "مصطلحات بلغة بسيطة وتفاصيل ناقصة",
  },
  results: {
    heading: "ملخص لغتك الطبية",
    actionsLabel: "إجراءات الملخص",
    detectedLabel: "اللغة المكتشفة",
    detected: {
      "ar-EG": "عامية مصرية",
      ar: "عربي",
      en: "إنجليزي",
      mixed: "عربي وإنجليزي",
      unknown: "مش محدد",
    },
    termCount: (count: number) =>
      `${formatNumber(count)} ${count === 1 ? "مصطلح" : count === 2 ? "مصطلحين" : "مصطلحات"}`,
    notDiagnosis: "مش تشخيص",
    copy: "نسخ الملخص",
    copied: "تم النسخ",
    copyFailed: "فشل النسخ",
    copyAnnounce: "تم نسخ الملخص.",
    copyAnnounceError:
      "مقدرناش ننسخ الملخص. تقدر تحدد النص وتنسخه بنفسك.",
    print: "طباعة / حفظ PDF",
    printHint: "اختر «حفظ كـ PDF» من نافذة الطباعة.",
    loadingTitle: "بنحلل وصفك…",
    loadingBody: "جارٍ إعداد المصطلحات السريرية والتفاصيل الناقصة.",
    stillWorking: "لسه بنحلل…",
    readyAnnounce: (terms: number, questions: number) =>
      `النتائج جاهزة. ${formatNumber(terms)} مصطلحات و${formatNumber(questions)} تفاصيل ناقصة.`,
    generated: "تم الإنشاء",
    demo: {
      badge: "عرض تجريبي",
      title: "ناتج عيّنة — مش تحليل حقيقي",
      body: "الملخص ده محتوى تجريبي اصطناعي اتعمل بدون ذكاء اصطناعي، ومش بيعمل تحليل لوصفك. اعتبر النتائج الحقيقية متاحة في الوضع المباشر فقط.",
    },
    summary: {
      title: "وصفك",
      originalLabel: "كلامك",
      originalChip: "الأصل",
      originalHelp: "زي ما كتبته بالظبط.",
      normalizedLabel: "وصف سريري",
      normalizedChip: "سريري",
      normalizedHelp:
        "إعادة صياغة سريرية موجزة باللغتين باستخدام مصطلحات موحدة. ليست تشخيصًا.",
      notDiagnosisLine:
        "الملخص ده مش تشخيص. لو عندك أعراض شديدة أو بتزيد، تواصل مع مختص رعاية صحية.",
    },
    errors: {
      title: "مقدرناش نكمل التحليل",
      network: "في مشكلة في الاتصال. اتأكد من الإنترنت وجرّب تاني.",
      timeout: "التحليل خد وقت أطول من المتوقع. جرّب تاني.",
      rateLimit: "في محاولات كتير في وقت قصير. استنى شوية وجرّب تاني.",
      dailyQuota:
        "خدمة التحليل المجانية خلصت نصيبها اليومي من الطلبات، فالتحليلات الجديدة متوقفة لحد ما يعمل تحديث يومي. جرّب تاني بعدين.",
      server: "حصلت مشكلة عندنا وإحنا بنحلل الوصف. جرّب تاني بعد شوية.",
      ai: "خدمة التحليل مش متاحة دلوقتي. جرّب تاني بعد شوية.",
      invalid: "الوصف مش مقبول. عدّله وجرّب تاني.",
      unexpected: "رد غير متوقع من الخدمة. جرّب تاني.",
      retry: "جرّب تاني",
    },
  },
  terminology: {
    title: "المصطلحات الموحدة",
    helper:
      "اللغة الطبية لوصفك، بالعربي والإنجليزي، مع شرح مبسط لكل مصطلح.",
    count: (count: number) =>
      `${formatNumber(count)} ${count === 1 ? "مصطلح" : count === 2 ? "مصطلحين" : "مصطلحات"}`,
    termLabel: (position: number) => `مصطلح ${formatTermNumber(position)}`,
    origin: {
      reported: "من وصفك",
      interpretation: "تفسير سريري — مش تشخيص",
    },
    kind: {
      symptom: "عَرَض",
      sign: "علامة",
      finding: "نتيجة",
      context: "سياق",
    },
    empty: "مفيش مصطلحات موحدة اتحددت من الوصف ده.",
  },
  clinical: {
    title: "سياق سريري محتمل — مش تشخيص",
    intro:
      "دي احتمالات من صياغة الكلام، مش استنتاجات نهائية. الطبيب هو اللي يفسرها.",
    confidence: "درجة الثقة",
    confidenceLevel: {
      low: "منخفضة",
      moderate: "متوسطة",
    },
    basis: "الأساس",
  },
  clarifications: {
    title: "معلومات ناقصة",
    helper: "الإجابة عن الأسئلة دي تخلي الملخص أدق.",
    continue: "كمّل الوصف",
    focusAnnounce: "تم التركيز على حقل الوصف.",
  },
  disclaimers: {
    title: "السلامة والحدود",
    productLabel: "عن الأداة",
  },
  footer: {
    disclaimer:
      "طبيبنا AI مساعد للمصطلحات الطبية، مش تشخيص أو علاج. لو حاسس إنك تعبان جدًا، اطلب مساعدة الطوارئ في بلدك.",
    brand: "طبيبنا AI — لغة طبية واضحة باللغتين.",
  },
  report: {
    titleEnglish: "Medical language summary",
    titleArabic: "ملخص اللغة الطبية",
    brand: "Tabibna AI",
    demo: "عرض تجريبي — الناتج ده عيّنة مش تحليل حقيقي، وبدون استخدام ذكاء اصطناعي.",
    generated: "تم الإنشاء",
    original: "الوصف الأصلي",
    normalizedEnglish: "الوصف السريري — الإنجليزية",
    normalizedArabic: "الوصف السريري — العربية",
    terminology: "المصطلحات",
    clarifications: "معلومات ناقصة",
    clinical: "سياق سريري محتمل — مش تشخيص",
    disclaimers: "إخلاء المسؤولية",
    footerEnglish:
      "Tabibna AI is a medical terminology aid, not a diagnosis or treatment.",
    footerArabic: "طبيبنا AI مساعد للمصطلحات الطبية، مش تشخيص أو علاج.",
  },
};

export const dictionaries: Record<Locale, Copy> = { en, ar };
