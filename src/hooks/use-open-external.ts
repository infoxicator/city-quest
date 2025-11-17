import { useCallback } from "react";

export function useOpenExternal() {
  const openExternal = useCallback((href: string) => {
    if (typeof window === "undefined") {
      return;
    }

    // Try to use ChatGPT's native link handler
    if (window?.openai?.openExternal) {
      try {
        window.openai.openExternal({ href });
        return;
      } catch (error) {
        console.warn("openExternal failed, falling back to window.open", error);
      }
    }

    // Fallback to standard web behavior
    window.open(href, "_blank", "noopener,noreferrer");
  }, []);

  return openExternal;
}

