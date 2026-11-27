import { Dimensions, PixelRatio } from "react-native";

/** Figma artboard width used as the design baseline. */
export const BASE_WIDTH = 375;

/** Keep SE readable and Pro Max from ballooning past ~15%. */
const SCALE_MIN = 0.9;
const SCALE_MAX = 1.15;

/** Default moderate-scale factor for fonts/spacing (was 0.35). */
const MS_FACTOR = 0.55;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getWindowWidth() {
  return Dimensions.get("window").width;
}

/** Current width scale vs 375, clamped for phones. */
export function getScale(width = getWindowWidth()): number {
  return clamp(width / BASE_WIDTH, SCALE_MIN, SCALE_MAX);
}

function round(value: number) {
  return Math.round(PixelRatio.roundToNearestPixel(value));
}

/**
 * Linear width scale from the 375 baseline.
 * Use for image/box dimensions that should track screen width closely.
 */
export function s(size: number, width = getWindowWidth()): number {
  return round(size * getScale(width));
}

/**
 * Moderate scale: softens linear width scaling so type/gaps feel like Figma
 * across phones without fully matching the linear ratio.
 */
export function ms(
  size: number,
  factor = MS_FACTOR,
  width = getWindowWidth(),
): number {
  const ratio = getScale(width);
  const scaled = size + (size * ratio - size) * factor;
  return round(scaled);
}

/** Font-size helper — same moderate scale as `ms`. */
export function fs(size: number, width = getWindowWidth()): number {
  return ms(size, MS_FACTOR, width);
}

export const space = {
  xs: ms(4),
  sm: ms(8),
  md: ms(16),
  lg: ms(24),
  xl: ms(32),
} as const;
