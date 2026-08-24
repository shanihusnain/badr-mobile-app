import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { AimIcon, LighteningIcon } from "@/assets/icons";

export type PrayerWeeklyProgressFooterComparisonVariant = "onTime" | "prayers";

export type PrayerWeeklyProgressFooterProps = {
  loading?: boolean;
  streakDays?: number;
  /** `null` / omitted on week 1 — no vs-last-week row. */
  vsLastWeek?: number | null;
  motivationalQuote?: string;
  defaultMotivationalQuote?: string;
  /** Five-daily uses on-time wording; other prayer goals use prayers wording. */
  comparisonVariant?: PrayerWeeklyProgressFooterComparisonVariant;
  /** Green streak label (five-daily); default is white/medium. */
  streakVariant?: "green" | "default";
};

export function PrayerWeeklyProgressFooter({
  loading = false,
  streakDays = 0,
  vsLastWeek = null,
  motivationalQuote = "",
  defaultMotivationalQuote = "",
  comparisonVariant = "prayers",
  streakVariant = "default",
}: PrayerWeeklyProgressFooterProps) {
  const { t } = useTranslation();
  const showComparison = !loading && vsLastWeek != null;
  const vsLastWeekMagnitude = Math.abs(vsLastWeek ?? 0);
  const vsLastWeekImproved = (vsLastWeek ?? 0) > 0;

  const resolvedQuote =
    loading ? "---" : motivationalQuote || defaultMotivationalQuote;

  const comparisonSuffixKey =
    comparisonVariant === "onTime"
      ? "homeScreen.weeklyProgress_vsLastWeek"
      : "homeScreen.weeklyProgress_prayersVsLastWeek";

  return (
    <View style={styles.footerSection}>
      <View
        style={[
          styles.footerRow,
          showComparison && styles.footerRowWithComparison,
          !showComparison && styles.footerRowWeekOne,
        ]}
      >
        <View style={styles.streakBadge}>
          <LighteningIcon />
          <Text
            style={[
              styles.streakText,
              streakVariant === "green" && styles.streakTextGreen,
            ]}
          >
            {loading
              ? "---"
              : t("homeScreen.weeklyProgress_dayStreak", { count: streakDays })}
          </Text>
        </View>

        {showComparison ? (
          <View style={styles.comparisonBadge}>
            {vsLastWeekMagnitude > 0 ? (
              <Ionicons
                name={vsLastWeekImproved ? "caret-up" : "caret-down"}
                size={13}
                color={
                  vsLastWeekImproved ? Colors.light.green : Colors.light.grey
                }
              />
            ) : null}
            <Text style={styles.comparisonText}>
              <Text style={styles.comparisonCount}>{vsLastWeekMagnitude}</Text>
              {` ${t(comparisonSuffixKey)}`}
            </Text>
          </View>
        ) : (
          <View style={[styles.quoteBlock, styles.quoteBlockInline]}>
            <AimIcon />
            <View style={[styles.quoteTextWrap, styles.quoteTextWrapInline]}>
              <Text
                style={[styles.quoteText, styles.quoteTextInline]}
                numberOfLines={3}
              >
                {resolvedQuote}
              </Text>
            </View>
          </View>
        )}
      </View>

      {showComparison ? (
        <View style={styles.quoteBlock}>
          <AimIcon />
          <View style={styles.quoteTextWrap}>
            <Text style={styles.quoteText}>{resolvedQuote}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  footerSection: {
    minHeight: 54,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 13,
    minWidth: 0,
    width: "100%",
    paddingHorizontal: 4,
  },
  footerRowWithComparison: {
    justifyContent: "flex-end",
    gap: 16,
    paddingRight: 18,
  },
  footerRowWeekOne: {
    minHeight: 54,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  streakText: {
    color: Colors.light.white,
    fontSize: 13,
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
  },
  streakTextGreen: {
    color: Colors.light.green,
    fontSize: 12,
    fontWeight: "600",
    fontFamily: undefined,
    lineHeight: 16,
  },
  comparisonBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 1,
    minWidth: 0,
  },
  comparisonText: {
    color: Colors.light.white,
    fontSize: 13,
    fontWeight: "400",
    fontFamily: fonts.primary.regular,
    lineHeight: 16,
    letterSpacing: 0.1,
    flexShrink: 1,
  },
  comparisonCount: {
    color: Colors.light.white,
    fontSize: 13,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  quoteBlock: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
    alignSelf: "stretch",
    minWidth: 0,
    width: "100%",
    marginTop: 4,
  },
  quoteBlockInline: {
    flex: 1,
    width: undefined,
    minWidth: 0,
    marginTop: 0,
  },
  quoteTextWrap: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  quoteTextWrapInline: {
    minHeight: 48,
  },
  quoteTextInline: {
    minHeight: 48,
    width: "90%",
  },
  quoteText: {
    color: Colors.light.white,
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: -0.1,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    flexShrink: 1,
  },
});
