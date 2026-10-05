import React, { useCallback, useState } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import { GoalData } from "../../home/components/goalsData";
import type { QuranCompletionLogEntry } from "../types";
import { styles } from "./DailyProgressLogging.styles";
import { CompletionRecitationGoalCard } from "./CompletionRecitationGoalCard";

type Props = {
  goalData: GoalData;
  onLogComplete?: (entry: QuranCompletionLogEntry) => void;
};

export function CompletionRecitationLoggingSection({
  goalData,
  onLogComplete,
}: Props) {
  const { t } = useTranslation();
  const [isFlowActive, setIsFlowActive] = useState(false);

  const handleStartFlow = useCallback(() => {
    setIsFlowActive(true);
  }, []);

  const handleFlowClose = useCallback(() => {
    setIsFlowActive(false);
  }, []);

  return (
    <>
      {isFlowActive ? <Pressable style={styles.backdrop} /> : null}
      {isFlowActive ? (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleFlowClose}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={20} color={Colors.light.white} />
        </TouchableOpacity>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t("progressLogging.myProgress")}
        </Text>
        <View
          style={[
            { marginTop: 4 },
            isFlowActive
              ? { zIndex: 101, elevation: 12, position: "relative" as const }
              : undefined,
          ]}
        >
          <CompletionRecitationGoalCard
            goalData={goalData}
            isFlowActive={isFlowActive}
            onStartFlow={handleStartFlow}
            onFlowClose={handleFlowClose}
            onLogComplete={onLogComplete}
          />
        </View>
      </View>
    </>
  );
}
