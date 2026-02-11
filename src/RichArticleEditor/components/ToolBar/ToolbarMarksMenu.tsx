import clsx from "clsx";
import { Type as MarksIcon, ChevronDown as ChevronIcon } from "lucide-react";

import Button from "@/RichArticleEditor/components/ui/buttons/button";
import Tooltip from "@/RichArticleEditor/components/ui/buttons/Tooltip";
import { useElementOpen } from "@/RichArticleEditor/hooks/useElementOpen";
import { useOutsideAlerter } from "@/RichArticleEditor/hooks/useOutsideAlerter";
import { useTheme } from "@/RichArticleEditor/hooks/useTheme";

import { useEditorActions } from "../../EditorContext";
import DropdownBox from "../DropdownBox";

export default function ToolbarMarksMenu() {
  const { resolvedTheme } = useTheme();
  const { isOpen, open, close } = useElementOpen(false);
  const ref = useOutsideAlerter(close);
  const { marksMenuItems } = useEditorActions();

  return (
    <div className="relative">
      <Tooltip text="Editor elements" isClosed={isOpen}>
        <Button
          styleType="blank"
          className={clsx("dropdown-btn", {
            "is-dark": resolvedTheme === "dark",
          })}
          onClick={open}
        >
          <div>
            <MarksIcon />
            <ChevronIcon
              className={clsx("dropdown-chevron", {
                "is-open": isOpen,
              })}
            />
          </div>
        </Button>
      </Tooltip>
      {isOpen && <DropdownBox ref={ref} items={marksMenuItems} onClose={close} />}
    </div>
  );
}
