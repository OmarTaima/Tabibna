import { useCallback, useRef, useState } from "react";

export type Announcement = {
  id: number;
  message: string;
};

export function useAnnouncer() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const idRef = useRef(0);

  const announce = useCallback((message: string) => {
    idRef.current += 1;
    setAnnouncement({ id: idRef.current, message });
  }, []);

  return { announcement, announce };
}
