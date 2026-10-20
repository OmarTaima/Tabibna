import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale, MedicalAnalysis } from "@shared/contract";
import { analyzeSymptoms, type ApiError } from "@/lib/api";

export type AnalysisStatus = "idle" | "loading" | "success" | "error";

export type SubmittedRequest = {
  description: string;
  locale: Locale;
};

export function useSymptomAnalysis() {
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [analysis, setAnalysis] = useState<MedicalAnalysis | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [submitted, setSubmitted] = useState<SubmittedRequest | null>(null);
  const [requestId, setRequestId] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const sequenceRef = useRef(0);
  const submittedRef = useRef<SubmittedRequest | null>(null);

  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    [],
  );

  const run = useCallback((description: string, locale: Locale) => {
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    const sequence = sequenceRef.current + 1;
    sequenceRef.current = sequence;

    setRequestId(sequence);
    setStatus("loading");
    setAnalysis(null);
    setError(null);

    const isCurrent = () =>
      sequenceRef.current === sequence && !controller.signal.aborted;

    void analyzeSymptoms(description, locale, controller.signal).then((result) => {
      if (!isCurrent()) {
        return;
      }

      if (result.ok) {
        setAnalysis(result.data.analysis);
        setStatus("success");
        return;
      }

      if (result.kind === "aborted") {
        return;
      }

      setError(result);
      setStatus("error");
    });
  }, []);

  const analyze = useCallback(
    (description: string, locale: Locale) => {
      const trimmed = description.trim();
      const nextSubmitted: SubmittedRequest = { description: trimmed, locale };

      submittedRef.current = nextSubmitted;
      setSubmitted(nextSubmitted);
      run(trimmed, locale);
    },
    [run],
  );

  const retry = useCallback(() => {
    const current = submittedRef.current;
    if (current) {
      run(current.description, current.locale);
    }
  }, [run]);

  return {
    status,
    analysis,
    error,
    submitted,
    requestId,
    analyze,
    retry,
  };
}
