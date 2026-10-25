import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MIN_ECHO_TEXT_LENGTH } from "@shared/contract";
import {
  MAX_PHOTO_BYTES,
  readImageMeta,
  recognizeReportPhoto,
  releaseOcrWorker,
  type ImageMeta,
  type OcrStage,
  type PhotoMeta,
  type ReportLanguage,
} from "@/lib/ocr";
import { redactPersonalData, truncateOcrText } from "@/lib/ocr-text";

export type PhotoErrorKind =
  | "unsupportedType"
  | "tooLarge"
  | "offline"
  | "prepareFailed"
  | "readerFailed"
  | "notEnoughText";

export type OcrStatus = "idle" | "preparing" | "recognizing" | "done" | "error";

export function useEchoPhotoOcr() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [meta, setMeta] = useState<PhotoMeta | null>(null);
  const [status, setStatus] = useState<OcrStatus>("idle");
  const [stage, setStage] = useState<OcrStage | null>(null);
  const [percent, setPercent] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [rawText, setRawText] = useState("");
  const [error, setError] = useState<PhotoErrorKind | null>(null);
  const [resultId, setResultId] = useState(0);

  const previewUrlRef = useRef<string | null>(null);
  const runIdRef = useRef(0);
  const mountedRef = useRef(true);

  const { text, truncated } = useMemo(
    () => truncateOcrText(redactPersonalData(rawText)),
    [rawText],
  );

  const clearPreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setPreviewUrl(null);
  }, []);

  const resetOcrState = useCallback(() => {
    setStatus("idle");
    setStage(null);
    setPercent(null);
    setConfidence(null);
    setRawText("");
    setError(null);
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }

      void releaseOcrWorker();
    };
  }, []);

  const selectFile = useCallback(
    async (nextFile: File) => {
      const runId = runIdRef.current + 1;
      runIdRef.current = runId;

      setFile(null);
      setMeta(null);
      clearPreview();
      resetOcrState();

      if (!nextFile.type.startsWith("image/")) {
        setStatus("error");
        setError("unsupportedType");
        return;
      }

      if (nextFile.size > MAX_PHOTO_BYTES) {
        setStatus("error");
        setError("tooLarge");
        return;
      }

      let dimensions: ImageMeta;

      try {
        dimensions = await readImageMeta(nextFile);
      } catch {
        if (runIdRef.current !== runId) {
          return;
        }

        setStatus("error");
        setError("unsupportedType");
        return;
      }

      if (!mountedRef.current || runIdRef.current !== runId) {
        return;
      }

      previewUrlRef.current = URL.createObjectURL(nextFile);
      setPreviewUrl(previewUrlRef.current);
      setMeta({ ...dimensions, bytes: nextFile.size });
      setFile(nextFile);
    },
    [clearPreview, resetOcrState],
  );

  const read = useCallback(
    async (language: ReportLanguage) => {
      if (!file) {
        return;
      }

      const runId = runIdRef.current + 1;
      runIdRef.current = runId;

      setStatus("preparing");
      setStage("engine");
      setPercent(null);
      setConfidence(null);
      setRawText("");
      setError(null);

      const outcome = await recognizeReportPhoto(file, language, (progress) => {
        if (!mountedRef.current || runIdRef.current !== runId) {
          return;
        }

        setStage(progress.stage);

        if (progress.stage !== "recognizing") {
          return;
        }

        setStatus("recognizing");

        const nextPercent = progress.percent;

        if (nextPercent === null) {
          return;
        }

        setPercent((current) => Math.max(current ?? 0, nextPercent));
      });

      if (!mountedRef.current || runIdRef.current !== runId) {
        return;
      }

      setStage(null);
      setPercent(null);

      if (!outcome.ok) {
        setStatus("error");
        setError(
          outcome.reason === "prepare"
            ? navigator.onLine
              ? "prepareFailed"
              : "offline"
            : "readerFailed",
        );
        return;
      }

      setConfidence(outcome.confidence);
      setRawText(outcome.text);

      if (
        truncateOcrText(redactPersonalData(outcome.text)).text.length <
        MIN_ECHO_TEXT_LENGTH
      ) {
        setStatus("error");
        setError("notEnoughText");
        return;
      }

      setStatus("done");
      setResultId((current) => current + 1);
    },
    [file],
  );

  const remove = useCallback(() => {
    runIdRef.current += 1;
    setFile(null);
    setMeta(null);
    clearPreview();
    resetOcrState();
  }, [clearPreview, resetOcrState]);

  const reset = useCallback(() => {
    remove();
    void releaseOcrWorker();
  }, [remove]);

  return {
    file,
    previewUrl,
    meta,
    status,
    stage,
    percent,
    confidence,
    text,
    truncated,
    error,
    resultId,
    selectFile,
    read,
    remove,
    reset,
  };
}
