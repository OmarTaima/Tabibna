import type { Locale } from "@shared/contract";
import {
  formatArabicNumber,
  formatNumber,
  formatTermNumber,
} from "@/lib/format";

const en = {
  meta: {
    title: "VivaValve AI — Medical language, made clear",
    description:
      "VivaValve AI turns everyday Egyptian Arabic or English symptom descriptions into clear medical language, asks a few follow-up questions, and explains echocardiography reports in plain language. It is not a confirmed diagnosis.",
  },
  skipLink: "Skip to main content",
  languages: {
    english: "English",
    arabic: "العربية",
  },
  nav: {
    label: "Sections",
    followUps: "FollowUps",
    echo: "EchoBridge",
    reminders: "Reminders",
  },
  header: {
    brandWordmark: "VivaValve",
    brandAccent: "AI",
    brandLabel: "VivaValve AI",
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
    overline: "VIVAVALVE AI · MEDICAL LANGUAGE",
    title: "From symptoms to a clear clinical assessment.",
    description:
      "Describe what you are feeling in everyday Egyptian Arabic or English. VivaValve structures it into standardized medical terms, asks a few follow-up questions, and suggests the most likely diagnosis, with alternatives. It is not a confirmed diagnosis.",
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
    submit: "Start assessment",
    submitting: "Analyzing…",
    shortcut: "Ctrl or ⌘ + Enter to analyze",
    charCount: (count: number) => `${formatNumber(count)} / 2,000`,
    charCountLabel: (count: number) =>
      `${formatNumber(count)} of 2,000 characters used.`,
    errorMin: "Please describe your symptoms in at least 10 characters.",
    errorMax: "Please keep your description under 2,000 characters.",
    editedNote: "You edited the text — start the assessment again to update these results.",
  },
  empty: {
    title: "What you'll get",
    terms: "Standardized terms in English and Arabic",
    explanations: "Plain-language explanations for each term",
    safety: "The most likely diagnosis, with alternatives, and follow-up questions",
  },
  followUps: {
    title: "Follow-up questions",
    subtitle:
      "Your answers keep the assessment specific. Write in your own words.",
    roundLabel: (current: number, total: number) =>
      `Question round ${formatNumber(current)} of ${formatNumber(total)}`,
    questionLabel: (position: number) => `Question ${formatNumber(position)}`,
    answerPlaceholder: "Type your answer…",
    submit: "Send answers",
    submitting: "Sending answers…",
    startOver: "Start over",
    demoNotice:
      "Demo mode: these follow-up questions are sample content, not a real AI assessment.",
    validation: "Please answer every question before sending.",
    readyAnnounce: (current: number, total: number) =>
      `Follow-up questions ready. Question round ${formatNumber(current)} of ${formatNumber(total)}.`,
  },
  impression: {
    title: "Clinical impression",
    subtitle:
      "The most likely diagnosis from your symptoms and answers, with alternatives. It is not a confirmed diagnosis.",
    primaryLabel: "Most likely diagnosis",
    confidence: "Confidence",
    confidenceLevel: {
      low: "Low",
      moderate: "Moderate",
      high: "High",
    },
    differentials: "Other possibilities",
    rationale: "Why this assessment",
    empty: "No other possibilities were listed.",
  },
  results: {
    heading: "Your clinical assessment",
    actionsLabel: "Assessment actions",
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
    notDiagnosis: "AI assessment, not a confirmed diagnosis",
    print: "Print / Save PDF",
    printHint: "Choose 'Save as PDF' in the print dialog.",
    loadingTitle: "Preparing your follow-up questions…",
    loadingBody: "Reviewing your description so the questions stay specific.",
    stillWorking: "Still working…",
    readyAnnounce: (terms: number, questions: number) =>
      `Results ready. ${formatNumber(terms)} ${terms === 1 ? "term" : "terms"}, a clinical impression, and ${formatNumber(questions)} ${
        questions === 1 ? "remaining detail" : "remaining details"
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
        "A concise clinical restatement in both languages, using standardized terms. An AI assessment, not a confirmed diagnosis.",
      notDiagnosisLine: "This is an AI assessment, not a confirmed diagnosis.",
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
    title: "Possible clinical context — AI assessment",
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
  reminders: {
    title: "Medicine reminders",
    subtitle:
      "Set a repeating interval or a daily time. VivaValve rings and shows a notification when it is time.",
    howItWorks:
      "Reminders run inside this browser tab. Keep it open so the alarm can sound.",
    newReminder: "New reminder",
    editReminder: "Edit reminder",
    medicineLabel: "Medicine name",
    medicinePlaceholder: "For example, Vitamin D",
    doseLabel: "Dose (optional)",
    dosePlaceholder: "For example, one tablet",
    scheduleLabel: "When should we remind you?",
    intervalMode: "Every few hours",
    intervalHoursLabel: "Repeat every",
    intervalHoursUnit: "hours",
    dailyMode: "At a daily time",
    dailyTimeLabel: "Time",
    add: "Add reminder",
    save: "Save changes",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    pause: "Pause",
    resume: "Resume",
    taken: "Taken",
    snooze: "Snooze 10 minutes",
    dismiss: "Dismiss",
    nextAlarm: "Next alarm",
    emptyTitle: "No reminders yet",
    emptyBody:
      "Add a reminder for a medicine you take and the time you take it.",
    enableNotifications: "Enable browser notifications",
    notificationsOn: "Browser notifications are on",
    notificationsBlocked:
      "Notifications are blocked. The in-app alarm will still sound.",
    notificationsUnsupported:
      "This browser cannot show notifications. The in-app alarm will still sound.",
    alarmTitle: "Time for your medicine",
    alarmBody: (medicine: string) => `Reminder for ${medicine}`,
    alarmDose: (dose: string) => `Dose: ${dose}`,
    ringing: "Alarm ringing",
    permissionNote:
      "VivaValve does not give dosing advice. Enter the schedule your doctor or pharmacist prescribed.",
    validationMedicine: "Enter a medicine name.",
    validationInterval: "Choose an interval between 1 and 24 hours.",
    validationTime: "Choose a time.",
    saved: "Reminder saved.",
    deleted: "Reminder deleted.",
  },
  echo: {
    title: "EchoBridge",
    subtitle:
      "Paste an echocardiography report and get plain-language explanations of what it says.",
    label: "Echocardiography report",
    placeholder: "Paste the report text here…",
    sample: "Use sample report",
    sampleLabel: "Sample echocardiography report",
    sampleText:
      "Transthoracic echocardiography report. Aortic valve: calcified trileaflet valve with reduced excursion. Aortic valve area 0.8 cm² by the continuity equation. Peak aortic velocity 4.1 m/s, mean pressure gradient 42 mmHg. Left ventricle: concentric left ventricular hypertrophy, wall thickness 14 mm, ejection fraction 60%. Mild mitral regurgitation. Impression: severe aortic stenosis with concentric LVH. Normal left ventricular systolic function.",
    submit: "Explain this report",
    submitting: "Explaining your report…",
    summaryTitle: "Plain-language summary",
    termsTitle: "Terms explained",
    termsCount: (count: number) =>
      `${formatNumber(count)} ${count === 1 ? "term" : "terms"}`,
    empty: "No terms were identified in this report.",
    note: "This explains terminology only; it is not a diagnosis. Discuss the report with your cardiologist.",
    startOver: "Start over",
    validation: "Paste at least 10 characters from the report.",
    charCount: (count: number) => `${formatNumber(count)} / 4,000`,
    termEn: "English term",
    termAr: "Arabic term",
    explanation: "Explanation",
    errors: {
      title: "We couldn't explain the report",
      network:
        "There seems to be a connection problem. Check your internet connection and try again.",
      timeout: "Explaining the report took longer than expected. Please try again.",
      rateLimit: "Too many requests in a short time. Please wait a moment and try again.",
      dailyQuota:
        "The free explanation service has used its daily request allowance, so new explanations are paused until the daily reset. Please try again later.",
      server:
        "Something went wrong on our side while explaining the report. Please try again shortly.",
      ai: "The explanation service is unavailable right now. Please try again shortly.",
      invalid: "The report couldn't be accepted. Please check it and try again.",
      unexpected: "The service returned an unexpected response. Please try again.",
      retry: "Try again",
    },
  },
  disclaimers: {
    title: "About this assessment",
    productLabel: "About this tool",
  },
  footer: {
    disclaimer:
      "VivaValve AI is a medical language aid, not a confirmed diagnosis or treatment. If you feel very unwell, seek local emergency help.",
    brand: "VivaValve AI — clear medical language, in both languages.",
  },
  report: {
    titleEnglish: "Clinical assessment",
    titleArabic: "تقييم سريري",
    brand: "VivaValve AI",
    demo: "DEMO — synthetic sample output; no AI was used.",
    generated: "Generated",
    original: "Original description",
    normalizedEnglish: "Clinical description — English",
    normalizedArabic: "Clinical description — Arabic",
    terminology: "Terminology",
    clarifications: "Missing information",
    clinical: "Possible clinical context — AI assessment",
    impression: "Clinical impression",
    followUps: "Follow-up questions",
    answerLabel: "Your answer",
    disclaimers: "Disclaimers",
    footerEnglish:
      "VivaValve AI is a medical terminology aid, not a confirmed diagnosis or treatment.",
    footerArabic: "VivaValve AI مساعد للمصطلحات الطبية، مش تشخيص مؤكد أو علاج.",
  },
};

export type Copy = typeof en;

const ar: Copy = {
  meta: {
    title: "VivaValve AI — لغتك الطبية بشكل أوضح",
    description:
      "VivaValve AI بيحوّل وصف أعراضك بالعامية المصرية أو الإنجليزية إلى لغة طبية واضحة، بيسألك شوية أسئلة متابعة، وبيشرح تقارير إيكو القلب بلغة بسيطة. ده مش تشخيص مؤكد.",
  },
  skipLink: "تخطَّ إلى المحتوى الرئيسي",
  languages: {
    english: "English",
    arabic: "العربية",
  },
  nav: {
    label: "الأقسام",
    followUps: "متابعة الأعراض",
    echo: "إيكو بريدج",
    reminders: "تذكيرات",
  },
  header: {
    brandWordmark: "VivaValve",
    brandAccent: "AI",
    brandLabel: "VivaValve AI",
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
    overline: "VIVAVALVE AI · MEDICAL LANGUAGE",
    title: "من الأعراض إلى تقييم سريري واضح.",
    description:
      "اوصف اللي حاسس بيه بالعامية المصرية أو الإنجليزية. VivaValve بيرتبه في مصطلحات طبية موحدة، بيسألك شوية أسئلة متابعة، وبيقترح التشخيص الأرجح مع بدائل. ده مش تشخيص مؤكد.",
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
    submit: "ابدأ التقييم",
    submitting: "جاري التحليل…",
    shortcut: "Ctrl أو ⌘ + Enter للتحليل",
    charCount: (count: number) => `${formatNumber(count)} / 2,000`,
    charCountLabel: (count: number) =>
      `${formatNumber(count)} من 2,000 حرف مستخدم.`,
    errorMin: "اوصف أعراضك في 10 حروف على الأقل.",
    errorMax: "خلي الوصف أقل من 2,000 حرف.",
    editedNote: "غيّرت النص — ابدأ التقييم تاني لتحديث النتائج.",
  },
  empty: {
    title: "اللي هتحصله",
    terms: "مصطلحات موحدة بالإنجليزي والعربي",
    explanations: "شرح مبسط لكل مصطلح",
    safety: "التشخيص الأرجح مع بدائل، وأسئلة متابعة",
  },
  followUps: {
    title: "أسئلة متابعة",
    subtitle: "إجاباتك بتخلي التقييم أدق. اكتب بالطريقة اللي تريحك.",
    roundLabel: (current: number, total: number) =>
      `جولة الأسئلة ${formatArabicNumber(current)} من ${formatArabicNumber(total)}`,
    questionLabel: (position: number) => `السؤال ${formatArabicNumber(position)}`,
    answerPlaceholder: "اكتب إجابتك…",
    submit: "ابعت الإجابات",
    submitting: "بنبعت الإجابات…",
    startOver: "ابدأ من جديد",
    demoNotice:
      "وضع تجريبي: أسئلة المتابعة دي محتوى عيّنة، مش تقييم حقيقي بالذكاء الاصطناعي.",
    validation: "جاوب على كل سؤال قبل ما تبعت.",
    readyAnnounce: (current: number, total: number) =>
      `أسئلة المتابعة جاهزة. جولة الأسئلة ${formatArabicNumber(current)} من ${formatArabicNumber(total)}.`,
  },
  impression: {
    title: "الانطباع السريري",
    subtitle:
      "التشخيص الأرجح بناءً على أعراضك وإجاباتك، مع بدائل. ده مش تشخيص مؤكد.",
    primaryLabel: "التشخيص الأرجح",
    confidence: "درجة الثقة",
    confidenceLevel: {
      low: "منخفضة",
      moderate: "متوسطة",
      high: "عالية",
    },
    differentials: "احتمالات تانية",
    rationale: "ليه التقييم ده",
    empty: "مفيش احتمالات تانية اتذكرت.",
  },
  results: {
    heading: "تقييمك السريري",
    actionsLabel: "إجراءات التقييم",
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
    notDiagnosis: "تقييم بالذكاء الاصطناعي، مش تشخيص مؤكد",
    print: "طباعة / حفظ PDF",
    printHint: "اختر «حفظ كـ PDF» من نافذة الطباعة.",
    loadingTitle: "بنجهز أسئلة المتابعة…",
    loadingBody: "بنراجع وصفك عشان الأسئلة تكون دقيقة.",
    stillWorking: "لسه بنحلل…",
    readyAnnounce: (terms: number, questions: number) =>
      `النتائج جاهزة. ${formatNumber(terms)} مصطلحات، وانطباع سريري، و${formatNumber(questions)} تفاصيل ناقصة.`,
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
        "إعادة صياغة سريرية موجزة باللغتين باستخدام مصطلحات موحدة. ده تقييم بالذكاء الاصطناعي، مش تشخيص مؤكد.",
      notDiagnosisLine: "ده تقييم بالذكاء الاصطناعي، مش تشخيص مؤكد.",
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
    title: "سياق سريري محتمل — تقييم بالذكاء الاصطناعي",
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
  reminders: {
    title: "تذكير الأدوية",
    subtitle:
      "حدّد كل كم ساعة تبيه، أو وقت يومي ثابت. VivaValve ينوّه ويطلع إشعار في الوقت ده.",
    howItWorks:
      "التذكيرات شغالة في تبويب المتصفح ده. خليه مفتوح عشان الإنذار يطلع.",
    newReminder: "تذكير جديد",
    editReminder: "عدّل التذكير",
    medicineLabel: "اسم الدواء",
    medicinePlaceholder: "مثال: فيتامين د",
    doseLabel: "الجرعة (اختياري)",
    dosePlaceholder: "مثال: قرص واحد",
    scheduleLabel: "متى نذكّرك؟",
    intervalMode: "كل كم ساعة",
    intervalHoursLabel: "كرّر كل",
    intervalHoursUnit: "ساعة",
    dailyMode: "في وقت يومي",
    dailyTimeLabel: "الوقت",
    add: "ضيف التذكير",
    save: "احفظ التعديلات",
    cancel: "إلغاء",
    delete: "احذف",
    edit: "عدّل",
    pause: "إيقاف مؤقت",
    resume: "استئناف",
    taken: "تم",
    snooze: "أجّل ١٠ دقايق",
    dismiss: "أغلق",
    nextAlarm: "الإنذار الجاي",
    emptyTitle: "مفيش تذكيرات لسه",
    emptyBody: "ضيف تذكير للدواء اللي بتاخده ووقت بتاخده.",
    enableNotifications: "فعّل إشعارات المتصفح",
    notificationsOn: "إشعارات المتصفح مفعّلة",
    notificationsBlocked: "الإشعارات محظورة. الإنذار جوه الصفحة هيرنّ.",
    notificationsUnsupported:
      "المتصفح ده مش بيعرض إشعارات. الإنذار جوه الصفحة هيرنّ.",
    alarmTitle: "وقت دوائك",
    alarmBody: (medicine: string) => `تذكير ${medicine}`,
    alarmDose: (dose: string) => `الجرعة: ${dose}`,
    ringing: "الإنذار بيرنّ",
    permissionNote:
      "VivaValve مش بيحدد الجرعات. دخّل الموعد اللي الدكتور أو الصيدلي حدده.",
    validationMedicine: "اكتب اسم الدواء.",
    validationInterval: "اختر مدة بين ساعة و٢٤ ساعة.",
    validationTime: "اختر وقت.",
    saved: "تم حفظ التذكير.",
    deleted: "تم حذف التذكير.",
  },
  echo: {
    title: "EchoBridge",
    subtitle: "الصق تقرير إيكو على القلب وهنشرحلك اللي فيه بلغة بسيطة.",
    label: "تقرير إيكو القلب",
    placeholder: "الصق نص التقرير هنا…",
    sample: "استخدم تقرير تجريبي",
    sampleLabel: "تقرير إيكو تجريبي",
    sampleText:
      "تقرير إيكو على القلب عبر الصدر. الصمام الأورطي: صمام ثلاثي الشرفات متكلس مع حركة محدودة. مساحة الصمام الأورطي 0.8 سم² بمعادلة الاستمرارية. أقصى سرعة للدم عبر الصمام 4.1 م/ث، ومتوسط فرق الضغط 42 مم زئبق. البطين الأيسر: تضخم متحدة المركز في عضلة البطين، سماكة الجدار 14 مم، وكسر القذف 60%. ارتجاع خفيف في الصمام الميترالي. الانطباع: ضيق شديد في الصمام الأورطي مع تضخم البطين الأيسر. وظيفة البطين الأيسر الانقباضية طبيعية.",
    submit: "اشرح التقرير",
    submitting: "بنشرح تقريرك…",
    summaryTitle: "ملخص بلغة بسيطة",
    termsTitle: "المصطلحات المشروحة",
    termsCount: (count: number) =>
      `${formatNumber(count)} ${count === 1 ? "مصطلح" : count === 2 ? "مصطلحين" : "مصطلحات"}`,
    empty: "مفيش مصطلحات اتحددت في التقرير ده.",
    note: "ده شرح للمصطلحات بس، مش تشخيص. ناقش التقرير مع طبيب القلب.",
    startOver: "ابدأ من جديد",
    validation: "الصق ١٠ حروف على الأقل من التقرير.",
    charCount: (count: number) => `${formatNumber(count)} / 4,000`,
    termEn: "المصطلح بالإنجليزي",
    termAr: "المصطلح بالعربي",
    explanation: "الشرح",
    errors: {
      title: "مقدرناش نشرح التقرير",
      network: "في مشكلة في الاتصال. اتأكد من الإنترنت وجرّب تاني.",
      timeout: "شرح التقرير خد وقت أطول من المتوقع. جرّب تاني.",
      rateLimit: "في محاولات كتير في وقت قصير. استنى شوية وجرّب تاني.",
      dailyQuota:
        "خدمة الشرح المجانية خلصت نصيبها اليومي من الطلبات، فالشرح الجديد متوقف لحد ما يعمل تحديث يومي. جرّب تاني بعدين.",
      server: "حصلت مشكلة عندنا وإحنا بنشرح التقرير. جرّب تاني بعد شوية.",
      ai: "خدمة الشرح مش متاحة دلوقتي. جرّب تاني بعد شوية.",
      invalid: "التقرير مش مقبول. راجعه وجرّب تاني.",
      unexpected: "رد غير متوقع من الخدمة. جرّب تاني.",
      retry: "جرّب تاني",
    },
  },
  disclaimers: {
    title: "عن التقييم ده",
    productLabel: "عن الأداة",
  },
  footer: {
    disclaimer:
      "VivaValve AI مساعد للمصطلحات الطبية، مش تشخيص مؤكد أو علاج. لو حاسس إنك تعبان جدًا، اطلب مساعدة الطوارئ في بلدك.",
    brand: "VivaValve AI — لغة طبية واضحة باللغتين.",
  },
  report: {
    titleEnglish: "Clinical assessment",
    titleArabic: "تقييم سريري",
    brand: "VivaValve AI",
    demo: "عرض تجريبي — الناتج ده عيّنة مش تحليل حقيقي، وبدون استخدام ذكاء اصطناعي.",
    generated: "تم الإنشاء",
    original: "الوصف الأصلي",
    normalizedEnglish: "الوصف السريري — الإنجليزية",
    normalizedArabic: "الوصف السريري — العربية",
    terminology: "المصطلحات",
    clarifications: "معلومات ناقصة",
    clinical: "سياق سريري محتمل — تقييم بالذكاء الاصطناعي",
    impression: "الانطباع السريري",
    followUps: "أسئلة المتابعة",
    answerLabel: "إجابتك",
    disclaimers: "إخلاء المسؤولية",
    footerEnglish:
      "VivaValve AI is a medical terminology aid, not a confirmed diagnosis or treatment.",
    footerArabic: "VivaValve AI مساعد للمصطلحات الطبية، مش تشخيص مؤكد أو علاج.",
  },
};

export const dictionaries: Record<Locale, Copy> = { en, ar };
