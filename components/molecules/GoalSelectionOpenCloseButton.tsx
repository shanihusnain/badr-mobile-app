import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text } from "react-native";

export const GoalSelectionOpenCloseButton = ({
  isOpen,
  title,
  toggleDropdown,
}: {
  isOpen: boolean;
  title: string;
  toggleDropdown: () => void;
}) => {
  return (
    <Pressable style={styles.headerRow} onPress={toggleDropdown}>
      <Text style={styles.titleText}>{title}</Text>
      <Feather
        name={isOpen ? "chevron-up" : "chevron-down"}
        size={18}
        color={Colors.light.white}
        style={styles.icon}
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
  },
});
