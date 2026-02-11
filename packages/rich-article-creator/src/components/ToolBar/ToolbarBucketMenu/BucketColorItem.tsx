import clsx from "clsx";
import { Palette as TextColorTwoIcon } from "lucide-react";

import Button from "@components/ui/buttons/button";

interface Props {
  idx: number;
  color: string;
  onHandleColor: (currentColor: string) => void;
  isActive: boolean;
}

export default function BucketColorItem({ idx, color, onHandleColor, isActive }: Props) {
  return (
    <Button
      styleType="blank"
      className={clsx("bucket-btn", `_c${idx}`, {
        "is-active": isActive,
      })}
      onClick={() => onHandleColor(color)}
    >
      <TextColorTwoIcon />
    </Button>
  );
}
