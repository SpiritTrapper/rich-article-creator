import { FormProvider } from "react-hook-form";

import EditorInput from "../EditorInput";
import Button from "../ui/buttons/button";

import { useEditorLink } from "./useEditorLink";

export default function EditorLinkBubble() {
  const { isBubbleVisible, anchor, onDeleteLink, onSubmit, methods, bubbleRef } = useEditorLink();
  const isNotActive = !isBubbleVisible || !anchor;

  const {
    handleSubmit,
    formState: { errors },
  } = methods;

  if (isNotActive) {
    return null;
  }

  return (
    <div
      ref={bubbleRef}
      style={{
        position: "absolute",
        top: (anchor?.top ?? 0) + 8,
        left: anchor?.left ?? 0,
        transform: "translateX(-25vw)",
        zIndex: 100,
        display: isBubbleVisible ? "block" : "none",
      }}
    >
      <FormProvider {...methods}>
        <div className="flex flex-col gap-3 rounded-xl bg-(--Monochrome-White) w-108 p-4 shadow-[0_-8px_20px_0_rgba(0,0,0,0.05),69px_171px_52px_0_rgba(0,0,0,0),44px_109px_47px_0_rgba(0,0,0,0.01),25px_62px_40px_0_rgba(0,0,0,0.03),3px_7px_16px_0_rgba(0,0,0,0.05)]">
          <EditorInput
            name="url"
            label="URL"
            className="w-full rounded-2xl py-5 px-6 bg-(--Monochrome-Fields)"
            placeholder="Paste a link"
            errorMessage={errors.url?.message}
          />
          <EditorInput
            name="name"
            label="Name"
            className="w-full rounded-2xl py-5 px-6 bg-(--Monochrome-Fields)"
            placeholder="Enter a name"
            errorMessage={errors.name?.message}
          />
          <div className="flex justify-between items-center mt-3 [&>button]:text-(--Colors-Blue) [&>button:first-child]:text-(--Colors-Red)">
            <Button styleType="blank" className="t5" onClick={onDeleteLink}>
              Delete link
            </Button>
            <Button styleType="blank" className="t5" onClick={handleSubmit(onSubmit)}>
              Add link
            </Button>
          </div>
        </div>
      </FormProvider>
    </div>
  );
}
