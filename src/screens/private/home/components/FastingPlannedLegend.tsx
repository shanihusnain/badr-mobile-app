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

export function FastingPlannedLegend({
  entries = FASTING_LEGEND_ENTRIES,
}: Props) {
  if (entries.length === 0) return null;

  if (entries.length === 1) {
    return (
      <View style={styles.fastingLegendLayout}>
        <View style={styles.fastingLegendRowCentered}>
          <FastingLegendItem entry={entries[0]} />
        </View>
      </View>
    );
  }

  if (entries.length === 2) {
    return (
      <View style={styles.fastingLegendLayout}>
        <View style={styles.fastingLegendRow}>
          <View style={styles.fastingLegendColumn}>
            <FastingLegendItem entry={entries[0]} />
          </View>
          <View style={styles.fastingLegendColumn}>
            <FastingLegendItem entry={entries[1]} />
          </View>
        </View>
      </View>
    );
  }

  if (entries.length === 3) {
    const [first, second, third] = entries;
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

  const rows: FastingLegendEntry[][] = [];
  for (let i = 0; i < entries.length; i += 2) {
    rows.push(entries.slice(i, i + 2));
  }

  return (
    <View style={styles.fastingLegendLayout}>
      {rows.map((row, rowIndex) => {
        if (row.length === 2) {
          return (
            <View key={rowIndex} style={styles.fastingLegendRow}>
              <View style={styles.fastingLegendColumn}>
                <FastingLegendItem entry={row[0]} />
              </View>
              <View style={styles.fastingLegendColumn}>
                <FastingLegendItem entry={row[1]} />
              </View>
            </View>
          );
        }
        return (
          <View key={rowIndex} style={styles.fastingLegendRowCentered}>
            <FastingLegendItem entry={row[0]} />
          </View>
        );
      })}
    </View>
  );
}
