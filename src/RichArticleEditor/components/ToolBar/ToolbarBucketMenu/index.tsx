import { useEffect, useState } from "react";

import clsx from "clsx";
import {
  ChevronDown as ChevronIcon,
  Paintbrush as BucketIcon,
  Palette as TextColorTwoIcon,
  PaintBucket as BgColorOneIcon,
} from "lucide-react";

import Button from "@/RichArticleEditor/components/ui/buttons/button";
import Tooltip from "@/RichArticleEditor/components/ui/buttons/Tooltip";
import { useElementOpen } from "@/RichArticleEditor/hooks/useElementOpen";
import { useOutsideAlerter } from "@/RichArticleEditor/hooks/useOutsideAlerter";
import { useTheme } from "@/RichArticleEditor/hooks/useTheme";

import { useEditorInstance } from "../../../EditorContext";
import * as cmd from "../../../pm/commands";

import BucketBgItem from "./BucketBgItem";
import BucketColorItem from "./BucketColorItem";

const colors: readonly string[] = Object.freeze([
  "#8F8F8F",
  "#E18D3E",
  "#9F6B53",
  "#0085D2",
  "#FF89C7",
  "#F0C23B",
  "#FF524B",
  "#258954",
  "#A552E3",
]);

const backgrounds: readonly string[] = Object.freeze([
  "rgba(143, 143, 143, 0.20)",
  "rgba(225, 141, 62, 0.20)",
  "rgba(159, 107, 83, 0.20)",
  "rgba(0, 133, 210, 0.20)",
  "rgba(255, 137, 199, 0.20)",
  "rgba(240, 194, 59, 0.20)",
  "rgba(255, 82, 75, 0.20)",
  "rgba(37, 137, 84, 0.20)",
  "rgba(165, 82, 227, 0.20)",
]);

export default function ToolbarBucketMenu() {
  const { resolvedTheme } = useTheme();
  const { view } = useEditorInstance();
  const { isOpen, open, close } = useElementOpen(false);
  const [activeColor, setActiveColor] = useState<string>();
  const [activeBg, setActiveBg] = useState<string>();
  const themeTextColor = resolvedTheme === "dark" ? "#e4e4e4" : "#292D32";
  const themeBgColor = resolvedTheme === "dark" ? "#292D32" : "#e4e4e4";

  const ref = useOutsideAlerter(close);

  const onHandleColor = (currentColor: string) => {
    cmd.execCommand(view, cmd.setColor(currentColor));
    setActiveColor(currentColor);
  };

  const onHandleBg = (currentHighlight: string) => {
    cmd.execCommand(view, cmd.toggleHighlight(currentHighlight));
    setActiveBg(currentHighlight);
  };

  const onDefaultTextColor = () => {
    onHandleColor(themeTextColor);
  };

  const onDefaultBg = () => {
    cmd.execCommand(view, cmd.toggleHighlight("transparent"));
  };

  useEffect(() => {
    if (isOpen) {
      view?.dom.classList.add("isColorPicking");
    } else {
      view?.dom.classList.remove("isColorPicking");
    }
  }, [isOpen, view]);

  return (
    <div className="relative">
      <Tooltip text="Fill & color" isClosed={isOpen}>
        <Button
          styleType="blank"
          className={clsx("dropdown-btn", {
            "is-dark": resolvedTheme === "dark",
          })}
          onClick={open}
        >
          <div>
            <BucketIcon />
            <ChevronIcon
              className={clsx("dropdown-chevron", {
                "is-open": isOpen,
              })}
            />
          </div>
        </Button>
      </Tooltip>
      {isOpen && (
        <div
          ref={ref}
          className="flex flex-col gap-6.25 p-5 absolute -right-25 top-[calc(100%+12px)] z-9999 w-73.75 bg-(--Monochrome-White) rounded-xl dropdown-menu max-desktop:right-0"
        >
          <div className="flex flex-col gap-3 [&>h5]:m-0">
            <h5 className="text-sm font-semibold">Text color</h5>
            <div className="flex gap-1.5 flex-wrap -ml-0.75">
              <Button
                styleType="blank"
                className={clsx("bucket-btn _c0", {
                  "is-active": activeColor === themeTextColor,
                })}
                onClick={onDefaultTextColor}
              >
                <TextColorTwoIcon />
              </Button>
              {colors.map((color, idx) => (
                <BucketColorItem
                  key={color}
                  idx={idx + 1}
                  color={color}
                  onHandleColor={onHandleColor}
                  isActive={color === activeColor}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 [&>h5]:m-0">
            <h5 className="text-sm font-semibold">Background color</h5>
            <div className="flex gap-1.5 flex-wrap -ml-0.75">
              <Button
                styleType="blank"
                className={clsx("bucket-btn _b0", {
                  "is-active": activeBg === themeBgColor,
                })}
                onClick={onDefaultBg}
              >
                <BgColorOneIcon />
              </Button>
              {backgrounds.map((color, idx) => (
                <BucketBgItem
                  key={color}
                  idx={idx + 1}
                  color={color}
                  onHandleBg={onHandleBg}
                  isActive={color === activeBg}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
