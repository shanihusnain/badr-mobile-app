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
import {
  Blur,
  Canvas,
  Circle as SkiaCircle,
  Path as SkiaPath,
  Skia,
} from "@shopify/react-native-skia";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { GoldenTickIcon } from "@/assets/icons/GoldenTickIcon";
import { getProgressGlow, PROGRESS_GLOW_LAYERS } from "@/src/utils/progressGlow";

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
   * - illuminated: white tapered core + GoalProgressCard neon glow
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
const ILLUMINATED_CORE_WIDTH = 0.9;

const FIGMA_GOLDEN = Colors.light.golden;
const GLOW_PAD = 16;
const ILLUMINATED_TRACK_WIDTH = 0.75;
const ILLUMINATED_GLOW_PAD = 36;

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
  const n = Number.parseFloat(String(value ?? "0").replace("%", ""));
  if (Number.isNaN(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
}

export function getGlowSlab(percent: number): 0 | 1 | 2 | 3 {
  if (percent <= 0) return 0;
  if (percent <= 33) return 1;
  if (percent <= 66) return 2;
  return 3;
}

export function getIlluminationGlowColor(percent: number): string {
  return getProgressGlow(percent).glow;
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
  minScale = ILLUMINATED_MIN_SCALE,
): number {
  const deg = t * sweepDeg;
  const ramp = Math.min(1, deg / ILLUMINATED_RAMP_DEG);
  const grow = minScale + (1 - minScale) * ramp;

  const tipDeg = Math.min(ILLUMINATED_TIP_DEG, sweepDeg * 0.25);
  const fromEnd = sweepDeg - deg;
  const tip =
    fromEnd < tipDeg
      ? ILLUMINATED_TIP_SCALE + (1 - ILLUMINATED_TIP_SCALE) * (fromEnd / tipDeg)
      : 1;

  return maxWidth * grow * tip;
}

/**
 * Single closed path outlining the tapered arc: outer edge out,
 * rounded head cap, inner edge back. Being ONE filled shape (per layer),
 * it can never self-overlap — no beading at any percentage.
 */
function taperedRibbonPath(
  sweepDeg: number,
  maxWidth: number,
  startDeg = 0,
  capTail = false,
): string {
  const sweep = Math.min(Math.max(sweepDeg, 0.01), 359.99);
  const n = Math.max(24, Math.min(RIBBON_SAMPLES, Math.ceil(sweep / 3) + 8));
  const toRad = Math.PI / 180;
  const minScale = capTail ? 0.75 : ILLUMINATED_MIN_SCALE;

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
    const angle = startDeg + t * sweep;
    const half = illuminatedWidthAt(t, sweep, maxWidth, minScale) / 2;
    outer.push(point(angle, half));
    inner.push(point(angle, -half));
  }

  const headAngle = startDeg + sweep;
  const headRad = headAngle * toRad;
  const sinH = Math.sin(headRad);
  const cosH = Math.cos(headRad);
  const head = { x: CX + RADIUS * sinH, y: CY - RADIUS * cosH };
  const headRadial = { x: sinH, y: -cosH };
  const headTangent = { x: cosH, y: sinH };
  const capHalf = illuminatedWidthAt(1, sweep, maxWidth, minScale) / 2;
  const headCap: { x: number; y: number }[] = [];
  for (let i = 1; i < CAP_SAMPLES; i += 1) {
    const a = (i / CAP_SAMPLES) * Math.PI;
    headCap.push({
      x:
        head.x +
        capHalf * (headRadial.x * Math.cos(a) + headTangent.x * Math.sin(a)),
      y:
        head.y +
        capHalf * (headRadial.y * Math.cos(a) + headTangent.y * Math.sin(a)),
    });
  }

  const tailCap: { x: number; y: number }[] = [];
  if (capTail) {
    const startRad = startDeg * toRad;
    const sinS = Math.sin(startRad);
    const cosS = Math.cos(startRad);
    const tail = { x: CX + RADIUS * sinS, y: CY - RADIUS * cosS };
    const tailRadial = { x: sinS, y: -cosS };
    const tailTangent = { x: cosS, y: sinS };
    const tailHalf = illuminatedWidthAt(0, sweep, maxWidth, minScale) / 2;
    for (let i = 1; i < CAP_SAMPLES; i += 1) {
      const a = (i / CAP_SAMPLES) * Math.PI;
      // Inner → counter-clockwise → outer, to close the ribbon.
      tailCap.push({
        x:
          tail.x +
          tailHalf *
            (-tailRadial.x * Math.cos(a) - tailTangent.x * Math.sin(a)),
        y:
          tail.y +
          tailHalf *
            (-tailRadial.y * Math.cos(a) - tailTangent.y * Math.sin(a)),
      });
    }
  }

  const pts = [...outer, ...headCap, ...inner.reverse(), ...tailCap];
  return `M ${pts
    .map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" L ")} Z`;
}

