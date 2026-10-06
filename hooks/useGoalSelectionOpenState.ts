import { useEffect, useRef, useState } from "react";
import { LayoutAnimation } from "react-native";

/** Keeps goal-selection dropdown in sync when parent sets openOnMount after toggle ON. */
export function useGoalSelectionOpenState(
  openOnMount = false,
  onOpened?: () => void,
  /** Incremented by parent after save hold — forces collapse even if openOnMount was already false. */
  collapseSignal = 0,
) {
  const [isOpen, setIsOpen] = useState(openOnMount);
  const wasOpenRef = useRef(false);
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;
  const onOpenedRef = useRef(onOpened);
  onOpenedRef.current = onOpened;
  // Ignore the value present on mount so a prior save's signal doesn't
  // immediately close a freshly opened selector (toggle ON flicker).
  const prevCollapseSignalRef = useRef(collapseSignal);

  useEffect(() => {
    if (openOnMount) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsOpen(true);
      return;
    }
    // Only animate when collapsing an open panel; avoid animating closed on mount.
    if (isOpenRef.current) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setIsOpen(false);
  }, [openOnMount]);

  useEffect(() => {
    if (collapseSignal === prevCollapseSignalRef.current) return;
    prevCollapseSignalRef.current = collapseSignal;
    if (!collapseSignal) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(false);
  }, [collapseSignal]);

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
