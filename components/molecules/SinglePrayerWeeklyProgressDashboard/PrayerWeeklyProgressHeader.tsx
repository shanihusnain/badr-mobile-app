import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { DashBoardCalenderIcon } from "@/assets/icons";

type PrayerWeeklyProgressHeaderProps = {
  weekFraction: string;
  weekRangeLabel: string;
  loading?: boolean;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
};

export function PrayerWeeklyProgressHeader({
  weekFraction,
  weekRangeLabel,
  loading = false,
  onPrevWeek,
  onNextWeek,
}: PrayerWeeklyProgressHeaderProps) {
  const { t } = useTranslation();
  const twoMonthRangePattern =
    /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d+\s*(?:-|–|—)\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d+/i;
  const isLongRangeLabel = twoMonthRangePattern.test(weekRangeLabel);

  return (
    <View style={styles.headerRow}>
      <View style={styles.headerLeft}>
        <DashBoardCalenderIcon size={24} color={Colors.light.graylightshade} />
        {!loading ? (
          <Text style={styles.weekFractionText} numberOfLines={1}>
            {`${weekFraction} ${t("homeScreen.weeklyProgress_weeks")}`}
          </Text>
        ) : null}
      </View>

      <View
        style={[
          styles.headerNav,
          isLongRangeLabel && styles.headerNavLongRange,
        ]}
      >
        <TouchableOpacity
          onPress={onPrevWeek}
          disabled={!onPrevWeek || loading}
          activeOpacity={onPrevWeek && !loading ? 0.7 : 1}
          style={styles.navBtn}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={
              onPrevWeek && !loading
                ? Colors.light.dullWhite
                : Colors.light.dullWhite + "4D"
            }
          />
        </TouchableOpacity>
        <View
          style={[
            styles.weekRangeTextWrap,
            loading && styles.weekRangeTextWrapLongRange,
          ]}
        >
          {!loading ? (
            <Text
              style={styles.weekRangeText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {weekRangeLabel}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity
          onPress={onNextWeek}
          disabled={!onNextWeek || loading}
          activeOpacity={onNextWeek && !loading ? 0.7 : 1}
          style={styles.navBtn}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={
              onNextWeek && !loading
                ? Colors.light.dullWhite
                : Colors.light.dullWhite + "4D"
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 6,
    paddingHorizontal: 10,
    minWidth: 0,
    // width: "100%",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
    flex: 1,
  },
  weekFractionText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    lineHeight: 19,
  },
  headerNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    flexShrink: 0,
    alignSelf: "flex-end",
    minWidth: 0,
  },
  headerNavLongRange: {
    gap: 8,
  },
  navBtn: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  weekRangeTextWrap: {
    flexShrink: 0,
    minWidth: 0,
    // width: 92,
    justifyContent: "center",
    alignItems: "center",
  },
  weekRangeTextWrapLongRange: {
    width: 80,
    paddingHorizontal: 8,
  },
  loadingCircleWrap: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.7,
  },
  loadingRangeWrap: {
    width: 92,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.7,
  },
  loadingCircle: {
    width: 18,
    height: 18,
  },
  weekRangeText: {
    color: Colors.light.white,
    fontSize: 15,
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
    textAlign: "center",
    lineHeight: 20,
  },
});
