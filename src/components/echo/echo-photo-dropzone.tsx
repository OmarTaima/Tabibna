import { Camera, ImagePlus, ImageUp } from "lucide-react";
import { useState, type DragEvent, type RefObject } from "react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n/use-locale";
import { cn } from "@/lib/utils";

type EchoPhotoDropzoneProps = {
  onTakePhoto: () => void;
  onChoosePhoto: () => void;
  onFiles: (files: File[]) => void;
  takeButtonRef: RefObject<HTMLButtonElement | null>;
  chooseButtonRef: RefObject<HTMLButtonElement | null>;
};

export function EchoPhotoDropzone({
  onTakePhoto,
  onChoosePhoto,
  onFiles,
  takeButtonRef,
  chooseButtonRef,
}: EchoPhotoDropzoneProps) {
  const { copy } = useLocale();
  const [dragActive, setDragActive] = useState(false);

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    const related = event.relatedTarget;

    if (related instanceof Node && event.currentTarget.contains(related)) {
      return;
    }

    setDragActive(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);

    const files = Array.from(event.dataTransfer.files);

    if (files.length > 0) {
      onFiles(files);
    }
  };

  return (
    <div
      role="group"
      aria-labelledby="echo-photo-drop-title"
      aria-describedby="echo-photo-help echo-photo-formats"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "mt-4 min-h-[196px] rounded-2xl border-2 border-dashed border-line bg-brand-soft px-5 py-7 text-center sm:min-h-[220px] sm:px-8 sm:py-9",
        dragActive && "border-brand bg-brand-mist",
      )}
    >
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-line bg-white text-brand">
        <ImagePlus className="h-5 w-5" aria-hidden="true" />
      </span>

      <h3
        id="echo-photo-drop-title"
        className="mt-3 text-[14.5px] font-semibold text-ink"
      >
        {dragActive ? copy.echo.photo.dropNow : copy.echo.photo.dropTitle}
      </h3>

      <p className="mt-1 text-[12.5px] leading-6 text-bodytext">
        <span className="hidden sm:block">{copy.echo.photo.dropHint}</span>
        <span className="sm:hidden">{copy.echo.photo.mobileHint}</span>
      </p>

      <p
        id="echo-photo-formats"
        className="mt-1 text-[11.5px] leading-5 text-bodytext"
      >
        {copy.echo.photo.formats}
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button
          ref={takeButtonRef}
          type="button"
          onClick={onTakePhoto}
          className="w-full sm:w-auto"
        >
          <Camera className="h-4 w-4" aria-hidden="true" />
          {copy.echo.photo.take}
        </Button>
        <Button
          ref={chooseButtonRef}
          type="button"
          variant="secondary"
          onClick={onChoosePhoto}
          className="w-full sm:w-auto"
        >
          <ImageUp className="h-4 w-4" aria-hidden="true" />
          {copy.echo.photo.choose}
        </Button>
      </div>
    </div>
  );
}
