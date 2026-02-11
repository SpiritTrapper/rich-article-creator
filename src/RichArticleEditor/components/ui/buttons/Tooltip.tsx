import { ReactNode, useState } from "react";

import clsx from "clsx";

interface TooltipProps {
  text: string;
  children: ReactNode;
  isClosed?: boolean;
}

export default function Tooltip({ text, children, isClosed }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const show = () => {
    if (!isClosed) {
      setIsVisible(true);
    }
  };

  const hide = () => setIsVisible(false);

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {isVisible && !isClosed && (
        <div
          className={clsx(
            "absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50",
            "whitespace-nowrap rounded-lg px-3 py-1.5",
            "bg-(--Monochrome-Main-color,#1a1a1a) text-white text-xs",
            "pointer-events-none",
          )}
        >
          {text}
        </div>
      )}
    </div>
  );
}
