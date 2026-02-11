import { ComponentType, RefCallback } from "react";

import { Node as PMNode } from "prosemirror-model";
import { EditorView, NodeView, Decoration } from "prosemirror-view";
import { createRoot, Root } from "react-dom/client";

/**
 * Props passed to React components used as ProseMirror node views.
 */
export interface ReactNodeViewProps {
  node: PMNode;
  view: EditorView;
  getPos: () => number | undefined;
  updateAttributes: (attrs: Record<string, unknown>) => void;
  deleteNode: () => void;
  selected: boolean;
  /** Ref callback for editable content area (contentDOM). Only provided when contentEditable option is true. */
  contentRef?: RefCallback<HTMLElement>;
}

interface CreateReactNodeViewOptions {
  /** If true, the node view has editable content (e.g. detailsSummary). */
  contentEditable?: boolean;
  /** Tag name for the outer wrapper. Defaults to "div". */
  wrapperTag?: string;
}

/**
 * Factory that creates a ProseMirror NodeView constructor from a React component.
 * Replaces TipTap's `ReactNodeViewRenderer` + `NodeViewWrapper` + `NodeViewContent`.
 */
export function createReactNodeView(
  Component: ComponentType<ReactNodeViewProps>,
  options: CreateReactNodeViewOptions = {},
) {
  return (
    node: PMNode,
    view: EditorView,
    getPos: () => number | undefined,
    _decorations: readonly Decoration[],
  ): NodeView => {
    const { contentEditable = false, wrapperTag = "div" } = options;

    const dom = document.createElement(wrapperTag);
    dom.setAttribute("data-node-view-wrapper", "");

    let contentDOM: HTMLElement | undefined;
    if (contentEditable) {
      contentDOM = document.createElement("div");
      contentDOM.setAttribute("data-node-view-content", "");
    }

    let root: Root | null = null;
    let currentNode = node;
    let isSelected = false;

    const updateAttributes = (attrs: Record<string, unknown>) => {
      const pos = getPos();
      if (pos == null) {
        return;
      }
      const { state } = view;
      const nodeAtPos = state.doc.nodeAt(pos);
      if (!nodeAtPos) {
        return;
      }
      const tr = state.tr.setNodeMarkup(pos, undefined, {
        ...nodeAtPos.attrs,
        ...attrs,
      });
      view.dispatch(tr);
    };

    const deleteNode = () => {
      const pos = getPos();
      if (pos == null) {
        return;
      }
      const nodeAtPos = view.state.doc.nodeAt(pos);
      if (!nodeAtPos) {
        return;
      }
      view.dispatch(view.state.tr.delete(pos, pos + nodeAtPos.nodeSize));
    };

    const contentRefCallback: RefCallback<HTMLElement> = (el) => {
      if (el && contentDOM && el !== contentDOM) {
        el.appendChild(contentDOM);
      }
    };

    const render = () => {
      if (!root) {
        root = createRoot(dom);
      }

      root.render(
        <Component
          node={currentNode}
          view={view}
          getPos={getPos}
          updateAttributes={updateAttributes}
          deleteNode={deleteNode}
          selected={isSelected}
          contentRef={contentEditable ? contentRefCallback : undefined}
        />,
      );
    };

    // Initial render
    render();

    return {
      dom,
      contentDOM,

      update(updatedNode: PMNode): boolean {
        if (updatedNode.type !== currentNode.type) {
          return false;
        }
        currentNode = updatedNode;
        render();
        return true;
      },

      selectNode() {
        isSelected = true;
        render();
      },

      deselectNode() {
        isSelected = false;
        render();
      },

      destroy() {
        if (root) {
          // Defer unmount to avoid React warnings during ProseMirror DOM cleanup
          const r = root;
          root = null;
          setTimeout(() => r.unmount(), 0);
        }
      },

      ignoreMutation(mutation) {
        // Ignore mutations inside our React-managed DOM
        if (!contentDOM) {
          return true;
        }
        // If the mutation is inside contentDOM, let ProseMirror handle it
        return !contentDOM.contains(mutation.target);
      },

      stopEvent(event: Event) {
        // Let ProseMirror handle keyboard events in contentDOM
        if (contentDOM && contentDOM.contains(event.target as Node)) {
          return false;
        }
        // Stop all events for atom node views to prevent ProseMirror interference
        return !contentEditable;
      },
    };
  };
}
