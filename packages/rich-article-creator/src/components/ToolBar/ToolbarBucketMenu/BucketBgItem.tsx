import clsx from "clsx";
import { PaintBucket as BgColorTwoIcon } from "lucide-react";

import Button from "@components/ui/buttons/button";

interface Props {
  idx: number;
  color: string;
  onHandleBg: (currentColor: string) => void;
  isActive: boolean;
}

export default function BucketBgItem({ idx, color, onHandleBg, isActive }: Props) {
  return (
    <Button
      styleType="blank"
      className={clsx("bucket-btn", `_b${idx}`, {
        "is-active": isActive,
      })}
      onClick={() => onHandleBg(color)}
    >
      <BgColorTwoIcon />
    </Button>
  );
}
