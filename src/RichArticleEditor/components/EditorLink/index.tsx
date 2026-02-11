import { TABLET_BREAKPOINT, useIsMobile } from "@/RichArticleEditor/hooks/useIsMobile";

import EditorLinkBubble from "./EditorLinkBubble";
import EditorLinkModal from "./EditorLinkModal";

export default function EditorLink() {
  const isMobile = useIsMobile(TABLET_BREAKPOINT);

  if (isMobile) {
    return <EditorLinkModal />;
  }

  return <EditorLinkBubble />;
}
