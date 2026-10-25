# EchoBridge photo input — UX specification

**Status:** ready for implementation
**Owner:** @uiux
**Scope:** `EchoBridgeView` and the copy in `src/i18n/copy.ts`
**Contract:** photo is read on-device with Tesseract.js; only reviewed text plus `source: "photo"` goes to the existing AI text endpoint.

---

## 1. Summary and constraints

### What changes

- Photo becomes the default input mode. Text stays visible and one tap away.
- The user chooses/takes/drops one photo, previews it, picks the report language, and starts OCR explicitly.
- OCR runs on-device. The photo is never uploaded or stored. The extracted text appears in an editable textarea for review.
- Only the reviewed text is sent for explanation, with `source: "photo"`.
- The result says it was read from a photo, and repeats the privacy fact.
- The text mode, its sample button, loading card, result card, and errors keep working unchanged.

### Non-goals

- No vision model, no server-side OCR, no image upload endpoint.
- No safety/triage layer, no diagnosis framing, no red-flag cards.
- No copy-summary button.
- No new design system, colors, fonts, or shadows.
- No camera stream UI. The OS camera/file picker is used through a file input.
- No batch upload, no multi-page reports, no PDF.

### Hard constraints

- **Privacy copy must be literally true.** The image bytes stay in the browser. Tesseract engine and language data are fetched from jsDelivr; that is network traffic but not user image data. The extracted text is POSTed to `/api/echo` and forwarded to the AI provider.
- Never write "nothing leaves your device" or "your photo is never shared". The accurate claim is: the photo is not uploaded or stored; only the checked text is sent.
- The UI must not mention the CDN. The privacy note is about the image, not about the OCR assets.
- Existing tokens and components only: `Button`, `Badge`, `Card`, `Textarea`, `ErrorResults`, `DemoNotice`, `LiveRegion`; Tailwind tokens `bg-brand`, `bg-brand-soft`, `bg-brand-mist`, `text-ink`, `text-bodytext`, `border-line`, `shadow-soft`, `text-urgent`, `bg-urgent-soft`, `border-urgent-border`, `text-caution-ink`, `bg-caution-soft`, `border-caution-border`, `bg-page`.
- Mobile-first, RTL-safe, keyboard-operable, screen-reader-friendly.
- No real patient data in examples, alt text, filenames, or test fixtures. Use synthetic text only.

### Success statement

A first-time mobile user can go from "I have a printed echo report" to "I checked the text and got an explanation" without typing, and can explain afterwards that the photo never left the phone.

---

## 2. User flow

### 2.1 Default photo flow

1. EchoBridge opens in **Photo** mode. The Photo segment is selected and first in DOM order. Text is visible next to it.
2. The panel shows the title, help, dropzone, report-language selector (default: app locale — `ar` → Arabic, otherwise English), privacy note, and collapsed tips.
3. The user either:
   - taps **Take a photo** (camera input, `capture="environment"`),
   - taps **Choose a photo** (gallery/file picker),
   - or drags one image onto the dropzone (desktop).
4. The file is validated locally: image MIME, decodable, ≤ 10 MB.
5. The dropzone is replaced by the preview: image, size + dimensions, report-language selector, actions, privacy note.
6. The user checks/changes **Report language**, then taps **Read the photo**.
7. The progress card appears: preparing the reader → loading language data → reading the photo with percent. The photo remains visible above.
8. On success the extracted text card appears. Focus moves to the editable textarea. The card says "Check the text before you send it", shows low-confidence and trimming warnings if needed, and the character count.
9. The user corrects text, removes names, and taps **Explain this report**. The button shows `submitting` copy and a spinner. The editor is disabled while the request runs.
10. The result appears below: DemoNotice if mock, then the summary card with a **Read from photo** badge, source help, privacy line, terms table, and the unchanged non-diagnostic note.
11. **Start over** resets the analysis, both drafts, and the photo, keeps the current mode, and focuses that mode's first control.

Selecting a photo does **not** start OCR automatically. The explicit Read step exists so the language choice is deliberate and the user is not surprised by CPU work.

### 2.2 Text flow

Unchanged, with one copy change (`label` becomes "Report text") and the new mode switch above the form:

1. Switch to **Text**.
2. Paste text or use the sample.
3. Submit. Existing validation, loading, result, and error behavior.

The text draft survives switching to Photo and back. The photo draft and extracted text survive switching to Text and back.

### 2.3 Mode switching

- Both panels stay mounted and are toggled with `hidden`. This preserves drafts, keeps `aria-controls` targets valid, and lets OCR finish if the user leaves Photo.
- Switching modes does not copy text between drafts. Only **Paste the text instead** transfers anything.
- Switching is disabled while the AI request is loading. It is allowed while OCR is running; OCR continues and the completion announcement changes to "Switch to Photo to check it".
- Switching modes while an AI error is shown clears the error card (not the drafts), so a retry cannot resend the other mode's request. Clear `confirmAction` and `validationError` on any mode switch.
- Focus stays on the pressed mode button. The newly visible panel is the next tab stop.
- Each mode button is a toggle with `aria-pressed`; the group has an accessible name. It is not a tablist (the app already uses a tablist for top-level views).

### 2.4 Error and recovery flows

| Situation | What the user sees | Primary recovery | Secondary recovery |
| --- | --- | --- | --- |
| Submit with no photo (defensive form guard) | Inline alert under the dropzone: "Add a photo of the report first." | Take a photo | Choose a photo |
| Photo selected, not read, form submitted by Enter | Inline alert: "Read the photo before you send it." | Read the photo | — |
| Wrong file type / undecodable | Inline alert: unsupported type | Choose another photo | Paste the text instead |
| File > 10 MB | Inline alert: too large | Choose another photo | Paste the text instead |
| Offline before OCR | Inline alert: offline | Try again | Paste the text instead |
| Engine/language data failed to load | Inline alert: reader couldn't load | Try again | Paste the text instead |
| Recognition crashed | Inline alert: couldn't read this photo | Read again | Paste the text instead |
| Extracted text < 10 characters | Inline alert: not enough text | Read again | Paste the text instead |
| Text deleted below 10 chars after success | Inline validation under the textarea | Focus textarea, edit | — |
| AI request failed | Existing `ErrorResults`, using `photoErrors` | Try again | — (editor remains above) |

Rules:

- OCR errors never discard the photo. The preview and **Read again** stay available.
- **Choose another photo** removes the current file and opens the gallery picker in the same click. If the browser blocks the programmatic picker, show the empty dropzone and focus **Choose a photo**.
- `Paste the text instead` switches to Text, transfers the extracted text if one exists, focuses the textarea, and announces the mode change.
- AI retry resends the current editor text, not a stale snapshot. If the frontend keeps `retry()` from the hook, it must first update the stored request text when the editor changes, or call `analyze(currentText, locale)` directly.
- The photo is still on the device after any error. The photo error copy says so where it helps.

### 2.5 Mode state machine

```
Photo (default)
  ├─ no file ──select/drop──> file ready
  │                              ├─ Read ──> preparing ──> recognizing ──> done
  │                              │                                      └─ error
  │                              ├─ Remove ──> no file
  │                              └─ language change ──> file ready (hint if previously read)
  ├─ done ──edit──> done (dirty)
  │        ├─ Read again ──dirty? confirm──> preparing
  │        ├─ Remove ──dirty? confirm──> no file
  │        └─ Submit ──> AI loading ──> result / AI error
  └─ error ──Read again / Choose another / Paste instead

Text
  ├─ paste/sample ──> Submit ──> AI loading ──> result / AI error
  └─ Start over ──> empty text, current mode kept
```

