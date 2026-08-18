import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { NegativeProgressIcon, PositiveProgressIcon } from "@/assets/icons";
import type { ReactNode } from "react";

export type InsightCardProps = {
  iconFamily?: "Ionicons" | "MaterialCommunityIcons";
  iconName?: string;
  icon?: ReactNode;
  title: string;
  value: string | number;
  subValue?: string;
  trendValue?: string;
  trendDirection?: "up" | "down";
  footerText?: string;
  footerNeutral?: boolean;
  noData?: boolean;
  style?: ViewStyle;
};

export function InsightCard({
  iconFamily = "Ionicons",
  iconName,
  icon,
  title,
  value,
  subValue,
  trendValue,
  trendDirection,
  footerText,
  footerNeutral,
  noData,
  style,
}: InsightCardProps) {
  const isUp = trendDirection === "up";
  const showTrend = !noData && !!trendValue;
  const showNeutralFooter = noData || (!showTrend && (!!footerText || footerNeutral));

  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        {icon ? (
          icon
        ) : iconFamily === "Ionicons" ? (
          <Ionicons
            name={iconName as any}
            size={14}
            color={Colors.light.subtext}
          />
        ) : (
          <MaterialCommunityIcons
            name={iconName as any}
            size={14}
            color={Colors.light.subtext}
          />
        )}
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.valueContainer}>
        <Text style={styles.value}>{noData ? "-- --" : value}</Text>
        {!noData && subValue ? (
          <Text style={styles.subValue}>{subValue}</Text>
        ) : null}
      </View>

      {showTrend ? (
        <View
          style={[styles.trendBadge, isUp ? styles.trendUp : styles.trendDown]}
        >
          {isUp ? <PositiveProgressIcon /> : <NegativeProgressIcon />}
          <Text
            style={[
              styles.trendText,
              isUp ? styles.trendTextUp : styles.trendTextDown,
            ]}
          >
            {trendValue}
          </Text>
        </View>
      ) : null}

      {showNeutralFooter ? (
        <View style={styles.footerBadge}>
          {(noData ||
            footerNeutral ||
            !String(footerText ?? "").trim().startsWith("•")) && (
            <View style={styles.footerDot} />
          )}
          <Text style={styles.footerText}>
            {noData ? footerText || "No data" : footerText}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 8,
    padding: 12,
    gap: 8,
    flex: 1,
    minWidth: "45%",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  title: {
    flex: 1,
    flexShrink: 1,
    color: Colors.light.subtext,
    fontSize: 10,
    fontFamily: fonts.primary.heavy,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.1,
    lineHeight: 13,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: 2,
  },
  value: {
    color: Colors.light.white,
    fontSize: 24,
    fontFamily: fonts.primary.bold,
    fontWeight: "700",
    lineHeight: 28,
  },
  subValue: {
    color: Colors.light.white,
    fontSize: 10,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  trendUp: {
    backgroundColor: Colors.light.lightgreen,
  },
  trendDown: {
    backgroundColor: Colors.light.calendarBg,
  },
  trendText: {
    fontSize: 10,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  trendTextUp: {
    color: Colors.light.greentextbutton,
  },
  trendTextDown: {
    color: Colors.light.subtext,
  },
  footerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: Colors.light.calendarBg,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 4,
  },
  footerDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.light.subtext,
  },
  footerText: {
    color: Colors.light.subtext,
    fontSize: 9,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
});
