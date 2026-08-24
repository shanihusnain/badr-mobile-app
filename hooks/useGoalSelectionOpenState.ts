import { useEffect, useState } from "react";
import { LayoutAnimation } from "react-native";

/** Keeps goal-selection dropdown in sync when parent sets openOnMount after toggle ON. */
export function useGoalSelectionOpenState(openOnMount = false) {
  const [isOpen, setIsOpen] = useState(openOnMount);

  useEffect(() => {
    if (openOnMount) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsOpen(true);
    }
  }, [openOnMount]);

  return [isOpen, setIsOpen] as const;
}
