import React, { FocusEvent, useState } from "react";

import { TextSelection } from "prosemirror-state";

import type { EditorView } from "prosemirror-view";

interface Props {
  initCaption: string;
  updateAttributes: (props: { caption: string }) => void;
  view: EditorView;
  getPos?: () => number | undefined;
}

export default function NodeCaption({ initCaption, updateAttributes, view, getPos }: Props) {
  const [caption, setCaption] = useState(initCaption);
  const [isCaptionFocused, setIsCaptionFocused] = useState(false);

  const handleCaptionBlur = (e: FocusEvent<HTMLDivElement>) => {
    setIsCaptionFocused(false);
    const text = e.currentTarget.textContent?.trim() || "";
    setCaption(text);
    updateAttributes({ caption: text });
  };

  const handleCaptionFocus = (e: FocusEvent<HTMLDivElement>) => {
    if (!caption) {
      e.currentTarget.textContent = "";
    }
    setIsCaptionFocused(true);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();

      const pos = typeof getPos === "function" ? getPos() : null;
      if (pos == null) {
        return;
      }

      const { state } = view;
      const nodeAtPos = state.doc.nodeAt(pos);
      const after = pos + (nodeAtPos?.nodeSize ?? 1);

      const tr = state.tr;
      const paragraphNode = state.schema.nodes.paragraph.create();
      tr.insert(after, paragraphNode);
      const resolvedPos = tr.doc.resolve(after + 1);
      tr.setSelection(TextSelection.near(resolvedPos));
      view.dispatch(tr);

      (view.dom as HTMLElement).focus?.({ preventScroll: true });
      (e.currentTarget as HTMLDivElement).blur();
    }
  };

  const stop = (ev: React.SyntheticEvent) => {
    ev.stopPropagation();
  };

  return (
    <div
      role="textbox"
      tabIndex={0}
      className="node-caption text-(--Monochrome-Auxiliary) text-[13px] font-medium h-6.25 outline-none select-none max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
      onFocus={handleCaptionFocus}
      onBlur={handleCaptionBlur}
      suppressContentEditableWarning
      contentEditable
      aria-placeholder="Добавьте описание"
      onBeforeInput={stop}
      onInput={stop}
      onKeyDown={onKeyDown}
      onKeyUp={stop}
      onClick={stop}
      onMouseDown={stop}
      onPointerDown={stop}
      onPaste={stop}
      onDrop={stop}
      data-node-caption
    >
      {!isCaptionFocused && !caption ? "" : caption}
    </div>
  );
}
