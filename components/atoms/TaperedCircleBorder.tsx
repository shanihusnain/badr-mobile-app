import React, { useId, useMemo } from "react";
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

export type RingSegment = {
  value: number;
  color: string;
};

interface TaperedCircleBorderProps {
  percentage?: string;
  size?: number;
  borderColor?: string;
  progressColor?: string;
  segments?: RingSegment[];
  children?: React.ReactNode;
  /**
   * - default: core + glow use `progressColor` (home cards, habit rings, etc.)
   * - golden: full white ring with golden bloom
   * - illuminated: white tapered core + stage-colored glow (logging hero only)
   */
  variant?: "default" | "golden" | "illuminated";
  style?: ViewStyle;
}

const CX = 40;
const CY = 40;
const RADIUS = 33;
const TRACK_WIDTH = 2;
const CORE_WIDTH = 2.4;
/**
 * Core width for the logging hero ring. Measured from the exported Figma
 * arc: max core ≈ 0.046 × ring radius — a delicate thin line; the wide
 * soft glow is what gives the ring its weight.
 */
const ILLUMINATED_CORE_WIDTH = 1.6;

const FIGMA_GOLDEN = Colors.light.golden;
const GLOW_PAD = 16;

/** Soft, generous colored bloom (blurred) — Figma neon look. */
const GLOW_LAYERS = [
  { widthAdd: 3, opacity: 0.1 },
  { widthAdd: 1, opacity: 0.15 },
  { widthAdd: 0.5, opacity: 0.3 },
] as const;
const GLOW_BLUR_STD = 2;

/**
 * Figma taper, measured pixel-by-pixel from the design:
 * the arc starts near-invisible at 12 o'clock and thickens linearly with
 * the ABSOLUTE angle traveled, reaching full width after ~130°. From there
 * it stays at full width all the way to the head, which ends in a short
 * narrowing (~9°) plus a rounded cap. Short arcs (< 130°) therefore stay
 * thin along their whole length, exactly as in Figma.
 */
const ILLUMINATED_RAMP_DEG = 130;
/**
 * Width at the very start of the tail. The exported Figma arc shows a
 * visible ~1px line from degree 0 (~30% of max width), not an invisible tip.
 */
const ILLUMINATED_MIN_SCALE = 0.3;
/** Angular length of the narrowing right before the rounded tip. */
const ILLUMINATED_TIP_DEG = 9;
/** Width scale the head narrows to before the cap rounds it off. */
const ILLUMINATED_TIP_SCALE = 0.7;
/** Outline samples along the ribbon (per edge). */
const RIBBON_SAMPLES = 64;
/** Samples for the rounded head cap. */
const CAP_SAMPLES = 10;

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

/**
 * Stage glow colors for the illuminated ring (logging hero):
 * Silver (1–33) → Blue (34–66) → Gold (67–99) → Glowing Gold (100).
 * Ring color follows progress percentage, never the goal category.
 */
export function getIlluminationGlowColor(percent: number): string {
  if (percent >= 100) return Colors.light.goldenBright;
  if (percent >= 67) return Colors.light.gold;
  if (percent >= 34) return Colors.light.darkblue;
  return Colors.light.dullWhite;
}

