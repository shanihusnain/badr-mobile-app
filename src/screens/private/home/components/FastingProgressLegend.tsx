import { View } from "react-native";
import {
  FASTING_LEGEND_ENTRIES,
  type FastingLegendEntry,
} from "../fastingLegend";
import { styles } from "../styles";
import { FastingLegendItem } from "./FastingLegendItem";

type Props = {
  entries?: FastingLegendEntry[];
};

function ProgressLegendRow({
  entry,
}: {
  entry: FastingLegendEntry;
}) {
  return (
    <View style={styles.fastingProgressLegendRow}>
      <FastingLegendItem entry={entry} fixedWidth />
      <FastingLegendItem entry={entry} completed fixedWidth />
    </View>
  );
}

export function FastingProgressLegend({
  entries = FASTING_LEGEND_ENTRIES,
}: Props) {
  if (entries.length === 0) return null;

  return (
    <View style={styles.fastingLegendLayout}>
      {entries.map((entry) => (
        <ProgressLegendRow key={entry.id} entry={entry} />
      ))}
    </View>
  );
}
