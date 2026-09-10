import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { StyleSheet, Text } from "react-native";
import { Pressable } from "react-native-gesture-handler";

export const Tabs = ({
  label,
  onPress,
  selectedTab,
  bgColor,
}: {
  label: string;
  onPress: () => void;
  selectedTab: string;
  bgColor?: string;
}) => {
  const isSelected = selectedTab === label;
  return (
    <Pressable
      key={label}
      style={[
        label === "All"
          ? styles.categoryFilterItem
          : styles.categoryFilterItemWide,
        isSelected && styles.categoryFilterItemActive,
        {
          backgroundColor: isSelected
            ? Colors.light.green
            : (bgColor ?? Colors.light.greybuttonBackground),
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.categoryFilterText,
          isSelected && styles.categoryFilterTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};
const styles = StyleSheet.create({
  categoryFilterItem: {
    borderRadius: 6,
    backgroundColor: Colors.light.greybuttonBackground,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexShrink: 0,
  },
  categoryFilterItemWide: {
    borderRadius: 6,
    backgroundColor: Colors.light.greybuttonBackground,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexShrink: 0,
  },
  categoryFilterItemActive: {
    backgroundColor: Colors.light.green,
  },
  categoryFilterText: {
    fontFamily: fonts.primary.medium || "SF Pro Text",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0,
    color: Colors.light.white,
    textAlign: "center",
  },
  categoryFilterTextActive: {
    color: Colors.light.white,
  },
});
