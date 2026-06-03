import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { TaperedCircleBorder } from "../atoms/TaperedCircleBorder";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

interface GoalDetailsCardProps {
  title: string;
  percentage: string;
  goalsCount?: string;
  notStarted?: string;
  inProgress?: string;
  completed?: string;
}

export const GoalDetailsCard: React.FC<GoalDetailsCardProps> = ({
  title,
  percentage,
  goalsCount = "11 Goals",
  notStarted = "11",
  inProgress = "0",
  completed = "0",
}) => {
  return (
    <View style={styles.card}>
      {/* Header Text */}
      <Text style={styles.headerText}>{title}</Text>

      {/* Center Visual: Scaled-up Tapered Progress Circle */}
      <View style={styles.circleContainer}>
        <TaperedCircleBorder size={220} borderColor={Colors.light.calendarBg}>
          <View style={styles.stackedTextContainer}>
            <Text style={styles.topText}>{goalsCount}</Text>
            <Text style={styles.bottomText}>{percentage}</Text>
          </View>
        </TaperedCircleBorder>
      </View>

      {/* Grid Statistics Footer */}
      <View style={styles.footerRow}>
        {/* Column 1: Left */}
        <View style={styles.column}>
          <Text style={styles.columnLabel}>NOT STARTED</Text>
          <Text style={styles.columnValue}>{notStarted}</Text>
        </View>

        {/* Column 2: Center */}
        <View style={styles.column}>
          <Text style={styles.columnLabel}>IN PROGRESS</Text>
          <Text style={[styles.columnValue, { color: Colors.light.ringMonThu }]}>{inProgress}</Text>
        </View>

        {/* Column 3: Right */}
        <View style={styles.column}>
          <Text style={styles.columnLabel}>COMPLETED</Text>
          <Text style={[styles.columnValue, { color: Colors.light.green }]}>{completed}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 16,
    padding: wp(5),
    width: "100%",
    marginTop: 16,
  },
  headerText: {
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0,
    textTransform: "uppercase",
    color: Colors.light.white,
    alignSelf: "flex-start",
    marginBottom: hp(2),
  },
  circleContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: hp(2),
  },
  stackedTextContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  topText: {
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    color: Colors.light.white,
    textAlign: "center",
    marginBottom: 4,
  },
  bottomText: {
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    fontSize: 40,
    lineHeight: 40,
    color: Colors.light.white,
    textAlign: "center",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: hp(2),
  },
  column: {
    flex: 1,
    alignItems: "center",
  },
  columnLabel: {
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    fontSize: 10,
    lineHeight: 10,
    color: Colors.light.grey,
    textTransform: "uppercase",
    marginBottom: 6,
    textAlign: "center",
  },
  columnValue: {
    fontFamily: fonts.primary.bold,
    fontWeight: "700",
    fontSize: 22,
    lineHeight: 22,
    color: Colors.light.white,
    textTransform: "uppercase",
    textAlign: "center",
  },
});
