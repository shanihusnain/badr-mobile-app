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

const UNIT_BY_GOAL_TITLE: Record<string, string> = {
  "kafarah-for-breaking-fasts": "monthlyGoalPlanner.items",
  fidya: "monthlyGoalPlanner.meals",
  "volunteering-services": "monthlyGoalPlanner.hours",
  "quran-listening": "monthlyGoalPlanner.hours",
  "quran-tajweed": "monthlyGoalPlanner.hours",
  "quran-recitation-by-surah": "monthlyGoalPlanner.surahs",
  "quran-memorization-by-surah": "monthlyGoalPlanner.surahs",
  "quran-recitation-by-juz": "monthlyGoalPlanner.juzUnit",
  "quran-memorization-by-juz": "monthlyGoalPlanner.juzUnit",
  "quran-memorization-by-hizb": "monthlyGoalPlanner.hizbUnit",
  "quran-recitation-by-completion": "monthlyGoalPlanner.completions",
  "missed-ramadan-fasts": "monthlyGoalPlanner.days",
  "missed-fasts": "monthlyGoalPlanner.days",
  "the-fasts-of-prophet-dawood": "monthlyGoalPlanner.days",
  "dawood-fasts": "monthlyGoalPlanner.days",
  "monday-and-thursday-fasts": "monthlyGoalPlanner.days",
  "white-days-fasts": "monthlyGoalPlanner.days",
};

const CURRENCY_GOAL_TITLES = new Set([
  "missed-zakat",
  "lillah-donations",
  "lilah-donations",
  "sadaqah-jariyah",
]);

/** Goals whose sub-rows show label only (no right-side value). */
const SUBGOAL_VALUE_HIDDEN_TITLES = new Set(["quran-memorization-by-surah"]);

/** Goals that show header chip/total only — no sub-goal rows on review. */
const HEADER_ONLY_GOAL_TITLES = new Set([
  "qiyal-al-lail-prayer",
  "quran-listening",
  "quran-tajweed",
  "fidya",
  "lillah-donations",
  "lilah-donations",
  "volunteering-services",
  "sadaqah-jariyah",
]);

/** Bold juz numbers in "From Juz 5 to Juz 13" (and Arabic equivalent). */
function renderLabelWithBoldNumbers(label: string) {
  const parts = String(label).split(/(\d+)/);
  return parts.map((part, index) =>
    /^\d+$/.test(part) ? (
      <Text key={`${part}-${index}`} style={styles.subGoalParenCount}>
        {part}
      </Text>
    ) : (
      part
    ),
  );
}

/** Bold the count inside parentheses, e.g. "Surah X (2 times daily)". */
function renderLabelWithBoldParenCount(label: string) {
  const match = label.match(/^(.*\()(\d+)(.*\))$/);
  if (!match) return label;
  const [, before, count, after] = match;
  return (
    <>
      {before}
      <Text style={styles.subGoalParenCount}>{count}</Text>
      {after}
    </>
  );
}

export default function ReviewGoalCard({ goal, handleEditPress }: Props) {
  const { t } = useTranslation();
  const key = String(goal?.title ?? "");
  const selected = HEADER_ONLY_GOAL_TITLES.has(key)
    ? []
    : (goal?.selectedGoals ?? []);
  const firstSelected = selected.length > 0 ? selected[0] : null;
  const totalValue = goal?.totalValue;

  const renderGreenTotal = (text: string) => (
    <Text style={styles.appliedGoalValueText}>{text}</Text>
  );

  /** Green number first, then unit label in a green-text chip. */
  const renderChipWithValue = (unitText: string, valueText: string) => (
    <View style={styles.chipRow}>
      <Text style={styles.appliedGoalValueText}>{valueText}</Text>
      <View style={styles.unitChip}>
        <Text style={styles.unitChipText}>{unitText}</Text>
      </View>
    </View>
  );

  const rightNode = (() => {
    if (CURRENCY_GOAL_TITLES.has(key)) {
      if (firstSelected && looksLikeCurrency(firstSelected.value)) {
        return renderGreenTotal(String(firstSelected.value));
      }
      const currency =
        goal?.sourceSadaqah?.currencyCode ?? goal?.currencyCode ?? "SAR";
      return renderGreenTotal(`${currency} ${String(totalValue ?? "")}`);
    }

    const unitKey = UNIT_BY_GOAL_TITLE[key];
    if (unitKey) {
      return renderChipWithValue(
        t(unitKey).toLowerCase(),
        String(totalValue ?? 0),
      );
    }

    // Prayer / other numeric totals — green number only (no chip)
    if (totalValue != null && totalValue !== "") {
      return renderGreenTotal(String(totalValue));
    }

    if (firstSelected?.value != null && firstSelected.value !== "") {
      return renderGreenTotal(String(firstSelected.value));
    }

    return null;
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
          {rightNode}
        </View>

        {selected.length > 0 && <Divider />}

        {selected.map((subGoal: any, subIdx: number) => (
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

                  if (
                    key === "quran-recitation-by-juz" &&
                    String(subGoal?.name ?? "").startsWith("JUZ-RANGE")
                  ) {
                    return renderLabelWithBoldNumbers(cleanLabel);
                  }

                  if (key.startsWith("quran-")) {
                    return renderLabelWithBoldParenCount(cleanLabel);
                  }

                  return cleanLabel;
                })()}
              </Text>
              {subGoal?.value != null &&
                String(subGoal.value).trim() !== "" &&
                !SUBGOAL_VALUE_HIDDEN_TITLES.has(key) && (
                  <Text style={styles.subGoalValueText}>{subGoal?.value}</Text>
                )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appliedGoalContainer: {
    backgroundColor: Colors.light.greybuttonBackground,
    padding: 10,
    borderRadius: 6,
  },
  appliedGoalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  appliedGoalLeftGroup: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    gap: 6,
  },
  appliedGoalTitleText: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    flexShrink: 1,
  },
  appliedGoalValueText: {
    color: Colors.light.green,
    fontSize: 14,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  chipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  unitChip: {
    backgroundColor: Colors.light.progressBarEmpty,
    padding: 2,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  unitChipText: {
    color: Colors.light.green,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    fontSize: 10,
    letterSpacing: 0.1,
  },
  subGoalWrapper: {
    // marginTop: 6,
  },
  subGoalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  subGoalText: {
    color: Colors.light.white,
    fontSize: 12,
    marginTop: 8,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    flexShrink: 1,
    opacity: 0.9,
  },
  subGoalParenCount: {
    fontFamily: fonts.primary.bold,
    fontWeight: "700",
  },
  subGoalValueText: {
    color: Colors.light.white,
    fontSize: 12,
    marginTop: 8,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    opacity: 0.8,
  },
});
