import type { Announcement } from "@/hooks/use-announcer";

type LiveRegionProps = {
  announcement: Announcement | null;
  assertive?: boolean;
};

export function LiveRegion({ announcement, assertive = false }: LiveRegionProps) {
  return (
    <div
      className="sr-only"
      role={assertive ? "alert" : "status"}
      aria-live={assertive ? "assertive" : "polite"}
      aria-atomic="true"
    >
      {announcement ? (
        <span key={announcement.id}>{announcement.message}</span>
      ) : null}
    </div>
  );
}
