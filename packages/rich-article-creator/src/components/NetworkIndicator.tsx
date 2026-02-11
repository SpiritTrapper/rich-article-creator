import clsx from "clsx";
import { Cloud as CloudIcon } from "lucide-react";

import Button from "@components/ui/buttons/button";

import { useCheckConnection } from "@hooks/useCheckConnection";

export default function NetworkIndicator() {
  const isConnection = useCheckConnection();

  return (
    <Button
      styleType="gray"
      className={clsx("indicator-btn", {
        "is-disconnect": !isConnection,
      })}
    >
      <CloudIcon stroke="transparent" />
      <div
        className={clsx("indicator-bubble", {
          "is-disconnect": !isConnection,
        })}
      >
        {isConnection ? "Changes are saved automatically every 5 seconds" : "Offline"}
      </div>
    </Button>
  );
}
