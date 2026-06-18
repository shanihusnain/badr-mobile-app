import React, { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { GoalData } from "../../home/components/goalsData";
import type { QuranRecitationLogEntry } from "../types";
import { styles } from "./DailyProgressLogging.styles";
import { SurahRecitationGoalsList } from "./SurahRecitationGoalsList";

type Props = {
  goalData: GoalData;
  onLogComplete?: (entry: QuranRecitationLogEntry) => void;
};

export function SurahRecitationLoggingSection({
  goalData,
  onLogComplete,
}: Props) {
  const { t } = useTranslation();
  const [activeFlowGoalId, setActiveFlowGoalId] = useState<string | null>(null);
  console.log("goalData inside the surah recitation logging section", goalData);
  const handleStartFlow = useCallback((goalId: string) => {
    setActiveFlowGoalId(goalId);
  }, []);

  const handleFlowClose = useCallback(() => {
    setActiveFlowGoalId(null);
  }, []);

  return (
    <View
      style={[
        styles.section,
        activeFlowGoalId ? styles.activeSection : undefined,
      ]}
    >
      <Text style={styles.sectionTitle}>{t("progressLogging.myProgress")}</Text>
      <View style={{ marginTop: 4 }}>
        <SurahRecitationGoalsList
          goalData={goalData}
          activeFlowGoalId={activeFlowGoalId}
          onStartFlow={handleStartFlow}
          onFlowClose={handleFlowClose}
          onLogComplete={onLogComplete}
        />
      </View>
    </View>
  );
}
