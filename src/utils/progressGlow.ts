import { Colors } from "@/constants/theme";

/** Eyedropped from Figma silver/cyan ring glow (sampled over navy). */
export const FIGMA_RING_GLOW_BLUE = "#50578F";

/**
 * Figma glow samples are mid-pixels on a dark background, so they look
 * navy/indigo. Skia needs a luminous paint or the bloom disappears.
 */
function neonPaint(hex: string): string {
  const raw = hex.replace("#", "");
  if (raw.length < 6) return hex;
  const r = Number.parseInt(raw.slice(0, 2), 16);
  const g = Number.parseInt(raw.slice(2, 4), 16);
  const b = Number.parseInt(raw.slice(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  if (luminance >= 0.5) return hex;
  const max = Math.max(r, g, b, 1);
  const scale = 235 / max;
  const ch = (c: number) =>
    Math.min(255, Math.round(c * scale))
      .toString(16)
      .padStart(2, "0");
  return `#${ch(r)}${ch(g)}${ch(b)}`;
}

/**
 * Neon stages for GoalProgressCard % text and the illuminated ring.
 * Glyphs/core stay white. Bloom tint:
 * Silver (0–33, bluish) → Cyan (34–66) → Gold (67–99) → Glowing Gold (100)
 */
export function getProgressGlow(percent: number) {
  if (percent >= 100) {
    return { glow: neonPaint(Colors.light.golden), radius: 10 };
  }
  if (percent >= 67) {
    return { glow: neonPaint(Colors.light.gold), radius: 8 };
  }
  if (percent >= 34) {
    return { glow: neonPaint(FIGMA_RING_GLOW_BLUE), radius: 10 };
  }
  return { glow: neonPaint(Colors.light.white), radius: 8 };
}

/** Same three outer-glow passes used by GlowingProgressPercent. */
export const PROGRESS_GLOW_LAYERS = [
  { opacity: 0.09, blurMul: 1.1 },
  { opacity: 0.1, blurMul: 0.7 },
  { opacity: 0.9, blurMul: 0.55 },
] as const;
