import { Dimensions, PixelRatio } from "react-native";

/** Figma artboard width used as the design baseline. */
const BASE_WIDTH = 375;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * Moderate scale: softens linear width scaling so gaps feel like Figma
 * across phones without ballooning on large devices or crushing on small ones.
 */
export function ms(size: number, factor = 0.35): number {
  const ratio = SCREEN_WIDTH / BASE_WIDTH;
  const scaled = size + (size * ratio - size) * factor;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
}

export const space = {
  xs: ms(4),
  sm: ms(8),
  md: ms(16),
  lg: ms(24),
  xl: ms(32),
} as const;
