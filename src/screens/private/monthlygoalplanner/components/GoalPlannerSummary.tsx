import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { StyleSheet, Text } from "react-native";
import { useTranslation } from "react-i18next";

export const GoalPlannerSummary = () => {
  const { t } = useTranslation();
  return (
    <Text style={styles.container}>
      {t("monthlyGoalPlanner.summaryText1")}
      <Text style={styles.bold}>{t("monthlyGoalPlanner.summaryTextBold1")}</Text>
      {t("monthlyGoalPlanner.summaryText2")}
      <Text style={styles.bold}>{t("monthlyGoalPlanner.summaryTextBold2")}</Text>
      {t("monthlyGoalPlanner.summaryText3")}
      <Text style={styles.bold}>{t("monthlyGoalPlanner.summaryTextBold3")}</Text>
      {t("monthlyGoalPlanner.summaryText4")}
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
