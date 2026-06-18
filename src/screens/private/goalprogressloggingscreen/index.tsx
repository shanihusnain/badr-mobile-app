import React from "react";
import { View, Text, ScrollView } from "react-native";
import { TaperedCircleBorder } from "@/components/atoms/TaperedCircleBorder";
import { Colors } from "@/constants/theme";
import { getResolvedGoalById, GoalId } from "../home/components/goalsData";
import { styles } from "./styles";
import { useRouter } from "expo-router";
import DailyProgressLogging from "./components/DailyProgressLogging";
import { useTranslation } from "react-i18next";
import { WeeklyProgressDashboard } from "@/components/molecules/WeeklyProgressDashboard";
import { PrayerProgressTrackerRing } from "@/components/molecules/PrayerProgressTrackerRing";
import type { DayProgress } from "@/components/molecules/WeeklyProgressDashboard";
import { LoggingFlowSlot } from "./components/LoggingFlowSlot";
import type { ProgressLogEntry } from "./types";
import { WeeklyProgressSection } from "./components/WeeklyProgressSection";
import { PastAchievementsSection } from "./components/PastAchievementsSection";

interface GoalProgressLoggingScreenProps {
  goalId: string;
}

export const GoalProgressLoggingScreen = ({
  goalId: goalIdParam,
}: GoalProgressLoggingScreenProps) => {
  const router = useRouter();
  const { t } = useTranslation();

  // Extract and validate goalId
  const goalId = (goalIdParam || "") as GoalId;
  console.log("goalId", goalId);
  const goalData = getResolvedGoalById(goalId);
  console.log("goalData", goalData);
  if (!goalData) {
    return (
      <View style={styles.container}>
        <View style={styles.container}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Goal data not found: {goalId}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const percentageNum = goalData.percentage.replace("%", "");
  const cleanLabel = goalData.label.startsWith("/")
    ? goalData.label.substring(1)
    : goalData.label;

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case "PRAYER":
        return Colors.light.ringPrayer;
      case "QURAN":
        return Colors.light.ringQuran;
      case "FASTING":
        return Colors.light.green;
      case "SADAQAH":
        return Colors.light.ringSadaqah;
      default:
        return Colors.light.green;
    }
  };

  const categoryColor = getCategoryColor(goalData.category);
  console.log("categoryColor", getCategoryColor(goalData.category));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.goalInfoContainer}>
        <TaperedCircleBorder
          percentage={goalData.percentage}
          progressColor={categoryColor}
          borderColor={Colors.light.dullWhiteOpacity}
          size={174}
        >
          <View style={styles.largeCircleInner}>
            <Text style={styles.circleGoalText}>
              {t("homeScreen.weeklyProgress_goalLabel", { label: cleanLabel })}
            </Text>
            <View style={styles.circlePercentRow}>
              <Text style={styles.circlePercentNumber}>{percentageNum}</Text>
              <Text style={styles.circlePercentSymbol}>%</Text>
            </View>
          </View>
        </TaperedCircleBorder>
      </View>

      <LoggingFlowSlot
        goalData={goalData}
        onLogComplete={(entry: ProgressLogEntry) => {
          console.log("Logged progress:", entry);
        }}
      />

      {/* Weekly progress dashboard — always visible, never hidden by modal */}
      <View style={styles.weeklyDashboardWrapper}>
        <WeeklyProgressSection goalData={goalData} />
      </View>

      <View style={styles.weeklyDashboardWrapper}>
        <PastAchievementsSection goalData={goalData} />
      </View>
    </ScrollView>
  );
};
