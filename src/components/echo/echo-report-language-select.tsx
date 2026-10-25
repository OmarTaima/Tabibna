import { ChevronDown } from "lucide-react";
import { useId } from "react";
import { useLocale } from "@/i18n/use-locale";
import { isReportLanguage, type ReportLanguage } from "@/lib/ocr";

type EchoReportLanguageSelectProps = {
  value: ReportLanguage;
  onChange: (language: ReportLanguage) => void;
  disabled: boolean;
  changed: boolean;
};

export function EchoReportLanguageSelect({
  value,
  onChange,
  disabled,
  changed,
}: EchoReportLanguageSelectProps) {
  const { copy } = useLocale();
  const helpId = useId();
  const hintId = useId();

  const options: Array<{ value: ReportLanguage; label: string }> = [
    { value: "eng", label: copy.echo.photo.languageEn },
    { value: "ara", label: copy.echo.photo.languageAr },
    { value: "eng+ara", label: copy.echo.photo.languageBoth },
  ];

  return (
    <div className="mt-4 sm:flex sm:items-end sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <label
          htmlFor="echo-report-language"
          className="block text-[13px] font-semibold text-ink"
        >
          {copy.echo.photo.languageLabel}
        </label>
        <p id={helpId} className="mt-1 text-[12px] leading-5 text-bodytext">
          {copy.echo.photo.languageHelp}
        </p>
      </div>

      <div className="mt-2 sm:mt-0 sm:w-[240px] sm:shrink-0">
        <div className="relative">
          <select
            id="echo-report-language"
            value={value}
            onChange={(event) => {
              if (isReportLanguage(event.target.value)) {
                onChange(event.target.value);
              }
            }}
            disabled={disabled}
            aria-describedby={changed ? `${helpId} ${hintId}` : helpId}
            className="h-11 w-full appearance-none truncate rounded-xl border border-line bg-white px-3.5 pe-9 text-[15px] text-ink transition-colors focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bodytext"
            aria-hidden="true"
          />
        </div>

        {changed ? (
          <p
            id={hintId}
            role="status"
            className="mt-1.5 text-[12px] leading-5 text-brand"
          >
            {copy.echo.photo.languageChanged}
          </p>
        ) : null}
      </div>
    </div>
  );
}
