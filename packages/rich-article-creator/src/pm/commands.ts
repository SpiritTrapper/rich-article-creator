import { toggleMark, setBlockType, wrapIn, lift } from "prosemirror-commands";
import { undo, redo } from "prosemirror-history";
import { MarkType, NodeType, ResolvedPos, Fragment } from "prosemirror-model";
import { wrapInList, liftListItem, sinkListItem } from "prosemirror-schema-list";
import { EditorState, Command } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

import { editorSchema } from "./schema";

/* ---------- types ---------- */

export interface MarkRange {
  from: number;
  to: number;
}

export interface CarouselItemAttrs {
  id: string;
  src: string;
  caption: string;
  orientation: "horizontal" | "vertical" | "square";
}

/* ---------- mark toggles ---------- */

export const toggleBold: Command = toggleMark(editorSchema.marks.bold);
export const toggleItalic: Command = toggleMark(editorSchema.marks.italic);
export const toggleUnderline: Command = toggleMark(editorSchema.marks.underline);
export const toggleStrike: Command = toggleMark(editorSchema.marks.strike);
export const toggleCode: Command = toggleMark(editorSchema.marks.code);

/* ---------- block toggles ---------- */

function isBlockActive(
  state: EditorState,
  nodeType: NodeType,
  attrs?: Record<string, unknown>,
): boolean {
  const { $from } = state.selection;
  for (let d = $from.depth; d > 0; d--) {
    const node = $from.node(d);
    if (node.type === nodeType) {
      if (!attrs) {
        return true;
      }

      return Object.entries(attrs).every(([k, v]) => node.attrs[k] === v);
    }
  }
  return (
    $from.parent.type === nodeType &&
    (!attrs || Object.entries(attrs).every(([k, v]) => $from.parent.attrs[k] === v))
  );
}

export function toggleHeading(level: number): Command {
  return (state, dispatch, view) => {
    const headingType = editorSchema.nodes.heading;
    if (isBlockActive(state, headingType, { level })) {
      return setBlockType(editorSchema.nodes.paragraph)(state, dispatch, view);
    }
    return setBlockType(headingType, { level })(state, dispatch, view);
  };
}

export function toggleBlockquote(): Command {
  return (state, dispatch, view) => {
    if (isBlockActive(state, editorSchema.nodes.blockquote)) {
      return lift(state, dispatch, view);
    }
    return wrapIn(editorSchema.nodes.blockquote)(state, dispatch, view);
  };
}

export function toggleCodeBlock(): Command {
  return (state, dispatch, view) => {
    if (isBlockActive(state, editorSchema.nodes.codeBlock)) {
      return setBlockType(editorSchema.nodes.paragraph)(state, dispatch, view);
    }
    return setBlockType(editorSchema.nodes.codeBlock)(state, dispatch, view);
  };
}

/* ---------- list toggles ---------- */

export function toggleBulletList(): Command {
  return (state, dispatch, view) => {
    if (isBlockActive(state, editorSchema.nodes.bulletList)) {
      return liftListItem(editorSchema.nodes.listItem)(state, dispatch, view);
    }
    return wrapInList(editorSchema.nodes.bulletList)(state, dispatch, view);
  };
}

export function toggleOrderedList(): Command {
  return (state, dispatch, view) => {
    if (isBlockActive(state, editorSchema.nodes.orderedList)) {
      return liftListItem(editorSchema.nodes.listItem)(state, dispatch, view);
    }
    return wrapInList(editorSchema.nodes.orderedList)(state, dispatch, view);
  };
}

/* ---------- links ---------- */

export function getMarkRange($pos: ResolvedPos, markType: MarkType): MarkRange | null {
  const { parent, parentOffset } = $pos;
  const start = parent.childAfter(parentOffset);
  if (!start.node) {
    return null;
  }

  const mark = start.node.marks.find((m) => m.type === markType);
  if (!mark) {
    return null;
  }

  const startIdx = $pos.start();
  const endIdx = startIdx + parent.content.size;
  let from = startIdx;
  let to = startIdx;

  parent.forEach((child, offset) => {
    const childStart = startIdx + offset;
    const childEnd = childStart + child.nodeSize;
    if (child.marks.some((m) => m.type === markType && m.eq(mark))) {
      if (childStart <= $pos.pos && $pos.pos < childEnd) {
        // This child contains our position — expand range
      }
    }
  });

  // Walk backwards to find start
  from = $pos.pos;
  to = $pos.pos;

  parent.forEach((child, offset) => {
    const childStart = startIdx + offset;
    const childEnd = childStart + child.nodeSize;
    const hasMark = child.marks.some((m) => m.type === markType && m.eq(mark));
    if (hasMark && childEnd > from && childStart <= to) {
      from = Math.min(from, childStart);
      to = Math.max(to, childEnd);
    }
  });

  // Expand further if adjacent nodes also have the same mark
  let changed = true;
  while (changed) {
    changed = false;
    parent.forEach((child, offset) => {
      const childStart = startIdx + offset;
      const childEnd = childStart + child.nodeSize;
      const hasMark = child.marks.some((m) => m.type === markType && m.eq(mark));
      if (hasMark) {
        if (childEnd === from) {
          from = childStart;
          changed = true;
        }
        if (childStart === to) {
          to = childEnd;
          changed = true;
        }
      }
    });
  }

  if (from === to) {
    return null;
  }
  return { from: Math.max(from, startIdx), to: Math.min(to, endIdx) };
}

