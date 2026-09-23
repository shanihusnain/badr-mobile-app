import React, { useCallback, useState } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import { GoalData } from "../../home/components/goalsData";
import type { QuranRecitationLogEntry } from "../types";
import { styles } from "./DailyProgressLogging.styles";
import { SurahRecitationGoalsList } from "./SurahRecitationGoalsList";
import { useOptionalRecitationSurahContext } from "../recitationSurahContext";

type Props = {
  goalData: GoalData;
  onLogComplete?: (entry: QuranRecitationLogEntry) => void;
};

export function SurahRecitationLoggingSection({
  goalData,
  onLogComplete,
}: Props) {
  const { t } = useTranslation();
  const recitationContext = useOptionalRecitationSurahContext();
  const [activeFlowGoalId, setActiveFlowGoalId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleStartFlow = useCallback((goalId: string) => {
    setActiveFlowGoalId(goalId);
  }, []);

  const handleFlowClose = useCallback(() => {
    setActiveFlowGoalId(null);
  }, []);

  const handleLogComplete = useCallback(
    (entry: QuranRecitationLogEntry) => {
      setRefreshKey((current) => current + 1);
      recitationContext?.bumpRefresh();
      onLogComplete?.(entry);
    },
    [onLogComplete, recitationContext],
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t("progressLogging.myProgress")}
        </Text>
        <View style={{ marginTop: 4 }}>
          <SurahRecitationGoalsList
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
