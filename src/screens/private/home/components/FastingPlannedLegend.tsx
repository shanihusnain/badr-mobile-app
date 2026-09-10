import { View } from "react-native";
import { FASTING_LEGEND_ENTRIES } from "../fastingLegend";
import { styles } from "../styles";
import { FastingLegendItem } from "./FastingLegendItem";

export function FastingPlannedLegend() {
  const [first, second, third] = FASTING_LEGEND_ENTRIES;

  return (
    <View style={styles.fastingLegendLayout}>
      <View style={styles.fastingLegendRow}>
        <View style={styles.fastingLegendColumn}>
          <FastingLegendItem entry={first} />
        </View>
        <View style={styles.fastingLegendColumn}>
          <FastingLegendItem entry={second} />
        </View>
      </View>
      <View style={styles.fastingLegendRowCentered}>
        <FastingLegendItem entry={third} />
      </View>
    </View>
  );
}
