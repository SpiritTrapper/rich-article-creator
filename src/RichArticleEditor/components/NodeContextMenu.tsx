import { CSSProperties, SyntheticEvent } from "react";

import { MoreHorizontal as DotIcon } from "lucide-react";

import Button from "@/RichArticleEditor/components/ui/buttons/button";
import { useElementOpen } from "@/RichArticleEditor/hooks/useElementOpen";
import { useOutsideAlerter } from "@/RichArticleEditor/hooks/useOutsideAlerter";

export interface NodeContextMenuItem {
  title: string;
  action: () => void;
}

interface Props {
  items: NodeContextMenuItem[];
  className?: string;
  style?: CSSProperties;
}

export default function NodeContextMenu({ items, className, style }: Props) {
  const { isOpen, toggleOpen, close } = useElementOpen(false);
  const ref = useOutsideAlerter(close);

  const stopAll = (e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div ref={ref} className={className} style={style}>
      <Button
        styleType="blank"
        className="p-0! w-10! h-10! rounded-xl! bg-(--Monochrome-White)! transition-[background] duration-200 select-none hover:bg-(--Monochrome-Active-menu)!"
        type="button"
        onMouseDown={stopAll}
        onPointerDown={stopAll}
        onTouchStart={stopAll}
        onClick={(e) => {
          stopAll(e);
          toggleOpen();
        }}
      >
        <DotIcon />
      </Button>

      {isOpen && (
        <div
          className="absolute top-[calc(100%+4px)] right-0 min-w-53 rounded-2xl bg-(--Monochrome-White) shadow-[-4px_10px_30px_0_rgba(0,0,0,0.2)]"
          onMouseDown={stopAll}
          onPointerDown={stopAll}
          onTouchStart={stopAll}
        >
          <div className="w-full h-full flex flex-col rounded-2xl overflow-hidden">
            {items.map(({ title, action }) => (
              <Button
                key={title}
                styleType="blank"
                className="w-full h-14 text-sm justify-start! px-4.5! rounded-none! whitespace-nowrap transition-[background] duration-200 hover:bg-(--Monochrome-Active-menu)!"
                type="button"
                onMouseDown={stopAll}
                onPointerDown={stopAll}
                onTouchStart={stopAll}
                onClick={(e) => {
                  stopAll(e);
                  close();
                  action();
                }}
              >
                {title}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
