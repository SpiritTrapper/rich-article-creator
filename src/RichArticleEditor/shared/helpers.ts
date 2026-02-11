import { Node as PMNode } from "prosemirror-model";
import { EditorView } from "prosemirror-view";

interface DocNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: DocNode[];
  text?: string;
}

interface DocJson {
  type: "doc";
  content: DocNode[];
}

export function selectImageFile(
  callback: (file: File, dimensions: { width: number; height: number }) => void,
) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.style.display = "none";

  input.onchange = () => {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const image = new Image();

      const url = URL.createObjectURL(file);

      image.onload = () => {
        const height = image.naturalHeight;
        const width =
          image.naturalWidth < image.naturalHeight
            ? 415
            : image.naturalWidth === image.naturalHeight
              ? 480
              : image.naturalWidth;
        URL.revokeObjectURL(url);
        callback(file, { width, height });
      };

      image.onerror = () => {
        URL.revokeObjectURL(url);
        console.error("Ошибка при загрузке изображения.");
      };

      image.src = url;
    }
  };

  document.body.appendChild(input);
  input.click();
  setTimeout(() => document.body.removeChild(input), 1000);
}

export function selectVideoFile(
  callback: (file: File, metadata: { width: number; height: number; duration: number }) => void,
) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "video/*";
  input.style.display = "none";

  input.onchange = () => {
    if (!input.files || !input.files[0]) {
      return;
    }

    const file = input.files[0];
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");

    video.preload = "metadata";
    video.src = url;

    video.onloadedmetadata = () => {
      const width =
        video.videoWidth < video.videoHeight
          ? 415
          : video.videoWidth === video.videoHeight
            ? 480
            : video.videoWidth;
      const height = video.videoHeight;
      const duration = video.duration;
      URL.revokeObjectURL(url);
      callback(file, { width, height, duration });
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      console.error("Ошибка при загрузке видео.");
    };
  };

  document.body.appendChild(input);
  input.click();
  setTimeout(() => document.body.removeChild(input), 1000);
}

export function selectAudioFile(callback: (file: File) => void) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "audio/*";
  input.style.display = "none";

  input.onchange = () => {
    if (input.files && input.files[0]) {
      callback(input.files[0]);
    }
  };

  document.body.appendChild(input);
  input.click();
  setTimeout(() => document.body.removeChild(input), 1000);
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export function pinMainBg(view: EditorView) {
  const doc = view.state.doc;
  const json = doc.toJSON() as DocJson;

  const customImageIndex = json.content.findIndex((node: DocNode) => node.type === "mainImage");

  if (customImageIndex !== 0 && customImageIndex !== -1) {
    const newContent: DocNode[] = [
      json.content[customImageIndex],
      ...json.content.slice(0, customImageIndex),
      ...json.content.slice(customImageIndex + 1),
    ];

    const newDoc = PMNode.fromJSON(view.state.schema, { type: "doc", content: newContent });
    const tr = view.state.tr.replaceWith(0, view.state.doc.content.size, newDoc.content);
    view.dispatch(tr);
  }
}