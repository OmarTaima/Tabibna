import {
  MAX_ECHO_TEXT_LENGTH,
  MIN_ECHO_TEXT_LENGTH,
  type EchoSource,
} from "@shared/contract";
import {
  FileText,
  HeartPulse,
  Info,
  Loader2,
  RotateCcw,
  ScanText,
  ShieldCheck,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { EchoExtractedText } from "@/components/echo/echo-extracted-text";
import {
  EchoModeSwitch,
  type EchoMode,
} from "@/components/echo/echo-mode-switch";
import { EchoOcrProgress } from "@/components/echo/echo-ocr-progress";
import { EchoPhotoDropzone } from "@/components/echo/echo-photo-dropzone";
import {
  EchoPhotoError,
  type EchoPhotoIssue,
} from "@/components/echo/echo-photo-error";
import { EchoPhotoPanel } from "@/components/echo/echo-photo-panel";
import {
  EchoPhotoPreview,
  type EchoConfirmAction,
} from "@/components/echo/echo-photo-preview";
import { EchoReportLanguageSelect } from "@/components/echo/echo-report-language-select";
import { DemoNotice } from "@/components/results/demo-notice";
import { ErrorResults } from "@/components/results/error-results";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LiveRegion } from "@/components/ui/live-region";
import { Textarea } from "@/components/ui/textarea";
import { useAnnouncer } from "@/hooks/use-announcer";
import { useEchoAnalysis } from "@/hooks/use-echo-analysis";
import { useEchoPhotoOcr } from "@/hooks/use-echo-photo-ocr";
import { useLocale } from "@/i18n/use-locale";
import {
  LOW_CONFIDENCE_THRESHOLD,
  type OcrStage,
  type ReportLanguage,
} from "@/lib/ocr";
import { cn } from "@/lib/utils";

type Validation =
  | { field: "photo"; issue: "noPhoto" | "readFirst" }
  | { field: "editor" | "text"; message: string };

type FocusTarget =
  | "photo-take"
  | "photo-choose"
  | "text-textarea"
  | "text-end"
  | "ocr-progress";

type ConfirmOrigin = "read" | "remove";

