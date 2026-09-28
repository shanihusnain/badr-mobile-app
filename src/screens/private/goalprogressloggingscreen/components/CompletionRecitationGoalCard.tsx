import React, { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import {
  AddLoggingFlowIcon,
  QuranRecitationBySurahFlowCardImage,
} from "@/assets/icons";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { getQuranFrameCompletionProgress } from "@/src/utils/quranGoalFrameMap";
import { GoalData } from "../../home/components/goalsData";
import QuranCompletionLoggingFlow from "../flows/QuranCompletionLoggingFlow";
import { useOptionalQuranGoalFrameContext } from "../quranGoalFrameContext";
import {
  getCompletionRecitationProgress,
  isCompletionGoalComplete,
} from "../quranRecitationCompletionData";
import type { QuranCompletionLogEntry } from "../types";
import { styles } from "./DailyProgressLogging.styles";
import { surahGoalStyles } from "./SurahRecitationGoals.styles";

type Props = {
  goalData: GoalData;
  isFlowActive: boolean;
  onStartFlow: () => void;
  onFlowClose: () => void;
  onLogComplete?: (entry: QuranCompletionLogEntry) => void;
};

/**
 * RECITATION_COMPLETION My Progress card — single AGGREGATE card from the frame
 * ("Goal: N Completions"), not mock progress.
 */
export function CompletionRecitationGoalCard({
  goalData,
  isFlowActive,
  onStartFlow,
  onFlowClose,
  onLogComplete,
}: Props) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const quranFrame = useOptionalQuranGoalFrameContext();
  const frame = quranFrame?.frame;

  const progress = useMemo(() => {
    if (frame) {
      const fromFrame = getQuranFrameCompletionProgress(frame);
      return {
        targetCompletions: fromFrame.targetCompletions,
        completedCompletions: fromFrame.completedCompletions,
        achievementPct: fromFrame.achievementPct,
      };
    }
    return {
      ...getCompletionRecitationProgress(),
      achievementPct: 0,
    };
  }, [frame]);

  const isComplete =
    (frame?.goal?.achievementPct ?? progress.achievementPct) >= 100 ||
    String(frame?.goal?.status ?? "").toUpperCase() === "COMPLETED" ||
    isCompletionGoalComplete(progress);

  const statusLabel = isComplete
    ? t("progressLogging.completionStatusComplete")
    : progress.completedCompletions > 0 || progress.achievementPct > 0
      ? t("progressLogging.surahStatusInProgress")
      : t("progressLogging.surahStatusNotStarted");

  const targetLabel = formatNumber(progress.targetCompletions);
  const frameTitle = frame?.items?.[0]?.title?.trim() || frame?.title?.trim();

  const handleFlowModeChange = (mode: "collapsed" | "active") => {
    if (mode === "collapsed") {
      onFlowClose();
    }
  };

  const canLog = !isComplete;

  return (
    <View style={isFlowActive ? styles.activeSection : undefined}>
      <View style={styles.cardAnchor}>
        {!isFlowActive ? (
          <View style={[surahGoalStyles.card, surahGoalStyles.cardActive]}>
            <View style={surahGoalStyles.bodyRow}>
              <View style={surahGoalStyles.iconCircle}>
                <QuranRecitationBySurahFlowCardImage
                  size={25}
                  color={Colors.light.white}
                />
              </View>

              <View style={surahGoalStyles.textColumn}>
                <View
                  style={[
                    surahGoalStyles.statusChip,
                    isComplete && surahGoalStyles.statusChipAchieved,
                  ]}
                >
                  <Text
                    style={[
                      surahGoalStyles.statusChipText,
                      isComplete && surahGoalStyles.statusChipTextAchieved,
                    ]}
                  >
                    {statusLabel}
                  </Text>
                </View>

                <View style={surahGoalStyles.textLines}>
                  <Text style={surahGoalStyles.surahName} numberOfLines={2}>
                    {frameTitle ||
                      t("progressLogging.completionCardTitle", {
                        target: targetLabel,
                      })}
                  </Text>
                  {!frameTitle || !/\(\s*total\b/i.test(frameTitle) ? (
                    <Text style={surahGoalStyles.metaRegular}>
                      {`(total `}
                      <Text style={surahGoalStyles.metaBold}>{targetLabel}</Text>
                      {` ${t("progressLogging.unitCompletions")})`}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>

            <View style={surahGoalStyles.footerRow} />

            {canLog ? (
              <TouchableOpacity
                style={surahGoalStyles.addButtonIconOnly}
                onPress={onStartFlow}
                activeOpacity={0.8}
              >
                <AddLoggingFlowIcon size={32} />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <QuranCompletionLoggingFlow
            goalData={goalData}
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
