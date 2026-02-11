import { PointerEventHandler } from "react";

import clsx from "clsx";
import { PlusCircle as PlusIcon } from "lucide-react";

import Button from "@/RichArticleEditor/components/ui/buttons/button";
import Tooltip from "@/RichArticleEditor/components/ui/buttons/Tooltip";
import { useElementOpen } from "@/RichArticleEditor/hooks/useElementOpen";
import { TABLET_BREAKPOINT, useIsMobile } from "@/RichArticleEditor/hooks/useIsMobile";
import { useOutsideAlerter } from "@/RichArticleEditor/hooks/useOutsideAlerter";
import { useTheme } from "@/RichArticleEditor/hooks/useTheme";

import { useEditorInstance, useEditorSelection, useEditorActions } from "../../EditorContext";
import { useIsParagraphFocused } from "../../hooks/useIsParagraphFocused";
import DropdownBox from "../DropdownBox";

export default function MobileBlocksMenu() {
  const { resolvedTheme } = useTheme();
  const { view } = useEditorInstance();
  const { isSelected } = useEditorSelection();
  const { floatingMenuItems } = useEditorActions();
  const {
    isOpen: isPlusOpen,
    close: closeMenu,
    toggleOpen: toggleMenuOpen,
  } = useElementOpen(false);
  const isMobile = useIsMobile(TABLET_BREAKPOINT);

  const anchorRef = useOutsideAlerter(closeMenu);

  const isParagraphFocused = useIsParagraphFocused(view);

  const showMobilePlus = isParagraphFocused || isPlusOpen;

  const onPlusPointerDown: PointerEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    toggleMenuOpen();
  };

  if (!showMobilePlus || isSelected || !isMobile) {
    return null;
  }

  return (
    <div ref={anchorRef} className="relative">
      <Tooltip text="Insert block">
        <Button
          styleType="blank"
          className={clsx("toolbar-btn", {
            "is-dark": resolvedTheme === "dark",
          })}
          onPointerDown={onPlusPointerDown}
          aria-label="Add block"
        >
          <PlusIcon />
        </Button>
      </Tooltip>
      {isPlusOpen && (
        <div className="hidden max-desktop:block max-desktop:absolute max-desktop:top-[calc(100%+6px)] max-desktop:-left-27.5 max-md:-left-8.75">
          <DropdownBox items={floatingMenuItems} onClose={closeMenu} />
        </div>
      )}
    </div>
  );
}
