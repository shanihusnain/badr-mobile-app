import React, { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
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
    <View
      style={[styles.section, isFlowActive ? styles.activeSection : undefined]}
    >
      <Text style={styles.sectionTitle}>{t("progressLogging.myProgress")}</Text>
      <View style={{ marginTop: 4 }}>
        <CompletionRecitationGoalCard
          goalData={goalData}
          isFlowActive={isFlowActive}
          onStartFlow={handleStartFlow}
          onFlowClose={handleFlowClose}
          onLogComplete={onLogComplete}
        />
      </View>
    </View>
  );
}
