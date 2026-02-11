import { ChangeEvent, useRef } from "react";

import Button from "@components/ui/buttons/button";

import { useEditorInstance, useEditorActions } from "@contexts/EditorContext";

import * as cmd from "../pm/commands";

export default function BgButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { view } = useEditorInstance();
  const { hasMainImage, setHasMainImage, onUploadImage } = useEditorActions();

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];

    if (onUploadImage) {
      const src = await onUploadImage(file);
      cmd.execCommand(view, cmd.setMainImage({ src }));
      setHasMainImage(true);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          cmd.execCommand(view, cmd.setMainImage({ src: reader.result }));
          setHasMainImage(true);
        }
      };
      reader.readAsDataURL(file);
    }

    event.target.value = "";
  };

  return (
    <div className="px-14 max-desktop:px-5">
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        style={{ display: "none" }}
        onChange={onFileChange}
      />
      {!hasMainImage && (
        <Button
          styleType="blank"
          type="button"
          onClick={openFileDialog}
          className="w-full h-14 rounded-xl cursor-pointer bg-(--Monochrome-Fields)! text-(--Monochrome-Auxiliary) max-desktop:text-sm!"
        >
          Upload cover (16×9)
        </Button>
      )}
    </div>
  );
}
