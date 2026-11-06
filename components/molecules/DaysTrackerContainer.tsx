import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTranslation } from "react-i18next";
import { localizeNumber } from "@/src/utils/localizeNumbers";
import { GlowingProgressPercent } from "@/components/atoms/GlowingProgressPercent";
import { MoonProgress } from "@/components/atoms/MoonProgress";
import type { HomeMoonCard } from "@/src/api/queries/useGetDashboardDataForDate";

interface DaysTrackerContainerProps {
  isBottomSheetView?: boolean;
  /** Dashboard `moonCard` — drives labels + moon fill animation. */
  moonCard?: HomeMoonCard | null;
  /** Duration for moon fill animation when overallPct changes. */
  animationDurationMs?: number;
  /** Opens details — attached to text rows only so Rive is never wrapped. */
  onPress?: () => void;
  /** Sheet copy from `/home/moon` — overrides default i18n when provided. */
  committedTitle?: string | null;
  message?: string | null;
}

const TOTAL_DAYS_FALLBACK = 28;
const CURRENT_DAY_FALLBACK = 10;
const OVERALL_PROGRESS_FALLBACK = 0;
const DEFAULT_ANIMATION_MS = 1200;
const MOON_SIZE = 300;

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function parseDaysLeftLabel(label: string | undefined): {
  left: string;
  rest: string;
} | null {
  const trimmed = label?.trim() ?? "";
  if (!trimmed) return null;
  const match = trimmed.match(/^(\d+)\s*(\/.*)$/);
  if (!match) return null;
  return { left: match[1], rest: match[2] };
}

