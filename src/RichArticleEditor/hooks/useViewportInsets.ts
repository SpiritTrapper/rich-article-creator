import { useEffect } from "react";

export function useViewportInsets() {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const vv = window.visualViewport;
    let raf = 0;

    const setVar = (k: string, v: string) => {
      root.style.setProperty(k, v);
      body.style.setProperty(k, v);
    };

    const update = () => {
      const top = vv ? Math.max(0, Math.round(vv.offsetTop)) : 0;
      const kb = vv ? Math.max(0, Math.round(window.innerHeight - (vv.height + vv.offsetTop))) : 0;
      setVar("--vv-top", `${top}px`);
      setVar("--kb-inset", `${kb}px`);
    };

    const onChange = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    vv?.addEventListener("resize", onChange);
    vv?.addEventListener("scroll", onChange);
    window.addEventListener("orientationchange", onChange);

    return () => {
      vv?.removeEventListener("resize", onChange);
      vv?.removeEventListener("scroll", onChange);
      window.removeEventListener("orientationchange", onChange);
      cancelAnimationFrame(raf);
      root.style.removeProperty("--vv-top");
      root.style.removeProperty("--kb-inset");
      body.style.removeProperty("--vv-top");
      body.style.removeProperty("--kb-inset");
    };
  }, []);
}
