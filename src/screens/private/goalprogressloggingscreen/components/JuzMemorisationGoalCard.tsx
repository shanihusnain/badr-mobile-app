import React, { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { AddLoggingFlowIcon, QuranMemorizationIcon } from "@/assets/icons";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { GoalData } from "../../home/components/goalsData";
import QuranMemorisationJuzLoggingFlow from "../flows/QuranMemorisationJuzLoggingFlow";
import type { JuzMemorisationGoal } from "../quranMemorisationJuzGoals";
import type { QuranMemorisationJuzLogEntry } from "../types";
import { FLOW_CARD_HEIGHT, styles } from "./DailyProgressLogging.styles";
import { surahGoalStyles } from "./SurahRecitationGoals.styles";

type Props = {
  goal: JuzMemorisationGoal;
  goalData: GoalData;
  cardWidth: number;
  isInView: boolean;
  isFlowActive: boolean;
  onStartFlow: (goalId: string) => void;
  onFlowClose: () => void;
  onLogComplete?: (entry: QuranMemorisationJuzLogEntry) => void;
};

export function JuzMemorisationGoalCard({
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

  const totalAyahsLabel = formatNumber(goal.totalAyahs);
  const showTotalAyahs = goal.totalAyahs > 0;

  /** Figma: "Juz 1 | Al-Fatiha 1:1 - Al-Baqarah 2:74" */
  const titleLabel = useMemo(() => {
    const isTotalVersesLabel = (value: string) =>
      /^\(?\s*total\b/i.test(value) || /\bverses?\s*\)?\s*$/i.test(value);

    const name = goal.juzName?.trim() || "";
    const rawRange = goal.rangeLabel?.trim() || goal.subtitle?.trim() || "";
    const range = isTotalVersesLabel(rawRange) ? "" : rawRange;

    if (name.includes("|")) {
      const [left, ...rest] = name.split("|");
      const right = rest.join("|").trim();
      if (right && !isTotalVersesLabel(right)) return name;
      return left?.trim() || name;
    }
    if (goal.displayName?.includes("|")) {
      const display = goal.displayName.trim();
      const [left, ...rest] = display.split("|");
      const right = rest.join("|").trim();
      if (right && !isTotalVersesLabel(right)) return display;
      if (left?.trim() && range) return `${left.trim()} | ${range}`;
      return left?.trim() || display;
    }
    if (name && range) return `${name} | ${range}`;
    return name || goal.displayName?.trim() || "";
  }, [
    goal.displayName,
    goal.juzName,
    goal.rangeLabel,
    goal.subtitle,
  ]);

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
            <View style={surahGoalStyles.bodyRow}>
              <View style={surahGoalStyles.iconCircle}>
                <QuranMemorizationIcon color={Colors.light.white} size={26} />
              </View>

              <View style={surahGoalStyles.textColumn}>
                <View style={surahGoalStyles.statusChip}>
                  <Text style={surahGoalStyles.statusChipText}>
                    {statusLabel}
                  </Text>
                </View>

                <View style={surahGoalStyles.textLines}>
                  <Text style={surahGoalStyles.surahName} numberOfLines={2}>
                    {titleLabel}
                  </Text>
                  {showTotalAyahs ? (
                    <Text style={surahGoalStyles.metaRegular}>
                      {t("progressLogging.memorisationJuzTotalVerses", {
                        count: totalAyahsLabel,
                      })}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>

            <View style={surahGoalStyles.footerRow} />

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
          <QuranMemorisationJuzLoggingFlow
            goalData={goalData}
            preselectedJuzId={goal.id}
            activeJuzGoal={goal}
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
