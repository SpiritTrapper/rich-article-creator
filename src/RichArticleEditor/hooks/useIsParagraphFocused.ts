import { useEffect, useRef, useState } from "react";

import { PM_STATE_UPDATE_EVENT } from "../pm/react/useEditor";

import type { EditorView } from "prosemirror-view";

interface Options {
  topLevelOnly?: boolean;
  ignoreBlurInsideSelector?: string;
  shouldIgnoreBlur?: boolean;
}

export function useIsParagraphFocused(view: EditorView | null, opts: Options = {}) {
  const { topLevelOnly = false } = opts;
  const ignoreSelRef = useRef(opts.ignoreBlurInsideSelector);
  const shouldIgnoreBlurRef = useRef(opts.shouldIgnoreBlur);
  const [isParagraph, setIsParagraph] = useState(false);

  const isParaRef = useRef(isParagraph);

  const setIsPara = (next: boolean) => {
    if (isParaRef.current !== next) {
      isParaRef.current = next;
      setIsParagraph(next);
    }
  };

  useEffect(() => {
    if (!view) {
      return;
    }

    const read = () => {
      if (!view.hasFocus()) {
        setIsPara(false);
        return;
      }

      const { state } = view;
      const sel = state.selection;
      const $from = sel?.$from;

      let inParagraph = false;
      if ($from) {
        const isParagraphParent = $from.parent?.type?.name === "paragraph";
        inParagraph = topLevelOnly ? isParagraphParent && $from.depth === 1 : isParagraphParent;
      }

      setIsPara(inParagraph);
    };

    const onBlur = (event: FocusEvent) => {
      if (shouldIgnoreBlurRef.current) {
        return;
      }

      const sel = ignoreSelRef.current;
      const target = (event?.relatedTarget || event.target) as Element | null;
      if (sel && target) {
        const container = document.querySelector(sel);
        if (container && container.contains(target)) return;
      }

      setIsPara(false);
    };

    view.dom.addEventListener(PM_STATE_UPDATE_EVENT, read);
    view.dom.addEventListener("focus", read);
    view.dom.addEventListener("blur", onBlur);

    read();

    return () => {
      view.dom.removeEventListener(PM_STATE_UPDATE_EVENT, read);
      view.dom.removeEventListener("focus", read);
      view.dom.removeEventListener("blur", onBlur);
    };
  }, [view, topLevelOnly]);

  return isParagraph;
}
