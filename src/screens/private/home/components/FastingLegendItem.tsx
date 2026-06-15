import { Text, View } from "react-native";
import { useTypedTranslation } from "@/i18next/useTypedTranslation";
import type { FastingLegendEntry } from "../fastingLegend";
import { styles } from "../styles";
import { FastingLegendRing } from "./FastingLegendRing";

type FastingLegendItemProps = {
  entry: FastingLegendEntry;
  completed?: boolean;
  fixedWidth?: boolean;
};

export function FastingLegendItem({
  entry,
  completed = false,
  fixedWidth = false,
}: FastingLegendItemProps) {
  const { t } = useTypedTranslation();
  const rawLabel = completed ? entry.completedLabel : entry.plannedLabel;
  
  function getFastingLegendTranslationKey(label: string): any {
    const map: Record<string, string> = {
      "MISSED RAMADAN": "homeScreen.fastingLegend_missedRamadan",
      "MONDAYS & THURSDAYS": "homeScreen.fastingLegend_monThu",
      "WHITE DAYS": "homeScreen.fastingLegend_whiteDays",
      "PLANNED MISSED RAMADAN FAST": "homeScreen.fastingLegend_plannedMissedRamadan",
      "COMPLETED MISSED RAMADAN FAST": "homeScreen.fastingLegend_completedMissedRamadan",
      "PLANNED MON & THU FAST": "homeScreen.fastingLegend_plannedMonThu",
      "COMPLETED MON & THU FAST": "homeScreen.fastingLegend_completedMonThu",
      "PLANNED WHITE DAYS": "homeScreen.fastingLegend_plannedWhiteDays",
      "COMPLETED WHITE DAYS": "homeScreen.fastingLegend_completedWhiteDays",
    };
    return map[label] || label;
  }
  
  const label = t(getFastingLegendTranslationKey(rawLabel));

  return (
    <View
      style={[
        styles.fastingLegendItem,
        fixedWidth && styles.fastingLegendItemFixed,
        fixedWidth && styles.fastingLegendItemUnsetWidth,
      ]}
    >
      <FastingLegendRing color={entry.color} completed={completed} />
      <View
        style={
          fixedWidth
            ? styles.fastingLegendTextWrapFixed
            : styles.fastingLegendTextWrap
        }
      >
        <Text style={styles.fastingLegendText} numberOfLines={2}>
          {label}
        </Text>
      </View>
    </View>
  );
}
