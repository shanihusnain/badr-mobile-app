import React from "react";
import { View, Text, ScrollView, useWindowDimensions } from "react-native";
import createStyles from "./style";
import { useTranslation } from "react-i18next";
import { localizeNumber } from "@/src/utils/localizeNumbers";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { FlashIcon } from "@/assets/icons/FlashIcon";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { useGetDayStreakDetails } from "@/src/api/queries/useGetDayStreakDetails";
import { BadarNameLogo } from "@/assets/icons";
import { LoadingComponent } from "@/components/atoms/LoadingComponent";

export default function StreakCounter({ date }: { date?: string }) {
  const { i18n } = useTranslation();
  const lng = i18n.language;
  const styles = createStyles();

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

  const { height } = useWindowDimensions();
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
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingTop: height * 0.04 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Main Center Hero Section */}
        <View style={styles.heroSection}>
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <View style={{ position: "absolute" }}>
              <Svg height="300" width="300" viewBox="0 0 300 300">
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
                    <Stop offset="0%" stopColor="#FFAA00" stopOpacity="0.35" />
                    <Stop offset="100%" stopColor="#FFAA00" stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Rect x="0" y="0" width="300" height="300" fill="url(#glow)" />
              </Svg>
            </View>
            <FlashIcon size={120} />
          </View>
          <Text style={styles.streakNumber}>
            {localizeNumber(details?.streak ?? "", lng)}
          </Text>
          <Text style={styles.streakSublabel}>{details?.dayStreakLabel}</Text>
        </View>

        {/* 3. Horizontal Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Column 1 */}
          <View style={styles.statsColumn}>
            <Text style={styles.statsValueLight}>
              {details?.started?.value}
            </Text>
            <Text style={styles.statsLabel}>{details?.started?.label}</Text>
          </View>

          {/* Vertical Divider */}
          <View style={styles.verticalDivider} />

          {/* Column 2 */}
          <View style={styles.statsColumn}>
            <Text style={styles.statsValue}>{details?.top?.value}</Text>
            <BadarNameLogo size={14} />
          </View>

          {/* Vertical Divider */}
          <View style={styles.verticalDivider} />

          {/* Column 3 */}
          <View style={styles.statsColumn}>
            <Text style={styles.statsValue}>
              {localizeNumber(details?.max?.value ?? "", lng)}
            </Text>
            <Text style={styles.statsLabel}>{details?.max?.label}</Text>
          </View>
        </View>

        {/* 4. This Week Tracker Container */}
        <View style={styles.thisWeekContainer}>
          <Text style={styles.thisWeekHeader}>{details?.thisWeek?.label}</Text>
          <View style={styles.daysRow}>
            {details?.thisWeek?.days?.map((day) => (
              <View key={day.date} style={styles.dayColumn}>
                <Text style={styles.dayText}>{day.label}</Text>
                {day.active ? (
                  <FlashIcon size={18} />
                ) : (
                  <View style={styles.dayCircle} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* 5. Milestone Tracker Container */}
        <View style={styles.milestoneContainer}>
          {/* Left Circle */}
          <View style={styles.milestoneLeftCircle}>
            <View style={styles.glowWrapper}>
              <Svg
                height="80"
                width="80"
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
            <FlashIcon size={34} />
            <Text style={styles.milestoneCircleText}>
              {localizeNumber(milestone?.current ?? "", lng)}
            </Text>
          </View>

          {/* Center Column */}
          <View style={styles.milestoneCenterColumn}>
            <Text style={styles.milestoneDays}>
              {milestone?.remainingLabel}
            </Text>

            {/* Progress Line */}
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

          {/* Right Circle */}
          <View style={styles.milestoneRightCircle}>
            <FlashIcon size={34} fillColor="#3a3a3c" strokeColor="#5c5c5e" />
            <Text style={styles.milestoneCircleText}>
              {localizeNumber(milestone?.next ?? "", lng)}
            </Text>
          </View>
        </View>

        {/* 6. Consistency Container */}
        <View style={styles.consistencyContainer}>
          <Text style={styles.consistencyHeader}>{details?.card?.title}</Text>
          <Text style={styles.consistencyBody}>
            {details?.card?.description}
          </Text>
        </View>
      </ScrollView>
    </BlackScreenWrapper>
  );
}
