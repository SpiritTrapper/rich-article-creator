import { dropCursor } from "prosemirror-dropcursor";
import { gapCursor } from "prosemirror-gapcursor";
import { history } from "prosemirror-history";
import { Node as PMNode } from "prosemirror-model";
import { EditorState, Plugin, PluginKey, TextSelection } from "prosemirror-state";
import { Decoration, DecorationSet, EditorView } from "prosemirror-view";

/* ---------- placeholder ---------- */

const placeholderKey = new PluginKey<DecorationSet>("placeholder");

export function placeholderPlugin(text: string): Plugin<DecorationSet> {
  return new Plugin<DecorationSet>({
    key: placeholderKey,
    state: {
      init(_config, state): DecorationSet {
        return buildPlaceholderDecos(state, text);
      },
      apply(_tr, _value, _old, newState): DecorationSet {
        return buildPlaceholderDecos(newState, text);
      },
    },
    props: {
      decorations(state): DecorationSet {
        return placeholderKey.getState(state) ?? DecorationSet.empty;
      },
    },
  });
}

function buildPlaceholderDecos(state: EditorState, text: string): DecorationSet {
  const doc = state.doc;
  const decos: Decoration[] = [];

  doc.descendants((node, pos) => {
    if (node.type.name === "paragraph" && node.content.size === 0) {
      // Show placeholder on the first empty paragraph only
      if (pos === 0 || (doc.childCount === 1 && pos === 0)) {
        decos.push(
          Decoration.node(pos, pos + node.nodeSize, {
            class: "is-empty is-editor-empty",
            "data-placeholder": text,
          }),
        );
      } else if (node.content.size === 0) {
        decos.push(
          Decoration.node(pos, pos + node.nodeSize, {
            class: "is-empty",
            "data-placeholder": "",
          }),
        );
      }
    }
  });

  return DecorationSet.create(doc, decos);
}

/* ---------- main image guard ---------- */

const mainImageGuardKey = new PluginKey("mainImageGuard");

export function mainImageGuardPlugin(): Plugin {
  const hasMainImage = (doc: PMNode): boolean => {
    let found = false;
    doc.descendants((n) => {
      if (n.type.name === "mainImage") {
        found = true;
        return false;
      }
      return true;
    });
    return found;
  };

  return new Plugin({
    key: mainImageGuardKey,
    filterTransaction(tr, state) {
      const hadBefore = hasMainImage(state.doc);
      const hasAfter = hasMainImage(tr.doc);

      if (hadBefore && !hasAfter) {
        return tr.getMeta("allowMainImageDelete") === true;
      }
      return true;
    },
  });
}

/* ---------- click below to add paragraph ---------- */

const clickBelowKey = new PluginKey<DecorationSet>("click-below-to-add-paragraph");

export function clickBelowToAddParagraphPlugin(): Plugin<DecorationSet> {
  const makeTail = (state: EditorState): DecorationSet => {
    const end = state.doc.content.size;
    const el = document.createElement("div");
    el.className = "pm-click-tail";
    el.setAttribute("aria-label", "Нажмите, чтобы добавить абзац");
    return DecorationSet.create(state.doc, [Decoration.widget(end, el, { side: 1 })]);
  };

  const isHTMLElement = (t: EventTarget | null): t is HTMLElement => t instanceof HTMLElement;

  const insertOrFocusLastParagraph = (view: EditorView) => {
    const { state } = view;
    const { schema } = state;
    const end = state.doc.content.size;
    const last = state.doc.lastChild;
    let tr = state.tr;

    if (last && last.type === schema.nodes.paragraph && last.content.size === 0) {
      const posInsideEmptyPara = end - 1;
      tr = tr.setSelection(TextSelection.create(state.doc, posInsideEmptyPara));
    } else {
      const para = schema.nodes.paragraph.createAndFill();
      if (para) {
        tr = tr.insert(end, para);
        const posInsideNewPara = tr.doc.content.size - 1;
        tr = tr.setSelection(TextSelection.create(tr.doc, posInsideNewPara));
      } else {
        const near = TextSelection.near(state.doc.resolve(end), -1);
        tr = tr.setSelection(near);
      }
    }

    view.focus();
    view.dispatch(tr.scrollIntoView());
  };

  return new Plugin<DecorationSet>({
    key: clickBelowKey,
    state: {
      init(_config, state): DecorationSet {
        return makeTail(state);
      },
      apply(_tr, _value, _old, newState): DecorationSet {
        return makeTail(newState);
      },
    },
    props: {
      decorations(state): DecorationSet {
        return clickBelowKey.getState(state) ?? DecorationSet.empty;
      },
      handleDOMEvents: {
        mousedown(view: EditorView, event: MouseEvent): boolean {
          const target = event.target;
          if (!isHTMLElement(target)) return false;
          if (!target.closest(".pm-click-tail")) return false;
          insertOrFocusLastParagraph(view);
          event.preventDefault();
          return true;
        },
        touchend(view: EditorView, event: TouchEvent): boolean {
          const target = event.target;
          if (!isHTMLElement(target)) return false;
          if (!target.closest(".pm-click-tail")) return false;
          insertOrFocusLastParagraph(view);
          event.preventDefault();
          return true;
        },
      },
    },
  });
}

/* ---------- character count ---------- */

interface CharCountState {
  characters: number;
}

const characterCountKey = new PluginKey<CharCountState>("characterCount");

export function characterCountPlugin(): Plugin<CharCountState> {
  return new Plugin<CharCountState>({
    key: characterCountKey,
    state: {
      init(_c, state): CharCountState {
        return { characters: state.doc.textContent.length };
      },
      apply(_t, _v, _o, newState): CharCountState {
        return { characters: newState.doc.textContent.length };
      },
    },
  });
}

export function getCharacterCount(state: EditorState): number {
  return characterCountKey.getState(state)?.characters ?? 0;
}

/* ---------- build all plugins ---------- */

export function buildPlugins(): Plugin[] {
  return [
    placeholderPlugin("Начните свой шедевр..."),
    mainImageGuardPlugin(),
    clickBelowToAddParagraphPlugin(),
    characterCountPlugin(),
    history(),
    dropCursor(),
    gapCursor(),
  ];
}
