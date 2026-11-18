import { Text, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Colors } from "@/constants/theme";
import { useTypedTranslation } from "@/i18next/useTypedTranslation";
import {
  FASTING_LEGEND_ENTRIES,
  type FastingLegendEntry,
} from "../fastingLegend";
import { styles } from "../styles";
import { FastingLegendItem } from "./FastingLegendItem";

type Props = {
  entries?: FastingLegendEntry[];
};

function ProgressLegendRow({ entry }: { entry: FastingLegendEntry }) {
  return (
    <View style={styles.fastingProgressLegendRow}>
      <View style={styles.fastingLegendHalf}>
        <FastingLegendItem entry={entry} />
      </View>
      <View style={styles.fastingLegendHalf}>
        <FastingLegendItem entry={entry} completed />
      </View>
    </View>
  );
}

export function FastingProgressLegend({
  entries = FASTING_LEGEND_ENTRIES,
}: Props) {
  const { t } = useTypedTranslation();

  if (entries.length === 0) return null;

  return (
    <View style={styles.fastingLegendLayout}>
      {entries.map((entry) => (
        <ProgressLegendRow key={entry.id} entry={entry} />
      ))}
      <View style={styles.fastingLegendSkippedRow}>
        <FontAwesome name="warning" size={11} color={Colors.light.yellow} />
        <Text style={styles.fastingLegendSkippedText}>
          {t("homeScreen.fastingLegend_skippedPlannedFast")}
        </Text>
      </View>
    </View>
  );
}