export function setLink(href: string): Command {
  return (state, dispatch) => {
    const { from, to } = state.selection;
    if (from === to) {
      return false;
    }
    if (dispatch) {
      const mark = editorSchema.marks.link.create({ href, target: "_blank" });
      dispatch(state.tr.addMark(from, to, mark));
    }
    return true;
  };
}

export function unsetLink(): Command {
  return (state, dispatch) => {
    const { from, to } = state.selection;
    if (dispatch) {
      dispatch(state.tr.removeMark(from, to, editorSchema.marks.link));
    }
    return true;
  };
}

/* ---------- color / highlight ---------- */

export function setColor(color: string): Command {
  return (state, dispatch) => {
    const { from, to } = state.selection;
    if (from === to) {
      return false;
    }
    if (dispatch) {
      const mark = editorSchema.marks.textStyle.create({ color });
      dispatch(state.tr.addMark(from, to, mark));
    }
    return true;
  };
}

export function toggleHighlight(color: string): Command {
  return (state, dispatch) => {
    const { from, to } = state.selection;
    if (from === to) {
      return false;
    }

    const markType = editorSchema.marks.highlight;
    const hasMark = state.doc.rangeHasMark(from, to, markType);

    if (dispatch) {
      if (hasMark) {
        const tr = state.tr.removeMark(from, to, markType);
        if (color !== "transparent") {
          tr.addMark(from, to, markType.create({ color }));
        }
        dispatch(tr);
      } else {
        dispatch(state.tr.addMark(from, to, markType.create({ color })));
      }
    }
    return true;
  };
}

/* ---------- alignment ---------- */

export function setTextAlign(align: string): Command {
  return (state, dispatch) => {
    const { from, to } = state.selection;
    if (dispatch) {
      const tr = state.tr;
      state.doc.nodesBetween(from, to, (node, pos) => {
        if (node.type === editorSchema.nodes.paragraph) {
          tr.setNodeMarkup(pos, undefined, { ...node.attrs, textAlign: align });
        }
      });
      dispatch(tr);
    }
    return true;
  };
}

/* ---------- indent ---------- */

function getActiveListType(state: EditorState): "listItem" | null {
  const { $from } = state.selection;
  for (let d = $from.depth; d > 0; d--) {
    if ($from.node(d).type === editorSchema.nodes.listItem) {
      return "listItem";
    }
  }
  return null;
}

export function setIndent(value: string): Command {
  return (state, dispatch, view) => {
    const listType = getActiveListType(state);
    if (listType) {
      return sinkListItem(editorSchema.nodes.listItem)(state, dispatch, view);
    }
    if (dispatch) {
      const { from, to } = state.selection;
      const tr = state.tr;
      state.doc.nodesBetween(from, to, (node, pos) => {
        if (node.type === editorSchema.nodes.paragraph) {
          tr.setNodeMarkup(pos, undefined, { ...node.attrs, textIndent: value });
        }
      });
      dispatch(tr);
    }
    return true;
  };
}

export function unsetIndent(): Command {
  return (state, dispatch, view) => {
    const listType = getActiveListType(state);
    if (listType) {
      return liftListItem(editorSchema.nodes.listItem)(state, dispatch, view);
    }
    if (dispatch) {
      const { from, to } = state.selection;
      const tr = state.tr;
      state.doc.nodesBetween(from, to, (node, pos) => {
        if (node.type === editorSchema.nodes.paragraph) {
          tr.setNodeMarkup(pos, undefined, { ...node.attrs, textIndent: null });
        }
      });
      dispatch(tr);
    }
    return true;
  };
}

/* ---------- details ---------- */

