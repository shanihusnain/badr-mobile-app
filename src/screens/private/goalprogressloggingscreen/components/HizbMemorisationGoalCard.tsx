import React, { useMemo } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { GoalData } from "../../home/components/goalsData";
import QuranMemorisationHizbLoggingFlow from "../flows/QuranMemorisationHizbLoggingFlow";
import type { HizbMemorisationGoal } from "../quranMemorisationHizbGoals";
import type { QuranMemorisationHizbLogEntry } from "../types";
import { styles } from "./DailyProgressLogging.styles";
import { surahGoalStyles } from "./SurahRecitationGoals.styles";

type Props = {
  goal: HizbMemorisationGoal;
  goalData: GoalData;
  cardWidth: number;
  isInView: boolean;
  isFlowActive: boolean;
  onStartFlow: (goalId: string) => void;
  onFlowClose: () => void;
  onLogComplete?: (entry: QuranMemorisationHizbLogEntry) => void;
};

export function HizbMemorisationGoalCard({
  goal,
  goalData,
  cardWidth,
  isInView,
  isFlowActive,
  onStartFlow,
  onFlowClose,
  onLogComplete,
}: Props) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();

  const statusLabel = useMemo(() => {
    if (goal.pillLabel?.trim()) return goal.pillLabel.trim();
    switch (goal.status) {
      case "not-started":
        return t("progressLogging.surahStatusNotStarted");
      case "in-progress":
        return t("progressLogging.surahStatusInProgress");
      case "completed":
        return t("progressLogging.surahStatusCompleted");
    }
  }, [goal.pillLabel, goal.status, t]);

  const progressText =
    goal.totalAyahs > 0
      ? t("progressLogging.memorisationCardProgress", {
          memorized: formatNumber(goal.memorizedAyahs),
          total: formatNumber(goal.totalAyahs),
          percent: formatNumber(goal.progressPercentage),
        })
      : goal.subtitle?.trim() || goal.rangeLabel || "";

  const handleLogProgress = () => {
    onStartFlow(goal.id);
  };

  const handleFlowModeChange = (mode: "collapsed" | "active") => {
    if (mode === "collapsed") {
      onFlowClose();
    }
  };

  const canLog = goal.canLog !== false && !goal.completed;

  return (
    <View
      style={[
        { width: cardWidth },
        isFlowActive ? styles.activeSection : undefined,
      ]}
    >
      <View style={[styles.cardAnchor, { width: "100%" }]}>
        {isFlowActive && (
          <Pressable style={styles.backdrop} />
        )}
        {isFlowActive && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onFlowClose}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={20} color={Colors.light.white} />
          </TouchableOpacity>
        )}

        {!isFlowActive ? (
          <View
            style={[
              surahGoalStyles.card,
              { width: "100%" },
              isInView ? surahGoalStyles.cardActive : surahGoalStyles.cardInactive,
            ]}
          >
            <View style={surahGoalStyles.cardContent}>
              <View style={surahGoalStyles.statusChip}>
                <Text style={surahGoalStyles.statusChipText}>{statusLabel}</Text>
              </View>

              <Text style={surahGoalStyles.surahName}>{goal.hizbName}</Text>
              {goal.rangeLabel ? (
                <Text
                  style={[
                    surahGoalStyles.frequencyText,
                    { fontSize: 12, marginTop: 2 },
                  ]}
                  numberOfLines={2}
                >
                  {goal.rangeLabel}
                </Text>
              ) : null}
              {progressText ? (
                <Text style={surahGoalStyles.frequencyText}>{progressText}</Text>
              ) : null}
            </View>

            {canLog ? (
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleLogProgress}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={22} color={Colors.light.white} />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <QuranMemorisationHizbLoggingFlow
            goalData={goalData}
            preselectedHizbId={goal.id}
            activeHizbGoal={goal}
            hideCollapsedSummary
            embedded
            suppressOverlay
            flowMode="active"
            onFlowModeChange={handleFlowModeChange}
            onLogComplete={onLogComplete}
          />
        )}
      </View>
    </View>
  );
}
