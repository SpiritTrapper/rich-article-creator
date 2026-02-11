import { baseKeymap, splitBlock, joinBackward } from "prosemirror-commands";
import { undo, redo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { liftListItem } from "prosemirror-schema-list";
import { Plugin, Command, NodeSelection } from "prosemirror-state";

import { toggleBold, toggleItalic, toggleUnderline, toggleStrike } from "./commands";
import { editorSchema } from "./schema";

/* ---------- custom Enter in paragraphs ---------- */

const customEnter: Command = (state, dispatch, view) => {
  const { $from } = state.selection;

  // --- list item exit logic (from IndentExtension) ---
  if ($from.parent.type === editorSchema.nodes.listItem || isInsideListItem(state)) {
    const isListName = (n: string) => n === "orderedList" || n === "bulletList";

    let listDepth = -1;
    for (let d = $from.depth; d > 0; d--) {
      if (isListName($from.node(d).type.name)) {
        listDepth = d;
        break;
      }
    }

    if (listDepth !== -1) {
      let liDepth = -1;
      for (let d = $from.depth; d > 0; d--) {
        if ($from.node(d).type.name === "listItem") {
          liDepth = d;
          break;
        }
      }

      if (liDepth !== -1) {
        const parentOfList = $from.node(listDepth - 1);
        const isTopLevel = parentOfList && parentOfList.type.name !== "listItem";

        let textBlockDepth = -1;
        for (let d = $from.depth; d > 0; d--) {
          if ($from.node(d).type.isTextblock) {
            textBlockDepth = d;
            break;
          }
        }
        const isEmpty = textBlockDepth !== -1 && $from.node(textBlockDepth).content.size === 0;

        const listNode = $from.node(listDepth);
        const indexInList = $from.index(listDepth);
        const isLast = indexInList === listNode.childCount - 1;

        if (isTopLevel && isEmpty && isLast) {
          return liftListItem(editorSchema.nodes.listItem)(state, dispatch, view);
        }
      }
    }

    // Don't handle non-exit list Enter — fall through to default
    return false;
  }

  // --- paragraph indent reset on Enter (from IndentExtension) ---
  if ($from.parent.type === editorSchema.nodes.paragraph && $from.parent.attrs.textIndent) {
    const ok = splitBlock(state, dispatch, view);
    if (ok && dispatch && view) {
      // Reset textIndent on the new paragraph
      const newState = view.state;
      const { $from: newFrom } = newState.selection;
      if (newFrom.parent.type === editorSchema.nodes.paragraph) {
        const pos = newFrom.before(newFrom.depth);
        dispatch(
          newState.tr.setNodeMarkup(pos, undefined, {
            ...newFrom.parent.attrs,
            textIndent: null,
          }),
        );
      }
    }
    return true;
  }

  // --- paragraph textAlign reset on Enter (from ParagraphExtension) ---
  if ($from.parent.type !== editorSchema.nodes.paragraph) {
    return false;
  }

  const ok = splitBlock(state, dispatch, view);
  if (ok && dispatch && view) {
    const newState = view.state;
    const { $from: newFrom } = newState.selection;
    if (newFrom.parent.type === editorSchema.nodes.paragraph) {
      const pos = newFrom.before(newFrom.depth);
      dispatch(
        newState.tr.setNodeMarkup(pos, undefined, {
          ...newFrom.parent.attrs,
          textAlign: "left",
        }),
      );
    }
  }
  return true;
};

/* ---------- custom Backspace in paragraphs ---------- */

const customBackspace: Command = (state, dispatch, view) => {
  const { $from, empty } = state.selection;
  const sel = state.selection;

  // MainImage guard: prevent Backspace on selected mainImage
  if (sel instanceof NodeSelection && sel.node.type.name === "mainImage") {
    return true;
  }

  // MainImage guard: prevent Backspace into mainImage
  if (empty && $from.parentOffset === 0) {
    const prev = $from.nodeBefore;
    if (prev && prev.type.name === "mainImage") {
      return true;
    }
  }

  // paragraph: reset textAlign on join
  if ($from.parent.type === editorSchema.nodes.paragraph && empty && $from.parentOffset === 0) {
    const ok = joinBackward(state, dispatch, view);
    if (ok && dispatch && view) {
      const newState = view.state;
      const { $from: newFrom } = newState.selection;
      if (newFrom.parent.type === editorSchema.nodes.paragraph) {
        const pos = newFrom.before(newFrom.depth);
        dispatch(
          newState.tr.setNodeMarkup(pos, undefined, {
            ...newFrom.parent.attrs,
            textAlign: "left",
          }),
        );
      }
    }
    return true;
  }

  return false;
};

/* ---------- custom Delete ---------- */

const customDelete: Command = (state) => {
  const sel = state.selection;

  // MainImage guard: prevent Delete on selected mainImage
  if (sel instanceof NodeSelection && sel.node.type.name === "mainImage") {
    return true;
  }

  // MainImage guard: prevent Delete into mainImage
  if (sel.empty) {
    const { $from } = sel;
    if ($from.parentOffset === $from.parent.content.size) {
      const next = $from.nodeAfter;
      if (next && next.type.name === "mainImage") {
        return true;
      }
    }
  }

  return false;
};

/* ---------- helper ---------- */

function isInsideListItem(state: {
  selection: { $from: { depth: number; node: (d: number) => { type: { name: string } } } };
}): boolean {
  const { $from } = state.selection;
  for (let d = $from.depth; d > 0; d--) {
    if ($from.node(d).type.name === "listItem") return true;
  }
  return false;
}

/* ---------- build keymap ---------- */

export function buildKeymap(): Plugin[] {
  return [
    // Custom handlers first (highest priority)
    keymap({
      Enter: customEnter,
      Backspace: customBackspace,
      Delete: customDelete,
    }),
    // Mark shortcuts
    keymap({
      "Mod-b": toggleBold,
      "Mod-i": toggleItalic,
      "Mod-u": toggleUnderline,
      "Mod-Shift-s": toggleStrike,
      "Mod-z": undo,
      "Mod-y": redo,
      "Mod-Shift-z": redo,
    }),
    // Base ProseMirror keymap
    keymap(baseKeymap),
  ];
}