export const DaysTrackerContainer: React.FC<DaysTrackerContainerProps> = ({
  isBottomSheetView = false,
  moonCard = null,
  animationDurationMs = DEFAULT_ANIMATION_MS,
  onPress,
  committedTitle = null,
  message = null,
}) => {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;

  const daysLeftLabel = moonCard?.daysLeftLabel?.trim() ?? "";
  const dayLabel = moonCard?.dayLabel?.trim() || t("daysTracker.day");
  const dayValue =
    typeof moonCard?.day === "number" && Number.isFinite(moonCard.day)
      ? Math.max(0, Math.round(moonCard.day))
      : CURRENT_DAY_FALLBACK;
  const overallProgressLabel =
    moonCard?.overallProgressLabel?.trim() || t("daysTracker.overallProgress");
  const targetProgress = clampPercent(
    Number(moonCard?.overallPct ?? OVERALL_PROGRESS_FALLBACK),
  );

  const parsedDaysLeft = useMemo(
    () => parseDaysLeftLabel(daysLeftLabel),
    [daysLeftLabel],
  );

  const [moonProgress, setMoonProgress] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [moonSide, setMoonSide] = useState(MOON_SIZE);

  useEffect(() => {
    const fromProgress = 0;
    const toProgress = targetProgress;
    let frameId = 0;
    let startTs: number | null = null;

    setMoonProgress(0);
    setDisplayProgress(0);

    const tick = (now: number) => {
      if (startTs == null) startTs = now;
      const raw = Math.min(1, (now - startTs) / animationDurationMs);
      const e = easeOutCubic(raw);
      const next = fromProgress + (toProgress - fromProgress) * e;
      setMoonProgress(next);
      setDisplayProgress(Math.round(next));

      if (raw < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        setMoonProgress(toProgress);
        setDisplayProgress(Math.round(toProgress));
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [animationDurationMs, targetProgress]);

  const localizedDay = localizeNumber(String(dayValue), lng);
  const localizedProgress = localizeNumber(String(displayProgress), lng);
  const localizedTotalFallback = localizeNumber(
    String(TOTAL_DAYS_FALLBACK),
    lng,
  );

  const header = (
    <View style={styles.daysHeaderWrapper}>
      {parsedDaysLeft ? (
        <>
          <Text style={styles.daysNumberBold}>
            {localizeNumber(parsedDaysLeft.left, lng)}
          </Text>
          <Text style={styles.daysNumberRegular}>{parsedDaysLeft.rest}</Text>
        </>
      ) : daysLeftLabel ? (
        <Text style={styles.daysNumberRegular}>{daysLeftLabel}</Text>
      ) : (
        <>
          <Text style={styles.daysNumberBold}>{localizedTotalFallback}</Text>
          <Text style={styles.daysNumberRegular}>
            {t("daysTracker.daysLeft", { total: localizedTotalFallback })}
          </Text>
        </>
      )}
    </View>
  );
  const footer = (
    <View style={styles.bottomInfoWrapper}>
      <View style={styles.bottomLeftSection}>
        <Text
          style={[
            styles.bottomLabel,
            {
              fontSize: 14,
              fontFamily: fonts.primary.medium,
              fontWeight: "500",
              color: Colors.light.white,
            },
          ]}
        >
          {dayLabel}
        </Text>
        <Text
          style={[
            styles.bottomValue,
            {
              color: Colors.light.white,
              fontFamily: fonts.primary.bold,
              fontWeight: "600",
              fontSize: 18,
            },
          ]}
        >
          {localizedDay}
        </Text>
      </View>

      <View style={styles.bottomRightSection}>
        <Text style={styles.bottomLabel}>{overallProgressLabel}</Text>
        <GlowingProgressPercent
          percent={displayProgress}
          label={`${localizedProgress}%`}
        />
      </View>
    </View>
  );

  return (
    <View
      style={[
        styles.daysLeftContainer,
        isBottomSheetView && styles.daysLeftContainerSheet,
      ]}
      collapsable={false}
    >
      {onPress ? <Pressable onPress={onPress}>{header}</Pressable> : header}

      {/* Match GoalProgressCard: measure area, then give Rive absolute px size. */}
      <View
        style={styles.moonContainer}
        collapsable={false}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          const side = Math.floor(Math.min(width, height));
          if (side > 0 && side !== moonSide) setMoonSide(side);
        }}
      >
        <View style={{ width: moonSide, height: moonSide }} collapsable={false}>
          {/* Same mount as Plan GoalTabContent — % size inside fixed box, no size prop. */}
          <MoonProgress progressPercent={moonProgress} />
        </View>
      </View>

      {onPress ? <Pressable onPress={onPress}>{footer}</Pressable> : footer}

      {isBottomSheetView && (
        <View style={styles.additionalTextSection}>
          <Text style={styles.textBlock1}>
            {committedTitle?.trim() ||
              t("daysTracker.committedGoals", {
                count: localizedTotalFallback,
              })}
          </Text>
          <Text style={styles.textBlock2}>
            {message?.trim() || t("daysTracker.welcomeJourney")}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  daysLeftContainer: {
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 16,
    padding: wp(5),
    alignItems: "center",
    width: "100%",
  },
  daysLeftContainerSheet: {},
  daysHeaderWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(2),
  },
  daysNumberBold: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: fonts.primary.bold,
    fontWeight: "600",
    marginRight: 2,
  },
  daysNumberRegular: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
  },
  moonContainer: {
    width: MOON_SIZE,
    height: MOON_SIZE,
    // marginVertical: hp(2),
    alignItems: "center",
    justifyContent: "center",
  },
  bottomInfoWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    width: "100%",
    // marginTop: hp(2),
  },
  bottomLeftSection: {
    alignItems: "flex-start",
  },
  bottomRightSection: {
    alignItems: "center",
  },
  bottomLabel: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    marginBottom: hp(0.5),
  },
  bottomValue: {
    color: Colors.light.grey,
    fontSize: 18,
    fontFamily: fonts.primary.bold,
    fontWeight: "600",
  },
  additionalTextSection: {
    width: "100%",
    marginTop: 16,
  },
  textBlock1: {
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 16,
    lineHeight: 16,
    letterSpacing: 0,
    color: Colors.light.white,
    marginBottom: 10,
  },
  textBlock2: {
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: 0.1,
    color: Colors.light.white,
    opacity: 0.8,
  },
});
