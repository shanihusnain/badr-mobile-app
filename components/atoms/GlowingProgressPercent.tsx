import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import {
  getProgressGlow,
  PROGRESS_GLOW_LAYERS,
} from "@/src/utils/progressGlow";
import {
  BlurMask,
  Canvas,
  Text as SkiaText,
  useFont,
} from "@shopify/react-native-skia";
import { StyleSheet, Text } from "react-native";

const PERCENT_FONT_SIZE = 18;
/** Extra canvas padding so the glyph blur is never clipped into a box. */
const GLOW_PAD = 22;

type Props = {
  /** 0–100 — drives glow tint via getProgressGlow. */
  percent: number;
  /**
   * Display string (defaults to `${percent}%`).
   * Pass a localized value for Arabic-Indic digits.
   */
  label?: string;
};

/**
 * Neon progress % used by GoalProgressCard and the home moon card.
 * Glyph stays white; bloom tint follows getProgressGlow stages.
 */
export function GlowingProgressPercent({ percent, label }: Props) {
  const font = useFont(
    require("@/assets/fonts/SF-Pro-Text-Semibold.otf"),
    PERCENT_FONT_SIZE,
  );
  const text = label ?? `${percent}%`;
  const { glow, radius } = getProgressGlow(percent);

  if (!font) {
    return <Text style={styles.fallback}>{text}</Text>;
  }

  // Keep canvas size and glyph x locked to "100%" so 0% → 100% never shifts.
  const maxBounds = font.measureText("100%");
  const bounds = font.measureText(text);
  const metrics = font.getMetrics();
  const width = Math.ceil(maxBounds.width + GLOW_PAD * 2);
  const height = Math.ceil(-metrics.ascent + metrics.descent + GLOW_PAD * 2);
  const x = GLOW_PAD + (maxBounds.width - bounds.width) / 2 - bounds.x;
  const y = GLOW_PAD - metrics.ascent;

  return (
    <Canvas
      opaque={false}
      style={[
        styles.percentCanvas,
        {
          width,
          height,
        },
      ]}
    >
      {PROGRESS_GLOW_LAYERS.map((layer) => (
        <SkiaText
          key={`glow-${layer.blurMul}`}
          text={text}
          x={x}
          y={y}
          font={font}
          color={glow}
          opacity={layer.opacity}
        >
          <BlurMask blur={radius * layer.blurMul} style="solid" />
        </SkiaText>
      ))}
      <SkiaText
        text={text}
        x={x}
        y={y}
        font={font}
        color={Colors.light.white}
      />
    </Canvas>
  );
}

const styles = StyleSheet.create({
  fallback: {
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    fontSize: PERCENT_FONT_SIZE,
    color: Colors.light.white,
  },
  percentCanvas: {
    marginVertical: -GLOW_PAD + 2,
    marginHorizontal: -GLOW_PAD / 3,
  },
});

export default GlowingProgressPercent;
