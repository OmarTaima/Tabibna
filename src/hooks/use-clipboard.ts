import { useCallback, useEffect, useRef, useState } from "react";

export type CopyStatus = "idle" | "copied" | "error";

async function writeToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the selection-based fallback.
  }

  const previousFocus =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.top = "-9999px";
  area.style.left = "-9999px";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  area.setSelectionRange(0, text.length);

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    area.remove();
    previousFocus?.focus({ preventScroll: true });
  }
}

export function useCopyToClipboard(resetDelayMs = 2_000) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const copy = useCallback(
    async (text: string) => {
      clearTimer();
      const copied = await writeToClipboard(text);

      setStatus(copied ? "copied" : "error");
      timerRef.current = window.setTimeout(() => {
        setStatus("idle");
        timerRef.current = null;
      }, resetDelayMs);

      return copied;
    },
    [clearTimer, resetDelayMs],
  );

  return { status, copy };
}
