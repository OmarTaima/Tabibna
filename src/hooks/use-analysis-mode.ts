import { useEffect, useState } from "react";
import type { AnalysisMode } from "@shared/contract";
import { getHealth } from "@/lib/api";

export function useAnalysisMode(): AnalysisMode | null {
  const [mode, setMode] = useState<AnalysisMode | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void getHealth(controller.signal).then((result) => {
      if (result.ok) {
        setMode(result.data.mode);
      }
    });

    return () => controller.abort();
  }, []);

  return mode;
}
