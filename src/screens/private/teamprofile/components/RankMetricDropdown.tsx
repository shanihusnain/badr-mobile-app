import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { RANK_METRICS } from "../rankMockData";

type RankMetricDropdownProps = {
  selectedMetricId: string;
  onSelect: (metricId: string) => void;
};

export function RankMetricDropdown({
  selectedMetricId,
  onSelect,
}: RankMetricDropdownProps) {
  return (
    <View style={styles.menu}>
      {RANK_METRICS.map((metric, index) => {
        const selected = metric.id === selectedMetricId;
        return (
          <Pressable
            key={metric.id}
            style={[
              styles.row,
              index < RANK_METRICS.length - 1 && styles.rowBorder,
            ]}
            onPress={() => onSelect(metric.id)}
          >
            <View
              style={[styles.radioOuter, selected && styles.radioOuterSelected]}
            >
              {selected ? <View style={styles.radioInner} /> : null}
            </View>
            <Text style={styles.label}>{metric.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.light.darkgrey,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.darkgrey,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: Colors.light.white,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: Colors.light.green,
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: Colors.light.green,
  },
  label: {
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 12,
    textTransform: "uppercase",
  },
});
