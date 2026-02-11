import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { TextSelection } from "prosemirror-state";
import { FieldValues, useForm } from "react-hook-form";
import * as yup from "yup";

import { useEditorInstance, useEditorSelection } from "@contexts/EditorContext";

import { getMarkRange } from "@pm/commands";
import { PM_STATE_UPDATE_EVENT } from "@pm/react";

import { FormReturn, LinkFormTypes, Anchor, Range } from "./types";

interface ReturnType {
  methods: FormReturn;
  onSubmit: (values: FieldValues) => void;
  onDeleteLink: () => void;
  isBubbleVisible?: boolean;
  anchor?: Anchor;
  bubbleRef: RefObject<HTMLDivElement | null>;
}

const REQUIRED_ERROR_MESSAGE = "This field is required";
const WRONG_URL_MESSAGE = "Invalid URL";
const REQ_MESSAGE = "Enter a URL";
const URL_REGEX =
  /^(?:https?:\/\/)?(?:localhost|(?:\d{1,3}\.){3}\d{1,3}|(?:[\p{L}\p{N}](?:[\p{L}\p{N}-]{0,61}[\p{L}\p{N}])?\.)+[\p{L}\p{N}-]{2,})(?::\d{2,5})?(?:[/?#]\S*)?$/iu;

const schema = yup.object({
  url: yup
    .string()
    .trim()
    .transform((v) => {
      if (!v) {
        return v;
      }
      return /^(?:[a-z][a-z0-9+\-.]*:)?\/\//i.test(v) ? v : `https://${v}`;
    })
    .matches(URL_REGEX, WRONG_URL_MESSAGE)
    .required(REQ_MESSAGE),
  name: yup.string().required(REQUIRED_ERROR_MESSAGE),
});

export const useEditorLink = (): ReturnType => {
  const { view } = useEditorInstance();
  const { isLinkActive, onToggleLinkActive } = useEditorSelection();

  const methods = useForm<LinkFormTypes>({
    resolver: yupResolver(schema),
    defaultValues: { url: "", name: "" },
  });

  const { reset, setValue, watch } = methods;
  const rangeRef = useRef<Range | null>(null);
  const lastTextRangeRef = useRef<Range | null>(null);
  const linkHrefRef = useRef<string | null>(null);
  const suspendLiveRef = useRef<boolean>(false);
  const suppressOpenRef = useRef<boolean>(false);
  const [anchor, setAnchor] = useState<Anchor>();
  const [visible, setVisible] = useState<boolean>(false);
  const bubbleRef = useRef<HTMLDivElement | null>(null);

  const isBubbleVisible = Boolean(visible) && Boolean(anchor);
  // eslint-disable-next-line react-hooks/incompatible-library
  const nameValue = watch("name");

  const ensureTextRange = (): Range | null => {
    if (!view) {
      return null;
    }

    const sel = view.state.selection;

    if (sel instanceof TextSelection && !sel.empty) {
      return { from: sel.from, to: sel.to };
    }

    const $from = view.state.doc.resolve(sel.from);
    const linkRange = getMarkRange($from, view.state.schema.marks.link);

    if (linkRange) {
      return { from: linkRange.from, to: linkRange.to };
    }

    if (rangeRef.current) {
      return rangeRef.current;
    }

    if (lastTextRangeRef.current) {
      return lastTextRangeRef.current;
    }

    return null;
  };

  const updateAnchor = () => {
    if (!view) {
      return;
    }

    const target = rangeRef.current ?? ensureTextRange();
    if (!target) {
      return;
    }

    const { from, to } = target;

    try {
      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);
      setAnchor({
        top: Math.max(start.bottom, end.bottom),
        left: (start.left + end.right) / 2,
      });
    } catch {
      /* coords may be unavailable if node is off-screen */
    }
  };

  const getLinkHrefFromPos = () => {
    if (!view) {
      return "";
    }
    const { $from } = view.state.selection;
    const linkMark = $from.marks().find((m) => m.type === view.state.schema.marks.link);
    return linkMark ? String(linkMark.attrs.href ?? "") : "";
  };

  const isLinkAtCursor = () => {
    if (!view) {
      return false;
    }
    const { $from } = view.state.selection;
    return $from.marks().some((m) => m.type === view.state.schema.marks.link);
  };

  const openForCurrentSelection = () => {
    if (!view) {
      return;
    }

    const target = ensureTextRange();

    if (!target) {
      return;
    }

    rangeRef.current = target;
    lastTextRangeRef.current = target;

    const { state } = view;
    const text = state.doc.textBetween(target.from, target.to, " ") ?? "";
    const attrHref = getLinkHrefFromPos();

    setValue("name", text, { shouldDirty: false, shouldTouch: false });

    if (attrHref) {
      setValue("url", String(attrHref), {
        shouldDirty: false,
        shouldTouch: false,
      });
      linkHrefRef.current = String(attrHref);
    } else {
      setValue("url", "", { shouldDirty: false, shouldTouch: false });
      linkHrefRef.current = null;
    }

    setVisible(true);
    updateAnchor();
  };

  const onSubmit = (values: FieldValues) => {
    if (!view) {
      return;
    }

    const r = rangeRef.current;

    if (!r) {
      return;
    }

    suspendLiveRef.current = true;
    suppressOpenRef.current = true;

    const { state } = view;
    const tr = state.tr;
    tr.setSelection(TextSelection.create(tr.doc, r.from, r.to));
    const linkMark = state.schema.marks.link.create({
      href: String(values.url || ""),
      target: "_blank",
    });
    tr.addMark(r.from, r.to, linkMark);
    const pos = Math.min(r.to, tr.doc.content.size - 1);
    tr.setSelection(TextSelection.create(tr.doc, pos, pos));
    view.dispatch(tr);
    view.focus();

    setVisible(false);
    setAnchor(undefined);
    onToggleLinkActive(true);

    setTimeout(() => {
      rangeRef.current = null;
      linkHrefRef.current = null;
      suspendLiveRef.current = false;
      suppressOpenRef.current = false;
    }, 0);
  };

  const onDeleteLink = () => {
    if (!view) {
      return;
    }

    suspendLiveRef.current = true;
    suppressOpenRef.current = true;

    const { state } = view;
    const { $from } = state.selection;
    const linkRange = getMarkRange($from, state.schema.marks.link);
    if (linkRange) {
      const tr = state.tr.removeMark(linkRange.from, linkRange.to, state.schema.marks.link);
      view.dispatch(tr);
      view.focus();
    }

    setVisible(false);
    setAnchor(undefined);
    onToggleLinkActive(true);

    setTimeout(() => {
      rangeRef.current = null;
      linkHrefRef.current = null;
      suspendLiveRef.current = false;
      suppressOpenRef.current = false;
      reset();
    }, 0);
  };

  useEffect(() => {
    if (!view) {
      return;
    }

    const onSelUpdate = () => {
      if (suppressOpenRef.current) {
        updateAnchor();
        return;
      }

      const { state } = view;
      const sel = state.selection;
      let target: Range | null;
      const $from = state.doc.resolve(sel.from);
      const linkRange = getMarkRange($from, state.schema.marks.link);

      if (linkRange) {
        target = { from: linkRange.from, to: linkRange.to };
      } else if (sel instanceof TextSelection && !sel.empty) {
        target = { from: sel.from, to: sel.to };
      } else {
        target = null;
      }

      if (target) {
        rangeRef.current = target;
        lastTextRangeRef.current = target;
        const text = state.doc.textBetween(target.from, target.to, " ") ?? "";
        const href = getLinkHrefFromPos();
        setValue("name", text, { shouldDirty: false, shouldTouch: false });

        if (href) {
          setValue("url", href, { shouldDirty: false, shouldTouch: false });
          linkHrefRef.current = href;
        } else {
          linkHrefRef.current = null;
        }

        if (isLinkAtCursor()) {
          setVisible(true);
        }
      }
      updateAnchor();
    };
    view.dom.addEventListener(PM_STATE_UPDATE_EVENT, onSelUpdate);

    return () => {
      view.dom.removeEventListener(PM_STATE_UPDATE_EVENT, onSelUpdate);
    };
  }, [view]); // eslint-disable-line

  useEffect(() => {
    if (!view) {
      return;
    }

    if (isLinkActive) {
      openForCurrentSelection();
    }
  }, [view, isLinkActive]); // eslint-disable-line

  useEffect(() => {
    const handler = () => {
      updateAnchor();
    };

    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [view]); // eslint-disable-line

  useEffect(() => {
    if (!view || !visible || !rangeRef.current || suspendLiveRef.current) {
      return;
    }

    const text = nameValue ?? "";

    const { state } = view;
    const { from, to } = rangeRef.current;
    const current = state.doc.textBetween(from, to, " ") ?? "";
    if (current !== text) {
      const tr = state.tr;
      tr.insertText(text, from, to);
      const href = linkHrefRef.current;
      if (href) {
        tr.addMark(from, from + text.length, state.schema.marks.link.create({ href }));
      }
      const newTo = from + text.length;
      rangeRef.current = { from, to: newTo };
      tr.setSelection(TextSelection.create(tr.doc, from, newTo));
      view.dispatch(tr);
    }

    updateAnchor();
  }, [nameValue, view, visible]); // eslint-disable-line

  useEffect(() => {
    if (!view) {
      return;
    }

    const root = view.dom.ownerDocument;
    const onPointerDown = (e: PointerEvent) => {
      if (!visible) {
        return;
      }

      if (!bubbleRef.current) {
        return;
      }

      const target = e.target as Node | null;

      if (!target) {
        return;
      }

      const bubble = bubbleRef.current;

      if (bubble && bubble.contains(target)) {
        return;
      }

      const viewDom = view.dom as HTMLElement;

      if (viewDom.contains(target)) {
        const el =
          (target as HTMLElement).nodeType === 1
            ? (target as HTMLElement)
            : (target as HTMLElement).parentElement;

        const linkEl = el ? el.closest("a") : null;

        if (linkEl) {
          return;
        }
      }
      suppressOpenRef.current = true;
      setVisible(false);
      setAnchor(undefined);
      onToggleLinkActive(true);

      setTimeout(() => {
        suppressOpenRef.current = false;
      }, 0);
    };
    root.addEventListener("pointerdown", onPointerDown, true);

    return () => {
      root.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [view, visible]); // eslint-disable-line

  return {
    methods: methods as unknown as FormReturn,
    onSubmit,
    onDeleteLink,
    isBubbleVisible,
    anchor,
    bubbleRef,
  };
};
