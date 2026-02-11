import clsx from "clsx";
import {
  EyeOff as SpoilerTextIcon,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlinedIcon,
  Strikethrough as StrokedIcon,
  Undo2 as UndoIcon,
  Redo2 as RedoIcon,
  IndentIncrease as IndentIcon,
  IndentDecrease as CancelIndentIcon,
} from "lucide-react";

import Button from "@/RichArticleEditor/components/ui/buttons/button";
import Tooltip from "@/RichArticleEditor/components/ui/buttons/Tooltip";
import { useTheme } from "@/RichArticleEditor/hooks/useTheme";
import { useEditorState } from "@/RichArticleEditor/pm/react";

import { useEditorInstance, useEditorSelection } from "../../EditorContext";
import { canExec, undo, redo } from "../../pm/commands";
import * as cmd from "../../pm/commands";

import MobileBlocksMenu from "./MobileBlocksMenu";
import ToolbarBucketMenu from "./ToolbarBucketMenu";
import ToolbarLinkBtn from "./ToolbarLinkBtn";
import ToolbarMarksMenu from "./ToolbarMarksMenu";

export default function ToolBar() {
  const { resolvedTheme } = useTheme();
  const { view } = useEditorInstance();
  const { isSelected, isContentLength } = useEditorSelection();

  const canUndoSelector = () => canExec(view, undo);
  const canRedoSelector = () => canExec(view, redo);

  const canUndoVal = useEditorState(view, canUndoSelector);
  const canRedoVal = useEditorState(view, canRedoSelector);

  const isDark = resolvedTheme === "dark";
  const btnCls = clsx("toolbar-btn", isDark && "is-dark");

  if (!view) {
    return null;
  }

  return (
    <div className="w-full flex border-b border-(--monochrome-outline-lines) h-13 min-h-13 bg-(--Monochrome-White) rounded-t-2xl max-desktop:rounded-none">
      <div className="m-auto flex justify-center items-center w-[min(734px,100%)]">
        {!isSelected && <MobileBlocksMenu />}
        {isContentLength && !isSelected && (
          <div className="hidden max-desktop:flex max-desktop:flex-row max-desktop:items-center max-desktop:flex-nowrap">
            <Tooltip text="Undo">
              <Button
                styleType="blank"
                className={btnCls}
                onPointerDown={(e) => e.preventDefault()}
                onMouseDown={(e) => e.preventDefault()}
                onTouchStart={(e) => e.preventDefault()}
                onClick={() => {
                  cmd.execCommand(view, undo);
                }}
                disabled={!canUndoVal}
                aria-label="Undo"
              >
                <UndoIcon />
              </Button>
            </Tooltip>

            <Tooltip text="Redo">
              <Button
                styleType="blank"
                className={btnCls}
                onPointerDown={(e) => e.preventDefault()}
                onMouseDown={(e) => e.preventDefault()}
                onTouchStart={(e) => e.preventDefault()}
                onClick={() => {
                  cmd.execCommand(view, redo);
                }}
                disabled={!canRedoVal}
                aria-label="Redo"
              >
                <RedoIcon />
              </Button>
            </Tooltip>
            <Tooltip text="Increase indent">
              <Button
                styleType="blank"
                className={btnCls}
                onPointerDown={(e) => e.preventDefault()}
                onMouseDown={(e) => e.preventDefault()}
                onTouchStart={(e) => e.preventDefault()}
                onClick={() => {
                  cmd.execCommand(view, cmd.setIndent("2em"));
                }}
                aria-label="Indent paragraph"
              >
                <IndentIcon />
              </Button>
            </Tooltip>
            <Tooltip text="Decrease indent">
              <Button
                styleType="blank"
                className={btnCls}
                onPointerDown={(e) => e.preventDefault()}
                onMouseDown={(e) => e.preventDefault()}
                onTouchStart={(e) => e.preventDefault()}
                onClick={() => {
                  cmd.execCommand(view, cmd.unsetIndent());
                }}
                aria-label="Remove paragraph indent"
              >
                <CancelIndentIcon />
              </Button>
            </Tooltip>
          </div>
        )}
        {isContentLength && isSelected && <ToolbarMarksMenu />}
        {isSelected && (
          <>
            <Tooltip text="Bold">
              <Button
                styleType="blank"
                className={btnCls}
                onClick={() => {
                  cmd.execCommand(view, cmd.toggleBold);
                }}
                aria-label="Bold"
              >
                <BoldIcon />
              </Button>
            </Tooltip>

            <Tooltip text="Italic">
              <Button
                styleType="blank"
                className={btnCls}
                onClick={() => {
                  cmd.execCommand(view, cmd.toggleItalic);
                }}
                aria-label="Italic"
              >
                <ItalicIcon />
              </Button>
            </Tooltip>

            <Tooltip text="Underline">
              <Button
                styleType="blank"
                className={btnCls}
                onClick={() => {
                  cmd.execCommand(view, cmd.toggleUnderline);
                }}
                aria-label="Underline"
              >
                <UnderlinedIcon />
              </Button>
            </Tooltip>

            <Tooltip text="Strikethrough">
              <Button
                styleType="blank"
                className={btnCls}
                onClick={() => {
                  cmd.execCommand(view, cmd.toggleStrike);
                }}
                aria-label="Strikethrough"
              >
                <StrokedIcon />
              </Button>
            </Tooltip>

            <ToolbarLinkBtn />
            <ToolbarBucketMenu />
          </>
        )}
        <Tooltip text="Spoiler">
          <Button
            styleType="blank"
            className={btnCls}
            onPointerDown={(e) => e.preventDefault()}
            onMouseDown={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
            onClick={() => {
              cmd.execCommand(view, cmd.setDetails());
            }}
            aria-label="Spoiler"
          >
            <SpoilerTextIcon />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
