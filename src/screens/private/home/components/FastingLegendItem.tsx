import { Text, View } from "react-native";
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
  const label = completed ? entry.completedLabel : entry.plannedLabel;

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
