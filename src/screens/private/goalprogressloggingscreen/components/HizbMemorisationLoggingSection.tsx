import React, { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { GoalData } from "../../home/components/goalsData";
import type { QuranMemorisationHizbLogEntry } from "../types";
import { styles } from "./DailyProgressLogging.styles";
import { HizbMemorisationGoalsList } from "./HizbMemorisationGoalsList";
import { useOptionalMemorisationHizbContext } from "../memorisationHizbContext";

type Props = {
  goalData: GoalData;
  onLogComplete?: (entry: QuranMemorisationHizbLogEntry) => void;
};

export function HizbMemorisationLoggingSection({
  goalData,
  onLogComplete,
}: Props) {
  const { t } = useTranslation();
  const memorisationContext = useOptionalMemorisationHizbContext();
  const [activeFlowGoalId, setActiveFlowGoalId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleStartFlow = useCallback((goalId: string) => {
    setActiveFlowGoalId(goalId);
  }, []);

  const handleFlowClose = useCallback(() => {
    setActiveFlowGoalId(null);
  }, []);

  const handleLogComplete = useCallback(
    (entry: QuranMemorisationHizbLogEntry) => {
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
        <HizbMemorisationGoalsList
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
