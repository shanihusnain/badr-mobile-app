import React, { forwardRef, useCallback, useMemo } from "react";
import { StyleSheet, View, Text } from "react-native";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import type { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { DaysTrackerContainer } from "./DaysTrackerContainer";
import { GoalDetailsCard } from "./PrayersGoalDetailsCard";
import { useTranslation } from "react-i18next";

type Props = {
  onClose: () => void;
};

export const NamazGoalBottomSheet = forwardRef<BottomSheet, Props>(
  ({ onClose }, ref) => {
    const { t, i18n } = useTranslation();
    const snapPoints = useMemo(() => ["50%", "92%"], []);

    const renderBackdrop = useCallback(
      (props: BottomSheetDefaultBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
        />
      ),
      [],
    );

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={onClose}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handle}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Date Range Header with Navigation Arrows */}
          <View style={styles.dateHeaderContainer}>
            <Ionicons
              name={i18n.language === "ar" ? "chevron-forward-outline" : "chevron-back-outline"}
              size={24}
              color={Colors.light.white}
            />
            <Text style={styles.dateText}>{t("namazGoalBottomSheet.dateRange")}</Text>
            <Ionicons
              name={i18n.language === "ar" ? "chevron-back-outline" : "chevron-forward-outline"}
              size={24}
              color={Colors.light.white}
            />
          </View>

          {/* 1. Upper Container: Days Tracker Container in Bottom Sheet Mode */}
          <DaysTrackerContainer isBottomSheetView={true} />

          {/* 2. Secondary Containers: Custom Goal Details Cards */}
          <GoalDetailsCard title={t("homeScreen.prayers")} percentage="0%" />
          <GoalDetailsCard title={t("homeScreen.quran")} percentage="0%" />
          <GoalDetailsCard title={t("homeScreen.fasting")} percentage="0%" />
          <GoalDetailsCard title={t("homeScreen.sadaqah")} percentage="0%" />
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: Colors.light.blackBackground,
  },
  handle: {
    backgroundColor: Colors.light.grey,
    width: "30%",
    height: 4,
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  dateHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  dateText: {
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0,
    textAlign: "center",
    textTransform: "uppercase",
    color: Colors.light.white,
    flex: 1,
  },
});
