import { useLayoutEffect, useRef, useState, useEffect } from "react";

import { Plus as PlusIcon } from "lucide-react";

import Button from "@components/ui/buttons/button";

import { useEditorInstance } from "@contexts/EditorContext";

import { useElementOpen } from "@hooks/useElementOpen";
import { useFloatingMenuItems } from "@hooks/useFloatingMenuItems";
import { useOutsideAlerter } from "@hooks/useOutsideAlerter";

import { PM_STATE_UPDATE_EVENT } from "@pm/react";

import DropdownBox from "./DropdownBox";

export default function FloatingMenuPopup() {
  const { isOpen, open, close } = useElementOpen(false);
  const dropdownRef = useOutsideAlerter(close);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { view } = useEditorInstance();
  const floatingMenuItems = useFloatingMenuItems();
  const [isReverted, setIsReverted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const updatePosition = () => {
    if (!view) {
      setVisible(false);
      return;
    }

    const { state } = view;
    const { $from } = state.selection;

    // Show only on empty top-level paragraphs
    const isEmptyParagraph =
      $from.parent.type.name === "paragraph" &&
      $from.parent.content.size === 0 &&
      $from.depth === 1;

    if (!isEmptyParagraph) {
      setVisible(false);
      return;
    }

    try {
      const coords = view.coordsAtPos($from.pos);
      setPosition({ top: coords.top, left: coords.left });
      setVisible(true);
    } catch {
      setVisible(false);
    }
  };

  useEffect(() => {
    if (!view) {
      return;
    }

    const handler = () => updatePosition();
    view.dom.addEventListener(PM_STATE_UPDATE_EVENT, handler);
    // Also check on focus/blur
    view.dom.addEventListener("focus", handler);
    view.dom.addEventListener("blur", handler);

    return () => {
      view.dom.removeEventListener(PM_STATE_UPDATE_EVENT, handler);
      view.dom.removeEventListener("focus", handler);
      view.dom.removeEventListener("blur", handler);
    };
  }, [view]); // eslint-disable-line

  useLayoutEffect(() => {
    if (!isOpen || !wrapperRef.current || !dropdownRef.current) {
      return;
    }

    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    const dropdownRect = dropdownRef.current.getBoundingClientRect();
    const vvHeight = window.visualViewport?.height ?? 0;
    setIsReverted(wrapperRect.top + dropdownRect.height > vvHeight);
  }, [isOpen, dropdownRef]);

  if (!view || !visible || !position) {
    return null;
  }

  // Convert position relative to the editor's parent
  const editorRect = view.dom.parentElement?.getBoundingClientRect();
  const relativeLeft = editorRect ? position.left - editorRect.left : position.left;

  return (
    <div
      ref={wrapperRef}
      className="absolute z-10"
      style={{
        top: position.top - 2,
        left: Math.max(0, relativeLeft - 40),
      }}
    >
      <Button
        styleType="gray"
        onClick={open}
        className="flex w-7! h-7! bg-transparent! p-0! [&>svg]:m-auto max-desktop:hidden"
      >
        <PlusIcon />
      </Button>
      {isOpen && (
        <DropdownBox
          ref={dropdownRef}
          items={floatingMenuItems}
          onClose={close}
          isReverted={isReverted}
        />
      )}
    </div>
  );
}
