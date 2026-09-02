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
  /** `null` / omitted on week 1 — quote sits beside streak. Weeks 2–4 show vs-last-week. */
  vsLastWeek?: number | null;
  motivationalQuote?: string;
  defaultMotivationalQuote?: string;
  /** Five-daily uses on-time wording; other prayer goals use prayers wording. */
  comparisonVariant?: PrayerWeeklyProgressFooterComparisonVariant;
  /** Green streak label (five-daily); default is white/medium. */
  streakVariant?: "green" | "default";
};

/** Space between the stats row ("prayers this week") and the footer content below. */
export const PRAYER_WEEKLY_STATS_FOOTER_GAP = 8;

/**
 * Pull weeks 2–4 stats+footer block up so card height matches week 1
 * (extra comparison row vs inline 3-line quote on week 1).
 */
export const PRAYER_WEEKLY_LATER_WEEK_MARGIN_TOP_ADJUSTMENT = -6.8;

/** Fixed quote block height — keeps week 1 / 2–4 dashboard cards the same size. */
const QUOTE_LINE_HEIGHT = 16;
const WEEK_ONE_QUOTE_LINE_COUNT = 3;
const LATER_WEEK_QUOTE_LINE_COUNT = 2;
const WEEK_ONE_QUOTE_BLOCK_MIN_HEIGHT =
  QUOTE_LINE_HEIGHT * WEEK_ONE_QUOTE_LINE_COUNT;
const LATER_WEEK_QUOTE_BLOCK_MIN_HEIGHT =
  QUOTE_LINE_HEIGHT * LATER_WEEK_QUOTE_LINE_COUNT;

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
  // Week 1: no comparison → streak + quote side by side.
  // Weeks 2–4: streak + vs last week, quote on its own row below.
  const isWeekOneLayout = loading || vsLastWeek == null;
  const vsLastWeekMagnitude = Math.abs(vsLastWeek ?? 0);
  const vsLastWeekImproved = (vsLastWeek ?? 0) > 0;

  const resolvedQuote = loading
    ? "---"
    : (motivationalQuote ?? defaultMotivationalQuote);

  const comparisonSuffixKey =
    comparisonVariant === "onTime"
      ? "homeScreen.weeklyProgress_vsLastWeek"
      : "homeScreen.weeklyProgress_prayersVsLastWeek";

  const streakLabel = (
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
  );

  if (isWeekOneLayout) {
    return (
      <View style={styles.footerSectionWeekOne}>
        <View style={styles.footerRowWeekOne}>
          {streakLabel}
          <View style={styles.quoteBlockInline}>
            <AimIcon />
            <View style={styles.quoteTextWrapInline}>
              <Text
                style={styles.quoteText}
                numberOfLines={WEEK_ONE_QUOTE_LINE_COUNT}
              >
                {resolvedQuote}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.footerSectionLaterWeeks}>
      <View style={styles.footerRowLaterWeeks}>
        {streakLabel}
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
      </View>

      <View style={styles.quoteBlockFull}>
        <AimIcon />
        <View style={styles.quoteTextWrapFull}>
          <Text
            style={styles.quoteText}
            numberOfLines={LATER_WEEK_QUOTE_LINE_COUNT}
          >
            {resolvedQuote}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerSectionWeekOne: {
    width: "100%",
    paddingTop: PRAYER_WEEKLY_STATS_FOOTER_GAP,
  },
  footerSectionLaterWeeks: {
    width: "100%",
    paddingTop: PRAYER_WEEKLY_STATS_FOOTER_GAP,
    gap: 6,
  },
  footerRowWeekOne: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    width: "100%",
    minWidth: 0,
    paddingHorizontal: 4,
  },
  footerRowLaterWeeks: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    flexWrap: "wrap",
    gap: 10,
    width: "100%",
    minWidth: 0,
    paddingLeft: 21,
    paddingRight: 4,
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
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
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
    marginLeft: 12,
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
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  quoteBlockInline: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    minWidth: 0,
  },
  quoteTextWrapInline: {
    flex: 1,
    minWidth: 0,
    minHeight: WEEK_ONE_QUOTE_BLOCK_MIN_HEIGHT,
    justifyContent: "flex-start",
  },
  quoteBlockFull: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    width: "100%",
    minWidth: 0,
    paddingLeft: 7,
    paddingRight: 4,
  },
  quoteTextWrapFull: {
    flex: 1,
    minWidth: 0,
    minHeight: LATER_WEEK_QUOTE_BLOCK_MIN_HEIGHT,
    justifyContent: "flex-start",
  },
  quoteText: {
    color: Colors.light.white,
    fontSize: 13,
    lineHeight: QUOTE_LINE_HEIGHT,
    letterSpacing: -0.1,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    flexShrink: 1,
  },
});
