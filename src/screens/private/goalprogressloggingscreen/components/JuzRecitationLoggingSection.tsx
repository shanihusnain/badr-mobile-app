import React, { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { GoalData } from "../../home/components/goalsData";
import type { QuranJuzLogEntry } from "../types";
import { styles } from "./DailyProgressLogging.styles";
import { JuzRecitationGoalCard } from "./JuzRecitationGoalCard";

type Props = {
  goalData: GoalData;
  onLogComplete?: (entry: QuranJuzLogEntry) => void;
};

export function JuzRecitationLoggingSection({
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
        <JuzRecitationGoalCard
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
