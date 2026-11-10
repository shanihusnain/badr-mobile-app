import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import type { JournalingDayProgress } from "../journalingHistory";
import { Forwardchevron, JournalBulbIcon } from "@/assets/icons";

export type JournalingHistoryWeekDashboardProps = {
  weekDays: JournalingDayProgress[];
  /** Dashboard `journalCard.title` — falls back to i18n when omitted. */
  title?: string;
  /** Dashboard `journalCard.button` — falls back to insights i18n when omitted. */
  buttonLabel?: string;
  onDayPress?: (index: number) => void;
  onPressHeader?: () => void;
  onBehaviorInsightsPress?: () => void;
};

const RING_SIZE = 22;

const DAY_TRANSLATION_KEYS: Record<string, string> = {
  Sun: "homeScreen.weeklyProgress_daySun",
  Mon: "homeScreen.weeklyProgress_dayMon",
  Tue: "homeScreen.weeklyProgress_dayTue",
  Wed: "homeScreen.weeklyProgress_dayWed",
  Thu: "homeScreen.weeklyProgress_dayThu",
  Fri: "homeScreen.weeklyProgress_dayFri",
  Sat: "homeScreen.weeklyProgress_daySat",
};

function getDayOfMonth(date: string): number {
  const day = Number.parseInt(date.slice(8, 10), 10);
  return Number.isNaN(day) ? 0 : day;
}

type JournalingDayRingProps = {
  logged: boolean;
};

function JournalingDayRing({ logged }: JournalingDayRingProps) {
  if (logged) {
    return (
      <View style={styles.ringLogged}>
        <AntDesign name="check" size={12} color={Colors.light.white} />
      </View>
    );
  }

  return <View style={styles.ringEmpty} />;
}

export function JournalingHistoryWeekDashboard({
  weekDays,
  title,
  buttonLabel,
  onDayPress,
  onPressHeader,
  onBehaviorInsightsPress,
}: JournalingHistoryWeekDashboardProps) {
  const { t } = useTranslation();
  const headerTitle =
    title?.trim() || t("homeScreen.journalWeeklyTitle");
  const ctaLabel =
    buttonLabel?.trim() || t("homeScreen.journalBehaviorInsights");

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.titleRow}
        onPress={onPressHeader}
        activeOpacity={onPressHeader ? 0.7 : 1}
        disabled={!onPressHeader}
      >
        <Text style={styles.titleText}>{headerTitle}</Text>
        <Forwardchevron />
      </TouchableOpacity>

      <View style={styles.daysRow}>
        {weekDays.map((day, index) => {
          const dayLabel = t(
            (DAY_TRANSLATION_KEYS[day.day] ??
              "homeScreen.weeklyProgress_daySun") as never,
          );
          const dateNumber =
            typeof day.dayNumber === "number" &&
            Number.isFinite(day.dayNumber)
              ? day.dayNumber
              : getDayOfMonth(day.date);
          const labelText =
            dateNumber > 0 ? `${dayLabel} ${dateNumber}` : dayLabel;
          const canPress = Boolean(onDayPress) && !day.isFuture;

          return (
            <TouchableOpacity
              key={day.id}
              style={[styles.dayColumn, day.isFuture && styles.dayColumnFuture]}
              onPress={() => onDayPress?.(index)}
              activeOpacity={canPress ? 0.75 : 1}
              disabled={!canPress}
            >
              <View
                style={[styles.dayItem, day.isToday && styles.dayItemToday]}
              >
                {day.isToday ? (
                  <View style={styles.dayItemTodayBackground} />
                ) : null}
                <JournalingDayRing logged={day.loggedJournal} />
                <Text
                  style={[styles.dayLabel, day.isToday && styles.dayLabelToday]}
                  numberOfLines={1}
                >
                  {labelText}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.insightsButton}
        onPress={onBehaviorInsightsPress}
        activeOpacity={onBehaviorInsightsPress ? 0.8 : 1}
        disabled={!onBehaviorInsightsPress}
      >
        <JournalBulbIcon />
        <Text style={styles.insightsText}>{ctaLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: Colors.light.greybuttonBackground,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 16,
    lineHeight: 19,
    letterSpacing: 0,
  },
  daysRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  dayColumn: {
    flex: 1,
    alignItems: "center",
    minWidth: 0,
  },
  dayColumnFuture: {
    opacity: 0.45,
  },
  dayItem: {
    alignItems: "center",
    gap: 8,
    position: "relative",
  },
  /** Extra gap drops the day label lower inside the today highlight. */
  dayItemToday: {
    gap: 14,
  },
  dayItemTodayBackground: {
    position: "absolute",
    top: -12,
    right: -8,
    bottom: -14,
    left: -8,
    backgroundColor: Colors.light.dayProgressCardBg,
    borderRadius: 8,
  },
  ringLogged: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    backgroundColor: Colors.light.green,
    alignItems: "center",
    justifyContent: "center",
  },
  ringEmpty: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    backgroundColor: Colors.light.selectcategory,
  },
  dayLabel: {
    color: Colors.light.grey,
    fontSize: 11,
    lineHeight: 11,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
  
    textAlign: "center",
  },
  dayLabelToday: {
    color: Colors.light.white,
  },
  insightsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.light.lightgreen,
  },
  insightsText: {
    color: Colors.light.green,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 21,
   
  },
});
