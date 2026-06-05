import React from "react";
import { View, Text, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import BackButton from "@/components/atoms/Backbutton";
import createStyles from "./style";
import { useTranslation } from "react-i18next";
import { localizeNumber } from "@/src/utils/localizeNumbers";

export default function StreakCounter() {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const styles = createStyles();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <BackButton onPress={() => router.back()} />
        </View>
        <Text style={styles.headerTitle}>{t("streakCounter.title")}</Text>
        <View style={styles.headerRight}>
          <View style={styles.infoIconContainer}>
            <AntDesign name="info-circle" size={24} color="white" />
          </View>
        </View>
      </View>

      {/* 2. Main Center Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.streakNumber}>{localizeNumber("205", lng)}</Text>
        <Text style={styles.streakSublabel}>{t("streakCounter.title")}</Text>
      </View>

      {/* 3. Horizontal Stats Grid (Bottom Section) */}
      <View style={styles.statsGrid}>
        {/* Column 1 */}
        <View style={styles.statsColumn}>
          <Text style={styles.statsValueLight}>{t("streakCounter.startedDate")}</Text>
          <Text style={styles.statsLabel}>{t("streakCounter.streakStarted")}</Text>
        </View>

        {/* Vertical Divider */}
        <View style={styles.verticalDivider} />

        {/* Column 2 */}
        <View style={styles.statsColumn}>
          <Text style={styles.statsValue}>{t("streakCounter.topPercentage")}</Text>
          <Text style={styles.statsLabel}>{t("streakCounter.badr")}</Text>
        </View>

        {/* Vertical Divider */}
        <View style={styles.verticalDivider} />

        {/* Column 3 */}
        <View style={styles.statsColumn}>
          <Text style={styles.statsValue}>{localizeNumber("391", lng)}</Text>
          <Text style={styles.statsLabel}>{t("streakCounter.maxStreak")}</Text>
        </View>
      </View>

      {/* 4. This Week Tracker Container */}
      <View style={styles.thisWeekContainer}>
        <Text style={styles.thisWeekHeader}>{t("streakCounter.thisWeek")}</Text>
        <View style={styles.daysRow}>
          {(t("streakCounter.weekDays", { returnObjects: true }) as string[]).map((day) => (
            <Text key={day} style={styles.dayText}>{day}</Text>
          ))}
        </View>
      </View>

      {/* 5. Milestone Tracker Container */}
      <View style={styles.milestoneContainer}>
        {/* Left Circle */}
        <View style={styles.milestoneLeftCircle} />

        {/* Center Column */}
        <View style={styles.milestoneCenterColumn}>
          <Text style={styles.milestoneDays}>
            {t("streakCounter.moreDays", { count: localizeNumber("160", lng) })}
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
        <View style={styles.milestoneRightCircle} />
      </View>

      {/* 6. Consistency Container */}
      <View style={styles.consistencyContainer}>
        <Text style={styles.consistencyHeader}>
          {t("streakCounter.consistencyHeader")}
        </Text>
        <Text style={styles.consistencyBody}>
          {t("streakCounter.consistencyBody")}
        </Text>
      </View>
    </SafeAreaView>
  );
}
