import { AlertCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n/use-locale";
import type { PhotoErrorKind } from "@/hooks/use-echo-photo-ocr";
import { cn } from "@/lib/utils";

export type EchoPhotoIssue = PhotoErrorKind | "noPhoto" | "readFirst";

type EchoPhotoErrorProps = {
  issue: EchoPhotoIssue;
  onRead: () => void;
  onTakePhoto: () => void;
  onChooseAnother: () => void;
  onPasteInstead: () => void;
};

type PhotoErrorAction = {
  label: string;
  onClick: () => void;
  variant: "secondary" | "ghost";
  className?: string;
};

export function EchoPhotoError({
  issue,
  onRead,
  onTakePhoto,
  onChooseAnother,
  onPasteInstead,
}: EchoPhotoErrorProps) {
  const { copy } = useLocale();
  const primaryActionRef = useRef<HTMLButtonElement | null>(null);

  const messages: Record<EchoPhotoIssue, string> = {
    noPhoto: copy.echo.photo.noPhoto,
    readFirst: copy.echo.photo.readFirst,
    unsupportedType: copy.echo.photo.unsupportedType,
    tooLarge: copy.echo.photo.tooLarge,
    offline: copy.echo.photo.offline,
    prepareFailed: copy.echo.photo.prepareFailed,
    readerFailed: copy.echo.photo.readerFailed,
    notEnoughText: copy.echo.photo.notEnoughText,
  };

  const pasteAction: PhotoErrorAction = {
    label: copy.echo.photo.pasteInstead,
    onClick: onPasteInstead,
    variant: "ghost",
    className: "text-urgent-ink hover:bg-white/60",
  };

  let actions: PhotoErrorAction[];

  switch (issue) {
    case "noPhoto":
      actions = [
        { label: copy.echo.photo.take, onClick: onTakePhoto, variant: "secondary" },
        {
          label: copy.echo.photo.choose,
          onClick: onChooseAnother,
          variant: "ghost",
        },
      ];
      break;
    case "readFirst":
      actions = [
        { label: copy.echo.photo.read, onClick: onRead, variant: "secondary" },
      ];
      break;
    case "unsupportedType":
    case "tooLarge":
      actions = [
        {
          label: copy.echo.photo.chooseAnother,
          onClick: onChooseAnother,
          variant: "secondary",
        },
        pasteAction,
      ];
      break;
    case "offline":
    case "prepareFailed":
      actions = [
        { label: copy.echo.photoErrors.retry, onClick: onRead, variant: "secondary" },
        pasteAction,
      ];
      break;
    case "readerFailed":
    case "notEnoughText":
      actions = [
        {
          label: copy.echo.photo.readAgain,
          onClick: onRead,
          variant: "secondary",
        },
        pasteAction,
      ];
      break;
  }

  useEffect(() => {
    primaryActionRef.current?.focus();
    primaryActionRef.current?.scrollIntoView({ block: "nearest" });
  }, [issue]);

  return (
    <div
      role="alert"
      aria-labelledby="echo-photo-error-message"
      className="flex items-start gap-2.5 rounded-xl border border-urgent-border bg-urgent-soft px-4 py-3"
    >
      <AlertCircle
        className="mt-0.5 h-4 w-4 shrink-0 text-urgent"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p
          id="echo-photo-error-message"
          className="text-[12.5px] leading-6 text-urgent-ink"
        >
          {messages[issue]}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {actions.map((action, index) => (
            <Button
              key={action.label}
              ref={index === 0 ? primaryActionRef : undefined}
              type="button"
              variant={action.variant}
              size="sm"
              onClick={action.onClick}
              className={cn(action.className)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
