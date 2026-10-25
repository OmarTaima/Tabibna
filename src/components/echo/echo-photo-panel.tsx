import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { useLocale } from "@/i18n/use-locale";

type EchoPhotoPanelProps = {
  oneAtATime: boolean;
  children: ReactNode;
};

export function EchoPhotoPanel({ oneAtATime, children }: EchoPhotoPanelProps) {
  const { copy } = useLocale();

  return (
    <Card className="p-5 sm:p-6">
      <h2
        id="echo-photo-title"
        className="font-display text-[17px] font-semibold text-ink sm:text-lg"
      >
        {copy.echo.photo.title}
      </h2>
      <p
        id="echo-photo-help"
        className="mt-1.5 text-[13px] leading-6 text-bodytext"
      >
        {copy.echo.photo.help}
      </p>

      {children}

      {oneAtATime ? (
        <p role="status" className="mt-2 text-[11.5px] text-bodytext">
          {copy.echo.photo.oneAtATime}
        </p>
      ) : null}

      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-line bg-brand-soft px-4 py-3">
        <ShieldCheck
          className="mt-0.5 h-4 w-4 shrink-0 text-brand"
          aria-hidden="true"
        />
        <div>
          <p className="text-[12.5px] font-semibold text-ink">
            {copy.echo.photo.privacyTitle}
          </p>
          <p className="mt-0.5 text-[12.5px] leading-6 text-bodytext">
            {copy.echo.photo.privacy}
          </p>
        </div>
      </div>

      <details className="mt-3">
        <summary className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded text-[12.5px] font-semibold text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-white">
          {copy.echo.photo.tipsTitle}
        </summary>
        <ul className="mt-2 list-disc space-y-1 ps-5 text-[12px] leading-6 text-bodytext">
          <li>{copy.echo.photo.tipLight}</li>
          <li>{copy.echo.photo.tipFlat}</li>
          <li>{copy.echo.photo.tipSharp}</li>
        </ul>
      </details>
    </Card>
  );
}