export function EchoBridgeView() {
  const { locale, copy, dir } = useLocale();
  const {
    status: aiStatus,
    analysis,
    error: aiError,
    analyze,
    retry,
    clearError,
    reset,
  } = useEchoAnalysis();
  const ocr = useEchoPhotoOcr();
  const { announcement, announce } = useAnnouncer();

  const [mode, setMode] = useState<EchoMode>("photo");
  const [reportLanguage, setReportLanguage] = useState<ReportLanguage>(() =>
    locale === "ar" ? "ara" : "eng",
  );
  const [readLanguage, setReadLanguage] = useState<ReportLanguage | null>(null);
  const [text, setText] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [editorBaseline, setEditorBaseline] = useState("");
  const [validation, setValidation] = useState<Validation | null>(null);
  const [submittedSource, setSubmittedSource] = useState<EchoSource | null>(null);
  const [confirmAction, setConfirmAction] = useState<EchoConfirmAction | null>(null);
  const [confirmOrigin, setConfirmOrigin] = useState<ConfirmOrigin>("read");
  const [oneAtATime, setOneAtATime] = useState(false);
  const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(null);

  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const takeButtonRef = useRef<HTMLButtonElement | null>(null);
  const chooseButtonRef = useRef<HTMLButtonElement | null>(null);
  const previewHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const readButtonRef = useRef<HTMLButtonElement | null>(null);
  const removeButtonRef = useRef<HTMLButtonElement | null>(null);
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const editorCardRef = useRef<HTMLDivElement | null>(null);
  const editorTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const textTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const errorHeadingRef = useRef<HTMLHeadingElement | null>(null);

  const announcedFileRef = useRef<File | null>(null);
  const handledResultRef = useRef(0);
  const announcedStageRef = useRef<OcrStage | null>(null);
  const announcedBucketRef = useRef(-1);

  const aiLoading = aiStatus === "loading";
  const ocrRunning = ocr.status === "preparing" || ocr.status === "recognizing";
  const dirty = extractedText !== editorBaseline;
  const showEditor = ocr.status === "done";
  const readAgain = ocr.status === "done" || ocr.status === "error";
  const busy = ocrRunning || aiLoading;
  const lowConfidence =
    ocr.confidence !== null && ocr.confidence < LOW_CONFIDENCE_THRESHOLD;
  const languageChanged =
    ocr.status === "done" &&
    readLanguage !== null &&
    reportLanguage !== readLanguage;

  const photoIssue: EchoPhotoIssue | null =
    validation?.field === "photo" ? validation.issue : ocr.error;
  const editorError = validation?.field === "editor" ? validation.message : null;
  const textError = validation?.field === "text" ? validation.message : null;

  useEffect(() => {
    if (!focusTarget) {
      return;
    }

    if (focusTarget === "photo-take") {
      takeButtonRef.current?.focus();
      takeButtonRef.current?.scrollIntoView({ block: "start" });
    } else if (focusTarget === "photo-choose") {
      chooseButtonRef.current?.focus();
      chooseButtonRef.current?.scrollIntoView({ block: "center" });
    } else if (focusTarget === "text-textarea") {
      textTextareaRef.current?.focus();
      textTextareaRef.current?.scrollIntoView({ block: "center" });
    } else if (focusTarget === "text-end") {
      const textarea = textTextareaRef.current;
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        textarea.scrollIntoView({ block: "center" });
      }
    } else {
      progressRef.current?.focus();
      progressRef.current?.scrollIntoView({ block: "start" });
    }

    setFocusTarget(null);
  }, [focusTarget]);

  useEffect(() => {
    if (!ocr.file || !ocr.previewUrl) {
      announcedFileRef.current = null;
      return;
    }

    if (announcedFileRef.current === ocr.file) {
      return;
    }

    announcedFileRef.current = ocr.file;
    previewHeadingRef.current?.focus();
    previewHeadingRef.current?.scrollIntoView({ block: "center" });
    announce(copy.echo.photo.announce.photoAdded);
  }, [announce, copy.echo.photo.announce.photoAdded, ocr.file, ocr.previewUrl]);

  useEffect(() => {
    if (ocr.resultId === 0 || handledResultRef.current === ocr.resultId) {
      return;
    }

    handledResultRef.current = ocr.resultId;
    setExtractedText(ocr.text);
    setEditorBaseline(ocr.text);
    setValidation(null);
    setConfirmAction(null);

    if (mode === "photo") {
      editorCardRef.current?.scrollIntoView({ block: "start" });
      editorTextareaRef.current?.focus({ preventScroll: true });
      announce(copy.echo.photo.announce.ready);
    } else {
      announce(copy.echo.photo.announce.readyElsewhere);
    }
  }, [
    announce,
    copy.echo.photo.announce.ready,
    copy.echo.photo.announce.readyElsewhere,
    mode,
    ocr.resultId,
    ocr.text,
  ]);

  useEffect(() => {
    if (!ocrRunning) {
      announcedStageRef.current = null;
      announcedBucketRef.current = -1;
      return;
    }

    if (mode !== "photo") {
      return;
    }

    if (ocr.stage === "language") {
      if (announcedStageRef.current !== "language") {
        announcedStageRef.current = "language";
        announce(copy.echo.photo.loadingLanguage);
      }
      return;
    }

    if (ocr.stage !== "recognizing") {
      return;
    }

    const percent = ocr.percent ?? 0;
    const bucket = Math.min(100, Math.floor(percent / 25) * 25);

    if (bucket > announcedBucketRef.current) {
      announcedBucketRef.current = bucket;
      announcedStageRef.current = "recognizing";
      announce(copy.echo.photo.recognizing(bucket));
    }
  }, [
    announce,
    copy.echo.photo.loadingLanguage,
    copy.echo.photo.recognizing,
    mode,
    ocr.percent,
    ocr.stage,
    ocrRunning,
  ]);

  useEffect(() => {
    if (aiStatus !== "success") {
      return;
    }

    resultHeadingRef.current?.focus();
    resultHeadingRef.current?.scrollIntoView({ block: "start" });
  }, [aiStatus]);

  useEffect(() => {
    if (aiStatus !== "error") {
      return;
    }

    errorHeadingRef.current?.focus();
    errorHeadingRef.current?.scrollIntoView({ block: "start" });
  }, [aiStatus]);

  useEffect(() => {
    if (confirmAction && !dirty) {
      setConfirmAction(null);
    }
  }, [confirmAction, dirty]);

  const selectFiles = (files: File[]) => {
    const images = files.filter((file) => file.type.startsWith("image/"));
    const [first] = images.length > 0 ? images : files;

    if (!first) {
      return;
    }

    setOneAtATime(files.length > 1);
    setValidation(null);
    setConfirmAction(null);
    setExtractedText("");
    setEditorBaseline("");
    setReadLanguage(null);
    void ocr.selectFile(first);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    selectFiles(files);
  };

  const openCamera = () => {
    cameraInputRef.current?.click();
  };

  const openGallery = () => {
    galleryInputRef.current?.click();
  };

  const handleChooseAnother = () => {
    announcedFileRef.current = null;
    ocr.remove();
    clearError();
    setExtractedText("");
    setEditorBaseline("");
    setValidation(null);
    setConfirmAction(null);
    setReadLanguage(null);
    setOneAtATime(false);
    setFocusTarget("photo-choose");
    galleryInputRef.current?.click();
  };

  const performRemove = () => {
    announcedFileRef.current = null;
    ocr.remove();
    clearError();
    setExtractedText("");
    setEditorBaseline("");
    setValidation(null);
    setConfirmAction(null);
    setReadLanguage(null);
    setOneAtATime(false);
    announce(copy.echo.photo.announce.removed);
    setFocusTarget("photo-take");
  };

  const startRead = () => {
    if (!ocr.file) {
      return;
    }

    setConfirmAction(null);
    setValidation(null);
    clearError();
    setExtractedText("");
    setEditorBaseline("");
    setReadLanguage(reportLanguage);
    announce(copy.echo.photo.preparing);
    setFocusTarget("ocr-progress");
    void ocr.read(reportLanguage);
  };

  const requestRead = () => {
    if (!ocr.file || busy) {
      return;
    }

    if (dirty) {
      setConfirmOrigin("read");
      setConfirmAction("reread");
      return;
    }

    startRead();
  };

  const requestRemove = () => {
    if (busy) {
      return;
    }

    if (dirty) {
      setConfirmOrigin("remove");
      setConfirmAction("remove");
      return;
    }

    performRemove();
  };

  const handleConfirm = () => {
    if (busy) {
      return;
    }

    if (confirmAction === "reread") {
      setConfirmAction(null);
      startRead();
      return;
    }

    if (confirmAction === "remove") {
      setConfirmAction(null);
      performRemove();
    }
  };

  const handleCancelConfirm = () => {
    setConfirmAction(null);

    if (confirmOrigin === "read") {
      readButtonRef.current?.focus();
    } else {
      removeButtonRef.current?.focus();
    }
  };

  const handleModeChange = (next: EchoMode) => {
    if (next === mode) {
      return;
    }

    setMode(next);
    setConfirmAction(null);
    setValidation(null);
    clearError();
    announce(
      next === "photo"
        ? copy.echo.photo.announce.modePhoto
        : copy.echo.photo.announce.modeText,
    );
  };

  const handlePasteInstead = () => {
    const transfer = extractedText.trim().length > 0 ? extractedText : ocr.text;

    if (transfer.trim().length > 0) {
      setText(transfer);
    }

    setMode("text");
    setConfirmAction(null);
    setValidation(null);
    clearError();
    setFocusTarget("text-end");
    announce(copy.echo.photo.announce.pasteInstead);
  };

  const handleStartOver = () => {
    reset();
    ocr.reset();
    announcedFileRef.current = null;
    setText("");
    setExtractedText("");
    setEditorBaseline("");
    setValidation(null);
    setSubmittedSource(null);
    setConfirmAction(null);
    setReadLanguage(null);
    setOneAtATime(false);
    setReportLanguage(locale === "ar" ? "ara" : "eng");
    announce(copy.echo.photo.announce.startOver);
    setFocusTarget(mode === "photo" ? "photo-take" : "text-textarea");
  };

  const handleTextChange = (value: string) => {
    setText(value);

    if (validation?.field === "text") {
      setValidation(null);
    }
  };

  const handleExtractedChange = (value: string) => {
    setExtractedText(value);

    if (validation?.field === "editor") {
      setValidation(null);
    }

    if (confirmAction && value === editorBaseline) {
      setConfirmAction(null);
    }
  };

  const handleSample = () => {
    setText(copy.echo.sampleText);
    setValidation(null);
    textTextareaRef.current?.focus();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (aiLoading) {
      return;
    }

    if (mode === "photo") {
      if (!ocr.file) {
        setValidation({ field: "photo", issue: "noPhoto" });
        return;
      }

      if (!showEditor) {
        setValidation({ field: "photo", issue: "readFirst" });
        return;
      }

      if (extractedText.trim().length < MIN_ECHO_TEXT_LENGTH) {
        setValidation({ field: "editor", message: copy.echo.photo.tooShort });
        editorTextareaRef.current?.focus();
        return;
      }

      setValidation(null);
      setSubmittedSource("photo");
      analyze(extractedText, locale, "photo");
      return;
    }

    if (text.trim().length < MIN_ECHO_TEXT_LENGTH) {
      setValidation({ field: "text", message: copy.echo.validation });
      textTextareaRef.current?.focus();
      return;
    }

    setValidation(null);
    setSubmittedSource("text");
    analyze(text, locale, "text");
  };

  const handleRetry = () => {
    const current = submittedSource === "photo" ? extractedText : text;

    if (current.trim().length < MIN_ECHO_TEXT_LENGTH) {
      if (submittedSource === "photo") {
        setValidation({ field: "editor", message: copy.echo.photo.tooShort });
        editorTextareaRef.current?.focus();
      } else {
        setValidation({ field: "text", message: copy.echo.validation });
        textTextareaRef.current?.focus();
      }

      return;
    }

    setValidation(null);
    retry(current);
  };

  const textDescribedBy = ["echo-count", textError ? "echo-error" : null]
    .filter(Boolean)
    .join(" ");

  return (
    <section aria-labelledby="echo-title" lang={locale} dir={dir}>
      <LiveRegion announcement={announcement} />

      <header>
        <h1
          id="echo-title"
          className="font-display text-[27px] font-bold leading-[34px] tracking-[-0.02em] text-ink sm:text-[34px] sm:leading-[1.15]"
        >
          {copy.echo.title}
        </h1>
        <p className="mt-3 max-w-[620px] text-[15px] leading-7 text-bodytext">
          {copy.echo.subtitle}
        </p>
      </header>

      <EchoModeSwitch mode={mode} onChange={handleModeChange} disabled={aiLoading} />

      <form
        noValidate
        aria-labelledby="echo-title"
        aria-busy={aiLoading}
        onSubmit={handleSubmit}
        className="mt-4"
      >
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleInputChange}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />

        <section
          id="echo-panel-photo"
          aria-labelledby="echo-photo-title"
          hidden={mode !== "photo"}
        >
          <EchoPhotoPanel oneAtATime={oneAtATime}>
            {ocr.file && ocr.previewUrl && ocr.meta ? (
              <EchoPhotoPreview
                previewUrl={ocr.previewUrl}
                meta={ocr.meta}
                busy={busy}
                readAgain={readAgain}
                confirmAction={confirmAction}
                headingRef={previewHeadingRef}
                readButtonRef={readButtonRef}
                removeButtonRef={removeButtonRef}
                confirmButtonRef={confirmButtonRef}
                onRead={requestRead}
                onRemove={requestRemove}
                onConfirm={handleConfirm}
                onCancel={handleCancelConfirm}
              >
                <EchoReportLanguageSelect
                  value={reportLanguage}
                  onChange={setReportLanguage}
                  disabled={busy}
                  changed={languageChanged}
                />
              </EchoPhotoPreview>
            ) : (
              <>
                <EchoPhotoDropzone
                  onTakePhoto={openCamera}
                  onChoosePhoto={openGallery}
                  onFiles={selectFiles}
                  takeButtonRef={takeButtonRef}
                  chooseButtonRef={chooseButtonRef}
                />
                <EchoReportLanguageSelect
                  value={reportLanguage}
                  onChange={setReportLanguage}
                  disabled={busy}
                  changed={languageChanged}
                />
              </>
            )}

            {photoIssue ? (
              <div className="mt-3">
                <EchoPhotoError
                  issue={photoIssue}
                  onRead={requestRead}
                  onTakePhoto={openCamera}
                  onChooseAnother={handleChooseAnother}
                  onPasteInstead={handlePasteInstead}
                />
              </div>
            ) : null}
          </EchoPhotoPanel>

          {ocrRunning ? (
            <EchoOcrProgress
              stage={ocr.stage}
              percent={ocr.percent}
              progressRef={progressRef}
            />
          ) : null}

          {showEditor ? (
            <EchoExtractedText
              value={extractedText}
              lowConfidence={lowConfidence}
              trimmed={ocr.truncated}
              error={editorError}
              submitting={aiLoading && submittedSource === "photo"}
              disabled={aiLoading}
              cardRef={editorCardRef}
              textareaRef={editorTextareaRef}
              onChange={handleExtractedChange}
            />
          ) : null}
        </section>

        <section
          id="echo-panel-text"
          aria-labelledby="echo-text-title"
          hidden={mode !== "text"}
        >
          <Card className="p-5 sm:p-6">
            <label
              htmlFor="echo-report"
              id="echo-text-title"
              className="block font-display text-[17px] font-semibold text-ink sm:text-lg"
            >
              {copy.echo.label}
            </label>

            <Textarea
              id="echo-report"
              ref={textTextareaRef}
              value={text}
              onChange={(event) => handleTextChange(event.target.value)}
              dir="auto"
              maxLength={MAX_ECHO_TEXT_LENGTH}
              placeholder={copy.echo.placeholder}
              disabled={aiLoading}
              aria-invalid={textError ? true : undefined}
              aria-describedby={textDescribedBy}
              className={cn(
                "mt-3",
                textError &&
                  "border-urgent focus-visible:border-urgent focus-visible:ring-urgent/20",
              )}
            />

            <div className="mt-2.5 flex flex-col gap-2 text-[11.5px] text-bodytext sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleSample}
                disabled={aiLoading}
                aria-label={`${copy.echo.sample} — ${copy.echo.sampleLabel}`}
                title={copy.echo.sampleLabel}
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                {copy.echo.sample}
              </Button>
              <p
                id="echo-count"
                className="shrink-0 tabular-nums text-bodytext sm:text-end"
                dir="ltr"
                lang="en"
              >
                {copy.echo.charCount(text.length)}
              </p>
            </div>

            {textError ? (
              <p
                id="echo-error"
                role="alert"
                className="mt-2.5 text-[12.5px] font-medium text-urgent"
              >
                {textError}
              </p>
            ) : null}

            <Button type="submit" size="lg" disabled={aiLoading} className="mt-5 w-full">
              {aiLoading ? (
                <Loader2
                  className="h-4 w-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              ) : (
                <HeartPulse className="h-4 w-4" aria-hidden="true" />
              )}
              {aiLoading ? copy.echo.submitting : copy.echo.submit}
            </Button>
          </Card>
        </section>
      </form>

      {aiLoading ? (
        <div
          role="status"
          aria-live="polite"
          className="mt-6 flex items-start gap-3 rounded-2xl border border-line bg-white p-5 shadow-soft sm:p-6"
        >
          <Loader2
            className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-brand motion-reduce:animate-none"
            aria-hidden="true"
          />
          <p className="text-[14px] leading-7 text-bodytext">
            {submittedSource === "photo"
              ? copy.echo.photo.submitting
              : copy.echo.submitting}
          </p>
        </div>
      ) : null}

      {aiStatus === "error" && aiError ? (
        <div className="mt-6">
          <ErrorResults
            error={aiError}
            onRetry={handleRetry}
            messages={
              submittedSource === "photo"
                ? copy.echo.photoErrors
                : copy.echo.errors
            }
            headingRef={errorHeadingRef}
          />
        </div>
      ) : null}

      {aiStatus === "success" && analysis ? (
        <div className="mt-8 flex flex-col gap-5">
          {analysis.meta.mode === "mock" ? <DemoNotice /> : null}

          <Card className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    ref={resultHeadingRef}
                    tabIndex={-1}
                    className="scroll-mt-24 rounded-md font-display text-[20px] font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-4 focus-visible:ring-offset-page"
                  >
                    {copy.echo.summaryTitle}
                  </h2>
                  {analysis.source === "photo" ? (
                    <Badge variant="teal">
                      <ScanText className="h-3 w-3" aria-hidden="true" />
                      {copy.echo.photo.resultBadge}
                    </Badge>
                  ) : null}
                </div>
                {analysis.source === "photo" ? (
                  <p className="mt-1 text-[12.5px] text-bodytext">
                    {copy.echo.photo.resultHelp}
                  </p>
                ) : null}
                <p className="mt-1 text-[12.5px] text-bodytext">
                  {copy.echo.termsCount(analysis.terms.length)}
                </p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={handleStartOver}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                {copy.echo.startOver}
              </Button>
            </div>

            <p
              lang={locale}
              dir={dir}
              className="mt-4 whitespace-pre-wrap break-words rounded-xl border border-line bg-[#F8FBFA] p-4 text-[15px] leading-7 text-ink"
            >
              {analysis.summary[locale]}
            </p>

            {analysis.source === "photo" ? (
              <p className="mt-3 flex items-start gap-2 border-t border-line pt-3 text-[11.5px] leading-5 text-bodytext">
                <ShieldCheck
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand"
                  aria-hidden="true"
                />
                <span>{copy.echo.photo.resultPrivacy}</span>
              </p>
            ) : null}
          </Card>

          <section aria-labelledby="echo-terms-title">
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
              <h3
                id="echo-terms-title"
                className="font-display text-[20px] font-semibold text-ink"
              >
                {copy.echo.termsTitle}
              </h3>
              <Badge variant="teal" className="self-start sm:self-auto">
                {copy.echo.termsCount(analysis.terms.length)}
              </Badge>
            </div>

            {analysis.terms.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-line bg-white p-5 text-[13px] text-bodytext">
                {copy.echo.empty}
              </p>
            ) : (
              <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
                <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-4 border-b border-line bg-brand-soft px-5 py-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-bodytext sm:grid">
                  <p>
                    {copy.echo.termEn} / {copy.echo.termAr}
                  </p>
                  <p>{copy.echo.explanation}</p>
                </div>

                <ul>
                  {analysis.terms.map((term) => (
                    <li
                      key={term.id}
                      className="border-b border-line p-4 last:border-b-0 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] sm:gap-4 sm:p-5"
                    >
                      <div>
                        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-bodytext sm:hidden">
                          {copy.echo.termEn}
                        </p>
                        <p
                          lang="en"
                          dir="ltr"
                          className="text-[15px] font-semibold text-ink"
                        >
                          {term.term.en}
                        </p>
                        <p className="mt-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-bodytext sm:hidden">
                          {copy.echo.termAr}
                        </p>
                        <p
                          lang="ar"
                          dir="rtl"
                          className="text-[15px] font-semibold text-ink"
                        >
                          {term.term.ar}
                        </p>
                      </div>
                      <div className="mt-3 border-t border-line pt-3 sm:mt-0 sm:border-t-0 sm:pt-0">
                        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-bodytext sm:hidden">
                          {copy.echo.explanation}
                        </p>
                        <p
                          lang={locale}
                          dir={dir}
                          className="text-[13.5px] leading-7 text-ink"
                        >
                          {term.explanation[locale]}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <p className="flex items-start gap-2.5 rounded-xl border border-caution-border bg-caution-soft px-4 py-3 text-[12.5px] leading-6 text-caution-ink">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{copy.echo.note}</span>
          </p>
        </div>
      ) : null}
    </section>
  );
}
