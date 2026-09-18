import React, { useCallback, useState } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import { GoalData } from "../../home/components/goalsData";
import type { QuranMemorisationJuzLogEntry } from "../types";
import { styles } from "./DailyProgressLogging.styles";
import { JuzMemorisationGoalsList } from "./JuzMemorisationGoalsList";
import { useOptionalMemorisationJuzContext } from "../memorisationJuzContext";

type Props = {
  goalData: GoalData;
  onLogComplete?: (entry: QuranMemorisationJuzLogEntry) => void;
};

export function JuzMemorisationLoggingSection({
  goalData,
  onLogComplete,
}: Props) {
  const { t } = useTranslation();
  const memorisationContext = useOptionalMemorisationJuzContext();
  const [activeFlowGoalId, setActiveFlowGoalId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleStartFlow = useCallback((goalId: string) => {
    setActiveFlowGoalId(goalId);
  }, []);

  const handleFlowClose = useCallback(() => {
    setActiveFlowGoalId(null);
  }, []);

  const handleLogComplete = useCallback(
    (entry: QuranMemorisationJuzLogEntry) => {
      setRefreshKey((current) => current + 1);
      memorisationContext?.bumpRefresh();
      onLogComplete?.(entry);
    },
    [memorisationContext, onLogComplete],
  );

  return (
    <>
      {activeFlowGoalId ? <Pressable style={styles.backdrop} /> : null}
      {activeFlowGoalId ? (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleFlowClose}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={20} color={Colors.light.white} />
        </TouchableOpacity>
      ) : null}

      <View
        style={[
          styles.section,
          activeFlowGoalId ? styles.activeSection : undefined,
        ]}
      >
        <Text style={styles.sectionTitle}>
          {t("progressLogging.myProgress")}
        </Text>
        <View style={{ marginTop: 4 }}>
          <JuzMemorisationGoalsList
            goalData={goalData}
            activeFlowGoalId={activeFlowGoalId}
            refreshKey={refreshKey}
            onStartFlow={handleStartFlow}
            onFlowClose={handleFlowClose}
            onLogComplete={handleLogComplete}
          />
        </View>
      </View>
    </>
  );
}