/** Path glyph sits inset in the 22×22 viewBox (drawn ~4–18). */
const TICK_PATH_INSET = 14 / 22;

function useScaledPath(d: string | undefined, scale: number) {
  return useMemo(() => {
    if (!d) return null;
    const path = Skia.Path.MakeFromSVGString(d);
    if (!path) return null;
    path.transform(Skia.Matrix().scale(scale, scale));
    return path;
  }, [d, scale]);
}

function NeonFill({
  path,
  color,
  opacity,
  blur,
}: {
  path: ReturnType<typeof Skia.Path.MakeFromSVGString>;
  color: string;
  opacity?: number;
  blur?: number;
}) {
  if (!path) return null;
  if (blur) {
    return (
      <SkiaPath path={path} color={color} opacity={opacity ?? 1} style="fill">
        <Blur blur={blur} mode="decal" />
      </SkiaPath>
    );
  }
  return (
    <SkiaPath path={path} color={color} opacity={opacity ?? 1} style="fill" />
  );
}

function NeonStrokeCircle({
  cx,
  cy,
  r,
  strokeWidth,
  color,
  opacity,
  blur,
}: {
  cx: number;
  cy: number;
  r: number;
  strokeWidth: number;
  color: string;
  opacity?: number;
  blur?: number;
}) {
  if (blur) {
    return (
      <SkiaCircle
        cx={cx}
        cy={cy}
        r={r}
        color={color}
        style="stroke"
        strokeWidth={strokeWidth}
        opacity={opacity ?? 1}
      >
        <Blur blur={blur} mode="decal" />
      </SkiaCircle>
    );
  }
  return (
    <SkiaCircle
      cx={cx}
      cy={cy}
      r={r}
      color={color}
      style="stroke"
      strokeWidth={strokeWidth}
      opacity={opacity ?? 1}
    />
  );
}

