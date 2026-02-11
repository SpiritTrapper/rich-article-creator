import { ReactElement, ReactNode } from "react";

import { AlertTriangle as AlertIcon } from "lucide-react";

import Button from "@components/ui/buttons/button";
import Dialog from "@components/ui/dialog/dialog";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  onSubmit?: () => void;
  onCancel?: () => void;
  title?: string;
  alert?: string | ReactElement;
  submitIsDisabled?: boolean;
  submitText?: string;
  cancelText?: string;
  noRender?: boolean;
}

export default function EditorModal({
  title,
  isOpen,
  onClose,
  children,
  onSubmit,
  onCancel,
  alert,
  submitIsDisabled,
  cancelText = "Cancel",
  submitText = "Save",
  noRender,
}: Props) {
  const onCloseModal = () => {
    if (onCancel) {
      onCancel();
    }

    onClose();
  };

  if (noRender) {
    return null;
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="w-full max-w-258.5 p-0!">
      {!!title && (
        <h3 className="flex items-center justify-between border-b border-(--monochrome-outline-lines) px-10 py-8 max-md:px-6 max-md:py-6 max-md:border-b-0">
          {title}
        </h3>
      )}
      <div className="px-10 pt-6 max-md:px-6 max-md:pb-6 max-md:pt-0">
        {!!alert && (
          <div className="flex items-start gap-3 bg-[rgba(255,211,88,0.1)] px-5 py-3 rounded-xl [&>svg]:min-w-6">
            <AlertIcon />
            <span className="text-[#c7a23d] text-sm font-semibold pt-0.5">{alert}</span>
          </div>
        )}
        {children}
      </div>
      {!!onSubmit && (
        <div className="flex items-center justify-end gap-2 px-10 py-6 w-full *:px-6! *:h-11! *:rounded-2xl!">
          <Button
            styleType="gray-border"
            onClick={onCloseModal}
            className={onCancel ? "text-(--Colors-Red)!" : undefined}
          >
            {cancelText}
          </Button>
          <Button styleType="dark" onClick={onSubmit} disabled={submitIsDisabled}>
            {submitText}
          </Button>
        </div>
      )}
    </Dialog>
  );
}
