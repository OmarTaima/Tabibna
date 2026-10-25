import { z } from "zod";

export const localeSchema = z.enum(["en", "ar"]);
export type Locale = z.infer<typeof localeSchema>;

export const localizedTextSchema = z.object({
  en: z.string().trim().min(1).max(2400),
  ar: z.string().trim().min(1).max(2400),
});
export type LocalizedText = z.infer<typeof localizedTextSchema>;

export const analysisModeSchema = z.enum(["live", "mock"]);
export type AnalysisMode = z.infer<typeof analysisModeSchema>;

export const detectedLanguageSchema = z.enum(["ar-EG", "ar", "en", "mixed", "unknown"]);
export type DetectedLanguage = z.infer<typeof detectedLanguageSchema>;

export const termKindSchema = z.enum(["symptom", "sign", "finding", "context"]);
export const termOriginSchema = z.enum(["reported", "interpretation"]);
export const confidenceSchema = z.enum(["low", "moderate"]);
export const diagnosisConfidenceSchema = z.enum(["low", "moderate", "high"]);
export type DiagnosisConfidence = z.infer<typeof diagnosisConfidenceSchema>;

const terminologyFields = {
  english: z.string().trim().min(1).max(160),
  arabic: z.string().trim().min(1).max(160),
  kind: termKindSchema,
  origin: termOriginSchema,
  explanation: localizedTextSchema,
  evidence: z.string().trim().max(400).optional(),
  certainty: z.enum(["stated", "inferred"]),
};

export const terminologyItemSchema = z.object({
  id: z.string().min(1),
  ...terminologyFields,
});
export type TerminologyItem = z.infer<typeof terminologyItemSchema>;

export const aiTerminologyItemSchema = z.object(terminologyFields);
export type AiTerminologyItem = z.infer<typeof aiTerminologyItemSchema>;

const clarificationFields = {
  label: localizedTextSchema,
  question: localizedTextSchema,
};

export const clarificationSchema = z.object({
  id: z.string().min(1),
  ...clarificationFields,
});
export type Clarification = z.infer<typeof clarificationSchema>;

export const aiClarificationSchema = z.object(clarificationFields);

const interpretationFields = {
  label: localizedTextSchema,
  detail: localizedTextSchema,
  basis: localizedTextSchema,
  confidence: confidenceSchema,
};

export const clinicalInterpretationSchema = z.object({
  id: z.string().min(1),
  ...interpretationFields,
});
export type ClinicalInterpretation = z.infer<typeof clinicalInterpretationSchema>;

export const aiClinicalInterpretationSchema = z.object(interpretationFields);

export const impressionFields = {
  primary: localizedTextSchema,
  confidence: diagnosisConfidenceSchema,
  differentials: z.array(localizedTextSchema).max(4),
  rationale: localizedTextSchema,
};

export const impressionSchema = z.object(impressionFields);
export type Impression = z.infer<typeof impressionSchema>;

export const aiImpressionSchema = z.object(impressionFields);
export type AiImpression = z.infer<typeof aiImpressionSchema>;

export const descriptionSchema = z
  .string()
  .trim()
  .min(10, "Please describe your symptoms in at least 10 characters.")
  .max(2000, "Please keep your description under 2,000 characters.");

export const MAX_FOLLOW_UP_ROUNDS = 2;
export const MAX_FOLLOW_UP_QUESTIONS = 3;
export const MAX_FOLLOW_UP_ANSWERS = MAX_FOLLOW_UP_ROUNDS * MAX_FOLLOW_UP_QUESTIONS;

export const followUpQuestionSchema = z.object({
  id: z.string().min(1).max(80),
  en: z.string().trim().min(1).max(400),
  ar: z.string().trim().min(1).max(400),
});
export type FollowUpQuestion = z.infer<typeof followUpQuestionSchema>;

export const followUpAnswerSchema = z.object({
  questionId: z.string().min(1).max(80),
  question: z.string().trim().min(1).max(400),
  answer: z.string().trim().min(1).max(1000),
});
export type FollowUpAnswer = z.infer<typeof followUpAnswerSchema>;

export const analyzeRequestSchema = z.object({
  description: descriptionSchema,
  locale: localeSchema.default("en"),
  round: z.number().int().min(0).max(MAX_FOLLOW_UP_ROUNDS).default(0),
  answers: z.array(followUpAnswerSchema).max(MAX_FOLLOW_UP_ANSWERS).default([]),
});
export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

export const analysisMetaSchema = z.object({
  mode: analysisModeSchema,
  model: z.string().nullable(),
  generatedAt: z.string().min(1),
  notice: localizedTextSchema,
});
export type AnalysisMeta = z.infer<typeof analysisMetaSchema>;

export const medicalAnalysisSchema = z.object({
  id: z.string().min(1),
  meta: analysisMetaSchema,
  original: z.string().min(1).max(2000),
  detectedLanguage: detectedLanguageSchema,
  normalized: localizedTextSchema,
  terminology: z.array(terminologyItemSchema).min(0).max(10),
  clarifications: z.array(clarificationSchema).min(0).max(5),
  clinicalInterpretations: z.array(clinicalInterpretationSchema).min(0).max(3),
  impression: impressionSchema,
  disclaimer: localizedTextSchema,
});
export type MedicalAnalysis = z.infer<typeof medicalAnalysisSchema>;

