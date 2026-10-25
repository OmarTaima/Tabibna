import { Camera, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n/use-locale";

export type EchoMode = "photo" | "text";

type EchoModeSwitchProps = {
  mode: EchoMode;
  onChange: (mode: EchoMode) => void;
  disabled: boolean;
};

export function EchoModeSwitch({ mode, onChange, disabled }: EchoModeSwitchProps) {
  const { copy } = useLocale();

  const options = [
    {
      value: "photo" as const,
      label: copy.echo.mode.photo,
      controls: "echo-panel-photo",
      Icon: Camera,
    },
    {
      value: "text" as const,
      label: copy.echo.mode.text,
      controls: "echo-panel-text",
      Icon: FileText,
    },
  ];

  return (
    <div
      role="group"
      aria-label={copy.echo.mode.groupLabel}
      className="mt-6 grid w-full grid-cols-2 gap-1 rounded-xl border border-line bg-white p-1 shadow-soft sm:max-w-[320px]"
    >
      {options.map(({ value, label, controls, Icon }) => {
        const active = mode === value;

        return (
          <Button
            key={value}
            type="button"
            variant={active ? "primary" : "ghost"}
            aria-pressed={active}
            aria-controls={controls}
            onClick={() => onChange(value)}
            disabled={disabled}
            className="h-11 rounded-lg px-3 text-[13.5px] font-semibold"
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </Button>
        );
      })}
    </div>
  );
}
