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
    switch (goal.status) {
      case "not-started":
        return t("progressLogging.surahStatusNotStarted");
      case "in-progress":
        return t("progressLogging.surahStatusInProgress");
      case "completed":
        return t("progressLogging.surahStatusCompleted");
    }
  }, [goal.status, t]);

  const progressText = t("progressLogging.memorisationCardProgress", {
    memorized: formatNumber(goal.memorizedAyahs),
    total: formatNumber(goal.totalAyahs),
    percent: formatNumber(goal.progressPercentage),
  });

  const handleLogProgress = () => {
    onStartFlow(goal.id);
  };

  const handleFlowModeChange = (mode: "collapsed" | "active") => {
    if (mode === "collapsed") {
      onFlowClose();
    }
  };

  return (
    <View
      style={[
        { width: cardWidth },
        isFlowActive ? styles.activeSection : undefined,
      ]}
    >
      <View style={[styles.cardAnchor, { width: "100%" }]}>
        {isFlowActive && (
          <Pressable style={styles.backdrop} onPress={onFlowClose} />
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
              <Text
                style={[
                  surahGoalStyles.frequencyText,
                  { fontSize: 12, marginTop: 2 },
                ]}
                numberOfLines={2}
              >
                {goal.rangeLabel}
              </Text>
              <Text style={surahGoalStyles.frequencyText}>{progressText}</Text>
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={handleLogProgress}
              activeOpacity={0.8}
              disabled={goal.completed}
            >
              <Ionicons name="add" size={22} color={Colors.light.white} />
            </TouchableOpacity>
          </View>
        ) : (
          <QuranMemorisationHizbLoggingFlow
            goalData={goalData}
            preselectedHizbId={goal.id}
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
