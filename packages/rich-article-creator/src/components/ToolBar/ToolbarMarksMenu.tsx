import clsx from "clsx";
import { Type as MarksIcon, ChevronDown as ChevronIcon } from "lucide-react";

import Button from "@components/ui/buttons/button";
import Tooltip from "@components/ui/buttons/Tooltip";

import { useElementOpen } from "@hooks/useElementOpen";
import { useMarksMenuItems } from "@hooks/useMarksMenuItems";
import { useOutsideAlerter } from "@hooks/useOutsideAlerter";
import { useTheme } from "@hooks/useTheme";

import DropdownBox from "../DropdownBox";

export default function ToolbarMarksMenu() {
  const { resolvedTheme } = useTheme();
  const { isOpen, open, close } = useElementOpen(false);
  const ref = useOutsideAlerter(close);
  const marksMenuItems = useMarksMenuItems();

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
