import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import type { JournalingDayProgress } from "../journalingHistory";
import { TopSpace } from "@/components/atoms/TopSpace";

export type JournalingHistoryWeekDashboardProps = {
  weekDays: JournalingDayProgress[];
  onDayPress?: (index: number) => void;
  onPressHeader?: () => void;
  onBehaviorInsightsPress?: () => void;
};

const RING_SIZE = 20;
const TODAY_BOX_PADDING = 16;

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
        <AntDesign name="check" size={11} color={Colors.light.white} />
      </View>
    );
  }

  return <View style={styles.ringEmpty} />;
}

export function JournalingHistoryWeekDashboard({
  weekDays,
  onDayPress,
  onPressHeader,
  onBehaviorInsightsPress,
}: JournalingHistoryWeekDashboardProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.titleRow}
        onPress={onPressHeader}
        activeOpacity={onPressHeader ? 0.7 : 1}
        disabled={!onPressHeader}
      >
        <Text style={styles.titleText}>
          {t("homeScreen.journalWeeklyTitle")}
        </Text>
        <AntDesign name="right" size={14} color={Colors.light.white} />
      </TouchableOpacity>

      <View style={styles.daysRow}>
        {weekDays.map((day, index) => {
          const dayLabel = t(
            (DAY_TRANSLATION_KEYS[day.day] ??
              "homeScreen.weeklyProgress_daySun") as never,
          );
          const dateNumber = getDayOfMonth(day.date);
          const labelText =
            dateNumber > 0 ? `${dayLabel} ${dateNumber}` : dayLabel;

          return (
            <TouchableOpacity
              key={day.id}
              style={styles.dayColumn}
              onPress={() => onDayPress?.(index)}
              activeOpacity={onDayPress ? 0.75 : 1}
              disabled={!onDayPress}
            >
              <View style={styles.dayItem}>
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
      <TopSpace top={16} />
      <TouchableOpacity
        style={styles.insightsButton}
        onPress={onBehaviorInsightsPress}
        activeOpacity={onBehaviorInsightsPress ? 0.8 : 1}
        disabled={!onBehaviorInsightsPress}
      >
        <MaterialCommunityIcons
          name="lightbulb-on-outline"
          size={18}
          color={Colors.light.green}
        />
        <Text style={styles.insightsText}>
          {t("homeScreen.journalBehaviorInsights")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: Colors.light.greybuttonBackground,
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    textTransform: "uppercase",
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
  dayItem: {
    alignItems: "center",
    gap: 8,
    position: "relative",
  },
  dayItemTodayBackground: {
    position: "absolute",
    top: -TODAY_BOX_PADDING,
    right: -TODAY_BOX_PADDING,
    bottom: -TODAY_BOX_PADDING,
    left: -TODAY_BOX_PADDING,
    backgroundColor: Colors.light.dayProgressCardBg,
    borderRadius: 12,
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
    lineHeight: 13,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    textAlign: "center",
  },
  dayLabelToday: {
    color: Colors.light.white,
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
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
    fontSize: 13,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
});
