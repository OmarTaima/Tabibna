import type { Locale } from "@shared/contract";
import {
  formatArabicNumber,
  formatNumber,
  formatTermNumber,
} from "@/lib/format";

const en = {
  meta: {
    title: "CardioBridge AI — Medical language, made clear",
    description:
      "CardioBridge AI turns everyday Egyptian Arabic or English symptom descriptions into clear medical language, asks a few follow-up questions, and explains echocardiography reports in plain language. It is not a confirmed diagnosis.",
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
    brandWordmark: "CardioBridge",
    brandAccent: "AI",
    brandLabel: "CardioBridge AI",
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
    overline: "CARDIOBRIDGE AI · MEDICAL LANGUAGE",
    title: "From symptoms to a clear clinical assessment.",
    description:
      "Describe what you are feeling in everyday Egyptian Arabic or English. CardioBridge structures it into standardized medical terms, asks a few follow-up questions, and suggests the most likely diagnosis, with alternatives. It is not a confirmed diagnosis.",
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
      "Set a repeating interval or a daily time. CardioBridge rings and shows a notification when it is time.",
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
      "CardioBridge does not give dosing advice. Enter the schedule your doctor or pharmacist prescribed.",
    validationMedicine: "Enter a medicine name.",
    validationInterval: "Choose an interval between 1 and 24 hours.",
    validationTime: "Choose a time.",
    saved: "Reminder saved.",
    deleted: "Reminder deleted.",
  },
  echo: {
    title: "EchoBridge",
    subtitle:
      "Take a photo of a printed echocardiography report or paste its text, and get plain-language explanations of what it says.",
    label: "Report text",
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
    mode: {
      groupLabel: "Report input",
      photo: "Photo",
      text: "Text",
    },
    photo: {
      title: "Photo of the report",
      help: "Use a clear photo of the printed report, including the measurements table and the conclusion.",
      languageLabel: "Report language",
      languageHelp:
        "Choose the language printed on the report. English + Arabic is slower but reads both.",
      languageEn: "English",
      languageAr: "Arabic",
      languageBoth: "English + Arabic",
      languageChanged:
        "You changed the report language. Read the photo again to apply it.",
      dropTitle: "Add a photo of the report",
      dropNow: "Drop the photo here",
      dropHint: "Drag it here, or use a button below.",
      mobileHint: "Use your camera or choose a photo from this device.",
      formats: "JPG, PNG, or WebP work best · up to 10 MB",
      take: "Take a photo",
      choose: "Choose a photo",
      oneAtATime: "One photo at a time. We used the first one.",
      tipsTitle: "Tips for a clear photo",
      tipLight: "Use even light and avoid shadows.",
      tipFlat: "Keep the page flat and fill the frame.",
      tipSharp: "Make sure the text is in focus.",
      privacyTitle: "Read on this device",
      privacy:
        "The photo is not uploaded or stored. Only the text you check below is sent to the AI service. Remove names and personal details before you send it.",
      previewTitle: "Selected photo",
      previewAlt: "Preview of the report photo you selected",
      metaLabel: "Photo details",
      read: "Read the photo",
      readAgain: "Read again",
      remove: "Remove photo",
      readFirst: "Read the photo before you send the text.",
      rereadConfirm: "Reading again will replace the text you edited.",
      rereadConfirmAction: "Read again",
      removeConfirm: "Removing the photo will also remove the text you edited.",
      removeConfirmAction: "Remove photo",
      keepEdits: "Keep my edits",
      preparing: "Preparing the reader…",
      loadingLanguage: "Loading language data…",
      recognizing: (percent: number) =>
        `Reading the photo… ${formatNumber(percent)}%`,
      progressLabel: "Reading the report photo",
      progressEngine: "Preparing the reader",
      progressLanguage: "Loading language data",
      progressRecognizing: (percent: number) =>
        `Reading the photo, ${formatNumber(percent)}%`,
      progressHint:
        "This can take a few seconds on a phone. Keep this screen open.",
      extractedTitle: "Check the text before you send it",
      extractedHelp:
        "This is what we read from the photo. Correct any mistakes and remove names or personal details.",
      extractedLabel: "Text read from the photo",
      extractedPlaceholder: "The text from your photo will appear here.",
      lowConfidence:
        "Some parts were hard to read. Compare the text with the photo and fix anything that looks wrong.",
      trimmed:
        "This report is longer than 4,000 characters, so we kept the beginning. Add the conclusion if it is missing.",
      tooShort: "Keep at least 10 characters from the report.",
      noPhoto: "Add a photo of the report first.",
      unsupportedType:
        "That file type is not supported. Use a JPG, PNG, or WebP photo.",
      tooLarge:
        "This photo is larger than 10 MB. Try a smaller photo or take a new one.",
      offline:
        "You're offline. The text reader can't load without a connection. Connect and try again, or paste the text instead.",
      prepareFailed:
        "The text reader couldn't load. Check your internet connection and try again, or paste the text instead.",
      readerFailed:
        "We couldn't read this photo. Try a clearer photo, or paste the text instead.",
      notEnoughText:
        "We couldn't find enough text in this photo. Try a sharper photo with the whole page in frame, or check the report language.",
      pasteInstead: "Paste the text instead",
      chooseAnother: "Choose another photo",
      submit: "Explain this report",
      submitting: "Explaining the text from your photo…",
      resultBadge: "Read from photo",
      resultHelp: "Based on the text you checked from the photo.",
      resultPrivacy:
        "The photo stayed on this device. Only the text you checked was sent for explanation.",
      announce: {
        photoAdded: "Photo added. Check the report language, then read the photo.",
        ready: "Text ready. Check it before you send it.",
        readyElsewhere:
          "Text from your photo is ready. Switch to Photo to check it.",
        removed: "Photo removed.",
        modePhoto: "Photo mode.",
        modeText: "Text mode.",
        pasteInstead: "Text mode. Paste or edit the report text.",
        startOver: "Started over.",
      },
    },
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
    photoErrors: {
      title: "We couldn't explain the text from the photo",
      network:
        "There seems to be a connection problem. Your photo is still on this device. Check your internet connection and try again.",
      timeout:
        "Explaining the text took longer than expected. Your photo is still on this device. Please try again.",
      rateLimit:
        "Too many requests in a short time. Please wait a moment and try again.",
      dailyQuota:
        "The free explanation service has used its daily request allowance, so new explanations are paused until the daily reset. Please try again later.",
      server:
        "Something went wrong on our side while explaining the text. Your photo is still on this device. Please try again shortly.",
      ai: "The explanation service is unavailable right now. Please try again shortly.",
      invalid: "The text couldn't be accepted. Please check it and try again.",
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
      "CardioBridge AI is a medical language aid, not a confirmed diagnosis or treatment. If you feel very unwell, seek local emergency help.",
    brand: "CardioBridge AI — clear medical language, in both languages.",
  },
  report: {
    titleEnglish: "Clinical assessment",
    titleArabic: "تقييم سريري",
    brand: "CardioBridge AI",
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
      "CardioBridge AI is a medical terminology aid, not a confirmed diagnosis or treatment.",
    footerArabic: "CardioBridge AI مساعد للمصطلحات الطبية، مش تشخيص مؤكد أو علاج.",
  },
};

export type Copy = typeof en;

const ar: Copy = {
  meta: {
    title: "CardioBridge AI — لغتك الطبية بشكل أوضح",
    description:
      "CardioBridge AI بيحوّل وصف أعراضك بالعامية المصرية أو الإنجليزية إلى لغة طبية واضحة، بيسألك شوية أسئلة متابعة، وبيشرح تقارير إيكو القلب بلغة بسيطة. ده مش تشخيص مؤكد.",
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
    brandWordmark: "CardioBridge",
    brandAccent: "AI",
    brandLabel: "CardioBridge AI",
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
    overline: "CARDIOBRIDGE AI · MEDICAL LANGUAGE",
    title: "من الأعراض إلى تقييم سريري واضح.",
    description:
      "اوصف اللي حاسس بيه بالعامية المصرية أو الإنجليزية. CardioBridge بيرتبه في مصطلحات طبية موحدة، بيسألك شوية أسئلة متابعة، وبيقترح التشخيص الأرجح مع بدائل. ده مش تشخيص مؤكد.",
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
      "حدّد كل كم ساعة تبيه، أو وقت يومي ثابت. CardioBridge ينوّه ويطلع إشعار في الوقت ده.",
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
      "CardioBridge مش بيحدد الجرعات. دخّل الموعد اللي الدكتور أو الصيدلي حدده.",
    validationMedicine: "اكتب اسم الدواء.",
    validationInterval: "اختر مدة بين ساعة و٢٤ ساعة.",
    validationTime: "اختر وقت.",
    saved: "تم حفظ التذكير.",
    deleted: "تم حذف التذكير.",
  },
  echo: {
    title: "EchoBridge",
    subtitle:
      "صوّر تقرير إيكو مطبوع أو الصق نصه، وهنشرحلك اللي فيه بلغة بسيطة.",
    label: "نص التقرير",
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
    mode: {
      groupLabel: "طريقة إدخال التقرير",
      photo: "صورة",
      text: "نص",
    },
    photo: {
      title: "صورة التقرير",
      help: "استخدم صورة واضحة لتقرير مطبوع، تشمل جدول القياسات والخلاصة.",
      languageLabel: "لغة التقرير",
      languageHelp:
        "اختر اللغة المطبوعة في التقرير. إنجليزي + عربي أبطأ لكنه بيقرأ الاتنين.",
      languageEn: "إنجليزي",
      languageAr: "عربي",
      languageBoth: "إنجليزي + عربي",
      languageChanged: "غيّرت لغة التقرير. اقرأ الصورة تاني علشان التغيير يتطبق.",
      dropTitle: "ضيف صورة التقرير",
      dropNow: "سيب الصورة هنا",
      dropHint: "اسحبها هنا، أو استخدم الأزرار اللي تحت.",
      mobileHint: "استخدم الكاميرا أو اختر صورة من جهازك.",
      formats: "JPG أو PNG أو WebP هي الأفضل · بحد أقصى ١٠ ميجابايت",
      take: "صوّر التقرير",
      choose: "اختر صورة",
      oneAtATime: "صورة واحدة في المرة. استخدمنا أول صورة.",
      tipsTitle: "علشان قراءة أوضح",
      tipLight: "استخدم إضاءة متساوية ومن غير ظلال.",
      tipFlat: "افرد الورقة وخليها تملأ الكادر.",
      tipSharp: "اتأكد إن النص واضح ومش مشوش.",
      privacyTitle: "تُقرأ الصورة على جهازك",
      privacy:
        "لا تُرفع الصورة ولا تُخزَّن. يُرسل النص الذي تراجعه أدناه فقط إلى خدمة الذكاء الاصطناعي. احذف الأسماء والبيانات الشخصية قبل الإرسال.",
      previewTitle: "الصورة المختارة",
      previewAlt: "معاينة صورة التقرير التي اخترتها",
      metaLabel: "بيانات الصورة",
      read: "اقرأ الصورة",
      readAgain: "اقرأ الصورة تاني",
      remove: "إزالة الصورة",
      readFirst: "اقرأ الصورة قبل ما تبعت النص.",
      rereadConfirm: "القراءة التانية هتستبدل النص اللي عدّلته.",
      rereadConfirmAction: "اقرأ تاني",
      removeConfirm: "إزالة الصورة هتشيل كمان النص اللي عدّلته.",
      removeConfirmAction: "إزالة الصورة",
      keepEdits: "سيب تعديلاتي",
      preparing: "بنجهز القارئ…",
      loadingLanguage: "بنحمّل بيانات اللغة…",
      recognizing: (percent: number) =>
        `بنقرأ الصورة… ${formatNumber(percent)}%`,
      progressLabel: "قراءة صورة التقرير",
      progressEngine: "تجهيز القارئ",
      progressLanguage: "تحميل بيانات اللغة",
      progressRecognizing: (percent: number) =>
        `قراءة الصورة، ${formatNumber(percent)}%`,
      progressHint: "ده ممكن ياخد شوية ثواني على الموبايل. سيب الشاشة مفتوحة.",
      extractedTitle: "راجع النص قبل ما تبعته",
      extractedHelp:
        "ده اللي قرأناه من الصورة. صحّح أي أخطاء وشيل الأسماء والبيانات الشخصية.",
      extractedLabel: "النص المقروء من الصورة",
      extractedPlaceholder: "نص الصورة هيظهر هنا.",
      lowConfidence:
        "في أجزاء كانت صعبة في القراءة. قارن النص بالصورة وصحّح أي حاجة شكلها غلط.",
      trimmed:
        "التقرير أطول من ٤٠٠٠ حرف، فاحتفظنا بالبداية. ضيف الخلاصة لو ناقصة.",
      tooShort: "خلي ١٠ حروف على الأقل من التقرير.",
      noPhoto: "ضيف صورة التقرير الأول.",
      unsupportedType: "نوع الملف ده مش مدعوم. استخدم صورة JPG أو PNG أو WebP.",
      tooLarge: "الصورة أكبر من ١٠ ميجابايت. جرّب صورة أصغر أو صوّرها تاني.",
      offline:
        "إنت مش متصل بالإنترنت. قارئ النص محتاج اتصال علشان يشتغل. اتصل وجرّب تاني، أو الصق النص بدل الصورة.",
      prepareFailed:
        "مقدرناش نحمّل قارئ النص. اتأكد من الإنترنت وجرّب تاني، أو الصق النص بدل الصورة.",
      readerFailed:
        "مقدرناش نقرأ الصورة دي. جرّب صورة أوضح، أو الصق النص بدل الصورة.",
      notEnoughText:
        "ملقيناش نص كافي في الصورة. جرّب صورة أوضح والتقرير كله في الكادر، أو اتأكد من لغة التقرير.",
      pasteInstead: "الصق النص بدل الصورة",
      chooseAnother: "اختر صورة تانية",
      submit: "اشرح التقرير",
      submitting: "بنشرح النص اللي قرأناه من صورتك…",
      resultBadge: "مقروء من صورة",
      resultHelp: "بناءً على النص اللي راجعته من الصورة.",
      resultPrivacy: "ظلت الصورة على جهازك. لم يُرسل إلا النص الذي راجعته للشرح.",
      announce: {
        photoAdded: "تمت إضافة الصورة. راجع لغة التقرير، وبعدين اقرأ الصورة.",
        ready: "النص جاهز. راجعه قبل ما تبعته.",
        readyElsewhere: "نص صورتك جاهز. ارجع لوضع الصورة علشان تراجعه.",
        removed: "تمت إزالة الصورة.",
        modePhoto: "وضع الصورة.",
        modeText: "وضع النص.",
        pasteInstead: "وضع النص. الصق أو عدّل نص التقرير.",
        startOver: "بدأنا من جديد.",
      },
    },
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
    photoErrors: {
      title: "مقدرناش نشرح النص اللي في الصورة",
      network:
        "في مشكلة في الاتصال. صورتك لسه على جهازك. اتأكد من الإنترنت وجرّب تاني.",
      timeout:
        "شرح النص خد وقت أطول من المتوقع. صورتك لسه على جهازك. جرّب تاني.",
      rateLimit: "في محاولات كتير في وقت قصير. استنى شوية وجرّب تاني.",
      dailyQuota:
        "خدمة الشرح المجانية خلصت نصيبها اليومي من الطلبات، فالشرح الجديد متوقف لحد ما يعمل تحديث يومي. جرّب تاني بعدين.",
      server:
        "حصلت مشكلة عندنا وإحنا بنشرح النص. صورتك لسه على جهازك. جرّب تاني بعد شوية.",
      ai: "خدمة الشرح مش متاحة دلوقتي. جرّب تاني بعد شوية.",
      invalid: "النص مش مقبول. راجعه وجرّب تاني.",
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
      "CardioBridge AI مساعد للمصطلحات الطبية، مش تشخيص مؤكد أو علاج. لو حاسس إنك تعبان جدًا، اطلب مساعدة الطوارئ في بلدك.",
    brand: "CardioBridge AI — لغة طبية واضحة باللغتين.",
  },
  report: {
    titleEnglish: "Clinical assessment",
    titleArabic: "تقييم سريري",
    brand: "CardioBridge AI",
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
      "CardioBridge AI is a medical terminology aid, not a confirmed diagnosis or treatment.",
    footerArabic: "CardioBridge AI مساعد للمصطلحات الطبية، مش تشخيص مؤكد أو علاج.",
  },
};

export const dictionaries: Record<Locale, Copy> = { en, ar };
