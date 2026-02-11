import clsx from "clsx";
import { Link as LinkIcon } from "lucide-react";

import Button from "@components/ui/buttons/button";
import Tooltip from "@components/ui/buttons/Tooltip";

import { useEditorInstance, useEditorSelection } from "@contexts/EditorContext";

import { useTheme } from "@hooks/useTheme";

import { useEditorState } from "@pm/react";


export default function ToolbarLinkBtn() {
  const { resolvedTheme } = useTheme();
  const { view } = useEditorInstance();
  const { onToggleLinkActive, isLinkActive } = useEditorSelection();

  const isInsideLinkSelector = () => {
    if (!view) {
      return false;
    }
    const { $from } = view.state.selection;
    return $from.marks().some((m) => m.type === view.state.schema.marks.link);
  };

  const isInsideLink = useEditorState(view, isInsideLinkSelector);

  return (
    <Tooltip text="Link">
      <Button
        styleType="blank"
        className={clsx("toolbar-btn", {
          "is-dark": resolvedTheme === "dark",
          "is-active-link": isLinkActive || isInsideLink,
        })}
        onClick={() => onToggleLinkActive()}
      >
        <LinkIcon />
      </Button>
    </Tooltip>
  );
}
