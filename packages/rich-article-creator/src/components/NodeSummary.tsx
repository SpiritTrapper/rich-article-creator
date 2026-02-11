import React, { useEffect, useRef } from "react";

import { TextSelection } from "prosemirror-state";

import { createReactNodeView } from "@pm/react";
import type { ReactNodeViewProps } from "@pm/react";

import NodeContextMenu from "./NodeContextMenu";


function SummaryNodeView({ view, getPos, contentRef }: ReactNodeViewProps) {
  const summaryRef = useRef<HTMLElement | null>(null);

  const restoreCaretIntoThisSummary = () => {
    const pos = getPos();
    if (typeof pos === "number") {
      const { state } = view;
      const $pos = state.doc.resolve(Math.max(0, pos + 1));
      const tr = state.tr.setSelection(TextSelection.near($pos, -1));
      view.dispatch(tr);
      view.focus();
    }
  };

  const convertToText = () => {
    const { state } = view;
    const { tr, selection } = state;
    const { $from } = selection;

    let detailsDepth: number | null = null;
    for (let d = $from.depth; d > 0; d--) {
      if ($from.node(d).type.name === "details") {
        detailsDepth = d;
        break;
      }
    }

    if (detailsDepth != null) {
      const detailsPos = $from.before(detailsDepth);
      const detailsNode = $from.node(detailsDepth);
      const summarySize = detailsNode.firstChild ? detailsNode.firstChild.nodeSize : 0;
      const contentFragment = detailsNode.content.cut(summarySize);

      view.dispatch(tr.replaceWith(detailsPos, detailsPos + detailsNode.nodeSize, contentFragment));
      requestAnimationFrame(() => {
        const docSize = view.state.doc.content.size;
        const near = Math.min(detailsPos + 1, docSize - 1);
        const $near = view.state.doc.resolve(Math.max(0, near));
        view.dispatch(view.state.tr.setSelection(TextSelection.near($near, -1)));
        view.focus();
      });
      return;
    }

    const pos = getPos();
    if (typeof pos === "number") {
      const node = state.doc.nodeAt(pos);
      if (node) {
        view.dispatch(tr.replaceWith(pos, pos + node.nodeSize, node.content));
        requestAnimationFrame(restoreCaretIntoThisSummary);
      }
    }
  };

  const deleteDetails = () => {
    const { state } = view;
    const { tr, selection } = state;
    const { $from } = selection;

    let detailsDepth: number | null = null;
    for (let d = $from.depth; d > 0; d--) {
      if ($from.node(d).type.name === "details") {
        detailsDepth = d;
        break;
      }
    }

    if (detailsDepth != null) {
      const detailsPos = $from.before(detailsDepth);
      const size = $from.node(detailsDepth).nodeSize;
      view.dispatch(tr.delete(detailsPos, detailsPos + size));
      requestAnimationFrame(() => {
        const near = Math.max(0, detailsPos - 1);
        const $near = view.state.doc.resolve(near);
        view.dispatch(view.state.tr.setSelection(TextSelection.near($near, -1)));
        view.focus();
      });
      return;
    }

    const pos = getPos();
    if (typeof pos === "number") {
      const node = state.doc.nodeAt(pos);
      if (node) {
        view.dispatch(tr.delete(pos, pos + node.nodeSize));
        requestAnimationFrame(() => {
          const near = Math.max(0, pos - 1);
          const $near = view.state.doc.resolve(near);
          view.dispatch(view.state.tr.setSelection(TextSelection.near($near, -1)));
          view.focus();
        });
      }
    }
  };

  const stopAll = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const summaryEl = summaryRef.current;
    if (!summaryEl) {
      return;
    }

    const detailsEl = summaryEl.closest("details");

    if (!detailsEl) {
      return;
    }

    const onToggle = () => {
      if (!(detailsEl as HTMLDetailsElement).open) {
        requestAnimationFrame(() => restoreCaretIntoThisSummary());
      }
    };

    detailsEl.addEventListener("toggle", onToggle);
    return () => detailsEl.removeEventListener("toggle", onToggle);
  }, [view, getPos]); // eslint-disable-line

  return (
    <div data-summary-node>
      <summary
        ref={(el) => {
          summaryRef.current = el;
          contentRef?.(el);
        }}
        style={{ touchAction: "manipulation" }}
      />
      <div
        className="absolute top-3 right-3 z-100"
        contentEditable={false}
        suppressContentEditableWarning
        onMouseDown={stopAll}
        onPointerDown={stopAll}
        onTouchStart={stopAll}
        onClick={stopAll}
      >
        <NodeContextMenu
          items={[
            { title: "Delete with text", action: deleteDetails },
            { title: "Convert to plain text", action: convertToText },
          ]}
        />
      </div>
    </div>
  );
}

export const detailsSummaryNodeView = createReactNodeView(SummaryNodeView, {
  contentEditable: true,
});