---

## 3. Component structure and state model

### 3.1 Tree

```
EchoBridgeView
├─ LiveRegion (polite announcements)
├─ header (h1 + subtitle)
├─ EchoModeSwitch
│   ├─ Button (Camera, Photo, aria-pressed)
│   └─ Button (FileText, Text, aria-pressed)
├─ form (noValidate, aria-labelledby="echo-title", aria-busy)
│   ├─ section#echo-panel-photo (hidden when mode=text)
│   │   ├─ Card (photo panel)
│   │   │   ├─ h2 + help
│   │   │   ├─ EchoPhotoDropzone        (no file)
│   │   │   │   ├─ hidden file inputs (gallery + camera)
│   │   │   │   ├─ ImagePlus, title, hint, formats
│   │   │   │   ├─ Button Take a photo
│   │   │   │   └─ Button Choose a photo
│   │   │   ├─ EchoPhotoPreview         (file ready)
│   │   │   │   ├─ h3 Selected photo + img
│   │   │   │   └─ metadata (size · dimensions)
│   │   │   ├─ EchoReportLanguageSelect
│   │   │   ├─ preview actions: Read / Read again, Remove  (file ready)
│   │   │   ├─ inline confirm (dirty re-read/remove)
│   │   │   ├─ EchoPhotoError            (error slot)
│   │   │   ├─ privacy note
│   │   │   └─ details Tips
│   │   ├─ EchoOcrProgress              (running)
│   │   └─ Card Extracted text          (done)
│   │       ├─ h2 + help
│   │       ├─ low-confidence / trimmed warnings
│   │       ├─ label + Textarea + count
│   │       └─ Button Submit
│   └─ section#echo-panel-text (hidden when mode=photo)
│       └─ Card (existing text form, label now "Report text")
├─ loading card (existing, copy switches by source)
├─ ErrorResults (messages = photoErrors when submittedSource=photo)
└─ result block (existing + photo badge/help/privacy)
```

### 3.2 Components

| Component | Suggested file | Responsibility | Reuses |
| --- | --- | --- | --- |
| `EchoModeSwitch` | `src/components/echo/echo-mode-switch.tsx` | Two-button segmented control, default Photo, `role="group"`, `aria-pressed`, `aria-controls`, disabled during AI loading | `Button`, `Camera`, `FileText` |
| `EchoPhotoPanel` | `src/components/echo/echo-photo-panel.tsx` | Photo heading, help, language field, dropzone/preview, error slot, privacy, tips | `Card` |
| `EchoPhotoDropzone` | `src/components/echo/echo-photo-dropzone.tsx` | Drag/drop, two hidden inputs, Take/Choose buttons, formats, drag-active state | `Button`, `ImagePlus`, `Camera`, `ImageUp` |
| `EchoPhotoPreview` | `src/components/echo/echo-photo-preview.tsx` | Preview image, alt, metadata, actions, inline confirm | `Button`, `ScanText`, `Trash2` |
| `EchoReportLanguageSelect` | `src/components/echo/echo-report-language-select.tsx` | Label, native select, help, changed-after-read hint | native `<select>`, `ChevronDown` |
| `EchoOcrProgress` | `src/components/echo/echo-ocr-progress.tsx` | Stage list, progressbar, percent, hint, focus target | `Loader2`, `Check` |
| `EchoExtractedText` | `src/components/echo/echo-extracted-text.tsx` | Heading, help, warnings, label, textarea, count, submit | `Card`, `Textarea`, `Button`, `AlertTriangle`, `ScanText` |
| `EchoPhotoError` | `src/components/echo/echo-photo-error.tsx` | Inline alert, message, max two recovery actions | `Button`, `AlertCircle` |
| `useEchoPhotoOcr` | `src/hooks/use-echo-photo-ocr.ts` | File validation, preview URL lifecycle, Tesseract worker, progress, confidence, raw text, truncation, errors | Tesseract.js |
| `EchoBridgeView` | existing | Mode, language, editable draft, dirty tracking, submit source, announcer, focus | `useEchoAnalysis`, `useAnnouncer` |

Icons: `Camera`, `FileText`, `ImagePlus`, `ImageUp`, `ScanText`, `ShieldCheck`, `AlertTriangle`, `AlertCircle`, `RotateCcw`, `Trash2`, `Loader2`, `Check`, `ChevronDown`, `ClipboardPaste`, `HeartPulse` (existing), `Info` (existing).

### 3.3 State model

View-level:

| State | Type | Initial | Notes |
| --- | --- | --- | --- |
| `mode` | `"photo" \| "text"` | `"photo"` | Not persisted across reloads |
| `reportLanguage` | `"eng" \| "ara" \| "eng+ara"` | locale default | Set once on mount; app language changes do not overwrite it |
| `text` | `string` | `""` | Text-mode draft |
| `extractedText` | `string` | `""` | Editable OCR draft |
| `editorBaseline` | `string` | `""` | The trimmed OCR text first inserted into the editor; `dirty` compares against this, not the untrimmed raw text |
| `validationError` | `string \| null` | `null` | Localized message; cleared on edit |
| `submittedSource` | `"text" \| "photo" \| null` | `null` | Set at submit; drives loading copy, error copy, and retry. The successful result reads `analysis.source` instead |
| `confirmAction` | `"reread" \| "remove" \| null` | `null` | Only when draft is dirty |
| `languageChangedSinceRead` | `boolean` | `false` | True when language changes after a successful read |

OCR-level (hook):

| State | Type | Initial | Notes |
| --- | --- | --- | --- |
| `file` | `File \| null` | `null` | One at a time |
| `previewUrl` | `string \| null` | `null` | `URL.createObjectURL`; revoke on replace/remove/unmount |
| `meta` | `{ width, height, bytes } \| null` | `null` | No filename stored or shown |
| `status` | `"idle" \| "preparing" \| "recognizing" \| "done" \| "error"` | `"idle"` | `done` only when the trimmed OCR text is at least 10 characters; shorter results become `error` + `notEnoughText` |
| `stage` | `"engine" \| "language" \| "recognizing" \| null` | `null` | Maps Tesseract logger |
| `percent` | `number \| null` | `null` | 0–100; only during recognizing |
| `confidence` | `number \| null` | `null` | Mean word confidence 0–100 |
| `rawText` | `string` | `""` | Full OCR output before trim |
| `truncated` | `boolean` | `false` | True when rawText > 4,000 |
| `error` | `PhotoErrorKind \| null` | `null` | `unsupportedType`, `tooLarge`, `offline`, `prepareFailed`, `readerFailed`, `notEnoughText` |

Derived:

- `ocrRunning = status === "preparing" || status === "recognizing"`.
- `aiLoading = echoStatus === "loading"`.
- `dirty = extractedText !== editorBaseline`.
- `showEditor = status === "done"` (the hook only sets `done` when the trimmed text is at least 10 characters, so deleting text later does not unmount the editor).
- `canRead = file && !ocrRunning && !aiLoading`.
- `canSubmitPhoto = showEditor && !aiLoading`; submit-time validation handles a draft that has since dropped below 10 characters.
- `submitSource = mode` at submit time; send it as `source` and store it in `submittedSource`. `submittedSource` covers loading, error copy, and retry; the result's badge, help, and privacy come from `analysis.source`.