export const followUpResponseSchema = z.object({
  status: z.literal("follow_up"),
  round: z.number().int().min(1).max(MAX_FOLLOW_UP_ROUNDS),
  questions: z.array(followUpQuestionSchema).min(1).max(MAX_FOLLOW_UP_QUESTIONS),
  meta: analysisMetaSchema,
});
export type FollowUpResponse = z.infer<typeof followUpResponseSchema>;

export const completeAnalysisResponseSchema = z.object({
  status: z.literal("complete"),
  analysis: medicalAnalysisSchema,
});
export type CompleteAnalysisResponse = z.infer<typeof completeAnalysisResponseSchema>;

export const analyzeResponseSchema = z.discriminatedUnion("status", [
  followUpResponseSchema,
  completeAnalysisResponseSchema,
]);
export type AnalyzeResponse = z.infer<typeof analyzeResponseSchema>;

export const aiFollowUpQuestionSchema = z.object({
  en: z.string().trim().min(1).max(400),
  ar: z.string().trim().min(1).max(400),
});
export type AiFollowUpQuestion = z.infer<typeof aiFollowUpQuestionSchema>;

export const aiFollowUpContentSchema = z.object({
  questions: z.array(aiFollowUpQuestionSchema).min(1).max(MAX_FOLLOW_UP_QUESTIONS),
});
export type AiFollowUpContent = z.infer<typeof aiFollowUpContentSchema>;

export const aiAnalysisContentSchema = z.object({
  detectedLanguage: detectedLanguageSchema,
  normalized: localizedTextSchema,
  terminology: z.array(aiTerminologyItemSchema).min(0).max(10),
  clarifications: z.array(aiClarificationSchema).min(0).max(5),
  clinicalInterpretations: z.array(aiClinicalInterpretationSchema).min(0).max(3),
  impression: aiImpressionSchema,
});
export type AiAnalysisContent = z.infer<typeof aiAnalysisContentSchema>;

export const aiFollowUpDecisionSchema = z.discriminatedUnion("decision", [
  z.object({
    decision: z.literal("ask"),
    questions: z.array(aiFollowUpQuestionSchema).min(1).max(MAX_FOLLOW_UP_QUESTIONS),
  }),
  z.object({
    decision: z.literal("final"),
    analysis: aiAnalysisContentSchema,
  }),
]);
export type AiFollowUpDecision = z.infer<typeof aiFollowUpDecisionSchema>;

export const MIN_ECHO_TEXT_LENGTH = 10;
export const MAX_ECHO_TEXT_LENGTH = 4000;

export const echoSourceSchema = z.enum(["text", "photo"]);
export type EchoSource = z.infer<typeof echoSourceSchema>;

export const echoRequestSchema = z.object({
  text: z
    .string()
    .trim()
    .min(MIN_ECHO_TEXT_LENGTH, "Please paste an echocardiography report of at least 10 characters.")
    .max(MAX_ECHO_TEXT_LENGTH, "Please keep the report under 4,000 characters."),
  locale: localeSchema.default("en"),
  source: echoSourceSchema.default("text"),
});
export type EchoRequest = z.infer<typeof echoRequestSchema>;

export const echoTermSchema = z.object({
  id: z.string().min(1),
  term: localizedTextSchema,
  explanation: localizedTextSchema,
});
export type EchoTerm = z.infer<typeof echoTermSchema>;

export const echoAnalysisSchema = z.object({
  id: z.string().min(1),
  meta: analysisMetaSchema,
  source: echoSourceSchema,
  original: z.string().min(1).max(MAX_ECHO_TEXT_LENGTH),
  summary: localizedTextSchema,
  terms: z.array(echoTermSchema).min(0).max(15),
});
export type EchoAnalysis = z.infer<typeof echoAnalysisSchema>;

export const echoResponseSchema = z.object({
  analysis: echoAnalysisSchema,
});
export type EchoResponse = z.infer<typeof echoResponseSchema>;

export const aiEchoTermSchema = z.object({
  term: localizedTextSchema,
  explanation: localizedTextSchema,
});
export type AiEchoTerm = z.infer<typeof aiEchoTermSchema>;

export const aiEchoContentSchema = z.object({
  summary: localizedTextSchema,
  terms: z.array(aiEchoTermSchema).min(0).max(15),
});
export type AiEchoContent = z.infer<typeof aiEchoContentSchema>;

export const healthResponseSchema = z.object({
  status: z.literal("ok"),
  mode: analysisModeSchema,
  aiConfigured: z.boolean(),
  version: z.string(),
});
export type HealthResponse = z.infer<typeof healthResponseSchema>;

export const apiErrorSchema = z.object({
  error: z.string().min(1),
  code: z.string().min(1),
  requestId: z.string().optional(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

export const MIN_DESCRIPTION_LENGTH = 10;
export const MAX_DESCRIPTION_LENGTH = 2000;
