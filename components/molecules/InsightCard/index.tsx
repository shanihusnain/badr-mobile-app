import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export type InsightCardProps = {
  iconFamily?: "Ionicons" | "MaterialCommunityIcons";
  iconName: string;
  title: string;
  value: string | number;
  subValue?: string;
  trendValue?: string;
  trendDirection?: "up" | "down";
  footerText?: string;
  style?: ViewStyle;
};

export function InsightCard({
  iconFamily = "Ionicons",
  iconName,
  title,
  value,
  subValue,
  trendValue,
  trendDirection,
  footerText,
  style,
}: InsightCardProps) {
  const isUp = trendDirection === "up";

  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        {iconFamily === "Ionicons" ? (
          <Ionicons name={iconName as any} size={14} color={Colors.light.subtext} />
        ) : (
          <MaterialCommunityIcons name={iconName as any} size={14} color={Colors.light.subtext} />
        )}
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
        {subValue && <Text style={styles.subValue}>{subValue}</Text>}
      </View>

      {trendValue && (
        <View style={[styles.trendBadge, isUp ? styles.trendUp : styles.trendDown]}>
          <Ionicons
            name={isUp ? "caret-up" : "caret-down"}
            size={10}
            color={isUp ? Colors.light.green : Colors.light.subtext}
          />
          <Text style={[styles.trendText, isUp ? styles.trendTextUp : styles.trendTextDown]}>
            {trendValue}
          </Text>
        </View>
      )}

      {footerText && (
        <View style={styles.footerBadge}>
          <Text style={styles.footerText}>{footerText}</Text>
        </View>
      )}
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
    alignItems: "center",
    gap: 6,
  },
  title: {
    color: Colors.light.subtext,
    fontSize: 10,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    backgroundColor: Colors.light.calendarBg,
  },
  trendUp: {},
  trendDown: {},
  trendText: {
    fontSize: 10,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  trendTextUp: {
    color: Colors.light.green,
  },
  trendTextDown: {
    color: Colors.light.subtext,
  },
  footerBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.light.calendarBg,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 4,
  },
  footerText: {
    color: Colors.light.subtext,
    fontSize: 9,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
});
