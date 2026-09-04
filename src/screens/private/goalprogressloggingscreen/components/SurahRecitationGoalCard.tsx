import React, { useMemo } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import { QuranRecitationBySurahFlowCardImage } from "@/assets/icons";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { GoalData } from "../../home/components/goalsData";
import QuranRecitationLoggingFlow from "../flows/QuranRecitationLoggingFlow";
import {
  toSurahTargetConfig,
  type SurahRecitationGoal,
} from "../quranRecitationSurahGoals";
import type { QuranRecitationLogEntry } from "../types";
import { FLOW_CARD_HEIGHT, styles } from "./DailyProgressLogging.styles";
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

  const quantityLabel = formatNumber(goal.quantity);
  const cycleTotalLabel = formatNumber(goal.cycleTotal);

  const frequencyLine = t(
    goal.frequency === "daily"
      ? "progressLogging.surahTimesDaily"
      : "progressLogging.surahTimesWeekly",
    { count: quantityLabel },
  );

  const totalLine = `(${t("progressLogging.total")} ${cycleTotalLabel} ${t(
    "progressLogging.unitRecitations",
  )})`;

  const renderLineWithBoldNumber = (
    line: string,
    number: string,
    keepOnOneLine = false,
  ) => {
    const index = line.indexOf(number);
    if (index < 0) {
      return (
        <Text
          style={surahGoalStyles.metaRegular}
          numberOfLines={keepOnOneLine ? 1 : undefined}
          adjustsFontSizeToFit={keepOnOneLine}
          minimumFontScale={0.85}
        >
          {line}
        </Text>
      );
    }

    return (
      <Text
        style={surahGoalStyles.metaText}
        numberOfLines={keepOnOneLine ? 1 : undefined}
        adjustsFontSizeToFit={keepOnOneLine}
        minimumFontScale={0.85}
      >
        <Text style={surahGoalStyles.metaRegular}>
          {line.slice(0, index)}
        </Text>
        <Text style={surahGoalStyles.metaBold}>{number}</Text>
        <Text style={surahGoalStyles.metaRegular}>
          {line.slice(index + number.length)}
        </Text>
      </Text>
    );
  };

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
        { width: cardWidth, height: FLOW_CARD_HEIGHT },
        isFlowActive ? styles.activeSection : undefined,
      ]}
    >
      <View style={surahGoalStyles.cardAnchor}>
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
              isInView
                ? surahGoalStyles.cardActive
                : surahGoalStyles.cardInactive,
            ]}
          >
            <View style={surahGoalStyles.cardContent}>
              <View style={surahGoalStyles.bodyRow}>
                <View style={surahGoalStyles.iconCircle}>
                  <QuranRecitationBySurahFlowCardImage
                    size={20}
                    color={Colors.light.white}
                  />
                </View>

                <View style={surahGoalStyles.textColumn}>
                  <View style={surahGoalStyles.statusChip}>
                    <Text style={surahGoalStyles.statusChipText}>
                      {statusLabel}
                    </Text>
                  </View>

                  <View style={surahGoalStyles.textLines}>
                    <Text style={surahGoalStyles.surahName}>
                      {t("progressLogging.surahNameLabel", {
                        name: goal.surahName,
                      })}
                    </Text>

                    {renderLineWithBoldNumber(frequencyLine, quantityLabel)}
                    {renderLineWithBoldNumber(
                      totalLine,
                      cycleTotalLabel,
                      true,
                    )}
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={surahGoalStyles.addButton}
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
