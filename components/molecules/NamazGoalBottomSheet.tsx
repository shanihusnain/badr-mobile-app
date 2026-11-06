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
import { router } from "expo-router";
import { useGetHomeMoon } from "@/src/api/queries/useGetHomeMoon";
import { LoadingComponent } from "@/components/atoms/LoadingComponent";

const CATEGORY_SLUG: Record<string, string> = {
  PRAYER: "prayer",
  QURAN: "quran",
  FASTING: "fasting",
  SADAQAH: "sadaqah",
};

type Props = {
  onClose: () => void;
  onChange?: (index: number) => void;
  /** Home My Day selected date (`YYYY-MM-DD`) for `GET api/home/moon`. */
  date: string;
  /** When false, skip mounting Rive moon (avoids fighting the home-screen instance). */
  isOpen?: boolean;
};

export const NamazGoalBottomSheet = forwardRef<BottomSheet, Props>(
  ({ onClose, onChange, date, isOpen = false }, ref) => {
    const { t, i18n } = useTranslation();
    const snapPoints = useMemo(() => ["50%", "92%"], []);

    const {
      data: moonData,
      isLoading: isLoadingMoon,
      isFetching: isFetchingMoon,
    } = useGetHomeMoon(date, {
      enabled: isOpen && Boolean(date?.trim()),
    });

    const showLoader =
      isOpen && (isLoadingMoon || (isFetchingMoon && !moonData));

    const rangeLabel =
      moonData?.cycle?.rangeLabel?.trim() ||
      t("namazGoalBottomSheet.dateRange");
    const moonCard = moonData?.moonCard ?? null;
    const categories = moonData?.categories ?? [];

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
        onChange={onChange}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handle}
      >
        <BottomSheetScrollView
          contentContainerStyle={[
            styles.content,
            showLoader && styles.contentLoading,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {showLoader ? (
            <LoadingComponent size="large" />
          ) : (
            <>
              {/* Date Range Header with Navigation Arrows */}
              <View style={styles.dateHeaderContainer}>
                <Ionicons
                  name={
                    i18n.language === "ar"
                      ? "chevron-forward-outline"
                      : "chevron-back-outline"
                  }
                  size={24}
                  color={Colors.light.white}
                />
                <Text style={styles.dateText}>{rangeLabel}</Text>
                <Ionicons
                  name={
                    i18n.language === "ar"
                      ? "chevron-back-outline"
                      : "chevron-forward-outline"
                  }
                  size={24}
                  color={Colors.light.white}
                />
              </View>

              {/* 1. Upper Container: Days Tracker Container in Bottom Sheet Mode */}
              {isOpen ? (
                <DaysTrackerContainer
                  isBottomSheetView={true}
                  moonCard={moonCard}
                  committedTitle={moonData?.committedTitle}
                  message={moonData?.message}
                />
              ) : (
                <View style={{ height: 280 }} />
              )}

              {/* 2. Secondary Containers: Custom Goal Details Cards */}
              {categories.map((category) => {
                const slug =
                  CATEGORY_SLUG[
                    String(category.category ?? "").toUpperCase()
                  ] ??
                  String(category.category ?? "")
                    .toLowerCase()
                    .trim();
                if (!slug) return null;

                const pct = Number(category.completedPct);
                const percentage = `${Number.isFinite(pct) ? Math.round(pct) : 0}%`;

                return (
                  <GoalDetailsCard
                    key={category.category}
                    title={category.label?.trim() || category.category}
                    percentage={percentage}
                    goalsCount={category.goalsLabel?.trim() || undefined}
                    notStarted={String(category.notStarted?.value ?? 0)}
                    inProgress={String(category.inProgress?.value ?? 0)}
                    completed={String(category.completed?.value ?? 0)}
                    onPress={() =>
                      router.push({
                        pathname: "/goalprogressoverview/[goal]",
                        params: { goal: slug },
                      })
                    }
                  />
                );
              })}
            </>
          )}
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
  contentLoading: {
    flexGrow: 1,
    minHeight: 320,
    justifyContent: "center",
    alignItems: "center",
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
