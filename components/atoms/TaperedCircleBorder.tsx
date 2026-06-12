import React, { useId } from "react";
import { View, Text, StyleSheet, Platform, type ViewStyle } from "react-native";
import Svg, {
  Path,
  Circle,
  Defs,
  Filter,
  FeGaussianBlur,
  G,
} from "react-native-svg";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

interface TaperedCircleBorderProps {
  percentage?: string;
  size?: number;
  borderColor?: string;
  progressColor?: string;
  children?: React.ReactNode;
  variant?: "default" | "golden";
  style?: ViewStyle;
}

const CX = 40;
const CY = 40;
const RADIUS = 33;
const TRACK_WIDTH = 2;
const CORE_WIDTH = 2.4;

const FIGMA_GOLDEN = Colors.light.golden;
const GLOW_PAD = 16;

/** Soft, generous colored bloom (blurred) — Figma neon look. */
const GLOW_LAYERS = [
  { widthAdd: 3, opacity: 0.1 },
  { widthAdd: 1, opacity: 0.15 },
  { widthAdd: 0.5, opacity: 0.3 },
] as const;
const GLOW_BLUR_STD = 2;

export function parsePercent(value?: string | number): number {
  const n = Number.parseInt(String(value ?? "0").replace("%", ""), 10);
  if (Number.isNaN(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

export function getGlowSlab(percent: number): 0 | 1 | 2 | 3 {
  if (percent <= 0) return 0;
  if (percent <= 33) return 1;
  if (percent <= 66) return 2;
  return 3;
}

function polarToCartesian(r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

/** Arc stroke path from top, clockwise, for `sweep` degrees. */
function arcPath(r: number, sweepDeg: number): string {
  const clamped = Math.min(Math.max(sweepDeg, 0.01), 359.999);
  const start = polarToCartesian(r, 0);
  const end = polarToCartesian(r, clamped);
  const largeArc = clamped > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function GoldenNativeGlow({ size }: { size: number }) {
  if (Platform.OS !== "ios") return null;

  return (
    <>
      {[5, 15, 25].map((radius) => (
        <View
          key={`native-glow-${radius}`}
          pointerEvents="none"
          style={[
            styles.nativeGlowDisc,
            {
              top: size / 2 - 1,
              left: size / 2 - 1,
              shadowColor: FIGMA_GOLDEN,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 1,
              shadowRadius: radius,
            },
          ]}
        />
      ))}
    </>
  );
}

export const TaperedCircleBorder: React.FC<TaperedCircleBorderProps> = ({
  percentage,
  size = 70,
  borderColor = Colors.light.calendarBg,
  progressColor,
  children,
  variant = "default",
  style,
}) => {
  const isGolden = variant === "golden";
  const percent = parsePercent(percentage);
  const slab = isGolden ? 3 : getGlowSlab(percent);
  const glowColor = isGolden ? FIGMA_GOLDEN : progressColor;
  const coreColor = isGolden ? Colors.light.white : progressColor;
  const showArc = isGolden || (percent > 0 && !!progressColor);
  const hasGlow = !!glowColor && slab > 0;

  // Higher percentage → stronger bloom.
  const glowStrength = isGolden ? 1 : 0.6 + (slab / 3) * 0.4;
  const sweep = isGolden ? 360 : (percent / 100) * 360;

  const uid = useId().replace(/:/g, "");
  const blurId = `glowBlur-${uid}`;

  const svgSize = size + GLOW_PAD * 2;
  const svgOffset = -GLOW_PAD;
  const arcD = arcPath(RADIUS, sweep);

  return (
    <View style={[styles.wrapper, { width: size, height: size }, style]}>
      {isGolden && <GoldenNativeGlow size={size} />}

      <Svg
        width={svgSize}
        height={svgSize}
        viewBox="0 0 80 80"
        style={[styles.svg, { top: svgOffset, left: svgOffset }]}
      >
        <Defs>
          <Filter id={blurId} x="-90%" y="-90%" width="280%" height="280%">
            <FeGaussianBlur in="SourceGraphic" stdDeviation={GLOW_BLUR_STD} />
          </Filter>
        </Defs>

        {/* Faint full track */}
        {!isGolden && (
          <Circle
            cx={CX}
            cy={CY}
            r={RADIUS}
            stroke={borderColor}
            strokeWidth={TRACK_WIDTH}
            fill="none"
          />
        )}

        {/* Soft colored neon bloom */}
        {hasGlow && (
          <G filter={`url(#${blurId})`}>
            {GLOW_LAYERS.map((layer, index) => (
              <Path
                key={`glow-${index}`}
                d={arcD}
                stroke={glowColor}
                strokeWidth={CORE_WIDTH + layer.widthAdd}
                strokeLinecap="round"
                fill="none"
                opacity={Math.min(1, layer.opacity * glowStrength)}
              />
            ))}
          </G>
        )}

        {/* Bright core */}
        {showArc && (
          <Path
            d={arcD}
            stroke={coreColor}
            strokeWidth={CORE_WIDTH}
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* White-hot highlight along the core (neon center) */}
        {showArc && !isGolden && (
          <Path
            d={arcD}
            stroke={Colors.light.white}
            strokeWidth={CORE_WIDTH * 0.45}
            strokeLinecap="round"
            fill="none"
            opacity={0.65}
          />
        )}
      </Svg>

      <View
        style={[styles.textContainer, { width: size, height: size }]}
        pointerEvents="box-none"
      >
        {children ? (
          children
        ) : (
          <Text style={styles.percentageText}>{percent}%</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
  },
  svg: {
    position: "absolute",
  },
  nativeGlowDisc: {
    position: "absolute",
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: FIGMA_GOLDEN,
  },
  textContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  percentageText: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: fonts.primary.bold,
  },
});