### 3.4 Tesseract stage mapping

| Tesseract logger status | UI stage | Progress |
| --- | --- | --- |
| `loading tesseract core`, `initializing tesseract` | engine | indeterminate |
| `loading language traineddata`, `initializing api` | language | indeterminate |
| `recognizing text` | recognizing | `round(progress * 100)` |

- Clamp percent so it never decreases.
- On a second read with a warm worker, mark engine/language complete immediately and show recognizing.
- Low confidence: mean word confidence below 70 shows `lowConfidence`; it never blocks submit. If Tesseract returns no confidence, do not show the warning.
- Announce stage changes and the 25/50/75/100 buckets only. Do not put `aria-live` on the percent.
- Engine and language data are fetched from jsDelivr. A network failure surfaces as `prepareFailed` (or `offline` when `navigator.onLine === false`). This is the only network step before the AI request; the image itself is never sent.

### 3.5 Trimming

- If OCR text exceeds 4,000 characters, keep the first 4,000, cut at the last newline at or before 4,000 (hard cut if none), and trim trailing whitespace.
- Set `truncated = true`, show the caution warning, and let the user edit. Never silently submit a truncated report.
- The textarea keeps `maxLength={MAX_ECHO_TEXT_LENGTH}`. The warning stays until re-read or remove.

### 3.6 Data contract

- The client sends `{ text, locale, source }`: `source: "photo"` for photo-origin submits and `source: "text"` for typed submits.
- `echoRequestSchema` validates `source` against `echoSourceSchema` (`"text" | "photo"`) and defaults it to `"text"`; `echoAnalysisSchema` requires it, and the route copies the request value onto `analysis.source`. Any other value is rejected with a 400 and `{ error }`.
- The successful result uses `analysis.source` for the badge, `resultHelp`, and `resultPrivacy`. `submittedSource` stays in view state for loading copy, error copy, and retry, because no analysis exists at those moments. It is no longer the source of truth for the result.
- The route also picks the live notice by source: `meta.notice` is `ECHO_PHOTO_LIVE_NOTICE` when `source === "photo"` and `ECHO_LIVE_NOTICE` otherwise; mock mode always uses `ECHO_DEMO_NOTICE`. The UI does not render `meta.notice` today, so the client `resultHelp` and `resultPrivacy` strings stay as specified.
- The AI prompt receives the text and the source; the source only selects the photo-specific prompt note. Do not send the image, the filename, dimensions, or OCR confidence.

---

## 4. Copy

### 4.1 Voice rules

- UI actions and progress: Egyptian Arabic, matching the existing echo copy ("هنشرحلك", "جرّب تاني").
- Privacy and data-flow statements: clear MSA, no colloquial shortcuts. These are the sentences users will quote when deciding whether to trust the feature.
- Medical framing: unchanged. The non-diagnostic note stays exactly as it is.
- Do not say the AI read the photo. The OCR read the photo; the AI read the checked text.
- Do not promise perfect OCR. Warnings and recovery copy acknowledge mistakes without blaming the user.
- No uppercase or letter-spacing on Arabic. No italics.

### 4.2 Updated existing echo strings

| Key | Current EN | New EN | New AR | Why |
| --- | --- | --- | --- | --- |
| `echo.subtitle` | Paste an echocardiography report and get plain-language explanations of what it says. | Take a photo of a printed echocardiography report or paste its text, and get plain-language explanations of what it says. | صوّر تقرير إيكو مطبوع أو الصق نصه، وهنشرحلك اللي فيه بلغة بسيطة. | Photo is now the default; text is still named |
| `echo.label` | Echocardiography report | Report text | نص التقرير | The label belongs to the text-mode textarea only; the photo panel has its own heading |
| `echo.placeholder` | Paste the report text here… | unchanged | unchanged | Still accurate |
| `echo.note` | This explains terminology only; it is not a diagnosis. Discuss the report with your cardiologist. | unchanged | unchanged | Required non-diagnostic note; do not touch |
| `echo.validation` | Paste at least 10 characters from the report. | unchanged | unchanged | Text mode only; photo mode has `photo.tooShort` |
| `echo.submitting` | Explaining your report… | unchanged | unchanged | Text mode only; photo mode has `photo.submitting` |
| `echo.errors` | existing object | unchanged | unchanged | Text mode only; photo mode uses `photoErrors` |

`echo.title`, `sample`, `sampleLabel`, `sampleText`, `submit`, `summaryTitle`, `termsTitle`, `termsCount`, `empty`, `startOver`, `charCount`, `termEn`, `termAr`, `explanation` are unchanged.

### 4.3 New English keys

Add `mode` and `photo` under `echo`, and `photoErrors` as a sibling of `errors`. Functions use the existing `formatNumber` import.

```ts
echo: {
  // ...existing keys, with subtitle and label updated above...

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
    languageChanged: "You changed the report language. Read the photo again to apply it.",

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
    recognizing: (percent: number) => `Reading the photo… ${formatNumber(percent)}%`,
    progressLabel: "Reading the report photo",
    progressEngine: "Preparing the reader",
    progressLanguage: "Loading language data",
    progressRecognizing: (percent: number) =>
      `Reading the photo, ${formatNumber(percent)}%`,
    progressHint: "This can take a few seconds on a phone. Keep this screen open.",

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
    unsupportedType: "That file type is not supported. Use a JPG, PNG, or WebP photo.",
    tooLarge: "This photo is larger than 10 MB. Try a smaller photo or take a new one.",
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
      readyElsewhere: "Text from your photo is ready. Switch to Photo to check it.",
      removed: "Photo removed.",
      modePhoto: "Photo mode.",
      modeText: "Text mode.",
      pasteInstead: "Text mode. Paste or edit the report text.",
      startOver: "Started over.",
    },
  },

  photoErrors: {
    title: "We couldn't explain the text from the photo",
    network:
      "There seems to be a connection problem. Your photo is still on this device. Check your internet connection and try again.",
    timeout:
      "Explaining the text took longer than expected. Your photo is still on this device. Please try again.",
    rateLimit: "Too many requests in a short time. Please wait a moment and try again.",
    dailyQuota:
      "The free explanation service has used its daily request allowance, so new explanations are paused until the daily reset. Please try again later.",
    server:
      "Something went wrong on our side while explaining the text. Your photo is still on this device. Please try again shortly.",
    ai: "The explanation service is unavailable right now. Please try again shortly.",
    invalid: "The text couldn't be accepted. Please check it and try again.",
    unexpected: "The service returned an unexpected response. Please try again.",
    retry: "Try again",
  },
}
```

### 4.4 New Arabic keys

```ts
echo: {
  // ...existing keys, with subtitle and label updated above...

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
    recognizing: (percent: number) => `بنقرأ الصورة… ${formatNumber(percent)}%`,
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

  photoErrors: {
    title: "مقدرناش نشرح النص اللي في الصورة",
    network:
      "في مشكلة في الاتصال. صورتك لسه على جهازك. اتأكد من الإنترنت وجرّب تاني.",
    timeout: "شرح النص خد وقت أطول من المتوقع. صورتك لسه على جهازك. جرّب تاني.",
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
}
```

