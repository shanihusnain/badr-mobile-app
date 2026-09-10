import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import type { JuzMemorisationGoal } from "../quranMemorisationJuzGoals";

type Props = {
  goals: JuzMemorisationGoal[];
  selectedJuzId: string;
  onSelectJuz: (juzId: string) => void;
  styles: any;
};

export function MemorisationJuzSelectionStep({
  goals,
  selectedJuzId,
  onSelectJuz,
  styles,
}: Props) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const availableGoals = goals.filter((goal) => !goal.completed);

  return (
    <View style={{ gap: 10 }}>
      <Text style={styles.recitationMaxLabel}>
        {t("progressLogging.memorisationSelectJuz")}
      </Text>
      {availableGoals.map((goal) => {
        const isSelected = selectedJuzId === goal.id;
        return (
          <TouchableOpacity
            key={goal.id}
            onPress={() => onSelectJuz(goal.id)}
            activeOpacity={0.8}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: isSelected ? Colors.light.green : Colors.light.white,
              paddingHorizontal: 14,
              paddingVertical: 12,
              backgroundColor: isSelected
                ? "rgba(46, 204, 113, 0.12)"
                : "transparent",
            }}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ color: Colors.light.white, fontSize: 15 }} numberOfLines={2}>
                {t("progressLogging.memorisationJuzCardTitle", {
                  juz: goal.juzName,
                  range: goal.rangeLabel,
                })}
              </Text>
              <Text style={{ color: Colors.light.grey, fontSize: 12 }}>
                {t("progressLogging.memorisationJuzTotalVerses", {
                  count: formatNumber(goal.totalAyahs),
                })}
              </Text>
              <Text style={{ color: Colors.light.grey, fontSize: 12 }}>
                {t("progressLogging.memorisationProgressLabel", {
                  memorized: formatNumber(goal.memorizedAyahs),
                  total: formatNumber(goal.totalAyahs),
                })}
              </Text>
            </View>
            {isSelected ? (
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={Colors.light.green}
              />
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
