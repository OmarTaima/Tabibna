import { Pause, Pencil, Play, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n/use-locale";
import {
  nextDueLabel,
  scheduleLabel,
  type Reminder,
} from "@/lib/reminders";

type ReminderListProps = {
  reminders: Reminder[];
  onEdit: (reminder: Reminder) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export function ReminderList({
  reminders,
  onEdit,
  onToggle,
  onDelete,
}: ReminderListProps) {
  const { copy, locale } = useLocale();
  const [now, setNow] = useState(() => Date.now());
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (reminders.length === 0) {
    return (
      <section
        aria-labelledby="reminders-empty-title"
        className="rounded-2xl border border-dashed border-line bg-white/70 px-5 py-8 text-center"
      >
        <h3
          id="reminders-empty-title"
          className="font-display text-[15px] font-semibold text-ink"
        >
          {copy.reminders.emptyTitle}
        </h3>
        <p className="mx-auto mt-1.5 max-w-[42ch] text-[13px] leading-6 text-bodytext">
          {copy.reminders.emptyBody}
        </p>
      </section>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {reminders.map((reminder) => {
        const isConfirming = confirmingId === reminder.id;

        return (
          <li
            key={reminder.id}
            className="rounded-2xl border border-line bg-white p-4 shadow-soft sm:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-[16px] font-semibold text-ink">
                  {reminder.medicine}
                </p>
                {reminder.dose ? (
                  <p className="mt-0.5 text-[13px] text-bodytext">
                    {reminder.dose}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="teal">
                  {scheduleLabel(reminder.schedule, locale)}
                </Badge>
                {reminder.enabled ? null : (
                  <Badge variant="neutral">{copy.reminders.pause}</Badge>
                )}
              </div>
            </div>

            <dl className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-[13px]">
              <div className="flex items-center gap-1.5">
                <dt className="text-bodytext">{copy.reminders.nextAlarm}</dt>
                <dd className="font-semibold tabular-nums text-ink">
                  {nextDueLabel(reminder, now, locale)}
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onEdit(reminder)}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                {copy.reminders.edit}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onToggle(reminder.id)}
              >
                {reminder.enabled ? (
                  <Pause className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Play className="h-4 w-4" aria-hidden="true" />
                )}
                {reminder.enabled
                  ? copy.reminders.pause
                  : copy.reminders.resume}
              </Button>
              {isConfirming ? (
                <>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    className="bg-urgent hover:bg-urgent/90"
                    aria-label={`${copy.reminders.delete}: ${reminder.medicine}`}
                    onClick={() => {
                      setConfirmingId(null);
                      onDelete(reminder.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    {copy.reminders.delete}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmingId(null)}
                  >
                    {copy.reminders.cancel}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmingId(reminder.id)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  {copy.reminders.delete}
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
