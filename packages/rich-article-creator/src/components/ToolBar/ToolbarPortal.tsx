import { useEffect, useState, type ReactNode } from "react";

import { createPortal } from "react-dom";

export default function ToolbarPortal({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return null;
  }

  return createPortal(children, document.body);
}
