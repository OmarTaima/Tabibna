export type ReminderSchedule =
  | { kind: "interval"; everyHours: number }
  | { kind: "daily"; time: string };

export type Reminder = {
  id: string;
  medicine: string;
  dose: string;
  schedule: ReminderSchedule;
  enabled: boolean;
  createdAt: number;
  nextTriggerAt: number;
  snoozeUntil: number | null;
  lastTriggeredAt: number | null;
};

export type ReminderInput = {
  medicine: string;
  dose: string;
  schedule: ReminderSchedule;
};

export type ReminderLocale = "en" | "ar";

export const REMINDERS_STORAGE_KEY = "tabibna.reminders.v1";

const HOUR_MS = 3_600_000;
const MINUTE_MS = 60_000;
const DAILY_TIME_PATTERN = /^(\d{1,2}):(\d{2})$/;

const LOCALE_TAGS: Record<ReminderLocale, string> = {
  en: "en-GB",
  ar: "ar-EG-u-nu-latn",
};

const BIDI_CONTROL_PATTERN = /[\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069]/g;

function stripBidiControls(value: string): string {
  return value.replace(BIDI_CONTROL_PATTERN, "");
}

function parseDailyTime(time: string): { hours: number; minutes: number } | null {
  const match = DAILY_TIME_PATTERN.exec(time);
  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours > 23 || minutes > 59) {
    return null;
  }

  return { hours, minutes };
}

function createId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `reminder-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function computeNextTrigger(
  schedule: ReminderSchedule,
  anchor: number,
  from: number,
): number {
  if (schedule.kind === "interval") {
    const hours =
      Number.isFinite(schedule.everyHours) && schedule.everyHours > 0
        ? schedule.everyHours
        : 1;
    const period = hours * HOUR_MS;

    if (anchor > from) {
      return anchor;
    }

    const steps = Math.floor((from - anchor) / period) + 1;
    return anchor + steps * period;
  }

  const parsed = parseDailyTime(schedule.time) ?? { hours: 0, minutes: 0 };
  const candidate = new Date(from);
  candidate.setHours(parsed.hours, parsed.minutes, 0, 0);

  if (candidate.getTime() <= from) {
    candidate.setDate(candidate.getDate() + 1);
  }

  return candidate.getTime();
}

export function createReminder(input: ReminderInput, now: number): Reminder {
  const schedule = input.schedule;

  return {
    id: createId(),
    medicine: input.medicine.trim(),
    dose: input.dose.trim(),
    schedule,
    enabled: true,
    createdAt: now,
    nextTriggerAt: computeNextTrigger(schedule, now, now),
    snoozeUntil: null,
    lastTriggeredAt: null,
  };
}

export function isDue(reminder: Reminder, now: number): boolean {
  if (now >= reminder.nextTriggerAt) {
    return true;
  }

  return reminder.snoozeUntil !== null && now >= reminder.snoozeUntil;
}

export function advanceAfterTrigger(reminder: Reminder, now: number): Reminder {
  return {
    ...reminder,
    lastTriggeredAt: now,
    snoozeUntil: null,
    nextTriggerAt: computeNextTrigger(reminder.schedule, reminder.createdAt, now),
  };
}

export function scheduleLabel(
  schedule: ReminderSchedule,
  locale: ReminderLocale = "en",
): string {
  if (schedule.kind === "interval") {
    const hours = Math.max(1, Math.round(schedule.everyHours));

    if (locale === "ar") {
      if (hours === 1) {
        return "كل ساعة";
      }

      if (hours === 2) {
        return "كل ساعتين";
      }

      return hours >= 11 ? `كل ${hours} ساعة` : `كل ${hours} ساعات`;
    }

    return hours === 1 ? "Every 1 hour" : `Every ${hours} hours`;
  }

  return locale === "ar"
    ? `يوميًا الساعة ${schedule.time}`
    : `Daily at ${schedule.time}`;
}

export function nextDueLabel(
  reminder: Reminder,
  now: number,
  locale: ReminderLocale = "en",
): string {
  const target = reminder.snoozeUntil ?? reminder.nextTriggerAt;
  const targetDate = new Date(target);
  const sameDay = targetDate.toDateString() === new Date(now).toDateString();

  const formatter = new Intl.DateTimeFormat(LOCALE_TAGS[locale], {
    ...(sameDay
      ? { hour: "2-digit", minute: "2-digit" }
      : {
          weekday: "short",
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
  });

  return stripBidiControls(formatter.format(targetDate));
}

export function formatClockTime(
  moment: number,
  locale: ReminderLocale = "en",
): string {
  const formatter = new Intl.DateTimeFormat(LOCALE_TAGS[locale], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return stripBidiControls(formatter.format(new Date(moment)));
}

function getStorage(): Storage | null {
  try {
    if (typeof globalThis.localStorage === "undefined") {
      return null;
    }

    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || isFiniteNumber(value);
}

function isSchedule(value: unknown): value is ReminderSchedule {
  if (!isRecord(value)) {
    return false;
  }

  if (value.kind === "interval") {
    return isFiniteNumber(value.everyHours) && value.everyHours > 0;
  }

  if (value.kind === "daily") {
    return typeof value.time === "string" && parseDailyTime(value.time) !== null;
  }

  return false;
}

function isReminder(value: unknown): value is Reminder {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.medicine === "string" &&
    typeof value.dose === "string" &&
    isSchedule(value.schedule) &&
    typeof value.enabled === "boolean" &&
    isFiniteNumber(value.createdAt) &&
    isFiniteNumber(value.nextTriggerAt) &&
    isNullableNumber(value.snoozeUntil) &&
    isNullableNumber(value.lastTriggeredAt)
  );
}

export function loadReminders(): Reminder[] {
  const storage = getStorage();
  if (!storage) {
    return [];
  }

  let raw: string | null = null;
  try {
    raw = storage.getItem(REMINDERS_STORAGE_KEY);
  } catch {
    return [];
  }

  if (!raw) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter(isReminder);
}

export function saveReminders(list: Reminder[]): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Blocked or full storage degrades to in-memory reminders only.
  }
}

export function snoozeUntilFrom(now: number, minutes: number): number {
  return now + minutes * MINUTE_MS;
}
