import { useCallback, useSyncExternalStore } from "react";

import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

import { PM_STATE_UPDATE_EVENT } from "./useEditor";

/**
 * Reactive state hook that re-renders when ProseMirror state changes.
 * Uses useSyncExternalStore for tear-free reads.
 *
 * @param view - The EditorView to subscribe to
 * @param selector - A function that extracts a derived value from EditorState
 * @returns The derived value, re-computed on every ProseMirror transaction
 */
export function useEditorState<T>(view: EditorView | null, selector: (state: EditorState) => T): T {
  const subscribe = useCallback(
    (callback: () => void) => {
      if (!view) return () => {};
      const handler = () => callback();
      view.dom.addEventListener(PM_STATE_UPDATE_EVENT, handler);
      return () => view.dom.removeEventListener(PM_STATE_UPDATE_EVENT, handler);
    },
    [view],
  );

  const getSnapshot = useCallback(() => {
    if (!view) return selector(null as unknown as EditorState);
    return selector(view.state);
  }, [view, selector]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
