import { zodResolver } from "@hookform/resolvers/zod";
import {
  MAX_DESCRIPTION_LENGTH,
  MIN_DESCRIPTION_LENGTH,
} from "@shared/contract";
import { Loader2, LockKeyhole, SearchCheck } from "lucide-react";
import {
  useEffect,
  useRef,
  type KeyboardEvent,
} from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLocale } from "@/i18n/use-locale";
import { cn } from "@/lib/utils";

const symptomSchema = z.object({
  description: z
    .string()
    .trim()
    .min(MIN_DESCRIPTION_LENGTH, "too_short")
    .max(MAX_DESCRIPTION_LENGTH, "too_long"),
});

type SymptomValues = z.infer<typeof symptomSchema>;

type SymptomFormProps = {
  loading: boolean;
  onSubmit: (description: string) => void;
  onDescriptionChange: (description: string) => void;
  focusSignal: number;
};

export function SymptomForm({
  loading,
  onSubmit,
  onDescriptionChange,
  focusSignal,
}: SymptomFormProps) {
  const { copy } = useLocale();
  const formRef = useRef<HTMLFormElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setFocus,
    formState: { errors },
  } = useForm<SymptomValues>({
    resolver: zodResolver(symptomSchema),
    defaultValues: { description: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  const description = watch("description");
  const fieldError = errors.description?.message;
  const errorMessage =
    fieldError === "too_long" ? copy.form.errorMax : fieldError ? copy.form.errorMin : null;
  const count = description.length;
  const { ref: fieldRef, ...fieldRegistration } = register("description");

  useEffect(() => {
    onDescriptionChange(description);
  }, [description, onDescriptionChange]);

  useEffect(() => {
    if (focusSignal === 0) {
      return;
    }

    textareaRef.current?.focus();
    textareaRef.current?.scrollIntoView({ block: "center" });
  }, [focusSignal]);

  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      if (!loading) {
        formRef.current?.requestSubmit();
      }
    }
  };

  const fillExample = (text: string) => {
    setValue("description", text, { shouldValidate: false, shouldDirty: true });
    textareaRef.current?.focus();
  };

  const describedBy = [
    "symptom-helper",
    "symptom-count",
    errorMessage ? "symptom-error" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <form
      ref={formRef}
      noValidate
      aria-label={copy.form.regionLabel}
      aria-busy={loading}
      onSubmit={handleSubmit(
        (values) => onSubmit(values.description.trim()),
        () => setFocus("description"),
      )}
      onKeyDown={handleKeyDown}
      className="rounded-2xl border border-line bg-white p-5 shadow-soft sm:p-7"
    >
      <label
        htmlFor="symptom-description"
        className="block font-display text-[17px] font-semibold text-ink sm:text-lg"
      >
        {copy.form.label}
      </label>
      <p
        id="symptom-helper"
        className="mt-1.5 max-w-[620px] text-[13px] leading-6 text-bodytext"
      >
        {copy.form.helper}
      </p>

      <Textarea
        id="symptom-description"
        {...fieldRegistration}
        ref={(node) => {
          fieldRef(node);
          textareaRef.current = node;
        }}
        dir="auto"
        maxLength={MAX_DESCRIPTION_LENGTH}
        placeholder={copy.form.placeholder}
        aria-invalid={errorMessage ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "mt-4",
          errorMessage &&
            "border-urgent focus-visible:border-urgent focus-visible:ring-urgent/20",
        )}
      />

      <div className="mt-2.5 flex flex-col gap-1.5 text-[11.5px] text-bodytext sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="flex items-center gap-1.5">
          <LockKeyhole className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{copy.form.privacy}</span>
        </p>
        <p
          id="symptom-count"
          className="shrink-0 tabular-nums text-bodytext sm:text-end"
        >
          <span className="sr-only">{copy.form.charCountLabel(count)}</span>
          <span
            aria-hidden="true"
            dir="ltr"
            lang="en"
            className="inline-block"
          >
            {copy.form.charCount(count)}
          </span>
        </p>
      </div>

      {errorMessage ? (
        <p
          id="symptom-error"
          role="alert"
          className="mt-2.5 text-[12.5px] font-medium text-urgent"
        >
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-[12px] font-medium text-bodytext">
          {copy.form.examplesLabel}
        </span>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => fillExample(copy.form.exampleArabicText)}
        >
          {copy.form.exampleArabicLabel}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => fillExample(copy.form.exampleEnglishText)}
        >
          {copy.form.exampleEnglishLabel}
        </Button>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="mt-5 w-full"
      >
        {loading ? (
          <Loader2
            className="h-4 w-4 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
        ) : (
          <SearchCheck className="h-4 w-4" aria-hidden="true" />
        )}
        {loading ? copy.form.submitting : copy.form.submit}
      </Button>

      <p className="mt-2.5 hidden text-center text-[11.5px] text-bodytext sm:block">
        {copy.form.shortcut}
      </p>
    </form>
  );
}
