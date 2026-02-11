import { Dispatch, RefObject, SetStateAction } from "react";

import { Plugin, PluginKey } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

import { CarouselItem } from "@shared/types";

export interface EditorCallbacks {
  onUploadImage?: (file: File) => Promise<string>;
  setHasMainImage?: Dispatch<SetStateAction<boolean>>;
  openCarouselModal?: () => void;
  setCarouselItems?: Dispatch<SetStateAction<CarouselItem[]>>;
  setEditingCarouselPos?: Dispatch<SetStateAction<number | null>>;
}

const callbackPluginKey = new PluginKey<RefObject<EditorCallbacks>>("editorCallbacks");

export function createCallbackPlugin(
  callbacksRef: RefObject<EditorCallbacks>,
): Plugin<RefObject<EditorCallbacks>> {
  return new Plugin<RefObject<EditorCallbacks>>({
    key: callbackPluginKey,
    state: {
      init() {
        return callbacksRef;
      },
      apply(_tr, value) {
        return value;
      },
    },
  });
}

export function getEditorCallbacks(view: EditorView): EditorCallbacks {
  return callbackPluginKey.getState(view.state)?.current ?? {};
}
