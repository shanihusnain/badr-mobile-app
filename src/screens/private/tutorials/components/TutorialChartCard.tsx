import React, { useMemo } from "react";
import { Text, View } from "react-native";
import Svg, { Circle, Line, Polyline } from "react-native-svg";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { StyleSheet } from "react-native";

const DAYS = [
  { day: "SUN", date: "01" },
  { day: "MON", date: "02" },
  { day: "TUE", date: "03" },
  { day: "WED", date: "04" },
  { day: "THU", date: "05" },
  { day: "FRI", date: "06" },
  { day: "SAT", date: "07" },
];

type TutorialChartCardProps = {
  title: string;
  primary: number[];
  secondary: number[];
  primaryColor: string;
  secondaryColor: string;
};

function pointsFor(
  values: number[],
  width: number,
  height: number,
): Array<{ x: number; y: number }> {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  return values.map((value, index) => {
    const x =
      values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return { x, y };
  });
}

export function TutorialChartCard({
  title,
  primary,
  secondary,
  primaryColor,
  secondaryColor,
}: TutorialChartCardProps) {
  const width = 320;
  const height = 110;
  const primaryPts = useMemo(
    () => pointsFor(primary, width, height),
    [primary],
  );
  const secondaryPts = useMemo(
    () => pointsFor(secondary, width, height),
    [secondary],
  );
  const primaryPolyline = primaryPts.map((p) => `${p.x},${p.y}`).join(" ");
  const secondaryPolyline = secondaryPts.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <View style={styles.card}>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <View style={styles.chartWrap}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
          {[0.25, 0.5, 0.75].map((ratio) => (
            <Line
              key={ratio}
              x1={0}
              y1={height * ratio}
              x2={width}
              y2={height * ratio}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth={1}
            />
          ))}
          <Polyline
            points={secondaryPolyline}
            fill="none"
            stroke={secondaryColor}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Polyline
            points={primaryPolyline}
            fill="none"
            stroke={primaryColor}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {secondaryPts.map((point, index) => (
            <Circle
              key={`s-${index}`}
              cx={point.x}
              cy={point.y}
              r={3.2}
              fill={secondaryColor}
            />
          ))}
          {primaryPts.map((point, index) => (
            <Circle
              key={`p-${index}`}
              cx={point.x}
              cy={point.y}
              r={3.2}
              fill={primaryColor}
            />
          ))}
        </Svg>
      </View>
      <View style={styles.daysRow}>
        {DAYS.map((item) => (
          <View key={item.day} style={styles.dayCol}>
            <Text style={styles.dayLabel}>{item.day}</Text>
            <Text style={styles.dateLabel}>{item.date}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.light.greybuttonBackground,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    justifyContent: "space-between",
  },
  title: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  chartWrap: {
    flex: 1,
    minHeight: 96,
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  dayCol: {
    alignItems: "center",
    flex: 1,
  },
  dayLabel: {
    color: Colors.light.green,
    fontFamily: fonts.primary.semiBold,
    fontSize: 10,
    letterSpacing: 0.2,
  },
  dateLabel: {
    color: Colors.light.subtext,
    fontFamily: fonts.primary.regular,
    fontSize: 10,
    marginTop: 2,
  },
});
