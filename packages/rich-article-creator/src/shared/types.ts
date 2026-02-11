export interface CustomOptions {
  HTMLAttributes: Record<string, string | number | boolean>;
}

export interface CarouselItem {
  id: string;
  src: string;
  caption: string;
  orientation: "horizontal" | "vertical" | "square";
}

export interface RichArticleEditorProps {
  defaultTitle?: string;
  defaultContent?: Record<string, unknown>;
  onSave?: (data: { title: string; content: Record<string, unknown> }) => void | Promise<void>;
  onBack?: () => void;
  onPublish?: (data: { title: string; content: Record<string, unknown> }) => void;
  onUploadImage?: (file: File) => Promise<string>;
  onUploadVideo?: (file: File) => Promise<string>;
  onUploadAudio?: (file: File) => Promise<string>;
}
