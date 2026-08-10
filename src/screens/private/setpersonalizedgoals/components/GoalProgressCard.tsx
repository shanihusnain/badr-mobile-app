import { fonts } from "@/assets/fonts";
import MoonProgress from "@/components/atoms/MoonProgress";
import { TopSpace } from "@/components/atoms/TopSpace";
import { Colors } from "@/constants/theme";
import { globalStyles } from "@/src/globalstyles/globalstyles";
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

const DEFAULT_ANIMATION_MS = 2800;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Progress % text color stages:
 * Silver (0–33) → Blue (34–66) → Gold (67–99) → Glowing Gold (100)
 */
function getProgressPercentStyle(percent: number) {
  if (percent >= 100) {
    return {
      color: Colors.light.goldenBright,
      textShadowColor: Colors.light.goldenGlow,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 10,
    };
  }
  if (percent >= 67) {
    return { color: Colors.light.gold };
  }
  if (percent >= 34) {
    return { color: Colors.light.lightblue };
  }
  return { color: Colors.light.dullWhite };
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

  const [moonReady, setMoonReady] = useState(!animate);
  const [displayCurrentDay, setDisplayCurrentDay] = useState(
    animate ? 1 : currentDay,
  );
  const [displayLastActiveDays, setDisplayLastActiveDays] = useState(
    animate ? 1 : lastActiveDays,
  );
  const [displayProgress, setDisplayProgress] = useState(
    animate ? 0 : overallProgress,
  );

  const handleMoonReady = useCallback(() => {
    setMoonReady(true);
  }, []);

  useEffect(() => {
    if (!animate) {
      setMoonReady(true);
      setDisplayCurrentDay(currentDay);
      setDisplayLastActiveDays(lastActiveDays);
      setDisplayProgress(overallProgress);
      return;
    }

    // Hold at start values until the Rive moon is ready to follow progress.
    if (!moonReady) {
      setDisplayCurrentDay(1);
      setDisplayLastActiveDays(1);
      setDisplayProgress(0);
      return;
    }

    const fromDay = 1;
    const fromProgress = 0;
    let frameId = 0;
    let startTs: number | null = null;

    const tick = (now: number) => {
      if (startTs == null) startTs = now;
      const raw = Math.min(1, (now - startTs) / animationDurationMs);
      const e = easeOutCubic(raw);

      setDisplayCurrentDay(Math.round(fromDay + (currentDay - fromDay) * e));
      setDisplayLastActiveDays(
        Math.round(fromDay + (lastActiveDays - fromDay) * e),
      );
      setDisplayProgress(
        Math.round(fromProgress + (overallProgress - fromProgress) * e),
      );

      if (raw < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        setDisplayCurrentDay(currentDay);
        setDisplayLastActiveDays(lastActiveDays);
        setDisplayProgress(overallProgress);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [
    animate,
    animationDurationMs,
    currentDay,
    lastActiveDays,
    moonReady,
    overallProgress,
  ]);

  return (
    <View style={styles.card}>
      {/* ── Days left header ── */}
      <Text style={styles.currentDayText}>
        {displayCurrentDay}
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
          progressPercent={displayProgress}
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
          <Text
            style={[styles.statValue, getProgressPercentStyle(displayProgress)]}
          >{`${displayProgress}%`}</Text>
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
});
