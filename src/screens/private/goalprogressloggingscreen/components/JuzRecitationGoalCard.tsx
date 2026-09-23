import React, { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import {
  AddLoggingFlowIcon,
  QuranRecitationBySurahFlowCardImage,
} from "@/assets/icons";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { GoalData } from "../../home/components/goalsData";
import QuranJuzLoggingFlow from "../flows/QuranJuzLoggingFlow";
import {
  getJuzRecitationProgress,
  isJuzGoalComplete,
} from "../quranRecitationJuzData";
import type { QuranJuzLogEntry } from "../types";
import { FLOW_CARD_HEIGHT, styles } from "./DailyProgressLogging.styles";
import { surahGoalStyles } from "./SurahRecitationGoals.styles";

type Props = {
  goalData: GoalData;
  isFlowActive: boolean;
  onStartFlow: () => void;
  onFlowClose: () => void;
  onLogComplete?: (entry: QuranJuzLogEntry) => void;
};

export function JuzRecitationGoalCard({
  goalData,
  isFlowActive,
  onStartFlow,
  onFlowClose,
  onLogComplete,
}: Props) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();

  const progress = useMemo(() => getJuzRecitationProgress(), []);
  const isComplete = isJuzGoalComplete(progress);

  const statusLabel = isComplete
    ? t("progressLogging.completionStatusComplete")
    : t("progressLogging.surahStatusInProgress");

  const completedLabel = formatNumber(progress.completedJuzCount);
  const targetLabel = formatNumber(progress.targetJuzCount);

  const handleFlowModeChange = (mode: "collapsed" | "active") => {
    if (mode === "collapsed") {
      onFlowClose();
    }
  };

  const canLog = !isComplete;

  return (
    <View
      style={[
        { width: "100%", height: FLOW_CARD_HEIGHT },
        isFlowActive ? styles.activeSection : undefined,
      ]}
    >
      <View style={[surahGoalStyles.cardAnchor, { width: "100%" }]}>
        {!isFlowActive ? (
          <View
            style={[
              surahGoalStyles.card,
              surahGoalStyles.cardActive,
              { width: "100%" },
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
                    {t("progressLogging.juzCardTitle", {
                      completed: completedLabel,
                      target: targetLabel,
                    })}
                  </Text>
                  <Text style={surahGoalStyles.metaRegular}>
                    {`(total `}
                    <Text style={surahGoalStyles.metaBold}>{targetLabel}</Text>
                    {` juz)`}
                  </Text>
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
          <QuranJuzLoggingFlow
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
