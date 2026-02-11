import { RefObject, useEffect, useState } from "react";

import { TABLET_BREAKPOINT, useIsMobile } from "@hooks/useIsMobile";

const extraPx = 83;
const hysteresis = 6;

export function useToolbarExpanded(mainRef: RefObject<HTMLElement | null>) {
  const [isExpanded, setIsExpanded] = useState(true);
  const isMobile = useIsMobile(TABLET_BREAKPOINT);

  useEffect(() => {
    if (!isMobile) {
      setIsExpanded(true);
      return;
    }

    const mainEl = mainRef.current;

    if (!mainEl) {
      return;
    }

    const vv = window.visualViewport;

    let expanded = true;

    const compute = () => {
      const rect = mainEl.getBoundingClientRect();
      const vvTop = vv?.offsetTop ?? 0;
      const distance = rect.top + extraPx / 3 - vvTop;

      if (expanded) {
        if (distance < hysteresis) {
          expanded = false;
          setIsExpanded(false);
        }
      } else {
        if (distance > hysteresis) {
          expanded = true;
          setIsExpanded(true);
        }
      }
    };

    compute();

    const onScroll = () => compute();
    const onResize = () => compute();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    vv?.addEventListener("scroll", onScroll);
    vv?.addEventListener("resize", onResize);
    const raf = requestAnimationFrame(compute);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      vv?.removeEventListener("scroll", onScroll);
      vv?.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, [mainRef, isMobile]);

  return { isExpanded };
}
