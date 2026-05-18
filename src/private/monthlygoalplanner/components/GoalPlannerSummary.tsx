import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { StyleSheet, Text } from "react-native";

export const GoalPlannerSummary = () => {
  return (
    <Text style={styles.container}>
      Choose when your <Text style={styles.bold}>4-week goal cycle </Text>
      begins, <Text style={styles.bold}>set goals </Text>
      across 4 categories, then{" "}
      <Text style={styles.bold}>review and confirm </Text>
      your plan!
    </Text>
  );
};

const styles = StyleSheet.create({
  container: {
    color: Colors.light.white,
    fontWeight: "400",
    fontSize: 14,
    fontFamily: fonts.primary.regular,
    lineHeight: 20,
    marginTop: 24,
    width: "80%",
    textAlign: "center",
    alignSelf: "center",
  },
  bold: {
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
  },
});
