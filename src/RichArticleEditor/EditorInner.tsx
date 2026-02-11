import { useRef } from "react";

import clsx from "clsx";

import { TABLET_BREAKPOINT, useIsMobile } from "@/RichArticleEditor/hooks/useIsMobile";

import BgButton from "./components/BgButton";
import EditorInput from "./components/EditorInput";
import EditorLink from "./components/EditorLink";
import FloatingMenuPopup from "./components/FloatingMenuPopup";
import NetworkIndicator from "./components/NetworkIndicator";
import ToolBar from "./components/ToolBar";
import ToolbarPortal from "./components/ToolBar/ToolbarPortal";
import { useEditorInstance } from "./EditorContext";
import { useToolbarExpanded } from "./hooks/useToolbarExpanded";
import { useViewportInsets } from "./hooks/useViewportInsets";

export default function Editor() {
  const { view, mountRef } = useEditorInstance();
  const isMobile = useIsMobile(TABLET_BREAKPOINT);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { isExpanded } = useToolbarExpanded(wrapperRef);
  useViewportInsets();

  return (
    <div
      ref={wrapperRef}
      className="relative flex items-start justify-center max-desktop:flex-col-reverse max-desktop:items-center max-desktop:px-5 max-desktop:pt-17.5 max-desktop:pb-5 max-desktop:gap-5 max-md:px-0 max-md:pt-17.5 max-md:pb-0"
    >
      <div className="relative flex flex-col w-full h-[calc(100vh-25px)] max-w-183.5 rounded-2xl bg-(--Monochrome-White) max-desktop:max-w-full max-desktop:h-[calc(100dvh-155px)] max-md:h-[calc(100dvh-135px)]">
        {view && !isMobile && <ToolBar />}
        <div className="overflow-y-auto pb-75 max-desktop:h-auto max-desktop:min-h-0 max-desktop:pt-0 max-desktop:pb-70 max-md:pb-35">
          <EditorInput
            name="title"
            className="max-w-[calc(100%-56px)] min-h-20 text-[28px] font-bold outline-none border-none py-5 px-14 w-full bg-transparent placeholder:text-(--Monochrome-Auxiliary) max-desktop:px-5 max-desktop:pt-5 max-desktop:pb-0"
            placeholder="Enter a title"
            autoFocus
          />
          <BgButton />
          <div ref={mountRef} className="pm-editor" />
          {view && (
            <>
              <FloatingMenuPopup />
              <EditorLink />
            </>
          )}
        </div>
        {view && (
          <div className="absolute top-2 left-full ml-3 flex justify-between items-center max-[1250px]:-right-13 max-desktop:w-full max-desktop:static max-md:px-5">
            <NetworkIndicator />
          </div>
        )}
      </div>
      {view && isMobile ? (
        <ToolbarPortal>
          <div
            className={clsx(
              "fixed left-0 w-full z-100 bg-transparent m-0",
              isExpanded
                ? "top-[calc(env(safe-area-inset-top,0px)+var(--vv-top,0px))]"
                : "top-[calc(env(safe-area-inset-top,0px)+var(--vv-top,0px))]",
            )}
          >
            <ToolBar />
          </div>
        </ToolbarPortal>
      ) : null}
    </div>
  );
}
