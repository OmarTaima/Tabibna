import assert from "node:assert/strict";
import {
  advanceAfterTrigger,
  computeNextTrigger,
  createReminder,
  isDue,
  LEGACY_REMINDERS_STORAGE_KEY,
  loadReminders,
  REMINDERS_STORAGE_KEY,
  saveReminders,
  type Reminder,
  type ReminderSchedule,
} from "./reminders";

class MemoryStorage {
  private readonly entries = new Map<string, string>();

  get length(): number {
    return this.entries.size;
  }

  clear(): void {
    this.entries.clear();
  }

  getItem(key: string): string | null {
    return this.entries.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.entries.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.entries.delete(key);
  }

  setItem(key: string, value: string): void {
    this.entries.set(key, value);
  }
}

function installStorage(): MemoryStorage {
  const storage = new MemoryStorage();

  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    configurable: true,
    writable: true,
  });

  return storage;
}

function passed(name: string): void {
  console.log(`ok - ${name}`);
}

const HOUR_MS = 3_600_000;

const intervalSchedule: ReminderSchedule = { kind: "interval", everyHours: 6 };
const dailySchedule: ReminderSchedule = { kind: "daily", time: "09:00" };

const anchor = new Date(2026, 0, 15, 8, 0, 0).getTime();

try {
  assert.equal(
    computeNextTrigger(intervalSchedule, anchor, anchor),
    anchor + 6 * HOUR_MS,
    "the first interval trigger lands one full period after the anchor",
  );
  assert.equal(
    computeNextTrigger(intervalSchedule, anchor, anchor + 6 * HOUR_MS),
    anchor + 12 * HOUR_MS,
    "the trigger after a period advances by exactly one period",
  );
  assert.equal(
    computeNextTrigger(intervalSchedule, anchor, anchor + 7 * HOUR_MS),
    anchor + 12 * HOUR_MS,
    "a late check still lands on the fixed cadence grid",
  );

  let cursor = computeNextTrigger(intervalSchedule, anchor, anchor);
  for (let index = 0; index < 5; index += 1) {
    cursor = computeNextTrigger(intervalSchedule, anchor, cursor);
  }
  assert.equal(
    cursor,
    anchor + 36 * HOUR_MS,
    "repeated computation never drifts away from the anchor",
  );
  passed("computeNextTrigger keeps the interval cadence anchored");

  assert.equal(
    computeNextTrigger(dailySchedule, 0, new Date(2026, 0, 15, 8, 0, 0).getTime()),
    new Date(2026, 0, 15, 9, 0, 0).getTime(),
    "a daily time later today is selected",
  );
  assert.equal(
    computeNextTrigger(dailySchedule, 0, new Date(2026, 0, 15, 22, 0, 0).getTime()),
    new Date(2026, 0, 16, 9, 0, 0).getTime(),
    "a daily time that already passed rolls over to tomorrow",
  );
  assert.equal(
    computeNextTrigger(dailySchedule, 0, new Date(2026, 0, 15, 9, 0, 0).getTime()),
    new Date(2026, 0, 16, 9, 0, 0).getTime(),
    "a daily time equal to now rolls over because the trigger must be strictly later",
  );
  assert.equal(
    computeNextTrigger(dailySchedule, 0, new Date(2026, 0, 31, 23, 0, 0).getTime()),
    new Date(2026, 1, 1, 9, 0, 0).getTime(),
    "a month boundary rolls into the next month",
  );
  assert.equal(
    computeNextTrigger(dailySchedule, 0, new Date(2026, 11, 31, 23, 0, 0).getTime()),
    new Date(2027, 0, 1, 9, 0, 0).getTime(),
    "a year boundary rolls into the next year",
  );
  passed("computeNextTrigger picks the next local daily occurrence");

  const created = createReminder(
    {
      medicine: "Vitamin D",
      dose: "one tablet",
      schedule: { kind: "interval", everyHours: 4 },
    },
    anchor,
  );
  assert.equal(created.enabled, true);
  assert.equal(created.createdAt, anchor);
  assert.equal(created.nextTriggerAt, anchor + 4 * HOUR_MS);
  assert.equal(created.snoozeUntil, null);
  assert.equal(created.lastTriggeredAt, null);

  const advanced = advanceAfterTrigger(
    { ...created, snoozeUntil: anchor + 10 * 60_000 },
    anchor + 4 * HOUR_MS,
  );
  assert.equal(advanced.snoozeUntil, null, "a trigger clears an active snooze");
  assert.equal(advanced.lastTriggeredAt, anchor + 4 * HOUR_MS);
  assert.equal(
    advanced.nextTriggerAt,
    anchor + 8 * HOUR_MS,
    "the next trigger advances by exactly one period from the anchor",
  );
  assert.equal(advanced.createdAt, anchor, "the anchor is preserved");
  passed("createReminder and advanceAfterTrigger advance the schedule by one period");

  assert.equal(isDue(created, created.nextTriggerAt - 1), false);
  assert.equal(isDue(created, created.nextTriggerAt), true);
  assert.equal(isDue(created, created.nextTriggerAt + 1), true);

  const snoozed: Reminder = { ...created, snoozeUntil: anchor + 10 * 60_000 };
  assert.equal(
    isDue(snoozed, anchor + 10 * 60_000 - 1),
    false,
    "a snooze is not due before it expires",
  );
  assert.equal(
    isDue(snoozed, anchor + 10 * 60_000),
    true,
    "a snooze becomes due once it expires",
  );
  passed("isDue covers the normal trigger and the snooze path");

  const storage = installStorage();
  assert.equal(
    REMINDERS_STORAGE_KEY,
    "vivavalve.reminders.v1",
    "reminders use the stable storage key",
  );

  const first = createReminder(
    { medicine: "Vitamin D", dose: "", schedule: intervalSchedule },
    anchor,
  );
  const second = createReminder(
    { medicine: "Ibuprofen", dose: "400 mg", schedule: dailySchedule },
    anchor,
  );
  const list = [first, second];

  saveReminders(list);
  assert.deepEqual(loadReminders(), list, "saved reminders survive a reload");

  storage.setItem(REMINDERS_STORAGE_KEY, "{not json");
  assert.deepEqual(loadReminders(), [], "corrupt JSON is dropped instead of thrown");

  storage.setItem(
    REMINDERS_STORAGE_KEY,
    JSON.stringify([{ id: "broken", medicine: "Vitamin D" }]),
  );
  assert.deepEqual(
    loadReminders(),
    [],
    "entries that do not match the reminder shape are dropped",
  );

  storage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify({ not: "an array" }));
  assert.deepEqual(loadReminders(), [], "a non-array payload is dropped");

  storage.clear();
  storage.setItem(LEGACY_REMINDERS_STORAGE_KEY, JSON.stringify(list));
  assert.deepEqual(
    loadReminders(),
    list,
    "legacy Tabibna reminders migrate to the new key",
  );
  assert.equal(
    storage.getItem(REMINDERS_STORAGE_KEY),
    JSON.stringify(list),
    "the migrated list is written under the new key",
  );
  assert.equal(
    storage.getItem(LEGACY_REMINDERS_STORAGE_KEY),
    null,
    "the legacy key is removed after migration",
  );

  storage.setItem(LEGACY_REMINDERS_STORAGE_KEY, JSON.stringify([first]));
  storage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify([second]));
  assert.deepEqual(
    loadReminders(),
    [second],
    "the new key wins when both keys exist",
  );

  passed("storage round-trips reminders, survives corrupt data, and migrates the legacy key");

  console.log("All client reminder tests passed.");
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
