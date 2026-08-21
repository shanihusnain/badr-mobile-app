import { fonts } from "@/assets/fonts";
import MoonProgress from "@/components/atoms/MoonProgress";
import { TopSpace } from "@/components/atoms/TopSpace";
import { Colors } from "@/constants/theme";
import {
  getProgressGlow,
  PROGRESS_GLOW_LAYERS,
} from "@/src/utils/progressGlow";
import { globalStyles } from "@/src/globalstyles/globalstyles";
import {
  BlurMask,
  Canvas,
  Text as SkiaText,
  useFont,
} from "@shopify/react-native-skia";
import { ImageSource } from "expo-image";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from "react-native-responsive-screen";

interface GoalProgressCardProps {
  currentDay: number;
  totalDays: number;
  lastActiveDays: number;
  overallProgress: number;
  image?: ImageSource;
  /**
   * When true, animates day counters and progress from the start values
   * up to the provided targets (moon + % + day numbers).
   * Other screens can omit this and keep the static display.
   */
  animate?: boolean;
  /** Animation length in ms (only used when `animate` is true). */
  animationDurationMs?: number;
}

const DEFAULT_ANIMATION_MS = 18000;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

const PERCENT_FONT_SIZE = 18;
/** Extra canvas padding so the glyph blur is never clipped into a box. */
const GLOW_PAD = 22;

function GlowingProgressPercent({ percent }: { percent: number }) {
  const font = useFont(
    require("@/assets/fonts/SF-Pro-Text-Semibold.otf"),
    PERCENT_FONT_SIZE,
  );
  const label = `${percent}%`;
  const { glow, radius } = getProgressGlow(percent);

  if (!font) {
    return <Text style={styles.statValue}>{label}</Text>;
  }

  // Keep canvas size and glyph x locked to "100%" so 0% → 100% never shifts.
  const maxBounds = font.measureText("100%");
  const bounds = font.measureText(label);
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
          text={label}
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
        text={label}
        x={x}
        y={y}
        font={font}
        color={Colors.light.white}
      />
    </Canvas>
  );
}

export const GoalProgressCard = ({
  currentDay,
  totalDays,
  lastActiveDays,
  overallProgress,
  animate = false,
  animationDurationMs = DEFAULT_ANIMATION_MS,
}: GoalProgressCardProps) => {
  const { t } = useTranslation();

  const staticDaysLeft = Math.max(0, totalDays - currentDay);

  const [moonReady, setMoonReady] = useState(!animate);
  /** Animated countdown numerator — only used when `animate` is true. */
  const [animatedDaysLeft, setAnimatedDaysLeft] = useState(totalDays);
  const [displayLastActiveDays, setDisplayLastActiveDays] = useState(
    animate ? 1 : lastActiveDays,
  );
  /** Fractional % for the moon; text below uses the rounded value. */
  const [moonProgress, setMoonProgress] = useState(
    animate ? 0 : overallProgress,
  );
  const [displayProgress, setDisplayProgress] = useState(
    animate ? 0 : Math.round(overallProgress),
  );

  const handleMoonReady = useCallback(() => {
    setMoonReady(true);
  }, []);

  useEffect(() => {
    if (!animate) {
      setMoonReady(true);
      setDisplayLastActiveDays(lastActiveDays);
      setMoonProgress(overallProgress);
      setDisplayProgress(Math.round(overallProgress));
      return;
    }

    // Hold at start values until the Rive moon is ready to follow progress.
    if (!moonReady) {
      setAnimatedDaysLeft(totalDays);
      setDisplayLastActiveDays(1);
      setMoonProgress(0);
      setDisplayProgress(0);
      return;
    }

    const fromDaysLeft = totalDays;
    const toDaysLeft = staticDaysLeft;
    const fromActiveDays = 1;
    const fromProgress = 0;
    let frameId = 0;
    let startTs: number | null = null;

    const tick = (now: number) => {
      if (startTs == null) startTs = now;
      const raw = Math.min(1, (now - startTs) / animationDurationMs);
      const e = easeOutCubic(raw);

      const nextProgress = fromProgress + (overallProgress - fromProgress) * e;

      // Countdown only while animating: 28/28 → 27/28 → … → days left
      setAnimatedDaysLeft(
        Math.round(fromDaysLeft + (toDaysLeft - fromDaysLeft) * e),
      );
      setDisplayLastActiveDays(
        Math.round(fromActiveDays + (lastActiveDays - fromActiveDays) * e),
      );
      // Keep moon on continuous floats; round only the % label.
      setMoonProgress(nextProgress);
      setDisplayProgress(Math.round(nextProgress));

      if (raw < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        setAnimatedDaysLeft(toDaysLeft);
        setDisplayLastActiveDays(lastActiveDays);
        setMoonProgress(overallProgress);
        setDisplayProgress(Math.round(overallProgress));
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [
    animate,
    animationDurationMs,
    lastActiveDays,
    moonReady,
    overallProgress,
    staticDaysLeft,
    totalDays,
  ]);

  const daysLeftDisplay = animate ? animatedDaysLeft : staticDaysLeft;

  return (
    <View style={styles.card}>
      {/* ── Days left header ── */}
      <Text style={styles.currentDayText}>
        {daysLeftDisplay}
        <Text style={styles.daysLeftText}>
          {`/${totalDays} ${t("setpersonalizedgoals.daysLeft")}`}
        </Text>
      </Text>

      <TopSpace top={20} />

      {/* ── Image ── */}
      <View
        style={{
          height: heightPercentageToDP(35),
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MoonProgress
          progressPercent={moonProgress}
          onReady={animate ? handleMoonReady : undefined}
        />
      </View>

      {/* ── Stats row ── */}
      <View style={[globalStyles.rowCenter, styles.statsRow]}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{t("setpersonalizedgoals.days")}</Text>
          <Text style={styles.statValue}>{displayLastActiveDays}</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>
            {t("setpersonalizedgoals.overall progress")}
          </Text>
          <GlowingProgressPercent percent={displayProgress} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: Colors.light.darkgrey,
    padding: 16,
    marginTop: 16,
  },
  currentDayText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  daysLeftText: {
    fontWeight: "400",
    fontFamily: fonts.primary.regular,
    fontSize: 16,
    color: Colors.light.white,
    opacity: 0.8,
    letterSpacing: 0.5,
  },
  image: {
    width: widthPercentageToDP(90),
    height: heightPercentageToDP(30),
  },
  statsRow: {
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    overflow: "visible",
  },
  statLabel: {
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
    fontSize: 14,
    color: Colors.light.white,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    fontSize: 18,
    color: Colors.light.white,
  },
  percentCanvas: {
    marginVertical: -GLOW_PAD + 2,
    marginHorizontal: -GLOW_PAD / 3,
  },
});
