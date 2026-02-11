import { ReactNode, useEffect, useRef, MouseEvent } from "react";

import clsx from "clsx";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
  className?: string;
}

export default function Dialog({ open, onClose, children, className }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleOverlayClick = (e: MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-1000 flex items-center justify-center bg-black/40"
      onClick={handleOverlayClick}
    >
      <div
        className={clsx(
          "bg-(--Monochrome-White,#fff) rounded-2xl shadow-xl max-h-[90vh] overflow-auto",
          className,
        )}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}
