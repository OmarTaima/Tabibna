import { RotateCcw, ScanText, Trash2 } from "lucide-react";
import {
  useEffect,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n/use-locale";
import { formatDimensions, formatFileSize } from "@/lib/ocr-text";
import type { PhotoMeta } from "@/lib/ocr";

export type EchoConfirmAction = "reread" | "remove";

type EchoPhotoPreviewProps = {
  previewUrl: string;
  meta: PhotoMeta;
  busy: boolean;
  readAgain: boolean;
  confirmAction: EchoConfirmAction | null;
  headingRef: RefObject<HTMLHeadingElement | null>;
  readButtonRef: RefObject<HTMLButtonElement | null>;
  removeButtonRef: RefObject<HTMLButtonElement | null>;
  confirmButtonRef: RefObject<HTMLButtonElement | null>;
  children: ReactNode;
  onRead: () => void;
  onRemove: () => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export function EchoPhotoPreview({
  previewUrl,
  meta,
  busy,
  readAgain,
  confirmAction,
  headingRef,
  readButtonRef,
  removeButtonRef,
  confirmButtonRef,
  children,
  onRead,
  onRemove,
  onConfirm,
  onCancel,
}: EchoPhotoPreviewProps) {
  const { copy } = useLocale();

  useEffect(() => {
    if (!confirmAction) {
      return;
    }

    confirmButtonRef.current?.focus();
    confirmButtonRef.current?.scrollIntoView({ block: "nearest" });
  }, [confirmAction, confirmButtonRef]);

  const handleConfirmKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") {
      return;
    }

    event.stopPropagation();
    onCancel();
  };

  const confirmMessage =
    confirmAction === "remove"
      ? copy.echo.photo.removeConfirm
      : copy.echo.photo.rereadConfirm;
  const confirmLabel =
    confirmAction === "remove"
      ? copy.echo.photo.removeConfirmAction
      : copy.echo.photo.rereadConfirmAction;

  return (
    <div className="mt-4">
      <section aria-labelledby="echo-photo-preview-title">
        <h3
          id="echo-photo-preview-title"
          ref={headingRef}
          tabIndex={-1}
          className="scroll-mt-24 rounded-md font-display text-[15px] font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-4 focus-visible:ring-offset-white"
        >
          {copy.echo.photo.previewTitle}
        </h3>

        <div className="mt-3 rounded-xl border border-line bg-page p-3">
          <img
            src={previewUrl}
            alt={copy.echo.photo.previewAlt}
            className="mx-auto max-h-[240px] w-auto max-w-full rounded-lg object-contain sm:max-h-[300px]"
          />
        </div>

        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-bodytext">
          <span className="sr-only">{copy.echo.photo.metaLabel}</span>
          <span dir="ltr">
            {formatFileSize(meta.bytes)} · {formatDimensions(meta.width, meta.height)}
          </span>
        </p>
      </section>

      {children}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:justify-end">
        <Button
          ref={readButtonRef}
          type="button"
          variant={readAgain ? "secondary" : "primary"}
          onClick={onRead}
          disabled={busy}
        >
          {readAgain ? (
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ScanText className="h-4 w-4" aria-hidden="true" />
          )}
          {readAgain ? copy.echo.photo.readAgain : copy.echo.photo.read}
        </Button>
        <Button
          ref={removeButtonRef}
          type="button"
          variant="ghost"
          onClick={onRemove}
          disabled={busy}
          className="text-urgent hover:bg-urgent-soft"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          {copy.echo.photo.remove}
        </Button>
      </div>

      {confirmAction ? (
        <div
          role="group"
          aria-labelledby="echo-photo-confirm-text"
          onKeyDown={handleConfirmKeyDown}
          className="mt-3 rounded-xl border border-caution-border bg-caution-soft p-3"
        >
          <p
            id="echo-photo-confirm-text"
            className="text-[12.5px] leading-6 text-caution-ink"
          >
            {confirmMessage}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              ref={confirmButtonRef}
              type="button"
              variant="secondary"
              size="sm"
              onClick={onConfirm}
              disabled={busy}
              className="border-caution-border bg-white text-caution-ink hover:bg-white"
            >
              {confirmLabel}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              {copy.echo.photo.keepEdits}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