export function setDetails(): Command {
  return (state, dispatch) => {
    const { $from, $to } = state.selection;
    if (dispatch) {
      const contentSlice = state.doc.slice($from.pos, $to.pos);
      const summaryContent =
        contentSlice.content.size > 0
          ? contentSlice.content
          : Fragment.from(editorSchema.text("..."));

      const summaryNode = editorSchema.nodes.detailsSummary.create(null, summaryContent);
      const detailsContentNode = editorSchema.nodes.detailsContent.create(
        null,
        editorSchema.nodes.paragraph.create(),
      );
      const detailsNode = editorSchema.nodes.details.create(null, [
        summaryNode,
        detailsContentNode,
      ]);

      const tr = state.tr.replaceSelectionWith(detailsNode);
      dispatch(tr);
    }
    return true;
  };
}

/* ---------- clear ---------- */

export function clearNodesAndMarks(): Command {
  return (state, dispatch) => {
    const { from, to } = state.selection;
    if (dispatch) {
      const tr = state.tr;
      // Remove all marks
      Object.values(editorSchema.marks).forEach((markType) => {
        tr.removeMark(from, to, markType);
      });
      // Set block type to paragraph
      state.doc.nodesBetween(from, to, (node, pos) => {
        if (node.isTextblock && node.type !== editorSchema.nodes.paragraph) {
          tr.setNodeMarkup(pos, editorSchema.nodes.paragraph);
        }
      });
      dispatch(tr);
    }
    return true;
  };
}

/* ---------- media inserts ---------- */

export function setMainImage(attrs: { src: string; alt?: string; title?: string }): Command {
  return (state, dispatch) => {
    const { doc, schema } = state;
    const type = schema.nodes.mainImage;

    let existingPos: number | null = null;
    doc.descendants((n, pos) => {
      if (n.type === type) {
        existingPos = pos;
        return false;
      }
      return true;
    });

    if (existingPos !== null) {
      if (dispatch) {
        dispatch(state.tr.setNodeMarkup(existingPos, type, { ...attrs }));
      }
      return true;
    }

    const mainNode = type.create({ ...attrs });
    const onlyEmptyParagraph =
      doc.childCount === 1 &&
      doc.firstChild?.isTextblock === true &&
      doc.firstChild.content.size === 0;

    if (dispatch) {
      if (onlyEmptyParagraph) {
        dispatch(state.tr.replaceWith(0, doc.content.size, mainNode));
      } else {
        dispatch(state.tr.insert(0, mainNode));
      }
    }
    return true;
  };
}

export function removeMainImage(): Command {
  return (state, dispatch) => {
    const { doc } = state;
    let pos: number | null = null;
    let nodeSize = 0;

    doc.descendants((n, p) => {
      if (n.type.name === "mainImage") {
        pos = p;
        nodeSize = n.nodeSize;
        return false;
      }
      return true;
    });

    if (pos === null) {
      return false;
    }

    if (dispatch) {
      const tr = state.tr.delete(pos, pos + nodeSize);
      tr.setMeta("allowMainImageDelete", true);
      dispatch(tr);
    }
    return true;
  };
}

function insertBlockWithParagraph(nodeType: NodeType, attrs: Record<string, unknown>): Command {
  return (state, dispatch) => {
    if (dispatch) {
      const node = nodeType.create(attrs);
      const para = editorSchema.nodes.paragraph.create();
      const { $to } = state.selection;
      const end = $to.end();
      const tr = state.tr.insert(end, Fragment.from([node, para]));
      dispatch(tr.scrollIntoView());
    }
    return true;
  };
}

export function insertCustomImage(attrs: {
  src: string;
  alt?: string;
  width: number;
  height: number;
}): Command {
  return insertBlockWithParagraph(editorSchema.nodes.customImage, attrs);
}

export function insertVideo(attrs: { src: string; width: number; height: number }): Command {
  return insertBlockWithParagraph(editorSchema.nodes.video, attrs);
}

export function insertAudioWaveform(attrs: { src: string }): Command {
  return insertBlockWithParagraph(editorSchema.nodes.audioWaveform, attrs);
}

export function insertCarousel(items: CarouselItemAttrs[]): Command {
  return insertBlockWithParagraph(editorSchema.nodes.imageCarousel, { items });
}

/* ---------- utilities ---------- */

export function execCommand(view: EditorView | null, cmd: Command): boolean {
  if (!view) {
    return false;
  }
  return cmd(view.state, view.dispatch, view);
}

export function canExec(view: EditorView | null, cmd: Command): boolean {
  if (!view) {
    return false;
  }
  return cmd(view.state, undefined, view);
}

export { undo, redo };
