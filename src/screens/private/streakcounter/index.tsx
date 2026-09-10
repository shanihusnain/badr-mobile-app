import React from "react";
import { View, Text, ScrollView } from "react-native";
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

export default function StreakCounter() {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const styles = createStyles();
  const router = useRouter();

  return (
    <BlackScreenWrapper>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Main Center Hero Section */}
        <View style={styles.heroSection}>
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <View style={{ position: "absolute" }}>
              <Svg height="300" width="300" viewBox="0 0 300 300">
                <Defs>
                  <RadialGradient id="glow" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
                    <Stop offset="0%" stopColor="#FFAA00" stopOpacity="0.35" />
                    <Stop offset="100%" stopColor="#FFAA00" stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Rect x="0" y="0" width="300" height="300" fill="url(#glow)" />
              </Svg>
            </View>
            <FlashIcon size={120} />
          </View>
          <Text style={styles.streakNumber}>{localizeNumber("205", lng)}</Text>
          <Text style={styles.streakSublabel}>{t("streakCounter.title")}</Text>
        </View>

        {/* 3. Horizontal Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Column 1 */}
          <View style={styles.statsColumn}>
            <Text style={styles.statsValueLight}>
              {t("streakCounter.startedDate")}
            </Text>
            <Text style={styles.statsLabel}>
              {t("streakCounter.streakStarted")}
            </Text>
          </View>

          {/* Vertical Divider */}
          <View style={styles.verticalDivider} />

          {/* Column 2 */}
          <View style={styles.statsColumn}>
            <Text style={styles.statsValue}>
              {t("streakCounter.topPercentage")}
            </Text>
            <Text style={styles.statsLabel}>{t("streakCounter.badr")}</Text>
          </View>

          {/* Vertical Divider */}
          <View style={styles.verticalDivider} />

          {/* Column 3 */}
          <View style={styles.statsColumn}>
            <Text style={styles.statsValue}>{localizeNumber("391", lng)}</Text>
            <Text style={styles.statsLabel}>
              {t("streakCounter.maxStreak")}
            </Text>
          </View>
        </View>

        {/* 4. This Week Tracker Container */}
        <View style={styles.thisWeekContainer}>
          <Text style={styles.thisWeekHeader}>
            {t("streakCounter.thisWeek")}
          </Text>
          <View style={styles.daysRow}>
            {(
              t("streakCounter.weekDays", { returnObjects: true }) as string[]
            ).map((day, index) => {
              const isCompleted = index < 3;
              return (
                <View key={day} style={styles.dayColumn}>
                  <Text style={styles.dayText}>{day}</Text>
                  {isCompleted ? (
                    <FlashIcon size={18} />
                  ) : (
                    <View style={styles.dayCircle} />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* 5. Milestone Tracker Container */}
        <View style={styles.milestoneContainer}>
          {/* Left Circle */}
          <View style={styles.milestoneLeftCircle}>
            <View style={styles.glowWrapper}>
              <Svg height="80" width="80" viewBox="0 0 80 80" style={{ position: "absolute" }}>
                <Defs>
                  <RadialGradient id="glowSmall" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
                    <Stop offset="0%" stopColor="#FFAA00" stopOpacity="0.4" />
                    <Stop offset="100%" stopColor="#FFAA00" stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Rect x="0" y="0" width="80" height="80" fill="url(#glowSmall)" />
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
            {t("streakCounter.consistencyHeader")}
          </Text>
          <Text style={styles.consistencyBody}>
            Your daily commitment to logging on{" "}
            <Text style={styles.badrText}>Badr</Text>
            {" "}is more than a routine—it's a step toward spiritual growth, bringing you closer to your goals, strengthening worship, and deepening your connection with Allah.
          </Text>
        </View>
      </ScrollView>
    </BlackScreenWrapper>
  );
}
