import { fonts } from "@/assets/fonts";
import { Divider } from "@/components/atoms/Divider";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTranslation } from "react-i18next";

type Props = {
  goal: any;
  handleEditPress: (goal: any) => void;
};

const looksLikeCurrency = (v: any) =>
  typeof v === "string" && /[^0-9\s,\.\-]/.test(v);

export default function ReviewGoalCard({ goal, handleEditPress }: Props) {
  const { t } = useTranslation();
  const selected = goal?.selectedGoals ?? [];
  const firstSelected = selected.length > 0 ? selected[0] : null;

  const renderChipUnitAndValue = (unitText: string, rightValue: string) => (
    <View style={styles.chipRow}>
      <View style={styles.chip}>
        <Text style={styles.chipText}>{unitText}</Text>
      </View>
      <Text style={styles.appliedGoalValueText}>{rightValue}</Text>
    </View>
  );

  const key = goal?.title;

  const rightNode = (() => {
    // Currency-only goals: show currency symbol + amount, no chip
    if (
      key === "missed-zakat" ||
      key === "lillah-donations" ||
      key === "sadaqah-jariyah"
    ) {
      if (firstSelected && looksLikeCurrency(firstSelected.value))
        return (
          <Text style={styles.appliedGoalValueText}>
            {String(firstSelected.value)}
          </Text>
        );
      return (
        <Text
          style={styles.appliedGoalValueText}
        >{`$ ${String(goal?.totalValue ?? "")}`}</Text>
      );
    }

    // Unit chips (chip contains unit text only; numeric value shown outside)
    if (key === "kafarah-for-breaking-fasts")
      return renderChipUnitAndValue(
        t("monthlyGoalPlanner.items"),
        String(goal?.totalValue ?? 0),
      );
    if (key === "fidya")
      return renderChipUnitAndValue(
        t("monthlyGoalPlanner.meals"),
        String(goal?.totalValue ?? 0),
      );
    if (key === "volunteering-services")
      return renderChipUnitAndValue(
        t("monthlyGoalPlanner.hours"),
        String(goal?.totalValue ?? 0),
      );

    // Quran or other goals: if there's a selected entry, prefer that
    if (firstSelected) {
      if (looksLikeCurrency(firstSelected.value))
        return (
          <Text style={styles.appliedGoalValueText}>
            {String(firstSelected.value)}
          </Text>
        );
      return renderChipUnitAndValue(
        String(firstSelected.label ?? ""),
        String(firstSelected.value ?? ""),
      );
    }

    // Fallback
    return (
      <Text style={styles.appliedGoalValueText}>
        {String(goal?.totalValue ?? "")}
      </Text>
    );
  })();

  return (
    <View>
      <View style={styles.appliedGoalContainer}>
        <View style={styles.appliedGoalRow}>
          <View style={styles.appliedGoalLeftGroup}>
            <Text style={styles.appliedGoalTitleText}>{goal?.label}</Text>
            <Pressable onPress={() => handleEditPress(goal)}>
              <Feather name="edit-2" size={14} color="white" />
            </Pressable>
          </View>
          <Text>{goal?.value}</Text>
        </View>

        {selected && selected.length > 0 && <Divider />}

        {selected &&
          selected.length > 0 &&
          selected.map((subGoal: any, subIdx: number) => (
            <View
              key={
                subGoal?.id != null
                  ? String(subGoal.id)
                  : `${String(goal?.id)}-sub-${subIdx}`
              }
              style={styles.subGoalWrapper}
            >
              <View style={styles.subGoalRow}>
                <Text style={styles.subGoalText}>
                  {(() => {
                    const cleanLabel = String(subGoal?.label ?? "");
                    // Translate common days of the week dynamically
                    if (cleanLabel.toLowerCase() === "monday")
                      return t("monthlyGoalPlanner.reviewLabels.monday");
                    if (cleanLabel.toLowerCase() === "tuesday")
                      return t(
                        "monthlyGoalPlanner.reviewLabels.tuesday",
                        "Tuesday",
                      );
                    if (cleanLabel.toLowerCase() === "wednesday")
                      return t(
                        "monthlyGoalPlanner.reviewLabels.wednesday",
                        "Wednesday",
                      );
                    if (cleanLabel.toLowerCase() === "thursday")
                      return t("monthlyGoalPlanner.reviewLabels.thursday");
                    if (cleanLabel.toLowerCase() === "friday")
                      return t(
                        "monthlyGoalPlanner.reviewLabels.friday",
                        "Friday",
                      );
                    if (cleanLabel.toLowerCase() === "saturday")
                      return t(
                        "monthlyGoalPlanner.reviewLabels.saturday",
                        "Saturday",
                      );
                    if (cleanLabel.toLowerCase() === "sunday")
                      return t(
                        "monthlyGoalPlanner.reviewLabels.sunday",
                        "Sunday",
                      );
                    if (cleanLabel.toLowerCase() === "mon")
                      return t("monthlyGoalPlanner.reviewLabels.mon");
                    if (cleanLabel.toLowerCase() === "wed")
                      return t("monthlyGoalPlanner.reviewLabels.wed");
                    if (cleanLabel.toLowerCase() === "juz")
                      return t("monthlyGoalPlanner.reviewLabels.juz");
                    if (cleanLabel.toLowerCase() === "hizb")
                      return t("monthlyGoalPlanner.reviewLabels.hizb");
                    if (cleanLabel.toLowerCase() === "surah")
                      return t("monthlyGoalPlanner.reviewLabels.surah");
                    if (cleanLabel.toLowerCase() === "completion")
                      return t("monthlyGoalPlanner.reviewLabels.completion");
                    if (cleanLabel.toLowerCase() === "amount")
                      return t("monthlyGoalPlanner.amount");
                    if (cleanLabel.toLowerCase() === "meals")
                      return t("monthlyGoalPlanner.meals");
                    if (cleanLabel.toLowerCase() === "cloths")
                      return t("monthlyGoalPlanner.cloths");
                    if (cleanLabel.toLowerCase() === "hours")
                      return t("monthlyGoalPlanner.hours");

                    return cleanLabel;
                  })()}
                </Text>
                <Text style={styles.subGoalValueText}>{subGoal?.value}</Text>
              </View>
            </View>
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appliedGoalContainer: {
    marginTop: 10,
    backgroundColor: Colors.light.calendarBg,
    padding: 10,
    borderRadius: 6,
  },
  appliedGoalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  appliedGoalLeftGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  appliedGoalTitleText: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  appliedGoalValueText: {
    color: Colors.light.green,
    fontSize: 14,
    marginTop: 8,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  subGoalWrapper: {
    marginTop: 6,
  },
  subGoalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subGoalText: {
    color: Colors.light.white,
    fontSize: 12,
    marginTop: 8,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    opacity: 0.8,
  },
  subGoalValueText: {
    color: Colors.light.white,
    fontSize: 12,
    marginTop: 8,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    opacity: 0.8,
  },
  chipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chip: {
    backgroundColor: Colors.light.progressBarEmpty,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
  },
});
