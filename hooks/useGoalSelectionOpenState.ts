import { useEffect, useRef, useState } from "react";
import { LayoutAnimation } from "react-native";

/** Keeps goal-selection dropdown in sync when parent sets openOnMount after toggle ON. */
export function useGoalSelectionOpenState(
  openOnMount = false,
  onOpened?: () => void,
) {
  const [isOpen, setIsOpen] = useState(openOnMount);
  const wasOpenRef = useRef(false);
  const onOpenedRef = useRef(onOpened);
  onOpenedRef.current = onOpened;

  useEffect(() => {
    if (openOnMount) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsOpen(true);
      return;
    }
    setIsOpen(false);
  }, [openOnMount]);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      // Defer so layout can settle before parent scrolls the list.
      const t = setTimeout(() => onOpenedRef.current?.(), 50);
      wasOpenRef.current = true;
      return () => clearTimeout(t);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  return [isOpen, setIsOpen] as const;
}
