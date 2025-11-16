/**
 * Source: https://github.com/openai/openai-apps-sdk-examples/tree/main/src
 */

import { useSyncExternalStore } from "react";
import {
  SET_GLOBALS_EVENT_TYPE,
  SetGlobalsEvent,
  type OpenAIGlobals,
} from "./types";

/**
 * Low-level hook to subscribe to a specific OpenAI global value.
 * Uses React's useSyncExternalStore for efficient reactivity.
 * 
 * @param key - The key of the OpenAI global to subscribe to
 * @returns The current value of the global or null if not available
 * 
 * @example
 * ```tsx
 * const theme = useOpenAIGlobal("theme"); // "light" | "dark" | null
 * ```
 */
export function useOpenAIGlobal<K extends keyof OpenAIGlobals>(
  key: K
): OpenAIGlobals[K] | null {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === "undefined") {
        return () => {};
      }

      const handleSetGlobal = (event: SetGlobalsEvent) => {
        const value = event.detail.globals[key];
        if (value === undefined) {
          return;
        }

        onChange();
      };

      // Handle MCP UI message events
      const handleMessage = (event: MessageEvent) => {
        // Trigger onChange for any message event to check for updates
        onChange();
      };

      window.addEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal, {
        passive: true,
      });
      
      // Also listen to message events for MCP UI updates
      window.addEventListener("message", handleMessage, {
        passive: true,
      });

      return () => {
        window.removeEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal);
        window.removeEventListener("message", handleMessage);
      };
    },
    () => {
      if (typeof window === "undefined") return null;
      
      // Try OpenAI format first
      if (window.openai?.[key] != null) {
        return window.openai[key];
      }
      
      // Fallback to MCP UI format for toolInput and toolOutput
      const win = window as any;
      if (key === "toolInput") {
        if (win.__MCP_UI_INITIAL_RENDER_DATA__?.toolInput) {
          return win.__MCP_UI_INITIAL_RENDER_DATA__.toolInput;
        }
        if (win.openai?.toolInput) {
          return win.openai.toolInput;
        }
      }
      if (key === "toolOutput") {
        if (win.__MCP_UI_INITIAL_RENDER_DATA__?.toolOutput) {
          return win.__MCP_UI_INITIAL_RENDER_DATA__.toolOutput;
        }
        if (win.__MCP_UI_INITIAL_RENDER_DATA__ && !win.__MCP_UI_INITIAL_RENDER_DATA__.toolOutput) {
          return win.__MCP_UI_INITIAL_RENDER_DATA__;
        }
        if (win.__MCP_WIDGET_LAST_TOOL_OUTPUT__) {
          return win.__MCP_WIDGET_LAST_TOOL_OUTPUT__;
        }
        if (win.openai?.toolOutput) {
          return win.openai.toolOutput;
        }
      }
      
      return null;
    },
    () => null
  );
}