### 4.5 Copy decisions to preserve

- **"Read on this device"** is the privacy headline. It is true and short. The body then makes the two separate claims: image not uploaded/stored, text is sent.
- **"Only the text you check below is sent"** is the precise boundary. Do not shorten to "only the text is sent" without "you check" — the review step is the point.
- **"Remove names and personal details before you send it"** is an instruction, not a guarantee. It must stay.
- **"Your photo is still on this device"** in AI errors reassures without claiming the request failed locally.
- **"Read from photo"** is the result badge. It describes OCR, not AI vision. Do not use "AI read your photo".
- **"Text read from the photo"** is the textarea label. It makes clear the text is a transcription, not an AI summary.
- **`photoErrors` must match the `ErrorMessages` shape exactly**: `title`, `network`, `timeout`, `rateLimit`, `dailyQuota`, `server`, `ai`, `invalid`, `unexpected`, `retry`.
- **Arabic privacy block is MSA**; the rest of the photo UI is Egyptian. Do not mix within one sentence.
- **Numbers**: character count and OCR percent use `formatNumber` (Latin digits), consistent with the existing `charCount`. Prose numbers (10 MB, 4,000 chars) use Arabic-Indic in Arabic copy, matching existing `validation` ("١٠ حروف") and `sampleText`.

---

## 5. Layout, spacing, typography

### 5.1 Existing tokens only

| Token | Value | Use |
| --- | --- | --- |
| `bg-page` | `#F7FAF9` | Preview image backdrop, page |
| `bg-brand-soft` | `#F1F6F4` | Dropzone, progress card, privacy note, active secondary surfaces |
| `bg-brand-mist` | `#E6F2EF` | Dropzone drag-over |
| `bg-brand` | `#0F766E` | Selected mode, progress fill, primary actions |
| `text-ink` | `#162220` | Headings, values |
| `text-bodytext` | `#55645F` | Help, metadata, counts |
| `border-line` | `#E3EAE7` | Cards, dividers, dashed dropzone |
| `shadow-soft` | existing | Cards only |
| `bg-caution-soft` / `border-caution-border` / `text-caution-ink` | existing | Low confidence, trimmed, non-diagnostic note |
| `bg-urgent-soft` / `border-urgent-border` / `text-urgent-ink` / `text-urgent` | existing | Photo errors, destructive remove |

No gradients. No new radius or shadow. Cards `rounded-2xl` (16px), buttons/inputs `rounded-xl` (12px), inner elements `rounded-lg` (8px).

### 5.2 Page composition

```
mx-auto w-full max-w-[880px] px-5 pt-10 sm:px-6 sm:pt-12 lg:px-8   (existing shell)

h1 27/34 → sm 34/1.15
subtitle mt-3 max-w-[620px] text-[15px] leading-7

EchoModeSwitch        mt-6
form                  mt-4
  Card photo/text     p-5 sm:p-6
  Card editor         mt-4 p-5 sm:p-6   (photo, after OCR)
  AI loading          mt-6
  ErrorResults        mt-6
  result              mt-8 flex flex-col gap-5
```

Mobile is a single column. Desktop keeps the same column; the 880px measure is intentional. Do not add a two-column layout for the form.

### 5.3 Mode switch

- Container: `grid w-full grid-cols-2 gap-1 rounded-xl border border-line bg-white p-1 shadow-soft sm:max-w-[320px]`.
- Buttons: `h-11 rounded-lg px-3 text-[13.5px] font-semibold` via `Button`; active `primary`, inactive `ghost`.
- Icons: `Camera` / `FileText`, `h-4 w-4`, `aria-hidden`.
- Photo is first in DOM and selected by default. In RTL it appears on the right, which is the correct reading start.
- Do not use a tablist. Use `role="group"` + `aria-pressed` + `aria-controls`.
- Touch target is 44px. The group is full width on mobile and 320px on `sm+`.
- No "Recommended" badge. Default selection plus first position is enough; a badge adds noise and does not translate well at 320px.

### 5.4 Photo panel — empty state

- Card: `rounded-2xl border border-line bg-white p-5 shadow-soft sm:p-6`.
- `h2`: `font-display text-[17px] font-semibold text-ink sm:text-lg`, same as the existing text label.
- Help: `mt-1.5 text-[13px] leading-6 text-bodytext`.
- Dropzone: `mt-4 rounded-2xl border-2 border-dashed border-line bg-brand-soft px-5 py-7 text-center sm:px-8 sm:py-9`; `min-h-[196px] sm:min-h-[220px]`; drag-over `border-brand bg-brand-mist`.
- Icon circle: `mx-auto grid h-12 w-12 place-items-center rounded-full border border-line bg-white text-brand`; `ImagePlus` `h-5 w-5`.
- Title: `mt-3 text-[14.5px] font-semibold text-ink`.
- Hint: `mt-1 text-[12.5px] leading-6 text-bodytext`. Show `dropHint` at `sm+` and `mobileHint` below `sm` (two spans, one `hidden sm:block`).
- Formats: `mt-1 text-[11.5px] leading-5 text-bodytext`.
- Buttons: `mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center`; each `w-full sm:w-auto`. **Take a photo** primary with `Camera`; **Choose a photo** secondary with `ImageUp`.
- Drag-active title swaps to `dropNow`; no other animation.
- The dropzone is not focusable. The two buttons are the keyboard path. Drag/drop is an enhancement.
- Hidden inputs: `accept="image/*"` for gallery; `accept="image/*" capture="environment"` for camera; `sr-only`, `tabIndex={-1}`, `aria-hidden="true"`. The visible buttons call `.click()`. Reset `input.value` after each selection so the same file can be chosen again.
- After a file is selected, the dropzone is replaced by the preview. Dropping onto the preview does nothing; the user must Remove first. This prevents accidental replacement and data loss.

### 5.5 Photo panel — preview

- `h3` "Selected photo": `font-display text-[15px] font-semibold text-ink`, `tabIndex={-1}` as the focus target after selection.
- Image frame: `mt-3 rounded-xl border border-line bg-page p-3`; image `mx-auto max-h-[240px] w-auto max-w-full rounded-lg object-contain sm:max-h-[300px]`.
- Preview alt: generic `previewAlt`. Never use the filename, OCR text, or patient details as alt.
- Metadata: `mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-bodytext`; content is `<span dir="ltr">2.4 MB · 1842 × 2560 px</span>`; the label is `sr-only` `metaLabel`. Format bytes with one decimal for MB and no decimals for KB; format dimensions with `formatNumber` and a `px` suffix. Omit the filename deliberately.
- Report language field: `mt-4`. On `sm+`, wrap the label/help block and the select in `sm:flex sm:items-end sm:justify-between sm:gap-4`; the select aligns to the bottom. Label `text-[13px] font-semibold text-ink`; help `mt-1 text-[12px] leading-5 text-bodytext`; select `h-11 w-full rounded-xl border border-line bg-white px-3.5 pe-9 text-[15px] text-ink sm:w-[240px]`, `appearance-none`, custom `ChevronDown` at `end-3`, focus ring `border-brand ring-2 ring-brand/20`. Disabled during OCR/AI loading.
- `languageChanged` hint: `mt-1.5 text-[12px] leading-5 text-brand`, `role="status"`, only when language changed after a successful read.
- Actions: `mt-4 grid grid-cols-2 gap-2 sm:flex sm:justify-end`.
  - Before OCR: **Read the photo** primary (`ScanText`), **Remove photo** ghost destructive.
  - During OCR: both disabled.
  - After success: **Read again** secondary (`RotateCcw`), **Remove photo** ghost destructive (`Trash2`).
  - After error: **Read again** secondary, **Remove photo** ghost.
