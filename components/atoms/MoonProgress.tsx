import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";

type Props = {
  /** 0–100; fractional values keep the moon fill smooth. */
  progressPercent: number;
  /** Fires once when the Rive view is ready (or if loading fails). */
  onReady?: () => void;
};

type MoonComponent = React.ComponentType<Props>;

/**
 * Rive needs native NitroModules (dev/production builds only).
 * Loading it with a static import crashes Expo Go and can leave this module
 * undefined for Fast Refresh consumers (e.g. GoalTabContent).
 */
let RiveMoon: MoonComponent | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require("./MoonProgressRive");
  RiveMoon = mod.MoonProgressRive ?? mod.default ?? null;
} catch (error) {
  console.warn(
    "[MoonProgress] Rive/NitroModules unavailable; using empty fallback.",
    error,
  );
}

function FallbackMoon({ onReady }: Props) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return <View style={styles.fallback} />;
}

export function MoonProgress(props: Props) {
  if (RiveMoon) {
    return <RiveMoon {...props} />;
  }
  return <FallbackMoon {...props} />;
}

const styles = StyleSheet.create({
  fallback: {
    width: "100%",
    height: "100%",
  },
});

export default MoonProgress;
