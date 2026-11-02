import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";

type Props = {
  /** 0–100; fractional values keep the moon fill smooth. */
  progressPercent: number;
  /** Fires once when the Rive view is ready (or if loading fails). */
  onReady?: () => void;
  /** Optional absolute size — preferred over % inside Animated.ScrollView. */
  size?: number;
};

type MoonComponent = React.ComponentType<Props>;

/**
 * Soft-load Rive so a broken Nitro install does not crash the whole screen.
 * After upgrading nitro to 0.36.5+ (RN 0.87+ JSI fix), this should resolve
 * to the real moon on a rebuilt native app.
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

function FallbackMoon({ onReady, size }: Props) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  const box =
    typeof size === "number" && size > 0
      ? { width: size, height: size, borderRadius: size / 2 }
      : styles.fallback;

  return <View style={[styles.fallback, box]} />;
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
