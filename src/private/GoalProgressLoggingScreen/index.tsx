import React from "react";
import { View, Text } from "react-native";
import { TaperedCircleBorder } from "@/components/atoms/TaperedCircleBorder";
import { Colors } from "@/constants/theme";
import { getGoalById, GoalId } from "../home/components/goalsData";
import { styles } from "./styles";
import Header from "@/components/Header";
import { useRouter } from "expo-router";
import DailyProgressLogging from "./components/DailyProgressLogging";
import { WeeklyProgressDashboard } from "@/components/molecules/WeeklyProgressDashboard";
import { PrayerProgressTrackerRing } from "@/components/molecules/PrayerProgressTrackerRing";
import type { DayProgress } from "@/components/molecules/WeeklyProgressDashboard";

interface GoalProgressLoggingScreenProps {
  goalId: string;
}

export const GoalProgressLoggingScreen = ({
  goalId: goalIdParam,
}: GoalProgressLoggingScreenProps) => {
  const router = useRouter();

  // Extract and validate goalId
  const goalId = (goalIdParam || "") as GoalId;
  const goalData = getGoalById(goalId);

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

  return (
    <View style={styles.container}>
      <View style={styles.scrollContent}>
        <View style={styles.goalInfoContainer}>
          <TaperedCircleBorder
            percentage={goalData.percentage}
            progressColor={categoryColor}
            borderColor={Colors.light.dullWhiteOpacity}
            size={174}
          >
            <View style={styles.largeCircleInner}>
              <Text style={styles.circleGoalText}>Goal: {cleanLabel}</Text>
              <View style={styles.circlePercentRow}>
                <Text style={styles.circlePercentNumber}>{percentageNum}</Text>
                <Text style={styles.circlePercentSymbol}>%</Text>
              </View>
            </View>
          </TaperedCircleBorder>
        </View>

        <DailyProgressLogging
          goalData={goalData}
          onLogComplete={(entry) => {
            console.log("Logged progress:", entry);
          }}
        />

        {/* Weekly progress dashboard — always visible, never hidden by modal */}
        <View style={styles.weeklyDashboardWrapper}>
          <WeeklyProgressDashboard
            renderRing={(day: DayProgress, size: number) => (
              <PrayerProgressTrackerRing
                statuses={day.statuses}
                isMenstruating={day.isMenstruating}
                size={size}
                strokeWidth={2.5}
              />
            )}
          />
        </View>
      </View>
    </View>
  );
};
