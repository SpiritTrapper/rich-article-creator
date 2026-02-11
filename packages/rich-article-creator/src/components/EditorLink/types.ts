import { EditorView } from "prosemirror-view";
import { UseFormReturn } from "react-hook-form";

export interface Anchor {
  top: number;
  left: number;
}

export interface Range {
  from: number;
  to: number;
}

export interface SelUpdateArg {
  view: EditorView;
}

export interface LinkFormTypes {
  url: string;
  name: string;
}

export type FormReturn = UseFormReturn<Record<string, unknown>>;
