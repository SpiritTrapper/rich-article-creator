import { ChangeEvent, FC, useRef } from "react";

import NodeContextMenu from "../components/NodeContextMenu";
import { getEditorCallbacks } from "../pm/callbackPlugin";
import { execCommand, removeMainImage } from "../pm/commands";
import { createReactNodeView } from "../pm/react/ReactNodeView";

import type { ReactNodeViewProps } from "../pm/react/ReactNodeView";

const ImageNodeView: FC<ReactNodeViewProps> = ({ node, updateAttributes, view }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const callbacks = getEditorCallbacks(view);

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const onDeleteNode = () => {
    execCommand(view, removeMainImage());
    callbacks.setHasMainImage?.(false);
  };

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;

    if (!fileList || fileList.length === 0) {
      return;
    }

    const file = fileList[0];

    if (callbacks.onUploadImage) {
      const src = await callbacks.onUploadImage(file);
      updateAttributes({ src });
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          updateAttributes({ src: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }

    event.target.value = "";
  };

  return (
    <div
      className="w-full pt-[56.25%] relative overflow-hidden rounded-xl select-none"
      data-main-image
    >
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        style={{ display: "none" }}
        onChange={onFileChange}
      />

      {node.attrs.src ? (
        <img
          src={node.attrs.src as string}
          alt={(node.attrs.alt as string) || ""}
          style={{
            objectFit: "cover",
            borderRadius: "12px",
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      ) : (
        <button type="button" onClick={openFileDialog} />
      )}

      {!!node.attrs.src && (
        <NodeContextMenu
          className="absolute top-3 right-3 z-100"
          items={[
            { title: "Change", action: openFileDialog },
            { title: "Delete", action: onDeleteNode },
          ]}
        />
      )}
    </div>
  );
};

export const mainImageNodeView = createReactNodeView(ImageNodeView);
