import { Bell, BellOff, BellRing, Info } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LiveRegion } from "@/components/ui/live-region";
import { useAnnouncer } from "@/hooks/use-announcer";
import { useLocale } from "@/i18n/use-locale";
import type { NotificationState } from "@/lib/notifications";
import type { Reminder, ReminderInput } from "@/lib/reminders";
import { ReminderForm } from "./reminder-form";
import { ReminderList } from "./reminder-list";

type RemindersViewProps = {
  reminders: Reminder[];
  permission: NotificationState;
  onAdd: (input: ReminderInput) => void;
  onUpdate: (id: string, input: ReminderInput) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
  onRequestPermission: () => void;
};

export function RemindersView({
  reminders,
  permission,
  onAdd,
  onUpdate,
  onRemove,
  onToggle,
  onRequestPermission,
}: RemindersViewProps) {
  const { copy, locale, dir } = useLocale();
  const [editing, setEditing] = useState<Reminder | null>(null);
  const { announcement, announce } = useAnnouncer();

  const handleSubmit = (input: ReminderInput) => {
    if (editing) {
      onUpdate(editing.id, input);
      setEditing(null);
    } else {
      onAdd(input);
    }

    announce(copy.reminders.saved);
  };

  const handleDelete = (id: string) => {
    onRemove(id);
    announce(copy.reminders.deleted);
  };

  return (
    <section aria-labelledby="reminders-title" lang={locale} dir={dir}>
      <LiveRegion announcement={announcement} />

      <header>
        <h1
          id="reminders-title"
          className="font-display text-[27px] font-bold leading-[34px] tracking-[-0.02em] text-ink sm:text-[34px] sm:leading-[1.15]"
        >
          {copy.reminders.title}
        </h1>
        <p className="mt-3 max-w-[620px] text-[15px] leading-7 text-bodytext">
          {copy.reminders.subtitle}
        </p>
      </header>

      <p className="mt-5 flex items-start gap-2.5 rounded-xl border border-caution-border bg-caution-soft px-4 py-3 text-[13px] leading-6 text-caution-ink">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{copy.reminders.howItWorks}</span>
      </p>

      <div className="mt-6 rounded-2xl border border-line bg-white p-4 shadow-soft sm:p-5">
        {permission === "default" ? (
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={onRequestPermission}>
              <BellRing className="h-4 w-4" aria-hidden="true" />
              {copy.reminders.enableNotifications}
            </Button>
          </div>
        ) : null}

        {permission === "granted" ? (
          <p className="flex items-center gap-2 text-[13px] font-medium text-brand">
            <Bell className="h-4 w-4 shrink-0" aria-hidden="true" />
            {copy.reminders.notificationsOn}
          </p>
        ) : null}

        {permission === "denied" ? (
          <p className="flex items-start gap-2 text-[13px] leading-6 text-bodytext">
            <BellOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {copy.reminders.notificationsBlocked}
          </p>
        ) : null}

        {permission === "unsupported" ? (
          <p className="flex items-start gap-2 text-[13px] leading-6 text-bodytext">
            <BellOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {copy.reminders.notificationsUnsupported}
          </p>
        ) : null}
      </div>

      <div className="mt-6">
        <ReminderForm
          key={editing?.id ?? "new"}
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={editing ? () => setEditing(null) : undefined}
        />
      </div>

      <div className="mt-6">
        <ReminderList
          reminders={reminders}
          onEdit={setEditing}
          onToggle={onToggle}
          onDelete={handleDelete}
        />
      </div>

      <p className="mt-6 max-w-[620px] text-[12px] leading-6 text-bodytext">
        {copy.reminders.permissionNote}
      </p>
    </section>
  );
}