- Destructive ghost: `text-urgent hover:bg-urgent-soft`, no border.
- Inline confirm (only when dirty): `mt-3 rounded-xl border border-caution-border bg-caution-soft p-3`; text `text-[12.5px] leading-6 text-caution-ink`; actions `mt-2 flex flex-wrap gap-2`; confirm action `secondary` with caution styling, cancel `ghost`. Focus the confirm action; Escape cancels and returns focus to the original button.
- Privacy note: `mt-4 flex items-start gap-2.5 rounded-xl border border-line bg-brand-soft px-4 py-3`; `ShieldCheck` `h-4 w-4 text-brand mt-0.5`; title `text-[12.5px] font-semibold text-ink`; body `mt-0.5 text-[12.5px] leading-6 text-bodytext`.
- Tips: `<details class="mt-3">`; `<summary class="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded text-[12.5px] font-semibold text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-white">`; native marker; list `mt-2 list-disc space-y-1 ps-5 text-[12px] leading-6 text-bodytext`.
- `oneAtATime` note: `mt-2 text-[11.5px] text-bodytext`, `role="status"`, only after a multi-file drop.

Empty-state order: heading → help → dropzone → language field → error slot → privacy → tips.
Selected-state order: heading → help → preview → language field → actions → confirm → error slot → privacy → tips.
This keeps the focus order logical: preview heading → language → Read.

### 5.6 OCR progress

- Card: `mt-4 rounded-xl border border-line bg-brand-soft p-4 sm:p-5`, `tabIndex={-1}`, `aria-labelledby="echo-ocr-progress-label"`.
- Add a visually hidden `<p id="echo-ocr-progress-label" class="sr-only">{progressLabel}</p>`; both the card and the progressbar use it.
- Header: `Loader2` `h-4 w-4 animate-spin text-brand motion-reduce:animate-none` + current stage text `text-[13.5px] font-semibold text-ink`.
- Stage list (visual, `aria-hidden="true"`): `mt-3 space-y-1.5 text-[12px]`.
  - Done: `Check` `h-3.5 w-3.5 text-brand` + `text-bodytext`.
  - Current: `Loader2` spinner + `font-semibold text-ink`.
  - Upcoming: `text-bodytext` normal weight.
- Track: `mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white`; fill `h-full rounded-full bg-brand transition-[width] duration-300 motion-reduce:transition-none`.
- Indeterminate (engine/language): fill `w-full bg-brand/20 animate-pulse motion-reduce:animate-none`; no `aria-valuenow`; `aria-valuetext` is the stage label.
- Determinate: `width: ${percent}%`; `aria-valuenow={percent}`.
- Percent line: `mt-2 text-[11.5px] tabular-nums text-bodytext`; visible text uses `recognizing(percent)`; if bidi places the percent oddly, wrap the numeral in `<bdi dir="ltr">`.
- Hint: `mt-1 text-[11.5px] leading-5 text-bodytext`.
- `role="progressbar"` on the track, `aria-labelledby="echo-ocr-progress-label"`, `aria-valuemin={0}`, `aria-valuemax={100}`. When determinate, `aria-valuenow={percent}` and `aria-valuetext={progressRecognizing(percent)}`; when indeterminate, omit `aria-valuenow` and set `aria-valuetext` to `progressEngine` or `progressLanguage`.
- The card is the focus target after Read/confirm. It is not itself a live region; announcements go through `LiveRegion`.

### 5.7 Extracted text card

- Card: `mt-4 rounded-2xl border border-line bg-white p-5 shadow-soft sm:p-6`; `scroll-mt-24`.
- `h2`: `font-display text-[17px] font-semibold text-ink sm:text-lg`.
- Help: `mt-1.5 text-[13px] leading-6 text-bodytext`, id for `aria-describedby`.
- Warnings: `mt-4 flex items-start gap-2.5 rounded-xl border border-caution-border bg-caution-soft px-4 py-3 text-[12.5px] leading-6 text-caution-ink`; `AlertTriangle` `h-4 w-4 mt-0.5 shrink-0`. Stack low-confidence then trimmed with `gap-2`.
- Label: `mt-4 block text-[13px] font-semibold text-ink`; id on the textarea.
- Textarea: existing `Textarea`, `mt-2`, `min-h-[180px] sm:min-h-[220px]`, `dir="auto"`, `maxLength={4000}`, placeholder `extractedPlaceholder`.
- Count row: `mt-2 flex items-center justify-between gap-3`; count `text-[11.5px] tabular-nums text-bodytext`, `dir="ltr" lang="en"`, `sm:text-end`.
- `tooShort` validation: `mt-2 text-[12.5px] font-medium text-urgent`, `role="alert"`; focus the textarea and set `aria-invalid`.
- Submit: `mt-5 w-full`, `size="lg"`, `ScanText` icon (not `HeartPulse`), label `submit` / `submitting`. Disabled only while AI loading. Validate on submit; do not disable for short text.
- Optional `animate-fade-up motion-reduce:animate-none` on the card when it first appears. Do not animate on every edit.

### 5.8 Photo errors

- Slot: after the preview/dropzone actions and before the privacy note; `mt-3`.
- Container: `flex items-start gap-2.5 rounded-xl border border-urgent-border bg-urgent-soft px-4 py-3`, `role="alert"`, `aria-labelledby` the message id.
- Icon: `AlertCircle` `h-4 w-4 text-urgent mt-0.5 shrink-0`.
- Message: `text-[12.5px] leading-6 text-urgent-ink`.
- Actions: `mt-3 flex flex-wrap gap-2`; primary recovery `secondary` size `sm` (white on soft red), paste `ghost` size `sm` with `text-urgent-ink hover:bg-white/60`.
- Max two actions. Do not show both "Read again" and "Try again" for the same failure.
- The AI error keeps using `ErrorResults` below the form; it is not duplicated inline.

### 5.9 Result additions

- Header row: `flex flex-wrap items-center gap-2` for `h2` + `Badge variant="teal"` with `ScanText` `h-3 w-3`.
- Badge: `Read from photo`, only when `analysis.source === "photo"`. `aria-label` not needed; the text is visible.
- `resultHelp`: `mt-1 text-[12.5px] text-bodytext`, only when `analysis.source === "photo"`.
- Terms count: existing `mt-1 text-[12.5px] text-bodytext`.
- Summary box: unchanged.
- `resultPrivacy`: inside the summary card, after the summary box, `mt-3 flex items-start gap-2 border-t border-line pt-3 text-[11.5px] leading-5 text-bodytext`; `ShieldCheck` `h-3.5 w-3.5 text-brand mt-0.5 shrink-0`; only when `analysis.source === "photo"`. This is not a caution banner.
- The non-diagnostic note at the bottom is unchanged and remains the only caution banner in the result.
- Start over unchanged in position.

### 5.10 Text mode

- Card: existing form card, `mt-0` inside the form; the form itself has `mt-4`.
- Label becomes `echo.label` ("Report text"), same 17/18px style.
- Textarea, sample button, count, validation, submit, loading, errors, result all unchanged.
- No photo elements in this panel. The mode switch is the only addition above it.

