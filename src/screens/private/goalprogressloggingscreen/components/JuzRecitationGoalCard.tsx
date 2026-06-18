import React, { useMemo } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Colors } from "@/constants/theme";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { GoalData } from "../../home/components/goalsData";
import QuranJuzLoggingFlow from "../flows/QuranJuzLoggingFlow";
import {
  getJuzRecitationProgress,
  isJuzGoalComplete,
} from "../quranRecitationJuzData";
import type { QuranJuzLogEntry } from "../types";
import { styles } from "./DailyProgressLogging.styles";
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
    : t("progressLogging.inProgress");

  const handleFlowModeChange = (mode: "collapsed" | "active") => {
    if (mode === "collapsed") {
      onFlowClose();
    }
  };

  return (
    <View style={isFlowActive ? styles.activeSection : undefined}>
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
              surahGoalStyles.cardActive,
              { width: "100%" },
            ]}
          >
            <View style={surahGoalStyles.cardContent}>
              <View style={surahGoalStyles.statusChip}>
                <Text style={surahGoalStyles.statusChipText}>
                  {statusLabel}
                </Text>
              </View>

              <Text style={surahGoalStyles.surahName}>
                {t("progressLogging.juzCardTitle", {
                  completed: formatNumber(progress.completedJuzCount),
                  target: formatNumber(progress.targetJuzCount),
                })}
              </Text>
            </View>

            {!isComplete ? (
              <TouchableOpacity
                style={styles.addButton}
                onPress={onStartFlow}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={22} color={Colors.light.white} />
              </TouchableOpacity>
            ) : (
              <View style={styles.addButton}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={22}
                  color={Colors.light.white}
                />
              </View>
            )}
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
