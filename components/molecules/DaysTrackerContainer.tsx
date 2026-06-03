import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

interface DaysTrackerContainerProps {
  isBottomSheetView?: boolean;
}

export const DaysTrackerContainer: React.FC<DaysTrackerContainerProps> = ({
  isBottomSheetView = false,
}) => {
  return (
    <View style={[styles.daysLeftContainer, isBottomSheetView && styles.daysLeftContainerSheet]}>
      {/* Header: Days Left */}
      <View style={styles.daysHeaderWrapper}>
        <Text style={styles.daysNumberBold}>28</Text>
        <Text style={styles.daysNumberRegular}>/28 days left</Text>
      </View>

      {/* Large Moon Circle */}
      <View style={styles.largeCircle} />

      {/* Bottom Section with Day and Progress */}
      <View style={styles.bottomInfoWrapper}>
        {/* Bottom Left - Day */}
        <View style={styles.bottomLeftSection}>
          <Text style={styles.bottomLabel}>Day</Text>
          <Text style={styles.bottomValue}>0</Text>
        </View>

        {/* Bottom Right - Overall Progress */}
        <View style={styles.bottomRightSection}>
          <Text style={styles.bottomLabel}>Overall Progress</Text>
          <Text style={styles.bottomValue}>     0%</Text>
        </View>
      </View>

      {/* Conditional Text Blocks for Bottom Sheet View */}
      {isBottomSheetView && (
        <View style={styles.additionalTextSection}>
          <Text style={styles.textBlock1}>
            {"You've committed to working on \n28 goals!"}
          </Text>
          
          <Text style={styles.textBlock2}>
            {"You're all set—your journey toward deeper connection and growth starts soon. As you begin tracking, your moon will fill with light—reflecting every step you take toward growth, connection, and ihsān."}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  daysLeftContainer: {
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 16,
    padding: wp(5),
    alignItems: "center",
    width: "100%",
  },
  daysLeftContainerSheet: {
    // Styling adaptations when inside bottom sheet if needed
  },
  daysHeaderWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(2),
  },
  daysNumberBold: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: fonts.primary.bold,
    fontWeight: "600",
    marginRight: 2,
  },
  daysNumberRegular: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
  },
  largeCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#000000",
    marginVertical: hp(2),
  },
  bottomInfoWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    width: "100%",
    marginTop: hp(2),
  },
  bottomLeftSection: {
    alignItems: "flex-start",
  },
  bottomRightSection: {
    alignItems: "center",
  },
  bottomLabel: {
    color: Colors.light.grey,
    fontSize: 12,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    marginBottom: hp(0.5),
  },
  bottomValue: {
    color: Colors.light.grey,
    fontSize: 18,
    fontFamily: fonts.primary.bold,
    fontWeight: "600",
  },
  additionalTextSection: {
    width: "100%",
    marginTop: 16,
  },
  sheetDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    width: "100%",
    marginVertical: 16,
  },
  textBlock1: {
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 16,
    lineHeight: 16,
    letterSpacing: 0,
    color: Colors.light.white,
    marginBottom: 10,
  },
  textBlock2: {
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: 0.1,
    color: Colors.light.white,
    opacity: 0.8,
  },
});
