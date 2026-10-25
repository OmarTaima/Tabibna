import { useCallback, useEffect, useRef, useState } from "react";
import type { EchoAnalysis, Locale } from "@shared/contract";
import { analyzeEcho, type ApiError } from "@/lib/api";

export type EchoStatus = "idle" | "loading" | "success" | "error";

type EchoRequest = {
  text: string;
  locale: Locale;
};

export function useEchoAnalysis() {
  const [status, setStatus] = useState<EchoStatus>("idle");
  const [analysis, setAnalysis] = useState<EchoAnalysis | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const sequenceRef = useRef(0);
  const lastRequestRef = useRef<EchoRequest | null>(null);

  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    [],
  );

  const run = useCallback((request: EchoRequest) => {
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    const sequence = sequenceRef.current + 1;
    sequenceRef.current = sequence;

    lastRequestRef.current = request;
    setStatus("loading");
    setAnalysis(null);
    setError(null);

    const isCurrent = () =>
      sequenceRef.current === sequence && !controller.signal.aborted;

    void analyzeEcho(request.text, request.locale, controller.signal).then(
      (result) => {
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
      },
    );
  }, []);

  const analyze = useCallback(
    (text: string, locale: Locale) => {
      run({ text: text.trim(), locale });
    },
    [run],
  );

  const retry = useCallback(() => {
    const current = lastRequestRef.current;
    if (current) {
      run(current);
    }
  }, [run]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    sequenceRef.current += 1;
    lastRequestRef.current = null;

    setStatus("idle");
    setAnalysis(null);
    setError(null);
  }, []);

  return { status, analysis, error, analyze, retry, reset };
}