/** Same 3-blur + white core stack as GoalProgressCard, on the Figma comet path. */
function IlluminatedProgressGlow({
  sweep,
  percent,
  canvasSize,
  canvasOffset,
  openAtTop = false,
  topGapDeg = 0,
}: {
  sweep: number;
  percent: number;
  canvasSize: number;
  canvasOffset: number;
  openAtTop?: boolean;
  topGapDeg?: number;
}) {
  const gapDeg = openAtTop ? Math.max(8, topGapDeg) : 0;
  const startDeg = gapDeg / 2;
  const arcSweep = openAtTop
    ? Math.min(Math.max(sweep - gapDeg, 0.01), 360 - gapDeg)
    : sweep;
  const isClosedRing = !openAtTop && sweep >= 359.5;
  const scale = canvasSize / 80;
  const { glow, radius } = getProgressGlow(percent);
  const glowD =
    isClosedRing || arcSweep <= 0
      ? undefined
      : taperedRibbonPath(
          arcSweep,
          ILLUMINATED_CORE_WIDTH * 3.4,
          startDeg,
          openAtTop,
        );
  const coreD =
    isClosedRing || arcSweep <= 0
      ? undefined
      : taperedRibbonPath(
          arcSweep,
          ILLUMINATED_CORE_WIDTH,
          startDeg,
          openAtTop,
        );
  const glowPath = useScaledPath(glowD, scale);
  const corePath = useScaledPath(coreD, scale);
  const cx = CX * scale;
  const cy = CY * scale;
  const r = RADIUS * scale;
  const stroke = ILLUMINATED_CORE_WIDTH * scale;
  const glowStroke = stroke * 3.4;

  return (
    <Canvas
      opaque={false}
      pointerEvents="none"
      style={[
        styles.svg,
        {
          width: canvasSize,
          height: canvasSize,
          top: canvasOffset,
          left: canvasOffset,
          zIndex: 1,
        },
      ]}
    >
      {isClosedRing ? (
        <>
          {PROGRESS_GLOW_LAYERS.map((layer) => (
            <NeonStrokeCircle
              key={`glow-ring-${layer.blurMul}`}
              cx={cx}
              cy={cy}
              r={r}
              strokeWidth={glowStroke}
              color={glow}
              opacity={layer.opacity}
              blur={radius * layer.blurMul}
            />
          ))}
          <NeonStrokeCircle
            cx={cx}
            cy={cy}
            r={r}
            strokeWidth={stroke}
            color={Colors.light.white}
          />
        </>
      ) : (
        <>
          {PROGRESS_GLOW_LAYERS.map((layer) => (
            <NeonFill
              key={`glow-arc-${layer.blurMul}`}
              path={glowPath}
              color={glow}
              opacity={layer.opacity}
              blur={radius * layer.blurMul}
            />
          ))}
          <NeonFill path={corePath} color={Colors.light.white} />
        </>
      )}
    </Canvas>
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
  const progressGlow = getProgressGlow(percent);
  const glowColor = isGolden
    ? FIGMA_GOLDEN
    : isIlluminated
      ? progressGlow.glow
      : progressColor;
  const coreColor = isGolden ? Colors.light.white : progressColor;
  const showArc = isGolden || isIlluminated || (percent > 0 && !!progressColor);
  const hasGlow = !!glowColor && slab > 0;

  // Higher percentage → stronger bloom (non-illuminated only).
  const glowStrength = isGolden ? 1 : 0.6 + (slab / 3) * 0.4;
  const sweep = isGolden ? 360 : (percent / 100) * 360;

  const uid = useId().replace(/:/g, "");
  const blurId = `glowBlur-${uid}`;

  const glowPad = isIlluminated ? ILLUMINATED_GLOW_PAD : GLOW_PAD;
  const svgSize = size + glowPad * 2;
  const svgOffset = -glowPad;
  const radiusPx = (RADIUS / 80) * svgSize;
  const arcD = arcPath(RADIUS, 0, sweep);
  const segmentArcs =
    useSegments && segments ? buildSegmentArcs(segments, segmentTotal) : [];
  // Check + top gap: 100% illuminated rings only. Never at 99% or below.
  const showCompleteCheck = isIlluminated && percent === 100;
  const checkSize = Math.max(28, Math.round(size * (34 / 174)));
  const visualTickPx = checkSize * TICK_PATH_INSET;
  // Arc gap slightly smaller than the glyph so both ends tuck into the icon.
  const checkGapDeg =
    ((visualTickPx * 1.2) / (2 * Math.PI * radiusPx)) * 360;
  const checkTop = size / 2 - radiusPx - checkSize / 2;

  return (
    <View style={[styles.wrapper, { width: size, height: size }, style]}>
      {isGolden && <GoldenNativeGlow size={size} />}

      {showCompleteCheck ? (
        <View
          style={[styles.completeCheck, { top: checkTop }]}
          pointerEvents="none"
        >
          <GoldenTickIcon size={checkSize} />
        </View>
      ) : null}

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

        {!isGolden && !useSegments && !showCompleteCheck ? (
          <Circle
            cx={CX}
            cy={CY}
            r={RADIUS}
            stroke={borderColor}
            strokeWidth={isIlluminated ? ILLUMINATED_TRACK_WIDTH : TRACK_WIDTH}
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

      {isIlluminated && showArc && hasGlow && glowColor ? (
        <IlluminatedProgressGlow
          sweep={sweep}
          percent={percent}
          canvasSize={svgSize}
          canvasOffset={svgOffset}
          openAtTop={showCompleteCheck}
          topGapDeg={checkGapDeg}
        />
      ) : null}

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
  completeCheck: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 4,
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