### 5.11 Responsive behavior

| Element | < 640px | ≥ 640px | ≥ 1024px |
| --- | --- | --- | --- |
| Mode switch | full width, 2 columns | 320px, 2 columns | same |
| Card padding | 20px | 24px | 24px |
| Dropzone | stacked, full-width buttons, 196px min | row buttons, 220px min | same |
| Preview image | max 240px tall | max 300px tall | same; centered |
| Language select | full width | 240px, right-aligned in the settings row | same |
| Preview actions | 2-column grid | row, end-aligned | same |
| Progress stages | 3 rows | 3 rows | same |
| Editor textarea | 180px min | 220px min | same |
| Result | existing single column | existing | existing |

Do not introduce horizontal scrolling at 320px. The mode labels, language option "English + Arabic", and "Remove photo" must fit at 13–14px; if Arabic "إنجليزي + عربي" overflows the 240px select, let the native select truncate with ellipsis rather than widening the row.

### 5.12 Motion

- Spinners: `animate-spin motion-reduce:animate-none`.
- Progress width: 300ms, `motion-reduce:transition-none`.
- Indeterminate track: `animate-pulse motion-reduce:animate-none`.
- Optional card entrance: `animate-fade-up motion-reduce:animate-none`.
- No parallax, no confetti, no scanning laser animation. The progress bar and stage list are enough.

---

## 6. Accessibility

### 6.1 Semantics

| Element | Role / element | Notes |
| --- | --- | --- |
| Mode switch | `div role="group" aria-label={mode.groupLabel}` | Two `Button` toggles with `aria-pressed`, `aria-controls` |
| Photo panel | `section aria-labelledby="echo-photo-title"` | h2 id |
| Dropzone | `div role="group" aria-labelledby="echo-photo-drop-title" aria-describedby="echo-photo-help echo-photo-formats"` | Not focusable; buttons are the controls |
| Preview | `figure` optional; use `div` + h3 | h3 is the focus target |
| Language | `<label htmlFor>` + native `<select>` | `aria-describedby` help + changed hint |
| Progress | `div role="progressbar"` | `aria-valuemin/max/now/valuetext` |
| Editor | `section aria-labelledby="echo-extracted-title"` | h2 id |
| Extracted textarea | `<label htmlFor>` + `Textarea` | `aria-describedby` help + warnings + count |
| Photo error | `div role="alert"` | Message id + actions |
| Confirm | `div role="group" aria-labelledby` | Focus the confirm action; Escape cancels |
| Result badge | `Badge` (span) | Visible text, no extra role |

### 6.2 Labels and descriptions

- Mode group: `mode.groupLabel` ("Report input" / "طريقة إدخال التقرير"). Each button's accessible name is its visible label.
- Dropzone: the h3 title names the group; help + formats describe it. The hidden file inputs are not exposed (`aria-hidden`, `tabIndex={-1}`); the visible buttons carry the action.
- Language select: label `languageLabel`; `aria-describedby` = language help id + changed hint id.
- Extracted textarea: label `extractedLabel`; `aria-describedby` = `extractedHelp` + low-confidence id (when shown) + trimmed id (when shown) + count id. This means a screen reader hears the review instruction and warnings on focus, without needing to explore.
- Submit: visible label; no extra `aria-label`. While loading, the text changes to `submitting` and a spinner is `aria-hidden`.
- Preview image: `alt={previewAlt}`. No filename, no OCR text, no "image of" redundancy beyond the generic phrase.
- Remove: visible "Remove photo". Do not use an icon-only button.
- Badge "Read from photo": visible text; no `title` needed.

### 6.3 Progress and live regions

- Add one `useAnnouncer` + `<LiveRegion announcement={...} />` at the top of `EchoBridgeView`. It is polite.
- Announce:
  - OCR start: `preparing`.
  - Stage changes: `loadingLanguage`; `recognizing` at 0/25/50/75.
  - Success: `announce.ready` (or `announce.readyElsewhere` if the user switched to Text).
  - Remove: `announce.removed`.
  - Mode change: `announce.modePhoto` / `announce.modeText`.
  - Paste instead: `announce.pasteInstead`.
  - Start over: `announce.startOver`.
  - Photo added: `announce.photoAdded`.
- Do not put `aria-live` on the percent or the stage list. The progressbar exposes `aria-valuenow`/`aria-valuetext`; the live region handles stage changes.
- Errors use `role="alert"`; do not also announce them through the polite region (double speech).
- Throttle progress announcements to stage changes and 25% buckets. At 1% updates the screen reader would be unusable.

### 6.4 Focus management

| Event | Focus target | Scroll | Announcement |
| --- | --- | --- | --- |
| Mode switch | Stays on the pressed button | None | `modePhoto` / `modeText` |
| Photo selected | Preview h3 `Selected photo` (`tabIndex={-1}`) | Preview into view | `photoAdded` |
| Read / Read again confirmed | Progress card (`tabIndex={-1}`) | Progress into view | `preparing` |
| OCR success | Extracted textarea | Editor card `scroll-mt-24` | `ready` |
| OCR success while in Text | No focus change | None | `readyElsewhere` |
| OCR error | The error's primary action | Error into view | `role="alert"` handles it |
| Remove | "Take a photo" button | Dropzone into view | `removed` |
| Paste instead | Text-mode textarea, caret at end | Text panel into view | `pasteInstead` |
| Dirty re-read/remove | Confirm action button | Confirm into view | Visible confirm text is focused |
| Confirm cancel | Original Read/Remove button | None | None |
| Start over | Current mode's first control (photo: Take; text: textarea) | Into view | `startOver` |
| AI success | Existing result h2 | Result into view | Existing behavior |
| AI error | ErrorResults heading (`tabIndex={-1}`) | Error into view | `role="alert"` handles it |

The `ErrorResults` heading focus is a small enhancement: add an optional `headingRef` or wrap it. If that is too invasive, focus the retry button instead.

For OCR success, scroll the editor card to start first (`scrollIntoView({ block: "start" })`), then focus the textarea with `{ preventScroll: true }` so the heading and help remain visible above it.

### 6.5 Keyboard

- `Tab` order: mode Photo → mode Text → panel controls in DOM order → submit → loading/result.
- Mode buttons: `Space`/`Enter` activate. Both are in the tab order (toggle buttons, not a roving tablist). Do not hijack arrow keys.
- Dropzone: `Tab` reaches Take, then Choose. `Enter`/`Space` open the OS picker. Drag/drop is not required for keyboard users.
- Native select: standard arrow/Home/End behavior. Do not intercept.
- `<details>` summary: `Enter`/`Space` toggles; the marker is native.
- Confirm row: focus lands on the confirm action; `Escape` cancels and returns focus; `Tab` reaches cancel.
- Textarea: normal editing. Do not add `Ctrl/Cmd+Enter` submit in this task; text mode does not have it either.
- No keyboard trap. The OCR progress is not a modal.

### 6.6 Contrast and touch

