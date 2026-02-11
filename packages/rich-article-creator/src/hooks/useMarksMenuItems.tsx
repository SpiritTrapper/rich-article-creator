import { ReactElement } from "react";

import {
  Type as MarksIcon,
  Heading2 as H2Icon,
  Heading3 as H3Icon,
  List as ListIcon,
  ListOrdered as NumberedListIcon,
  Quote as CitationIcon,
  Code as CodeIcon,
} from "lucide-react";

import { useEditorInstance } from "@contexts/EditorContext";

import * as cmd from "../pm/commands";

export interface DropdownItem {
  title: string;
  Icon: () => ReactElement;
  action: () => void;
  disabled?: boolean;
}

export function useMarksMenuItems(): DropdownItem[] {
  const { view } = useEditorInstance();

  return [
    {
      title: "Normal text",
      Icon: () => <MarksIcon size={20} />,
      action: () => cmd.execCommand(view, cmd.clearNodesAndMarks()),
    },
    {
      title: "Heading 2",
      Icon: () => <H2Icon size={20} />,
      action: () => cmd.execCommand(view, cmd.toggleHeading(2)),
    },
    {
      title: "Heading 3",
      Icon: () => <H3Icon size={20} />,
      action: () => cmd.execCommand(view, cmd.toggleHeading(3)),
    },
    {
      title: "Bullet list",
      Icon: () => <ListIcon size={20} />,
      action: () => cmd.execCommand(view, cmd.toggleBulletList()),
    },
    {
      title: "Numbered list",
      Icon: () => <NumberedListIcon size={20} />,
      action: () => cmd.execCommand(view, cmd.toggleOrderedList()),
    },
    {
      title: "Quote",
      Icon: () => <CitationIcon size={20} />,
      action: () => cmd.execCommand(view, cmd.toggleBlockquote()),
    },
    {
      title: "Code",
      Icon: () => <CodeIcon size={20} />,
      action: () => cmd.execCommand(view, cmd.toggleCodeBlock()),
    },
  ];
}
