/**
 * Hook to get widget input (tool input) from ChatGPT.
 * 
 * @param defaultState - Default value or function to compute it if tool input is not available
 * @returns The tool input props or the default fallback
 * 
 * @example
 * ```tsx
 * const input = useWidgetInput({ gameId: "", adventureType: "tour" });
 * ```
 */
import { useOpenAIGlobal } from "./use-openai-global";

export function useWidgetInput<T extends Record<string, unknown>>(
  defaultState?: T | (() => T)
): T | null {
  const toolInput = useOpenAIGlobal("toolInput") as T | null;

  if (toolInput != null) {
    return toolInput;
  }

  const fallback =
    typeof defaultState === "function"
      ? (defaultState as () => T | null)()
      : defaultState ?? null;

  return fallback;
}

