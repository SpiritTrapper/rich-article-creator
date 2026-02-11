import { EditorContextProvider } from "@contexts/EditorContext";

import type { RichArticleEditorProps } from "@shared/types";

import EditorInner from "./EditorInner";

import "./globals.css";

export type { CarouselItem, RichArticleEditorProps } from "@shared/types";
export type { DropdownItem } from "@contexts/EditorContext";

export function RichArticleEditor(props: RichArticleEditorProps) {
  return (
    <EditorContextProvider {...props}>
      <EditorInner />
    </EditorContextProvider>
  );
}
