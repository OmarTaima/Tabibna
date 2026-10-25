import type { LoggerMessage, Worker } from "tesseract.js";

export type ReportLanguage = "eng" | "ara" | "eng+ara";

export type OcrStage = "engine" | "language" | "recognizing";

export type OcrProgress = {
  stage: OcrStage;
  percent: number | null;
};

export type ImageMeta = {
  width: number;
  height: number;
};

export type PhotoMeta = ImageMeta & {
  bytes: number;
};

export type OcrOutcome =
  | { ok: true; text: string; confidence: number | null }
  | { ok: false; reason: "prepare" | "recognize" };

export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const LOW_CONFIDENCE_THRESHOLD = 70;

const MAX_OCR_EDGE = 2200;

const STAGE_BY_STATUS: Record<string, OcrStage | undefined> = {
  "loading tesseract core": "engine",
  "initializing tesseract": "engine",
  "loading language traineddata": "language",
  "initializing api": "language",
  "recognizing text": "recognizing",
};

let workerPromise: Promise<Worker> | null = null;
let workerLanguage: ReportLanguage | null = null;
let progressListener: ((progress: OcrProgress) => void) | null = null;

function handleLogger(message: LoggerMessage): void {
  const stage = STAGE_BY_STATUS[message.status];

  if (!stage || !progressListener) {
    return;
  }

  progressListener({
    stage,
    percent: stage === "recognizing" ? Math.round(message.progress * 100) : null,
  });
}

export function isReportLanguage(value: string): value is ReportLanguage {
  return value === "eng" || value === "ara" || value === "eng+ara";
}

export async function releaseOcrWorker(): Promise<void> {
  const pending = workerPromise;
  workerPromise = null;
  workerLanguage = null;

  if (!pending) {
    return;
  }

  try {
    const worker = await pending;
    await worker.terminate();
  } catch {
    // A worker that never initialized holds no resources to release.
  }
}

async function getWorker(language: ReportLanguage): Promise<Worker> {
  if (workerPromise && workerLanguage === language) {
    return workerPromise;
  }

  await releaseOcrWorker();

  const { createWorker, PSM } = await import("tesseract.js");

  workerLanguage = language;
  const created = createWorker(language, undefined, { logger: handleLogger });
  workerPromise = created;

  try {
    const worker = await created;
    await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO });
    return worker;
  } catch (error) {
    if (workerPromise === created) {
      workerPromise = null;
      workerLanguage = null;
    }
    throw error;
  }
}

type DecodedImage = {
  source: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
};

function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("image_decode_failed"));
    image.src = url;
  });
}

async function decodeImage(file: File): Promise<DecodedImage> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close(),
      };
    } catch {
      // Some browsers reject createImageBitmap for formats their <img> decoder still handles.
    }
  }

  const url = URL.createObjectURL(file);

  try {
    const image = await loadImageElement(url);

    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      release: () => URL.revokeObjectURL(url),
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

export async function readImageMeta(file: File): Promise<ImageMeta> {
  const decoded = await decodeImage(file);

  try {
    return { width: decoded.width, height: decoded.height };
  } finally {
    decoded.release();
  }
}

export async function prepareImageForOcr(file: File): Promise<HTMLCanvasElement> {
  const decoded = await decodeImage(file);

  try {
    const scale = Math.min(1, MAX_OCR_EDGE / Math.max(decoded.width, decoded.height));
    const width = Math.max(1, Math.round(decoded.width * scale));
    const height = Math.max(1, Math.round(decoded.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("canvas_unavailable");
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(decoded.source, 0, 0, width, height);

    return canvas;
  } finally {
    decoded.release();
  }
}

export async function recognizeReportPhoto(
  file: File,
  language: ReportLanguage,
  onProgress: (progress: OcrProgress) => void,
): Promise<OcrOutcome> {
  progressListener = onProgress;

  try {
    let worker: Worker;

    try {
      worker = await getWorker(language);
    } catch {
      return { ok: false, reason: "prepare" };
    }

    let canvas: HTMLCanvasElement;

    try {
      canvas = await prepareImageForOcr(file);
    } catch {
      return { ok: false, reason: "recognize" };
    }

    onProgress({ stage: "recognizing", percent: 0 });

    try {
      const result = await worker.recognize(canvas);
      const confidence = Number.isFinite(result.data.confidence)
        ? result.data.confidence
        : null;

      return { ok: true, text: result.data.text, confidence };
    } catch {
      return { ok: false, reason: "recognize" };
    }
  } finally {
    progressListener = null;
  }
}
