import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text } from "react-native";

export const GoalSelectionOpenCloseButton = ({
  isOpen,
  title,
  toggleDropdown,
  /** When true: open → chevron-down, closed → chevron-up. */
  chevronDownWhenOpen = false,
  chevronOpacity = 1,
}: {
  isOpen: boolean;
  title: string;
  toggleDropdown: () => void;
  chevronDownWhenOpen?: boolean;
  chevronOpacity?: number;
}) => {
  const openIcon = chevronDownWhenOpen ? "chevron-down" : "chevron-up";
  const closedIcon = chevronDownWhenOpen ? "chevron-up" : "chevron-down";

  return (
    <Pressable style={styles.headerRow} onPress={toggleDropdown}>
      <Text style={styles.titleText}>{title}</Text>
      <Feather
        name={isOpen ? openIcon : closedIcon}
        size={18}
        color={Colors.light.white}
        style={[styles.icon, { opacity: chevronOpacity }]}
      />
    </Pressable>
  );
};
const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    minHeight: 24,
  },
  titleText: {
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  icon: {
    marginLeft: 4,
    marginTop: -12,
  },
});