- All text pairs use existing tokens that already pass AA in the app. Use `text-caution-ink` on `bg-caution-soft` and `text-urgent-ink` on `bg-urgent-soft`, not `text-caution` / `text-urgent` for body copy.
- `text-bodytext` is used for upcoming stage labels, which are redundant with the progressbar and live region. The current stage is distinguished by weight and a spinner, not by color alone.
- All interactive targets are at least 44×44px: buttons `h-11`, select `h-11`, summary `min-h-11`.
- Focus rings: use the existing `Button` ring. For the select and summary, use `focus-visible:ring-2 focus-visible:ring-brand` with offset on white/page.
- Do not rely on color alone: the current stage has a spinner + semibold; errors have an icon + text; the selected mode has fill + `aria-pressed`.

### 6.7 Error and confirm patterns

- Inline photo errors are not modals. They appear in the error slot, use `role="alert"`, and move focus to the recovery action.
- The confirm row is not a modal. It is a `role="group"` with visible text, two buttons, and Escape handling. It exists only to prevent silent loss of edited text.
- The AI error stays in `ErrorResults` with `role="alert"` and a retry button. It does not repeat the photo privacy note; the editor above already has it.

---

## 7. RTL notes

- Use logical utilities everywhere: `ps-`, `pe-`, `ms-`, `me-`, `start-`, `end-`, `text-start`, `text-end`. No `left`/`right` for layout.
- Mode switch: DOM order Photo → Text. In RTL, Photo is on the right. Do not force `dir="ltr"` on the switch.
- Dropzone: icon and text are centered; buttons use `flex-col` on mobile and `sm:flex-row` with `justify-center`. Flex order follows `dir` automatically.
- Preview: `mx-auto` centering is direction-neutral. `object-contain`.
- Metadata: keep the numeric string in a single `<span dir="ltr">`; the surrounding row inherits RTL so it aligns to the start (right). Do not set `dir="ltr"` on the whole row.
- Language select: no `dir="auto"`. The control inherits RTL; the custom chevron uses `end-3` so it moves to the left. Option labels are localized.
- Actions: `sm:justify-end` means left in RTL. On mobile, the 2-column grid follows direction, so Read is right and Remove is left. That is correct reading order.
- Textareas: `dir="auto"` for both text and extracted text. Do not force RTL when the report language is Arabic; mixed reports and leading numbers need auto.
- Progress percent: the sentence is RTL; if the percent renders on the wrong side of the ellipsis, wrap the numeral in `<bdi dir="ltr">`. The visible copy function already returns the localized sentence.
- Char count: keep `dir="ltr" lang="en"` and `sm:text-end`, matching the existing text mode.
- Arabic labels: no uppercase, no `tracking-*`, no italics. Use the existing `leading-6`/`leading-7` for Arabic body copy. The section already has `lang={locale}` and `dir={dir}`.
- The privacy block is MSA. Do not apply Egyptian colloquial substitutions during review.
- The `×` in dimensions is part of the LTR metadata span; it will read as "times" in screen readers, which is acceptable.
- The mode switch group label and all new ARIA labels are localized; never leave English `aria-label`s in Arabic mode.

---

## 8. Edge cases

| Case | Behavior | Copy / key |
| --- | --- | --- |
| Mock mode | OCR runs for real on-device; the AI explanation is synthetic. `DemoNotice` shows above the result, unchanged. The "Read from photo" badge still shows because OCR was real. The privacy note still holds. | existing `results.demo.*`; `photo.resultBadge` |
| Arabic report | User selects Arabic (or English + Arabic). Tesseract uses `ara` / `eng+ara`. Expect lower accuracy than English; low-confidence warning is likely. Textarea stays `dir="auto"`. | `languageAr`, `languageBoth`, `lowConfidence` |
| Mixed English/Arabic report | Recommend English + Arabic. If the user picked one language, `notEnoughText` or `lowConfidence` may appear; the language select stays visible so they can switch and re-read. | `languageBoth`, `notEnoughText`, `languageChanged` |
| Language changed after a successful read | Do not auto-rerun. Show `languageChanged` under the select; Read again applies the new language. If the text was edited, the re-read confirm appears first. | `languageChanged`, `rereadConfirm` |
| Report longer than 4,000 chars | Keep the first 4,000 at the last line break; show the trimmed warning; char count shows the kept length / 4,000. The user can delete text and add the conclusion. | `trimmed` |
| Low OCR confidence | Non-blocking caution above the textarea. The user can still submit. Do not hide the text or block the button. | `lowConfidence` |
| OCR returns < 10 chars | Treat as `notEnoughText`, do not show the editor or submit. Keep the photo and offer Read again / Paste instead. | `notEnoughText` |
| User deletes text below 10 chars | Submit validates, shows `tooShort`, focuses the textarea, sets `aria-invalid`. | `tooShort` |
| CDN blocked / engine load fails | `prepareFailed`; photo kept; Try again and Paste instead. If `navigator.onLine === false`, use `offline` instead. | `prepareFailed`, `offline` |
| CDN slow | Progress stays on the engine/language stage with the hint. Do not fake percent. Do not auto-cancel. | `preparing`, `loadingLanguage`, `progressHint` |
| AI failure | `ErrorResults` with `photoErrors`; the photo and edited text remain; retry resends the current text. | `photoErrors` |
| AI failure after editing | Retry must use the current textarea value. If the hook's `retry()` uses the last request snapshot, update it on edit or call `analyze(currentText, locale)` directly. | `photoErrors.retry` |
| Switch to Text while OCR runs | Allowed. OCR continues. On completion announce `readyElsewhere`; do not force a mode switch. The editor is ready when the user returns. | `announce.readyElsewhere` |
| Switch to Text with OCR text present | Drafts stay separate. The extracted text does not auto-copy. Use Paste instead only from an OCR error; manual switching keeps the text-mode draft. | — |
| Switch to Photo with a text draft present | Text draft is preserved in the hidden panel. Photo state is unchanged. | — |
| Remove photo with unedited text | Remove immediately; clear preview, OCR state, extracted text, warnings, dirty flag. Focus Take a photo. | `announce.removed` |
| Remove photo with edited text | Inline confirm first. Cancel keeps the photo and edits. Confirm clears both. | `removeConfirm`, `removeConfirmAction`, `keepEdits` |
| Read again with unedited text | Re-run immediately with the current language. | `readAgain` |
| Read again with edited text | Inline confirm first; confirm replaces the draft. Cancel keeps the edits. | `rereadConfirm`, `rereadConfirmAction`, `keepEdits` |
| Select a new file | Only possible after Remove (the dropzone is hidden while a preview exists). This avoids accidental replacement. | `remove` |
| Drop multiple files | Use the first image; show a polite `oneAtATime` note; ignore the rest. | `oneAtATime` |
| HEIC / undecodable photo | Treat as `unsupportedType`; copy recommends JPG/PNG/WebP or taking a new photo. | `unsupportedType` |
| Large photo (>10 MB) | Reject before decode/OCR; no preview. | `tooLarge` |
| EXIF rotation | Preview and OCR must respect orientation. If the preview looks rotated but OCR reads it correctly (or vice versa), fix the canvas orientation before OCR. This is a QA case. | — |
| Offline after the reader is cached | OCR may still work; do not block preemptively. Only show `offline` if the engine/language load actually fails. | `offline` |
| Start over from photo result | Reset analysis, both drafts, photo, OCR, language to locale default, validation, confirm. Stay in photo mode. Focus Take a photo. | `announce.startOver` |
| Start over from text result | Reset analysis, both drafts, photo, OCR. Stay in text mode. Focus textarea. | `announce.startOver` |
| App language switch | UI copy and direction update. Report language is not overwritten. An in-flight OCR keeps its chosen language. | — |
| Very long filename | Never displayed. Metadata is size + dimensions only. | — |
| Screen reader on progress | Progressbar has `aria-valuetext`; live region announces stages and 25% buckets. The visual stage list is `aria-hidden`. | `progressEngine`, `progressLanguage`, `progressRecognizing` |
| Reduced motion | Spinners stop; progress width transition removed; pulse removed; optional card entrance removed. The percent text still updates. | — |
| Zoom 200% / 320px width | No horizontal scroll. Mode switch, dropzone buttons, preview actions, and select wrap/stack. | — |

