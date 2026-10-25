import type { ZodError, ZodType } from "zod";
import { AppError } from "./errors.ts";

function validationMessage(error: ZodError): string {
  const issue = error.issues[0];
  if (issue === undefined) return "Please check your input and try again.";

  const path = issue.path.join(".");

  if (path === "description") {
    if (issue.code === "too_small") {
      return "Please describe your symptoms in at least 10 characters.";
    }
    if (issue.code === "too_big") {
      return "Please keep your description under 2,000 characters.";
    }
    return "Please provide a description as text.";
  }

  if (path === "text") {
    if (issue.code === "too_small") {
      return "Please paste an echocardiography report of at least 10 characters.";
    }
    if (issue.code === "too_big") {
      return "Please keep the report under 4,000 characters.";
    }
    return "Please provide the echocardiography report as text.";
  }

  if (path === "locale") {
    return "Unsupported language. Use 'en' or 'ar'.";
  }

  if (path === "source") {
    return "Unsupported report source. Use 'text' or 'photo'.";
  }

  if (path === "round") {
    return "Please use a follow-up round between 0 and 2.";
  }

  if (path.startsWith("answers")) {
    return "Please check the follow-up answers and try again.";
  }

  if (path === "") {
    return "Please send a JSON object with the required fields.";
  }

  return "Please check your input and try again.";
}

export function parseRequest<Output, Input>(
  schema: ZodType<Output, Input>,
  input: unknown,
): Output {
  const result = schema.safeParse(input);
  if (result.success) return result.data;
  throw new AppError(400, "INVALID_INPUT", validationMessage(result.error));
}
