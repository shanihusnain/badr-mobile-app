import React from "react";
import { View, Text, ScrollView, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import BackButton from "@/components/atoms/Backbutton";
import createStyles from "./style";
import { useTranslation } from "react-i18next";
import { localizeNumber } from "@/src/utils/localizeNumbers";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { FlashIcon } from "@/assets/icons/FlashIcon";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { useGetDayStreakDetails } from "@/src/api/queries/useGetDayStreakDetails";
import { BadarNameLogo } from "@/assets/icons";
import { TaperedCircleBorder } from "@/components/atoms/TaperedCircleBorder";
import { Colors } from "@/constants/theme";
export default function StreakCounter({ date }: { date?: string }) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const styles = createStyles();
  const router = useRouter();

  const { data: streakData, isLoading } = useGetDayStreakDetails(
    date ?? new Date().toISOString().split("T")[0],
  );

  console.log(
    "the streak data we are getting in the streak counter screen is",
    streakData?.data,
  );

  const { height } = useWindowDimensions()
  if (isLoading) {
    return <TaperedCircleBorder completeIcon={null} progressColor={Colors.light.gold}
    />
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
          <Text style={styles.streakNumber}>{localizeNumber(streakData?.data?.max?.value, lng)}</Text>
          <Text style={styles.streakSublabel}>{streakData?.data?.dayStreakLabel}</Text>
        </View>

        {/* 3. Horizontal Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Column 1 */}
          <View style={styles.statsColumn}>
            <Text style={styles.statsValueLight}>
              {streakData?.data?.started?.value}
            </Text>
            <Text style={styles.statsLabel}>
              {streakData?.data?.started?.label}

            </Text>
          </View>

          {/* Vertical Divider */}
          <View style={styles.verticalDivider} />

          {/* Column 2 */}
          <View style={styles.statsColumn}>
            <Text style={styles.statsValue}>
              {streakData?.data?.top?.value}
            </Text>
            <BadarNameLogo size={14} />
          </View>

          {/* Vertical Divider */}
          <View style={styles.verticalDivider} />

          {/* Column 3 */}
          <View style={styles.statsColumn}>
            <Text style={styles.statsValue}>{localizeNumber(streakData?.data?.max?.value, lng)}</Text>
            <Text style={styles.statsLabel}>
              {streakData?.data?.max?.label}
            </Text>
          </View>
        </View>

        {/* 4. This Week Tracker Container */}
        <View style={styles.thisWeekContainer}>
          <Text style={styles.thisWeekHeader}>
            {streakData?.data?.thisWeek?.label}
          </Text>
          {/* <View style={styles.daysRow}>
            {(
              streakData?.data?.thisWeek?.days && streakData?.data?.thisWeek?.days
            )?.map((day, index) => {
              return (
                <View key={day?.label} style={styles.dayColumn}>
                  <Text style={styles.dayText}>{day?.label}</Text>
                  {day?.active ? (
                    <FlashIcon size={18} />
                  ) : (
                    <View style={styles.dayCircle} />
                  )}
                </View>
              );
            })}
          </View> */}
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
            <Text style={styles.milestoneCircleText}>205</Text>
          </View>

          {/* Center Column */}
          <View style={styles.milestoneCenterColumn}>
            <Text style={styles.milestoneDays}>
              {t("streakCounter.moreDays", {
                count: localizeNumber("160", lng),
              })}
            </Text>

            {/* Progress Line */}
            <View style={styles.progressLineBg}>
              <View style={styles.progressLineFill} />
            </View>

            <Text style={styles.milestoneSubtext}>
              {t("streakCounter.unlockMilestone")}
            </Text>
          </View>

          {/* Right Circle */}
          <View style={styles.milestoneRightCircle}>
            <FlashIcon size={34} fillColor="#3a3a3c" strokeColor="#5c5c5e" />
            <Text style={styles.milestoneCircleText}>365</Text>
          </View>
        </View>

        {/* 6. Consistency Container */}
        <View style={styles.consistencyContainer}>
          <Text style={styles.consistencyHeader}>
            {
              streakData?.data?.card?.title
            }
          </Text>
          <Text style={styles.consistencyBody}>
            {/* Your daily commitment to logging on{" "} */}
            {/* <Text style={styles.badrText}></Text>  */}
            {
              streakData?.data?.card?.description
            }
          </Text>
        </View>
      </ScrollView>
    </BlackScreenWrapper>
  );
}
