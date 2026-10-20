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

export const descriptionSchema = z
  .string()
  .trim()
  .min(10, "Please describe your symptoms in at least 10 characters.")
  .max(2000, "Please keep your description under 2,000 characters.");

export const analyzeRequestSchema = z.object({
  description: descriptionSchema,
  locale: localeSchema.default("en"),
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
  disclaimer: localizedTextSchema,
});
export type MedicalAnalysis = z.infer<typeof medicalAnalysisSchema>;

export const analyzeResponseSchema = z.object({
  analysis: medicalAnalysisSchema,
});
export type AnalyzeResponse = z.infer<typeof analyzeResponseSchema>;

export const aiAnalysisContentSchema = z.object({
  detectedLanguage: detectedLanguageSchema,
  normalized: localizedTextSchema,
  terminology: z.array(aiTerminologyItemSchema).min(0).max(10),
  clarifications: z.array(aiClarificationSchema).min(0).max(5),
  clinicalInterpretations: z.array(aiClinicalInterpretationSchema).min(0).max(3),
});
export type AiAnalysisContent = z.infer<typeof aiAnalysisContentSchema>;

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
