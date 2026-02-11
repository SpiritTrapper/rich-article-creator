import { useState } from "react";

interface UseElementOpenReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggleOpen: () => void;
}

export function useElementOpen(initialState: boolean = false): UseElementOpenReturn {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggleOpen = () => setIsOpen((prev) => !prev);

  return { isOpen, open, close, toggleOpen };
}
