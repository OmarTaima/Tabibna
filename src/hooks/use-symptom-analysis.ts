import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AnalysisMeta,
  FollowUpAnswer,
  FollowUpQuestion,
  Locale,
  MedicalAnalysis,
} from "@shared/contract";
import { analyzeSymptoms, type ApiError } from "@/lib/api";

export type AnalysisStatus = "idle" | "loading" | "questions" | "success" | "error";

export type SubmittedRequest = {
  description: string;
  locale: Locale;
  round: number;
  answers: FollowUpAnswer[];
};

export function useSymptomAnalysis() {
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [analysis, setAnalysis] = useState<MedicalAnalysis | null>(null);
  const [questions, setQuestions] = useState<FollowUpQuestion[] | null>(null);
  const [questionHistory, setQuestionHistory] = useState<FollowUpQuestion[]>([]);
  const [round, setRound] = useState(0);
  const [answers, setAnswers] = useState<FollowUpAnswer[]>([]);
  const [meta, setMeta] = useState<AnalysisMeta | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [submitted, setSubmitted] = useState<SubmittedRequest | null>(null);
  const [requestId, setRequestId] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const sequenceRef = useRef(0);
  const submittedRef = useRef<SubmittedRequest | null>(null);
  const answersRef = useRef<FollowUpAnswer[]>([]);
  const roundRef = useRef(0);

  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    [],
  );

  const run = useCallback((request: SubmittedRequest) => {
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    const sequence = sequenceRef.current + 1;
    sequenceRef.current = sequence;

    submittedRef.current = request;
    setSubmitted(request);
    setRequestId(sequence);
    setStatus("loading");
    setAnalysis(null);
    setError(null);

    const isCurrent = () =>
      sequenceRef.current === sequence && !controller.signal.aborted;

    void analyzeSymptoms(
      request.description,
      request.locale,
      request.round,
      request.answers,
      controller.signal,
    ).then((result) => {
      if (!isCurrent()) {
        return;
      }

      if (result.ok) {
        if (result.data.status === "follow_up") {
          const nextQuestions = result.data.questions;

          setQuestions(nextQuestions);
          setQuestionHistory((current) => {
            const known = new Set(current.map((question) => question.id));
            return [
              ...current,
              ...nextQuestions.filter((question) => !known.has(question.id)),
            ];
          });
          setRound(result.data.round);
          roundRef.current = result.data.round;
          setMeta(result.data.meta);
          setStatus("questions");
          return;
        }

        setAnalysis(result.data.analysis);
        setQuestions(null);
        setMeta(result.data.analysis.meta);
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

      answersRef.current = [];
      roundRef.current = 0;
      setAnswers([]);
      setRound(0);
      setQuestions(null);
      setQuestionHistory([]);
      setMeta(null);

      run({
        description: trimmed,
        locale,
        round: 0,
        answers: [],
      });
    },
    [run],
  );

  const submitAnswers = useCallback(
    (answersForRound: FollowUpAnswer[]) => {
      const current = submittedRef.current;
      if (!current) {
        return;
      }

      const combined = [...answersRef.current, ...answersForRound];
      answersRef.current = combined;
      setAnswers(combined);

      run({
        description: current.description,
        locale: current.locale,
        round: roundRef.current,
        answers: combined,
      });
    },
    [run],
  );

  const retry = useCallback(() => {
    const current = submittedRef.current;
    if (current) {
      run(current);
    }
  }, [run]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    sequenceRef.current += 1;

    submittedRef.current = null;
    answersRef.current = [];
    roundRef.current = 0;

    setStatus("idle");
    setAnalysis(null);
    setQuestions(null);
    setQuestionHistory([]);
    setRound(0);
    setAnswers([]);
    setMeta(null);
    setError(null);
    setSubmitted(null);
  }, []);

  return {
    status,
    analysis,
    questions,
    questionHistory,
    round,
    answers,
    meta,
    error,
    submitted,
    requestId,
    analyze,
    submitAnswers,
    retry,
    reset,
  };
}
