import { useCallback, useEffect, useRef, useState } from "react";

import { Schema, Node as PMNode } from "prosemirror-model";
import { EditorState, Plugin, Transaction } from "prosemirror-state";
import { EditorView, DirectEditorProps } from "prosemirror-view";

export const PM_STATE_UPDATE_EVENT = "pm-state-update";

export interface UseEditorOptions {
  schema: Schema;
  doc?: Record<string, unknown>;
  plugins?: Plugin[];
  editorProps?: Partial<DirectEditorProps>;
  onUpdate?: (view: EditorView, tr: Transaction) => void;
  onSelectionUpdate?: (view: EditorView) => void;
  onFocus?: (view: EditorView) => void;
  onBlur?: (view: EditorView) => void;
}

export interface UseEditorReturn {
  view: EditorView | null;
  mountRef: (node: HTMLElement | null) => void;
}

export function useEditor(options: UseEditorOptions): UseEditorReturn {
  const [view, setView] = useState<EditorView | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  const mountRef = useCallback((node: HTMLElement | null) => {
    // Clean up old view if mount point changes
    if (viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
      setView(null);
    }

    if (!node) return;

    const { schema, doc, plugins = [], editorProps = {} } = optionsRef.current;

    let docNode: PMNode;
    if (doc && typeof doc === "object" && doc.type === "doc") {
      try {
        docNode = PMNode.fromJSON(schema, doc);
      } catch {
        docNode = schema.node("doc", null, [schema.node("paragraph")]);
      }
    } else {
      docNode = schema.node("doc", null, [schema.node("paragraph")]);
    }

    const state = EditorState.create({
      doc: docNode,
      plugins,
    });

    const editorView = new EditorView(node, {
      state,
      ...editorProps,
      dispatchTransaction(tr: Transaction) {
        const newState = editorView.state.apply(tr);
        editorView.updateState(newState);

        // Fire custom event for useEditorState subscriptions
        editorView.dom.dispatchEvent(new CustomEvent(PM_STATE_UPDATE_EVENT, { detail: { tr } }));

        // Call user callbacks
        const opts = optionsRef.current;
        if (tr.docChanged && opts.onUpdate) {
          opts.onUpdate(editorView, tr);
        }
        if (tr.selectionSet && opts.onSelectionUpdate) {
          opts.onSelectionUpdate(editorView);
        }
      },
      handleDOMEvents: {
        focus: (view) => {
          optionsRef.current.onFocus?.(view);
          return false;
        },
        blur: (view) => {
          optionsRef.current.onBlur?.(view);
          return false;
        },
        ...editorProps.handleDOMEvents,
      },
    });

    viewRef.current = editorView;
    setView(editorView);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, []);

  return { view, mountRef };
}
