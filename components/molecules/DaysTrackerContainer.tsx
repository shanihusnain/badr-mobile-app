import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTranslation } from "react-i18next";
import { localizeNumber } from "@/src/utils/localizeNumbers";
import MoonProgress from "@/components/atoms/MoonProgress";

interface DaysTrackerContainerProps {
  isBottomSheetView?: boolean;
}

const TOTAL_DAYS = 28;
const CURRENT_DAY = 10;
const OVERALL_PROGRESS = 100;

export const DaysTrackerContainer: React.FC<DaysTrackerContainerProps> = ({
  isBottomSheetView = false,
}) => {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const localizedTotal = localizeNumber(String(TOTAL_DAYS), lng);
  const localizedDay = localizeNumber(String(CURRENT_DAY), lng);
  const localizedProgress = localizeNumber(String(OVERALL_PROGRESS), lng);

  return (
    <View
      style={[
        styles.daysLeftContainer,
        isBottomSheetView && styles.daysLeftContainerSheet,
      ]}
    >
      {/* Header: Days Left */}
      <View style={styles.daysHeaderWrapper}>
        <Text style={styles.daysNumberBold}>{localizedTotal}</Text>
        <Text style={styles.daysNumberRegular}>
          {t("daysTracker.daysLeft", { total: localizedTotal })}
        </Text>
      </View>

      {/* Large Moon Circle */}
      <View style={styles.moonContainer}>
        {/* <MoonProgress progressPercent={OVERALL_PROGRESS} /> */}
      </View>

      {/* Bottom Section with Day and Progress */}
      <View style={styles.bottomInfoWrapper}>
        {/* Bottom Left - Day */}
        <View style={styles.bottomLeftSection}>
          <Text
            style={[
              styles.bottomLabel,
              {
                fontSize: 14,
                fontFamily: fonts.primary.medium,
                fontWeight: "500",
                color: Colors.light.dullWhite,
              },
            ]}
          >
            {t("daysTracker.day")}
          </Text>
          <Text
            style={[
              styles.bottomValue,
              {
                color: Colors.light.white,
                fontFamily: fonts.primary.bold,
                fontWeight: "600",
                fontSize: 18,
              },
            ]}
          >
            {localizedDay}
          </Text>
        </View>

        {/* Bottom Right - Overall Progress */}
        <View style={styles.bottomRightSection}>
          <Text style={styles.bottomLabel}>
            {t("daysTracker.overallProgress")}
          </Text>
          <Text style={styles.bottomValue}> {localizedProgress}%</Text>
        </View>
      </View>

      {/* Conditional Text Blocks for Bottom Sheet View */}
      {isBottomSheetView && (
        <View style={styles.additionalTextSection}>
          <Text style={styles.textBlock1}>
            {t("daysTracker.committedGoals", { count: localizedTotal })}
          </Text>

          <Text style={styles.textBlock2}>
            {t("daysTracker.welcomeJourney")}
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
  moonContainer: {
    backgroundColor: Colors.light.greybuttonBackground,
    width: 220,
    height: 220,
    borderRadius: 110,
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
