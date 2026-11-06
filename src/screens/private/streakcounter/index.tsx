import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  useWindowDimensions,
  type LayoutChangeEvent,
} from "react-native";
import createStyles from "./style";
import { useTranslation } from "react-i18next";
import { localizeNumber } from "@/src/utils/localizeNumbers";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { FlashIcon } from "@/assets/icons/FlashIcon";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { useGetDayStreakDetails } from "@/src/api/queries/useGetDayStreakDetails";
import { BadarNameLogo } from "@/assets/icons";
import { LoadingComponent } from "@/components/atoms/LoadingComponent";

/** Figma artboard. */
const DESIGN_WIDTH = 375;
/** Content stack height under header on the 812-tall frame. */
const DESIGN_CONTENT_HEIGHT = 700;
const SCALE_MIN = 0.72;
const SCALE_MAX = 1.12;

function clampScale(raw: number) {
  return Math.max(SCALE_MIN, Math.min(raw, SCALE_MAX));
}

export default function StreakCounter({ date }: { date?: string }) {
  const { i18n } = useTranslation();
  const lng = i18n.language;
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const [contentSize, setContentSize] = useState({
    width: windowWidth,
    height: Math.max(1, windowHeight * 0.85),
  });

  const scale = useMemo(() => {
    const raw = Math.min(
      contentSize.width / DESIGN_WIDTH,
      contentSize.height / DESIGN_CONTENT_HEIGHT,
    );
    return clampScale(raw);
  }, [contentSize.height, contentSize.width]);

  const styles = useMemo(() => createStyles(scale), [scale]);

  const heroGlowSize = 300 * scale;
  const heroFlashSize = 120 * scale;
  const weekFlashSize = 18 * scale;
  const milestoneFlashSize = 34 * scale;
  const milestoneGlowSize = 80 * scale;
  const badrLogoSize = 14 * scale;

  const onContentLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width <= 0 || height <= 0) return;
    setContentSize((prev) => {
      if (
        Math.abs(prev.width - width) < 0.5 &&
        Math.abs(prev.height - height) < 0.5
      ) {
        return prev;
      }
      return { width, height };
    });
  }, []);

  const { data: streakData, isLoading } = useGetDayStreakDetails(
    date ?? new Date().toISOString().split("T")[0],
  );

  const details = streakData?.data;
  const milestone = details?.milestone;
  const milestoneProgressPct = (() => {
    const current = milestone?.current ?? 0;
    const next = milestone?.next ?? 0;
    if (next <= 0) return 0;
    return Math.min(100, Math.max(0, (current / next) * 100));
  })();

  if (isLoading) {
    return (
      <BlackScreenWrapper edges={["bottom"]}>
        <View style={styles.loadingContainer}>
          <LoadingComponent size="large" />
        </View>
      </BlackScreenWrapper>
    );
  }

  return (
    <BlackScreenWrapper edges={["bottom"]}>
      <View style={{ flex: 1 }} onLayout={onContentLayout}>
        <View style={styles.container}>
          {/* Main Center Hero Section */}
          <View style={styles.heroSection}>
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <View style={{ position: "absolute" }}>
                <Svg
                  height={heroGlowSize}
                  width={heroGlowSize}
                  viewBox="0 0 300 300"
                >
                  <Defs>
                    <RadialGradient
                      id="glow"
                      cx="50%"
                      cy="50%"
                      rx="50%"
                      ry="50%"
                      fx="50%"
                      fy="50%"
                    >
                      <Stop offset="0%" stopColor="#FFAA00" stopOpacity="0.2" />
                      <Stop offset="100%" stopColor="#FFAA00" stopOpacity="0" />
                    </RadialGradient>
                  </Defs>
                  <Rect
                    x="0"
                    y="0"
                    width="300"
                    height="300"
                    fill="url(#glow)"
                  />
                </Svg>
              </View>
              <FlashIcon size={heroFlashSize} />
            </View>
            <Text style={styles.streakNumber}>
              {localizeNumber(details?.streak ?? "", lng)}
            </Text>
            <Text style={styles.streakSublabel}>{details?.dayStreakLabel}</Text>
          </View>

          {/* Horizontal Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statsColumn}>
              <Text style={styles.statsValueLight}>
                {details?.started?.value}
              </Text>
              <Text style={styles.statsLabel}>{details?.started?.label}</Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.statsColumn}>
              <Text style={styles.statsValue}>{details?.top?.value}</Text>
              <BadarNameLogo size={badrLogoSize} />
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.statsColumn}>
              <Text style={styles.statsValue}>
                {localizeNumber(details?.max?.value ?? "", lng)}
              </Text>
              <Text style={styles.statsLabel}>{details?.max?.label}</Text>
            </View>
          </View>

          {/* This Week Tracker */}
          <View style={styles.thisWeekContainer}>
            <Text style={styles.thisWeekHeader}>
              {details?.thisWeek?.label}
            </Text>
            <View style={styles.daysRow}>
              {details?.thisWeek?.days?.map((day) => (
                <View key={day.date} style={styles.dayColumn}>
                  <Text style={styles.dayText}>{day.label}</Text>
                  {day.active ? (
                    <FlashIcon size={weekFlashSize} />
                  ) : (
                    <View style={styles.dayCircle} />
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Milestone Tracker */}
          <View style={styles.milestoneContainer}>
            <View style={styles.milestoneLeftCircle}>
              <View style={styles.glowWrapper}>
                <Svg
                  height={milestoneGlowSize}
                  width={milestoneGlowSize}
                  viewBox="0 0 80 80"
                  style={{ position: "absolute" }}
                >
                  <Defs>
                    <RadialGradient
                      id="glowSmall"
                      cx="50%"
                      cy="50%"
                      rx="50%"
                      ry="50%"
                      fx="50%"
                      fy="50%"
                    >
                      <Stop offset="0%" stopColor="#FFAA00" stopOpacity="0.4" />
                      <Stop offset="100%" stopColor="#FFAA00" stopOpacity="0" />
                    </RadialGradient>
                  </Defs>
                  <Rect
                    x="0"
                    y="0"
                    width="80"
                    height="80"
                    fill="url(#glowSmall)"
                  />
                </Svg>
              </View>
              <FlashIcon size={milestoneFlashSize} />
              <Text style={styles.milestoneCircleText}>
                {localizeNumber(milestone?.current ?? "", lng)}
              </Text>
            </View>

            <View style={styles.milestoneCenterColumn}>
              <Text style={styles.milestoneDays}>
                {milestone?.remainingLabel}
              </Text>

              <View style={styles.progressLineBg}>
                <View
                  style={[
                    styles.progressLineFill,
                    { width: `${milestoneProgressPct}%` },
                  ]}
                />
              </View>

              <Text style={styles.milestoneSubtext} numberOfLines={2}>
                {milestone?.suffix}
              </Text>
            </View>

            <View style={styles.milestoneRightCircle}>
              <FlashIcon
                size={milestoneFlashSize}
                fillColor="#3a3a3c"
                strokeColor="#5c5c5e"
              />
              <Text style={styles.milestoneCircleText}>
                {localizeNumber(milestone?.next ?? "", lng)}
              </Text>
            </View>
          </View>

          {/* Consistency Card */}
          <View style={styles.consistencyContainer}>
            <Text style={styles.consistencyHeader}>{details?.card?.title}</Text>
            <Text style={styles.consistencyBody}>
              {details?.card?.description}
            </Text>
          </View>
        </View>
      </View>
    </BlackScreenWrapper>
  );
}
