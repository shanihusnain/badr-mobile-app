import React, { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import {
  AddLoggingFlowIcon,
  QuranRecitationBySurahFlowCardImage,
} from "@/assets/icons";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { quranFrameShowsInsights } from "@/src/utils/quranGoalFrameMap";
import { stripEnglishParenthetical } from "@/src/utils/quranGoalMap";
import { GoalData } from "../../home/components/goalsData";
import QuranRecitationLoggingFlow from "../flows/QuranRecitationLoggingFlow";
import { useOptionalQuranGoalFrameContext } from "../quranGoalFrameContext";
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
  const quranFrame = useOptionalQuranGoalFrameContext();
  const showInsights = quranFrame?.frame
    ? quranFrameShowsInsights(quranFrame.frame)
    : false;
  const isFullyAchieved =
    (quranFrame?.frame?.goal.achievementPct ?? 0) >= 100 ||
    goal.completed === true ||
    goal.status === "achieved";

  const statusLabel = useMemo(() => {
    if (goal.pillLabel?.trim()) return goal.pillLabel.trim();
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
  }, [formatNumber, goal.achievementPercent, goal.pillLabel, goal.status, t]);

  const quantityLabel = formatNumber(goal.quantity);
  const cycleTotalLabel = formatNumber(goal.cycleTotal);
  const fallbackSubtitle = goal.subtitle?.trim() || "";

  const frequencyLine = t(
    goal.frequency === "daily"
      ? "progressLogging.surahTimesDaily"
      : "progressLogging.surahTimesWeekly",
    { count: quantityLabel },
  );

  const handleLogProgress = () => {
    onStartFlow(goal.id);
  };

  const handleFlowModeChange = (mode: "collapsed" | "active") => {
    if (mode === "collapsed") {
      onFlowClose();
    }
  };

  const canLog = goal.canLog !== false && !isFullyAchieved;

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
                <QuranRecitationBySurahFlowCardImage
                  size={26}
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
                  <Text style={surahGoalStyles.surahName} numberOfLines={2}>
                    {t("progressLogging.surahNameLabel", {
                      name: stripEnglishParenthetical(goal.surahName),
                    })}
                  </Text>
                  {fallbackSubtitle ? (
                    <Text style={surahGoalStyles.metaRegular}>
                      {fallbackSubtitle}
                    </Text>
                  ) : (
                    <>
                      <Text style={surahGoalStyles.metaRegular}>
                        {frequencyLine.includes(quantityLabel) ? (
                          <>
                            {frequencyLine.slice(
                              0,
                              frequencyLine.indexOf(quantityLabel),
                            )}
                            <Text style={surahGoalStyles.metaBold}>
                              {quantityLabel}
                            </Text>
                            {frequencyLine.slice(
                              frequencyLine.indexOf(quantityLabel) +
                                quantityLabel.length,
                            )}
                          </>
                        ) : (
                          frequencyLine
                        )}
                      </Text>
                      <Text style={surahGoalStyles.metaRegular}>
                        {`(total `}
                        <Text style={surahGoalStyles.metaBold}>
                          {cycleTotalLabel}
                        </Text>
                        {` ${t("progressLogging.unitRecitations")})`}
                      </Text>
                    </>
                  )}
                </View>
              </View>
            </View>

            <View style={surahGoalStyles.footerRow}>
              {showInsights ? (
                <TouchableOpacity
                  style={surahGoalStyles.insightsBtn}
                  onPress={() => quranFrame?.openInsights?.()}
                  activeOpacity={0.8}
                >
                  <Text style={surahGoalStyles.insightsText}>
                    {t("progressLogging.viewInsights")}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={22}
                    color={Colors.light.white}
                  />
                </TouchableOpacity>
              ) : null}
            </View>

            {canLog ? (
              <TouchableOpacity
                style={[
                  surahGoalStyles.addButtonIconOnly,
                  isFullyAchieved && surahGoalStyles.addButtonDisabled,
                ]}
                onPress={handleLogProgress}
                activeOpacity={0.8}
                disabled={isFullyAchieved}
              >
                <AddLoggingFlowIcon size={32} />
              </TouchableOpacity>
            ) : null}
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
