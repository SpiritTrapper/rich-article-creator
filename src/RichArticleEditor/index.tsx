import { EditorContextProvider } from "./EditorContext";
import EditorInner from "./EditorInner";

import "./globals.css";
import type { RichArticleEditorProps } from "./shared/types";

export type { CarouselItem, RichArticleEditorProps } from "./shared/types";
export type { DropdownItem } from "./EditorContext";

export function RichArticleEditor(props: RichArticleEditorProps) {
  return (
    <EditorContextProvider {...props}>
      <EditorInner />
    </EditorContextProvider>
  );
}
