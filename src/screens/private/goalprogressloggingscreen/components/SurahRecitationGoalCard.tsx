import React, { useMemo } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { GoalData } from "../../home/components/goalsData";
import QuranRecitationLoggingFlow from "../flows/QuranRecitationLoggingFlow";
import {
  toSurahTargetConfig,
  type SurahRecitationGoal,
} from "../quranRecitationSurahGoals";
import type { QuranRecitationLogEntry } from "../types";
import { styles } from "./DailyProgressLogging.styles";
import { surahGoalStyles } from "./SurahRecitationGoals.styles";

type Props = {
  goal: SurahRecitationGoal;
  goalData: GoalData;
  cardWidth: number;
  isInView: boolean;
  isFlowActive: boolean;
  onStartFlow: (goalId: string) => void;
  onFlowClose: () => void;
  onLogComplete?: (entry: QuranRecitationLogEntry) => void;
};

export function SurahRecitationGoalCard({
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
      case "achieved":
        return t("progressLogging.surahStatusAchieved", {
          percent: formatNumber(goal.achievementPercent ?? 0),
        });
    }
  }, [formatNumber, goal.achievementPercent, goal.status, t]);

  const frequencyText = t(
    goal.frequency === "daily"
      ? "progressLogging.surahTimesDaily"
      : "progressLogging.surahTimesWeekly",
    { count: formatNumber(goal.quantity) },
  );

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

              <Text style={surahGoalStyles.surahName}>
                {t("progressLogging.surahNameLabel", { name: goal.surahName })}
              </Text>
              <Text style={surahGoalStyles.frequencyText}>{frequencyText}</Text>
              <Text style={surahGoalStyles.totalText}>
                {t("progressLogging.surahTotalRecitations", {
                  total: formatNumber(goal.cycleTotal),
                })}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={handleLogProgress}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={22} color={Colors.light.white} />
            </TouchableOpacity>
          </View>
        ) : (
          <QuranRecitationLoggingFlow
            goalData={goalData}
            targetConfig={toSurahTargetConfig(goal)}
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
