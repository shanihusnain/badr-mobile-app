import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { TaperedCircleBorder } from "@/components/atoms/TaperedCircleBorder";

type Props = {
  title: string;
  subtitleCount: string;
  subtitleLabel: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  percentage: string;
  progressColor: string;
  isSelected?: boolean;
  onPress?: () => void;
  titleFontSize?: number;
};

export const DetailedIbadahsProgressCard = ({
  title,
  subtitleCount,
  subtitleLabel,
  icon,
  iconBgColor,
  percentage,
  progressColor,
  isSelected = false,
  onPress,
  titleFontSize = 15,
}: Props) => {
  const percentNum = percentage.replace("%", "");

  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        { borderColor: isSelected ? Colors.light.green : "transparent" },
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.leftSection}>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: iconBgColor || Colors.light.calendarBg },
          ]}
        >
          {icon}
        </View>
        <View style={styles.textWrapper}>
          <Text style={[styles.title, { fontSize: titleFontSize }]}>
            {title}
          </Text>
          <Text style={styles.subtitle}>
            <Text style={styles.boldText}>{subtitleCount}</Text>
            <Text style={styles.regularText}>{subtitleLabel}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <TaperedCircleBorder
          percentage={percentage}
          progressColor={progressColor}
          borderColor={Colors.light.dullWhiteOpacity}
          size={25}
        >
          <View style={styles.percentTextContainer}>
            <Text style={styles.percentText}>{percentNum}</Text>
            <Text style={styles.percentSymbol}>%</Text>
          </View>
        </TaperedCircleBorder>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 19,
    marginBottom: 12,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textWrapper: {
    justifyContent: "center",
  },
  title: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 15,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  subtitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  boldText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "700",
    fontSize: 13,
  },
  regularText: {
    color: Colors.light.subtext,
    fontFamily: fonts.primary.regular,
    fontSize: 13,
  },
  rightSection: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  percentTextContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
  },
  percentText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 9,
    fontWeight: "600",
  },
  percentSymbol: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 6,
    marginLeft: 0.5,
  },
});
