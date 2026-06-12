import { View } from "react-native";
import { FASTING_LEGEND_ENTRIES } from "../fastingLegend";
import { styles } from "../styles";
import { FastingLegendItem } from "./FastingLegendItem";

function ProgressLegendRow({
  entry,
}: {
  entry: (typeof FASTING_LEGEND_ENTRIES)[number];
}) {
  return (
    <View style={styles.fastingProgressLegendRow}>
      <FastingLegendItem entry={entry} fixedWidth />
      <FastingLegendItem entry={entry} completed fixedWidth />
    </View>
  );
}

export function FastingProgressLegend() {
  return (
    <View style={styles.fastingLegendLayout}>
      {FASTING_LEGEND_ENTRIES.map((entry) => (
        <ProgressLegendRow key={entry.id} entry={entry} />
      ))}
    </View>
  );
}
