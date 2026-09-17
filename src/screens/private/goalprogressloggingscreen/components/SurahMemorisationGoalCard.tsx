import React, { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import {
  AddLoggingFlowIcon,
  QuranMemorizationIcon,
} from "@/assets/icons";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { GoalData } from "../../home/components/goalsData";
import QuranMemorisationLoggingFlow from "../flows/QuranMemorisationLoggingFlow";
import { type SurahMemorisationGoal } from "../quranMemorisationSurahGoals";
import type { QuranMemorisationLogEntry } from "../types";
import { FLOW_CARD_HEIGHT, styles } from "./DailyProgressLogging.styles";
import { surahGoalStyles } from "./SurahRecitationGoals.styles";
import { stripEnglishParenthetical } from "@/src/utils/quranGoalMap";

type Props = {
  goal: SurahMemorisationGoal;
  goalData: GoalData;
  cardWidth: number;
  isInView: boolean;
  isFlowActive: boolean;
  onStartFlow: (goalId: string) => void;
  onFlowClose: () => void;
  onLogComplete?: (entry: QuranMemorisationLogEntry) => void;
};

export function SurahMemorisationGoalCard({
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
      ? `(total ${formatNumber(goal.totalAyahs)} ayahs)`
      : goal.subtitle?.trim() || "";

  const totalAyahsLabel = formatNumber(goal.totalAyahs);

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
        { width: cardWidth, height: FLOW_CARD_HEIGHT },
        isFlowActive ? styles.activeSection : undefined,
      ]}
    >
      <View style={surahGoalStyles.cardAnchor}>
        {!isFlowActive ? (
          <View
            style={[
              surahGoalStyles.card,
              isInView
                ? surahGoalStyles.cardActive
                : surahGoalStyles.cardInactive,
            ]}
          >
            <View style={surahGoalStyles.cardContent}>
              <View style={surahGoalStyles.bodyRow}>
                <View style={surahGoalStyles.iconCircle}>
                  <QuranMemorizationIcon
                    color={Colors.light.white}
                    size={22}
                  />
                </View>

                <View style={surahGoalStyles.textColumn}>
                  <View style={surahGoalStyles.statusChip}>
                    <Text style={surahGoalStyles.statusChipText}>
                      {statusLabel}
                    </Text>
                  </View>

              <Text style={surahGoalStyles.surahName}>
                {t("progressLogging.surahNameLabel", { name: goal.surahName })}
              </Text>
              {progressText ? (
                <Text style={surahGoalStyles.metaBold}>{progressText}</Text>
              ) : null}
            </View>

            {canLog ? (
              <TouchableOpacity
                style={surahGoalStyles.addButtonIconOnly}
                onPress={handleLogProgress}
                activeOpacity={0.8}
              >
                <AddLoggingFlowIcon size={32} />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <QuranMemorisationLoggingFlow
            goalData={goalData}
            preselectedSurahId={goal.id}
            activeSurahGoal={goal}
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
