import React, { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { GoalData } from "../../home/components/goalsData";
import type { QuranMemorisationLogEntry } from "../types";
import { styles } from "./DailyProgressLogging.styles";
import { SurahMemorisationGoalsList } from "./SurahMemorisationGoalsList";
import { useOptionalMemorisationSurahContext } from "../memorisationSurahContext";

type Props = {
  goalData: GoalData;
  onLogComplete?: (entry: QuranMemorisationLogEntry) => void;
};

export function SurahMemorisationLoggingSection({
  goalData,
  onLogComplete,
}: Props) {
  const { t } = useTranslation();
  const memorisationContext = useOptionalMemorisationSurahContext();
  const [activeFlowGoalId, setActiveFlowGoalId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleStartFlow = useCallback((goalId: string) => {
    setActiveFlowGoalId(goalId);
  }, []);

  const handleFlowClose = useCallback(() => {
    setActiveFlowGoalId(null);
  }, []);

  const handleLogComplete = useCallback(
    (entry: QuranMemorisationLogEntry) => {
      setRefreshKey((current) => current + 1);
      memorisationContext?.bumpRefresh();
      onLogComplete?.(entry);
    },
    [memorisationContext, onLogComplete],
  );

  return (
    <View
      style={[
        styles.section,
        activeFlowGoalId ? styles.activeSection : undefined,
      ]}
    >
      <Text style={styles.sectionTitle}>{t("progressLogging.myProgress")}</Text>
      <View style={{ marginTop: 4 }}>
        <SurahMemorisationGoalsList
          goalData={goalData}
          activeFlowGoalId={activeFlowGoalId}
          refreshKey={refreshKey}
          onStartFlow={handleStartFlow}
          onFlowClose={handleFlowClose}
          onLogComplete={handleLogComplete}
        />
      </View>
    </View>
  );
}
