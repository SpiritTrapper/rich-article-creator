import { PointerEventHandler } from "react";

import clsx from "clsx";
import { PlusCircle as PlusIcon } from "lucide-react";

import Button from "@components/ui/buttons/button";
import Tooltip from "@components/ui/buttons/Tooltip";

import { useEditorInstance, useEditorSelection } from "@contexts/EditorContext";

import { useElementOpen } from "@hooks/useElementOpen";
import { useFloatingMenuItems } from "@hooks/useFloatingMenuItems";
import { TABLET_BREAKPOINT, useIsMobile } from "@hooks/useIsMobile";
import { useIsParagraphFocused } from "@hooks/useIsParagraphFocused";
import { useOutsideAlerter } from "@hooks/useOutsideAlerter";
import { useTheme } from "@hooks/useTheme";


import DropdownBox from "../DropdownBox";

export default function MobileBlocksMenu() {
  const { resolvedTheme } = useTheme();
  const { view } = useEditorInstance();
  const { isSelected } = useEditorSelection();
  const floatingMenuItems = useFloatingMenuItems();
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
