import { AlarmClock, Check, Clock, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n/use-locale";
import { formatClockTime, type Reminder } from "@/lib/reminders";

type AlarmOverlayProps = {
  reminder: Reminder;
  onTaken: () => void;
  onSnooze: () => void;
  onDismiss: () => void;
};

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function AlarmOverlay({
  reminder,
  onTaken,
  onSnooze,
  onDismiss,
}: AlarmOverlayProps) {
  const { copy, locale, dir } = useLocale();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onDismiss();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const dialog = dialogRef.current;
      if (!dialog) {
        return;
      }

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm">
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alarm-title"
        aria-describedby="alarm-description"
        tabIndex={-1}
        lang={locale}
        dir={dir}
        className="relative w-full max-w-[30rem] overflow-hidden rounded-2xl border border-urgent-border bg-white p-6 text-center shadow-lift focus:outline-none sm:p-8"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <span className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-urgent/70 animate-alarm-pulse motion-reduce:animate-none" />
          <span className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-urgent/50 animate-alarm-pulse motion-reduce:animate-none [animation-delay:400ms]" />
          <span className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-urgent/30 animate-alarm-pulse motion-reduce:animate-none [animation-delay:800ms]" />
        </div>

        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-urgent-border bg-urgent-soft px-3 py-1 text-[12px] font-semibold text-urgent">
            <AlarmClock className="h-3.5 w-3.5" aria-hidden="true" />
            {copy.reminders.ringing}
          </span>

          <h2
            id="alarm-title"
            className="mt-4 font-display text-[26px] font-bold leading-[32px] tracking-[-0.02em] text-ink sm:text-[30px]"
          >
            {reminder.medicine}
          </h2>

          {reminder.dose ? (
            <p
              id="alarm-description"
              className="mt-1.5 text-[15px] text-bodytext"
            >
              {copy.reminders.alarmDose(reminder.dose)}
            </p>
          ) : (
            <p id="alarm-description" className="sr-only">
              {copy.reminders.alarmTitle}
            </p>
          )}

          <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-soft px-3.5 py-2 font-display text-[19px] font-semibold tabular-nums text-brand">
            <Clock className="h-4 w-4" aria-hidden="true" />
            {formatClockTime(now, locale)}
          </p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button type="button" size="lg" onClick={onTaken}>
              <Check className="h-4 w-4" aria-hidden="true" />
              {copy.reminders.taken}
            </Button>
            <Button type="button" size="lg" variant="secondary" onClick={onSnooze}>
              {copy.reminders.snooze}
            </Button>
            <Button type="button" size="lg" variant="ghost" onClick={onDismiss}>
              <X className="h-4 w-4" aria-hidden="true" />
              {copy.reminders.dismiss}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
