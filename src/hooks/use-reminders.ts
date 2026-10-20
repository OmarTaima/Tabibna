import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "@/i18n/use-locale";
import { startRinging, stopRinging, unlockAudio } from "@/lib/alarm-audio";
import {
  notificationPermission,
  requestNotificationPermission,
  showAlarmNotification,
  type NotificationState,
} from "@/lib/notifications";
import {
  advanceAfterTrigger,
  computeNextTrigger,
  createReminder,
  isDue,
  loadReminders,
  saveReminders,
  snoozeUntilFrom,
  type Reminder,
  type ReminderInput,
} from "@/lib/reminders";

const TICK_MS = 10_000;

export type UseRemindersResult = {
  reminders: Reminder[];
  addReminder: (input: ReminderInput) => Reminder;
  updateReminder: (id: string, input: ReminderInput) => void;
  removeReminder: (id: string) => void;
  toggleEnabled: (id: string) => void;
  setSnooze: (id: string, minutes: number) => void;
  markTaken: (id: string) => void;
  acknowledge: (id: string) => void;
  ringing: Reminder | null;
  dismissRinging: () => void;
  permission: NotificationState;
  requestPermission: () => Promise<NotificationState>;
};

export function useReminders(): UseRemindersResult {
  const { copy } = useLocale();
  const [reminders, setReminders] = useState<Reminder[]>(loadReminders);
  const [ringing, setRinging] = useState<Reminder | null>(null);
  const [permission, setPermission] = useState<NotificationState>(() =>
    notificationPermission(),
  );

  const remindersRef = useRef(reminders);
  const ringingRef = useRef<Reminder | null>(null);

  const commit = useCallback((next: Reminder[]) => {
    remindersRef.current = next;
    setReminders(next);
    saveReminders(next);
  }, []);

  const stopAlarm = useCallback(() => {
    stopRinging();
    ringingRef.current = null;
    setRinging(null);
  }, []);

  const checkDue = useCallback(() => {
    if (ringingRef.current) {
      return;
    }

    const now = Date.now();
    const due = remindersRef.current.find(
      (reminder) => reminder.enabled && isDue(reminder, now),
    );

    if (!due) {
      return;
    }

    const advanced = advanceAfterTrigger(due, now);
    commit(
      remindersRef.current.map((reminder) =>
        reminder.id === due.id ? advanced : reminder,
      ),
    );

    ringingRef.current = advanced;
    setRinging(advanced);
    startRinging();
    showAlarmNotification(
      copy.reminders.alarmTitle,
      copy.reminders.alarmBody(due.medicine),
    );
  }, [commit, copy.reminders]);

  const addReminder = useCallback(
    (input: ReminderInput) => {
      const reminder = createReminder(input, Date.now());
      commit([reminder, ...remindersRef.current]);
      unlockAudio();
      return reminder;
    },
    [commit],
  );

  const updateReminder = useCallback(
    (id: string, input: ReminderInput) => {
      const now = Date.now();

      commit(
        remindersRef.current.map((reminder) => {
          if (reminder.id !== id) {
            return reminder;
          }

          return {
            ...reminder,
            medicine: input.medicine.trim(),
            dose: input.dose.trim(),
            schedule: input.schedule,
            snoozeUntil: null,
            nextTriggerAt: computeNextTrigger(
              input.schedule,
              reminder.createdAt,
              now,
            ),
          };
        }),
      );
    },
    [commit],
  );

  const removeReminder = useCallback(
    (id: string) => {
      commit(remindersRef.current.filter((reminder) => reminder.id !== id));

      if (ringingRef.current?.id === id) {
        stopAlarm();
      }
    },
    [commit, stopAlarm],
  );

  const toggleEnabled = useCallback(
    (id: string) => {
      const now = Date.now();

      commit(
        remindersRef.current.map((reminder) => {
          if (reminder.id !== id) {
            return reminder;
          }

          const enabled = !reminder.enabled;

          return {
            ...reminder,
            enabled,
            nextTriggerAt: enabled
              ? computeNextTrigger(reminder.schedule, reminder.createdAt, now)
              : reminder.nextTriggerAt,
          };
        }),
      );
    },
    [commit],
  );

  const setSnooze = useCallback(
    (id: string, minutes: number) => {
      const now = Date.now();

      commit(
        remindersRef.current.map((reminder) =>
          reminder.id === id
            ? { ...reminder, snoozeUntil: snoozeUntilFrom(now, minutes) }
            : reminder,
        ),
      );

      stopAlarm();
    },
    [commit, stopAlarm],
  );

  const markTaken = useCallback(
    (id: string) => {
      const now = Date.now();

      commit(
        remindersRef.current.map((reminder) =>
          reminder.id === id ? advanceAfterTrigger(reminder, now) : reminder,
        ),
      );
    },
    [commit],
  );

  const acknowledge = useCallback(
    (id: string) => {
      markTaken(id);
      stopAlarm();
    },
    [markTaken, stopAlarm],
  );

  const dismissRinging = useCallback(() => {
    stopAlarm();
  }, [stopAlarm]);

  const requestPermission = useCallback(async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    return result;
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkDue();
      }
    };

    checkDue();

    const timer = window.setInterval(checkDue, TICK_MS);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", checkDue);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", checkDue);
    };
  }, [checkDue]);

  useEffect(() => {
    return () => {
      stopRinging();
    };
  }, []);

  return {
    reminders,
    addReminder,
    updateReminder,
    removeReminder,
    toggleEnabled,
    setSnooze,
    markTaken,
    acknowledge,
    ringing,
    dismissRinging,
    permission,
    requestPermission,
  };
}
