import { Platform, type TextStyle } from "react-native";
import { fonts } from "@/assets/fonts";
import { fs } from "@/src/utils/responsive";

/**
 * Figma “Forced small caps” for SF Pro Text.
 *
 * Why not `fonts.primary.semiBold` (bundled OTF)?
 * Expo-registered SF Pro files do not apply OpenType `smcp`. Plain
 * `textTransform: "uppercase"` uses full capital glyphs and never matches
 * Figma’s forced-small-caps rendering.
 *
 * OpenType `small-caps` keeps SOURCE capitals at full height and only
 * shortens lowercase. Figma “Forced small caps” makes every letter the
 * short height — so prepare copy with `prepareFigmaForcedSmallCapsText`
 * (lowercase) before rendering.
 *
 * iOS: system San Francisco + `fontVariant: ["small-caps"]`.
 * Android: same variant when possible; uppercase bundled SF Pro as fallback.
 *
 * Spec (set-personalized-goals header): 18 / 600 / line 22.
 * Default tracking `0.4` opens system small-caps to match Figma’s airier feel
 * (RN SF small-caps at 0 reads tighter / more “stretched” than the design).
 * Family: SF Pro Text per design specs.
 */
export type FigmaForcedSmallCapsOptions = {
  fontSize?: number;
  lineHeight?: number;
  letterSpacing?: number;
  color?: string;
  textAlign?: TextStyle["textAlign"];
};

/**
 * Force every Latin letter through the small-cap path so none stay tall.
 * (Source capitals would otherwise remain full-height with fontVariant.)
 */
export function prepareFigmaForcedSmallCapsText(title: string): string {
  return title.toLocaleLowerCase("en-US");
}

export function getFigmaForcedSmallCapsTextStyle(
  options: FigmaForcedSmallCapsOptions = {},
): TextStyle {
  const {
    fontSize = fs(18),
    lineHeight = fs(22),
    letterSpacing = 0.4,
    color,
    textAlign,
  } = options;

  const base: TextStyle = {
    fontSize,
    lineHeight,
    letterSpacing,
    fontWeight: "600",
    ...(color != null ? { color } : null),
    ...(textAlign != null ? { textAlign } : null),
  };

  if (Platform.OS === "ios") {
    return {
      ...base,
      // System SF Pro — OpenType small-caps works here.
      fontFamily: undefined,
      fontVariant: ["small-caps"],
    };
  }

  // Prefer real small-caps when the platform honors it on lowercase input.
  return {
    ...base,
    fontFamily: fonts.primary.semiBold,
    fontVariant: ["small-caps"],
  };
}