---

## 9. Acceptance criteria

### Frontend

- [ ] Photo is the default mode on first load; Text is visible and one tap away.
- [ ] The mode switch uses `role="group"`, `aria-pressed`, `aria-controls`, 44px targets, and does not use a nested tablist.
- [ ] Take a photo opens the camera input with `capture="environment"`; Choose a photo opens the gallery/file picker; both are keyboard-operable via the visible buttons.
- [ ] Drag/drop accepts one image, shows the drag-over state, and uses the first file if multiple are dropped.
- [ ] Invalid type, undecodable image, and >10 MB files are rejected before OCR with the correct inline message.
- [ ] The preview shows the image, size, dimensions, report language, Read/Read again, and Remove. No filename is shown.
- [ ] Selecting a photo does not auto-start OCR. Read starts it with the selected language.
- [ ] OCR progress shows engine → language → recognizing with percent; the progressbar has `aria-valuemin/max/now` when determinate and `aria-valuetext` when indeterminate.
- [ ] The photo stays visible during OCR; Remove and Read are disabled while OCR runs.
- [ ] OCR success shows the editable text card, focuses the textarea, and announces readiness.
- [ ] The extracted textarea is `dir="auto"`, `maxLength={4000}`, has the label, help, count, and warnings described by `aria-describedby`.
- [ ] Low confidence and trimming are non-blocking warnings; the user can still edit and submit.
- [ ] Submit sends the current text and `source: "photo"`; it is disabled only while the AI request is loading.
- [ ] The result shows the "Read from photo" badge, source help, and privacy line; the non-diagnostic note is unchanged.
- [ ] AI errors in photo mode use `photoErrors`; text mode still uses `errors`.
- [ ] OCR errors keep the photo and offer the specified recovery actions; Paste instead switches to Text, transfers any extracted text, focuses the textarea, and announces.
- [ ] Read again and Remove confirm before discarding edited text; Escape cancels and restores focus.
- [ ] Remove clears the preview, OCR state, extracted text, warnings, and object URL; focus returns to Take a photo.
- [ ] Start over resets analysis, both drafts, and the photo, keeps the current mode, and focuses its first control.
- [ ] Text mode is functionally unchanged (sample, count, validation, submit, loading, result, errors) apart from the new label and the mode switch.
- [ ] Mock mode shows DemoNotice; the OCR is real and the badge remains.
- [ ] No image bytes are sent in any request. Verify in DevTools: `/api/echo` body contains only text, locale, and source.
- [ ] No filename, image, or OCR text appears in analytics, logs, alt text, or error messages.
- [ ] `npm run build` / `tsc --noEmit` passes; no `any`, no unused imports, no dead code.

### Lead / review

- [ ] The privacy claim is literally true: image not uploaded/stored; only checked text sent; CDN assets are not described as user data.
- [ ] The UI never says "nothing leaves your device" or "the AI read your photo".
- [ ] Photo is primary but Text is not hidden, demoted to a link, or buried.
- [ ] The flow has a clear review step; the extracted text is editable before submit.
- [ ] Arabic copy uses Egyptian for UI actions and MSA for privacy; no uppercase/tracking/italics in Arabic.
- [ ] RTL: mode order, preview centering, metadata direction, select chevron, action order, and textarea `dir="auto"` all behave.
- [ ] Keyboard-only run: mode switch → photo picker → language → read → editor → submit → result; no traps.
- [ ] Screen-reader run: group name, pressed states, dropzone description, progressbar, stage announcements, warnings on focus, error alerts, result badge.
- [ ] 320px, 375px, 768px, 1024px: no horizontal scroll; buttons and text fit; preview does not overflow.
- [ ] 200% zoom: the mode switch and preview actions still usable.
- [ ] Reduced motion: no spinner/pulse/transition.
- [ ] No new design tokens, no new shadows, no gradients, no new component library.
- [ ] No safety/triage layer and no copy-summary button were added.
- [ ] The existing non-diagnostic note and footer disclaimer are unchanged.

---

## 10. Open questions and risks

1. **`source` contract — resolved.** `echoRequestSchema` now validates `source` (`"text" | "photo"`, default `"text"`), `echoAnalysisSchema` requires it, and the route sets `analysis.source`. The UI renders the result badge, help, and privacy from `analysis.source`; `submittedSource` remains for loading, error copy, and retry. Live photo responses also carry `ECHO_PHOTO_LIVE_NOTICE` in `meta.notice`.
2. **CDN / CSP.** Tesseract core and `eng`/`ara` traineddata load from jsDelivr. Confirm the production CSP allows `cdn.jsdelivr.net` and the worker/blob URLs Tesseract uses. A blocked CDN is a `prepareFailed` dead end except for Paste instead.
3. **HEIC.** iPhone library photos may be HEIC. Some Safari versions decode them; some do not. The copy recommends JPG/PNG/WebP, and the error offers Choose another photo and Paste instead. Confirm on real iOS hardware; consider accepting only `image/jpeg,image/png,image/webp` if HEIC proves unreliable.
4. **OCR time on low-end phones.** 10–30s is plausible. There is no Cancel action in this spec. If QA finds it too long, add a Cancel that terminates the worker and returns to the preview; that needs its own copy and focus behavior.
5. **Arabic OCR accuracy.** Printed Arabic reports with tables and mixed numerals may produce weak text. The low-confidence warning and language hint are the mitigation. Consider a short in-context note for Arabic ("Arabic reading is less accurate") only if testing shows a high failure rate; do not add it preemptively.
6. **Filename privacy.** The preview intentionally omits the filename because it can contain a patient name. Confirm product is fine with size + dimensions only.
7. **Dirty confirm pattern.** Two inline confirms (re-read, remove) add state and copy. If the team prefers a single modal, use the existing design language, but do not silently discard edits.
8. **Mode switch during OCR.** This spec allows it. If the team prefers to lock the switch while OCR runs, the progress card must stay visible or the user must be told why. Allowing it is less trapping.
9. **`DemoNotice` wording in echo mock mode.** `copy.results.demo.body` says "It does not analyze your description." In EchoBridge the input is a report, not a description. This is a pre-existing generic string. Consider an echo-specific demo notice in a later copy pass; do not block this feature.
10. **`ErrorResults` focus.** The component has `role="alert"` but no focus target. The spec recommends focusing its heading after an AI error. This is a small optional prop; confirm with frontend.
11. **Object URL and worker lifecycle.** Revoke the preview URL on remove, replace, unmount, and start over. Terminate the Tesseract worker on unmount and start over. A leak is invisible in QA but shows up after several photos on mobile.
12. **EXIF orientation.** Test portrait phone photos on iOS and Android. A rotated preview with correct OCR (or the reverse) destroys trust faster than a low-confidence warning.



