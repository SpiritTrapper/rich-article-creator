import { PointerEvent } from "react";

import {
  AlignLeft as TextAlignLeft,
  AlignCenter as TextAlignCenter,
  AlignRight as TextAlignRight,
  X as CloseIcon,
  Maximize2 as MaximizeIcon,
} from "lucide-react";

import Button from "@components/ui/buttons/button";

interface Props {
  setTextAlign: (textAlign: "left" | "center" | "right") => void;
  onClose: (e: MouseEvent) => void;
  isSelected: boolean;
  handleResizeStart?: (e: PointerEvent) => void;
}

export default function MediaControls({
  setTextAlign,
  onClose,
  isSelected,
  handleResizeStart,
}: Props) {
  if (!isSelected) {
    return null;
  }

  return (
    <>
      <div className="absolute left-[calc(50%-60px)] bottom-[calc(100%+4px)] bg-(--Monochrome-White)! flex rounded-xl overflow-hidden z-9999 shadow-[-4px_10px_30px_0_rgba(0,0,0,0.2)]">
        <Button
          styleType="blank"
          className="w-10! h-10! p-0! bg-(--Monochrome-White)! rounded-xl! transition-[background] duration-200 hover:bg-(--Monochrome-Active-menu)!"
          onClick={() => setTextAlign("left")}
        >
          <TextAlignLeft />
        </Button>
        <Button
          styleType="blank"
          className="w-10! h-10! p-0! bg-(--Monochrome-White)! rounded-xl! transition-[background] duration-200 hover:bg-(--Monochrome-Active-menu)!"
          onClick={() => setTextAlign("center")}
        >
          <TextAlignCenter />
        </Button>
        <Button
          styleType="blank"
          className="w-10! h-10! p-0! bg-(--Monochrome-White)! rounded-xl! transition-[background] duration-200 hover:bg-(--Monochrome-Active-menu)!"
          onClick={() => setTextAlign("right")}
        >
          <TextAlignRight />
        </Button>
      </div>
      <Button
        styleType="blank"
        className="absolute w-7 h-7 rounded-lg top-2 right-2 z-3 p-0! bg-(--Monochrome-Auxiliary)!"
        onClick={onClose as () => void}
      >
        <CloseIcon />
      </Button>
      {!!handleResizeStart && (
        <Button
          styleType="blank"
          className="absolute -bottom-2.5 -right-2.5 w-7 h-7 z-3 p-0! bg-(--Monochrome-Auxiliary)! rounded-full cursor-nwse-resize touch-none select-none"
          onPointerDown={handleResizeStart}
        >
          <MaximizeIcon />
        </Button>
      )}
    </>
  );
}
