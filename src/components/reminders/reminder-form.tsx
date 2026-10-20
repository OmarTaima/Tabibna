import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n/use-locale";
import type { Reminder, ReminderInput, ReminderSchedule } from "@/lib/reminders";
import { cn } from "@/lib/utils";

type ScheduleMode = "interval" | "daily";

const INTERVAL_PRESETS = [4, 6, 8, 12, 24];
const DAILY_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

type ReminderFormProps = {
  initial?: Reminder | null;
  onSubmit: (input: ReminderInput) => void;
  onCancel?: () => void;
};

const inputClassName =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-[16px] text-ink transition-colors placeholder:text-bodytext/55 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20";

const modeChipClassName =
  "inline-flex h-10 items-center rounded-xl border border-line bg-white px-3.5 text-[13px] font-semibold text-bodytext transition-colors peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-focus-visible:ring-offset-2";

export function ReminderForm({
  initial = null,
  onSubmit,
  onCancel,
}: ReminderFormProps) {
  const { copy } = useLocale();
  const [medicine, setMedicine] = useState(initial?.medicine ?? "");
  const [dose, setDose] = useState(initial?.dose ?? "");
  const [mode, setMode] = useState<ScheduleMode>(
    initial?.schedule.kind === "daily" ? "daily" : "interval",
  );
  const [hours, setHours] = useState(
    initial?.schedule.kind === "interval" ? String(initial.schedule.everyHours) : "6",
  );
  const [time, setTime] = useState(
    initial?.schedule.kind === "daily" ? initial.schedule.time : "08:00",
  );
  const [medicineError, setMedicineError] = useState<string | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedMedicine = medicine.trim();
    const nextMedicineError = trimmedMedicine
      ? null
      : copy.reminders.validationMedicine;
    let nextScheduleError: string | null = null;
    let schedule: ReminderSchedule;

    if (mode === "interval") {
      const parsedHours = Number(hours);
      const isValid =
        Number.isInteger(parsedHours) && parsedHours >= 1 && parsedHours <= 24;

      if (!isValid) {
        nextScheduleError = copy.reminders.validationInterval;
      }

      schedule = { kind: "interval", everyHours: parsedHours };
    } else {
      if (!DAILY_TIME_PATTERN.test(time)) {
        nextScheduleError = copy.reminders.validationTime;
      }

      schedule = { kind: "daily", time };
    }

    setMedicineError(nextMedicineError);
    setScheduleError(nextScheduleError);

    if (nextMedicineError || nextScheduleError) {
      return;
    }

    onSubmit({ medicine: trimmedMedicine, dose: dose.trim(), schedule });
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-label={initial ? copy.reminders.editReminder : copy.reminders.newReminder}
      className="rounded-2xl border border-line bg-white p-5 shadow-soft sm:p-6"
    >
      <h3 className="font-display text-[17px] font-semibold text-ink">
        {initial ? copy.reminders.editReminder : copy.reminders.newReminder}
      </h3>

      <div className="mt-4 flex flex-col gap-4">
        <div>
          <label
            htmlFor="reminder-medicine"
            className="block text-[13px] font-semibold text-ink"
          >
            {copy.reminders.medicineLabel}
          </label>
          <input
            id="reminder-medicine"
            type="text"
            dir="auto"
            value={medicine}
            onChange={(event) => setMedicine(event.target.value)}
            placeholder={copy.reminders.medicinePlaceholder}
            aria-invalid={medicineError ? true : undefined}
            aria-describedby={medicineError ? "reminder-medicine-error" : undefined}
            className={cn(
              inputClassName,
              "mt-1.5",
              medicineError && "border-urgent focus-visible:border-urgent",
            )}
          />
          {medicineError ? (
            <p
              id="reminder-medicine-error"
              role="alert"
              className="mt-1.5 text-[12.5px] font-medium text-urgent"
            >
              {medicineError}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="reminder-dose"
            className="block text-[13px] font-semibold text-ink"
          >
            {copy.reminders.doseLabel}
          </label>
          <input
            id="reminder-dose"
            type="text"
            dir="auto"
            value={dose}
            onChange={(event) => setDose(event.target.value)}
            placeholder={copy.reminders.dosePlaceholder}
            className={cn(inputClassName, "mt-1.5")}
          />
        </div>

        <fieldset>
          <legend className="text-[13px] font-semibold text-ink">
            {copy.reminders.scheduleLabel}
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            <label className="cursor-pointer">
              <input
                type="radio"
                name="reminder-schedule-mode"
                value="interval"
                checked={mode === "interval"}
                onChange={() => setMode("interval")}
                className="peer sr-only"
              />
              <span className={modeChipClassName}>
                {copy.reminders.intervalMode}
              </span>
            </label>
            <label className="cursor-pointer">
              <input
                type="radio"
                name="reminder-schedule-mode"
                value="daily"
                checked={mode === "daily"}
                onChange={() => setMode("daily")}
                className="peer sr-only"
              />
              <span className={modeChipClassName}>
                {copy.reminders.dailyMode}
              </span>
            </label>
          </div>
        </fieldset>

        {mode === "interval" ? (
          <div>
            <label
              htmlFor="reminder-hours"
              className="block text-[13px] font-semibold text-ink"
            >
              {copy.reminders.intervalHoursLabel}
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                id="reminder-hours"
                type="number"
                min={1}
                max={24}
                step={1}
                inputMode="numeric"
                value={hours}
                onChange={(event) => setHours(event.target.value)}
                aria-invalid={scheduleError ? true : undefined}
                aria-describedby={
                  scheduleError ? "reminder-schedule-error" : undefined
                }
                className={cn(
                  inputClassName,
                  "max-w-[7rem]",
                  scheduleError && "border-urgent focus-visible:border-urgent",
                )}
              />
              <span className="text-[13px] text-bodytext">
                {copy.reminders.intervalHoursUnit}
              </span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {INTERVAL_PRESETS.map((preset) => {
                const isActive = hours === String(preset);

                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setHours(String(preset))}
                    aria-pressed={isActive}
                    className={cn(
                      "h-9 min-w-11 rounded-lg border px-3 text-[13px] font-semibold transition-colors",
                      isActive
                        ? "border-brand bg-brand text-white"
                        : "border-line bg-white text-bodytext hover:border-brand/40 hover:text-brand",
                    )}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <label
              htmlFor="reminder-time"
              className="block text-[13px] font-semibold text-ink"
            >
              {copy.reminders.dailyTimeLabel}
            </label>
            <input
              id="reminder-time"
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              aria-invalid={scheduleError ? true : undefined}
              aria-describedby={
                scheduleError ? "reminder-schedule-error" : undefined
              }
              className={cn(
                inputClassName,
                "mt-1.5 max-w-[12rem]",
                scheduleError && "border-urgent focus-visible:border-urgent",
              )}
            />
          </div>
        )}

        {scheduleError ? (
          <p
            id="reminder-schedule-error"
            role="alert"
            className="text-[12.5px] font-medium text-urgent"
          >
            {scheduleError}
          </p>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="submit" size="lg" className="flex-1 sm:flex-none">
          {initial ? copy.reminders.save : copy.reminders.add}
        </Button>
        {onCancel ? (
          <Button type="button" variant="secondary" size="lg" onClick={onCancel}>
            {copy.reminders.cancel}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
