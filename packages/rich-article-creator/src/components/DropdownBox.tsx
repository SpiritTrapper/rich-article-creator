import { ForwardedRef, forwardRef } from "react";

import clsx from "clsx";

import Button from "@components/ui/buttons/button";

import type { DropdownItem } from "@contexts/EditorContext";

import { useTheme } from "@hooks/useTheme";


interface Props {
  items: DropdownItem[];
  onClose: () => void;
  isReverted?: boolean;
}

function DropdownBox({ items, onClose, isReverted }: Props, ref: ForwardedRef<HTMLDivElement>) {
  const { resolvedTheme } = useTheme();

  const onHitOption = (action: () => void) => {
    action();
    onClose();
  };

  if (!items.length) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={clsx(
        "dropdown-menu absolute left-0 top-[calc(100%+12px)] z-200 w-65 bg-(--Monochrome-White) rounded-xl",
        isReverted && "top-auto! bottom-[calc(100%+12px)]!",
      )}
    >
      {items.map(({ title, Icon, action, disabled }) => (
        <Button
          key={title}
          styleType="blank"
          className={clsx(
            "t5 dropdown-item justify-start! gap-3 p-3 h-10! rounded-none! w-full transition-[background] duration-200 hover:bg-(--Monochrome-Fields)! [&>svg]:w-5 [&>svg]:min-w-5 disabled:bg-(--Monochrome-White)! disabled:[&>svg]:opacity-50 max-desktop:text-sm",
            resolvedTheme === "dark" && "is-dark",
          )}
          onClick={() => onHitOption(action)}
          disabled={disabled}
        >
          <Icon />
          <span>{title}</span>
        </Button>
      ))}
    </div>
  );
}

export default forwardRef(DropdownBox);
