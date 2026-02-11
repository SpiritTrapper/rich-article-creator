import { useEffect } from "react";

import { FormProvider } from "react-hook-form";

import { useEditorSelection } from "@contexts/EditorContext";

import { useElementOpen } from "@hooks/useElementOpen";
import { MOBILE_BREAKPOINT, useIsMobile } from "@hooks/useIsMobile";

import EditorInput from "../EditorInput";
import EditorModal from "../EditorModal";

import { useEditorLink } from "./useEditorLink";

export default function EditorLinkModal() {
  const isMobile = useIsMobile(MOBILE_BREAKPOINT);
  const { isLinkActive, onToggleLinkActive } = useEditorSelection();
  const { isOpen: isModalOpen, open: openModal, close: closeModal } = useElementOpen(false);
  const { onDeleteLink, onSubmit, methods } = useEditorLink();

  const {
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmitLink = async () => {
    await handleSubmit(onSubmit)();
    closeModal();
  };

  const onCloseModal = () => {
    onToggleLinkActive(true);
    closeModal();
  };

  useEffect(() => {
    if (isLinkActive) {
      openModal();
    } else {
      closeModal();
    }
  }, [isLinkActive, openModal, closeModal]);

  return (
    <EditorModal
      isOpen={isModalOpen}
      onCancel={onDeleteLink}
      onClose={onCloseModal}
      onSubmit={onSubmitLink}
      noRender={!isMobile}
      cancelText="Delete"
    >
      <FormProvider {...methods}>
        <div className="w-full flex flex-col py-10 gap-6">
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
        </div>
      </FormProvider>
    </EditorModal>
  );
}