function polarToCartesian(r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

/** Arc stroke path clockwise from `startDeg` for `sweepDeg` degrees. */
function arcPath(r: number, startDeg: number, sweepDeg: number): string {
  const clamped = Math.min(Math.max(sweepDeg, 0.01), 359.999);
  const start = polarToCartesian(r, startDeg);
  const end = polarToCartesian(r, startDeg + clamped);
  const largeArc = clamped > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

/**
 * Stroke width along the arc (t in 0..1) — measured Figma profile:
 * comet shape. Width ramps linearly with the absolute angle traveled
 * (full width after ILLUMINATED_RAMP_DEG), holds full width to the head,
 * then narrows slightly over the last few degrees into the rounded cap.
 */
function illuminatedWidthAt(
  t: number,
  sweepDeg: number,
  maxWidth: number,
): number {
  const deg = t * sweepDeg;
  const ramp = Math.min(1, deg / ILLUMINATED_RAMP_DEG);
  const grow =
    ILLUMINATED_MIN_SCALE + (1 - ILLUMINATED_MIN_SCALE) * ramp;

  const tipDeg = Math.min(ILLUMINATED_TIP_DEG, sweepDeg * 0.25);
  const fromEnd = sweepDeg - deg;
  const tip =
    fromEnd < tipDeg
      ? ILLUMINATED_TIP_SCALE +
        (1 - ILLUMINATED_TIP_SCALE) * (fromEnd / tipDeg)
      : 1;

  return maxWidth * grow * tip;
}

/**
 * Single closed path outlining the tapered arc: outer edge out,
 * rounded head cap, inner edge back. Being ONE filled shape (per layer),
 * it can never self-overlap — no beading at any percentage.
 */
function taperedRibbonPath(sweepDeg: number, maxWidth: number): string {
  const sweep = Math.min(Math.max(sweepDeg, 0.01), 359.99);
  const n = Math.max(24, Math.min(RIBBON_SAMPLES, Math.ceil(sweep / 3) + 8));
  const toRad = Math.PI / 180;

  // Angle measured clockwise from 12 o'clock.
  const point = (angleDeg: number, radialOffset: number) => {
    const a = angleDeg * toRad;
    const r = RADIUS + radialOffset;
    return { x: CX + r * Math.sin(a), y: CY - r * Math.cos(a) };
  };

  const outer: { x: number; y: number }[] = [];
  const inner: { x: number; y: number }[] = [];
  for (let i = 0; i <= n; i += 1) {
    const t = i / n;
    const angle = t * sweep;
    const half = illuminatedWidthAt(t, sweep, maxWidth) / 2;
    outer.push(point(angle, half));
    inner.push(point(angle, -half));
  }

  // Rounded cap at the head (widest end).
  const headRad = sweep * toRad;
  const sinH = Math.sin(headRad);
  const cosH = Math.cos(headRad);
  const head = { x: CX + RADIUS * sinH, y: CY - RADIUS * cosH };
  const radial = { x: sinH, y: -cosH };
  const tangent = { x: cosH, y: sinH };
  const capHalf = illuminatedWidthAt(1, sweep, maxWidth) / 2;
  const cap: { x: number; y: number }[] = [];
  for (let i = 1; i < CAP_SAMPLES; i += 1) {
    const a = (i / CAP_SAMPLES) * Math.PI;
    cap.push({
      x: head.x + capHalf * (radial.x * Math.cos(a) + tangent.x * Math.sin(a)),
      y: head.y + capHalf * (radial.y * Math.cos(a) + tangent.y * Math.sin(a)),
    });
  }

  const pts = [...outer, ...cap, ...inner.reverse()];
  return `M ${pts
    .map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" L ")} Z`;
}

function IlluminatedProgressArc({
  sweep,
  glowColor,
  blurId,
  glowStrength,
}: {
  sweep: number;
  glowColor: string;
  blurId: string;
  glowStrength: number;
}) {
  const isFullRing = sweep >= 359.5;

  // Each layer is ONE filled ribbon — no overlapping strokes, no beading.
  const paths = useMemo(() => {
    if (isFullRing || sweep <= 0) return null;
    return {
      glowOuter: taperedRibbonPath(sweep, ILLUMINATED_CORE_WIDTH * 3.4),
      glowMid: taperedRibbonPath(sweep, ILLUMINATED_CORE_WIDTH * 2),
      band: taperedRibbonPath(sweep, ILLUMINATED_CORE_WIDTH * 1.4),
      core: taperedRibbonPath(sweep, ILLUMINATED_CORE_WIDTH),
    };
  }, [sweep, isFullRing]);

  // 100%: one continuous circle with an even bloom — no taper, no seams.
  // Kept lighter than the partial-arc glow so it reads as a crisp ring
  // haloed in gold, not a thick glowing donut.
  if (isFullRing) {
    return (
      <>
        <G filter={`url(#${blurId})`}>
          <Circle
            cx={CX}
            cy={CY}
            r={RADIUS}
            stroke={glowColor}
            strokeWidth={ILLUMINATED_CORE_WIDTH * 2.8}
            fill="none"
            opacity={0.14 * glowStrength}
          />
          <Circle
            cx={CX}
            cy={CY}
            r={RADIUS}
            stroke={glowColor}
            strokeWidth={ILLUMINATED_CORE_WIDTH * 1.8}
            fill="none"
            opacity={0.26 * glowStrength}
          />
        </G>
        <Circle
          cx={CX}
          cy={CY}
          r={RADIUS}
          stroke={glowColor}
          strokeWidth={ILLUMINATED_CORE_WIDTH * 1.3}
          fill="none"
          opacity={0.22 * glowStrength}
        />
        <Circle
          cx={CX}
          cy={CY}
          r={RADIUS}
          stroke={Colors.light.white}
          strokeWidth={ILLUMINATED_CORE_WIDTH}
          fill="none"
        />
      </>
    );
  }

  if (!paths) return null;

  return (
    <>
      {/* Neon bloom, blurred — wide soft halo plus tighter saturated band. */}
      <G filter={`url(#${blurId})`}>
        <Path d={paths.glowOuter} fill={glowColor} opacity={0.2 * glowStrength} />
        <Path d={paths.glowMid} fill={glowColor} opacity={0.35 * glowStrength} />
      </G>

      {/* Tight unblurred color band hugging the core. */}
      <Path d={paths.band} fill={glowColor} opacity={0.28 * glowStrength} />

      {/* Crisp white tapered core on top. */}
      <Path d={paths.core} fill={Colors.light.white} />
    </>
  );
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

function renderSegmentArc({
  arcD,
  color,
  blurId,
  glowStrength,
  withGlow,
  withHighlight,
}: {
  arcD: string;
  color: string;
  blurId: string;
  glowStrength: number;
  withGlow: boolean;
  withHighlight: boolean;
}) {
  return (
    <>
      {withGlow ? (
        <G filter={`url(#${blurId})`}>
          {GLOW_LAYERS.map((layer, index) => (
            <Path
              key={`glow-${index}`}
              d={arcD}
              stroke={color}
              strokeWidth={CORE_WIDTH + layer.widthAdd}
              strokeLinecap="round"
              fill="none"
              opacity={Math.min(1, layer.opacity * glowStrength)}
            />
          ))}
        </G>
      ) : null}

      <Path
        d={arcD}
        stroke={color}
        strokeWidth={CORE_WIDTH}
        strokeLinecap="round"
        fill="none"
      />

      {withHighlight ? (
        <Path
          d={arcD}
          stroke={Colors.light.white}
          strokeWidth={CORE_WIDTH * 0.45}
          strokeLinecap="round"
          fill="none"
          opacity={0.65}
        />
      ) : null}
    </>
  );
}

function buildSegmentArcs(segments: RingSegment[], segmentTotal: number) {
  let priorSweep = 0;

  return segments.flatMap((segment) => {
    const segmentSweep = (segment.value / segmentTotal) * 360;
    if (segmentSweep <= 0) return [];

    const arc = {
      arcD: arcPath(RADIUS, priorSweep, segmentSweep),
      color: segment.color,
      withGlow: segment.color === Colors.light.green && segment.value > 0,
      withHighlight: segment.color === Colors.light.green && segment.value > 0,
    };
    priorSweep += segmentSweep;
    return [arc];
  });
}

export const TaperedCircleBorder: React.FC<TaperedCircleBorderProps> = ({
  percentage,
  size = 70,
  borderColor = Colors.light.calendarBg,
  progressColor,
  segments,
  children,
  variant = "default",
  style,
}) => {
  const isGolden = variant === "golden";
  const isIlluminated = variant === "illuminated";
  const percent = parsePercent(percentage);
  const segmentTotal =
    segments?.reduce((sum, segment) => sum + segment.value, 0) ?? 0;
  // Segments keep the existing multi-color path; illuminated is for solid arcs only.
  const useSegments = !isGolden && !isIlluminated && segmentTotal > 0;
  const slab = isGolden ? 3 : getGlowSlab(percent);
  const glowColor = isGolden
    ? FIGMA_GOLDEN
    : isIlluminated
      ? getIlluminationGlowColor(percent)
      : progressColor;
  const coreColor = isGolden ? Colors.light.white : progressColor;
  const showArc = isGolden || isIlluminated || (percent > 0 && !!progressColor);
  const hasGlow = !!glowColor && slab > 0;

  // Higher percentage → stronger bloom.
  const glowStrength = isGolden
    ? 1
    : isIlluminated
      ? 0.6 + (slab / 3) * 0.4
      : 0.6 + (slab / 3) * 0.4;
  const sweep = isGolden ? 360 : (percent / 100) * 360;

  const uid = useId().replace(/:/g, "");
  const blurId = `glowBlur-${uid}`;

  const svgSize = size + GLOW_PAD * 2;
  const svgOffset = -GLOW_PAD;
  const arcD = arcPath(RADIUS, 0, sweep);
  const segmentArcs =
    useSegments && segments ? buildSegmentArcs(segments, segmentTotal) : [];

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
            <FeGaussianBlur
              in="SourceGraphic"
              stdDeviation={isIlluminated ? 2 : GLOW_BLUR_STD}
            />
          </Filter>
        </Defs>

        {!isGolden && !useSegments ? (
          <Circle
            cx={CX}
            cy={CY}
            r={RADIUS}
            stroke={borderColor}
            strokeWidth={TRACK_WIDTH}
            fill="none"
          />
        ) : null}

        {useSegments
          ? segmentArcs.map((segment, index) => (
              <G key={`segment-${index}`}>
                {renderSegmentArc({
                  arcD: segment.arcD,
                  color: segment.color,
                  blurId,
                  glowStrength,
                  withGlow: segment.withGlow && hasGlow,
                  withHighlight: segment.withHighlight,
                })}
              </G>
            ))
          : null}

        {isIlluminated && showArc && hasGlow && glowColor ? (
          <IlluminatedProgressArc
            sweep={sweep}
            glowColor={glowColor}
            blurId={blurId}
            glowStrength={glowStrength}
          />
        ) : null}

        {!isIlluminated && !useSegments && hasGlow ? (
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
        ) : null}

        {!isIlluminated && !useSegments && showArc ? (
          <Path
            d={arcD}
            stroke={coreColor}
            strokeWidth={CORE_WIDTH}
            strokeLinecap="round"
            fill="none"
          />
        ) : null}

        {!isIlluminated && !useSegments && showArc && !isGolden ? (
          <Path
            d={arcD}
            stroke={Colors.light.white}
            strokeWidth={CORE_WIDTH * 0.45}
            strokeLinecap="round"
            fill="none"
            opacity={0.65}
          />
        ) : null}
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
