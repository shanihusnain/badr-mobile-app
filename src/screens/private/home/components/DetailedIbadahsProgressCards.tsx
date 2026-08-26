import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { TaperedCircleBorder } from "@/components/atoms/TaperedCircleBorder";
import { GoalId } from "./goalsData";
import { FiveDailyPrayerIDetailedIbadhasIcon } from "@/assets/icons/FiveDailyPrayerIDetailedIbadhasIcon";
import { SunnahRawatibDetailedIbadhasIcon } from "@/assets/icons/SunnahRawatibDetailedIbadhasIcon";
import { TahiyyatMasjidDetailedIbadhasIcon } from "@/assets/icons/TahiyyatMasjidDetailedIbadhasIcon";
import { MissedPastPrayerDetailedIbadhasIcon } from "@/assets/icons/MissedPastPrayerDetailedIbadhasIcon";
import { DuhaPrayerDetailedIbadhasIcon } from "@/assets/icons/DuhaPrayerDetailedIbadhasIcon";
import { TawbahPrayerDetailedIbadhasIcon } from "@/assets/icons/TawbahPrayerDetailedIbadhasIcon";
import { IstikharaPrayerDetailedIcon } from "@/assets/icons/IstikharaPrayerDetailedIcon";
import { ShukrPrayerDetailedIbadhasIcon } from "@/assets/icons/ShukrPrayerDetailedIbadhasIcon";
import { QiyamAlLaylDetailedIbadhasIcon } from "@/assets/icons/QiyamAlLaylDetailedIbadhasIcon";

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
  /** Show "---" for progress count + ring until the category goals API responds. */
  loading?: boolean;
};

export function getDetailedIbadahIcon(
  goalId: GoalId,
  color: string,
  size = 19,
): React.ReactNode {
  switch (goalId) {
    case "prayer-tahiyyat":
      return <Ionicons name="water" size={25} color={color} />;
    case "prayer-fiveDailyPrayers":
      return <FiveDailyPrayerIDetailedIbadhasIcon color={color} size={size} />;
    case "prayer-sunnah":
      return <SunnahRawatibDetailedIbadhasIcon color={color} size={size} />;
    case "prayer-tahiyyatMasjid":
      return <TahiyyatMasjidDetailedIbadhasIcon color={color} size={size} />;
    case "prayer-missed":
      return <MissedPastPrayerDetailedIbadhasIcon color={color} size={size} />;
    case "prayer-duha":
      return <DuhaPrayerDetailedIbadhasIcon color={color} size={size} />;
    case "prayer-tawbah":
      return <TawbahPrayerDetailedIbadhasIcon color={color} size={size} />;
    case "prayer-istikhara":
      return <IstikharaPrayerDetailedIcon color={color} size={size} />;
    case "prayer-shukr":
      return <ShukrPrayerDetailedIbadhasIcon color={color} size={size} />;
    case "prayer-qiyam":
      return <QiyamAlLaylDetailedIbadhasIcon color={color} size={size} />;
    default:
      return <FontAwesome6 name="person-praying" size={size} color={color} />;
  }
}

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
  loading = false,
}: Props) => {
  const percentNum = percentage.replace("%", "");
  const displayTitle = loading ? "---" : title.toUpperCase();

  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        { borderColor: isSelected ? Colors.light.green : "transparent" },
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress || loading}
    >
      <View style={styles.leftSection}>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: iconBgColor || Colors.light.calendarBg },
          ]}
        >
          {loading ? <Text style={styles.iconPlaceholder}>---</Text> : icon}
        </View>
        <View style={styles.textWrapper}>
          <Text style={[styles.title, { fontSize: titleFontSize }]}>
            {displayTitle}
          </Text>
          <Text style={styles.subtitle}>
            {loading ? (
              <Text style={styles.boldText}>---</Text>
            ) : (
              <>
                <Text style={styles.boldText}>{subtitleCount}</Text>
                <Text style={styles.regularText}>{subtitleLabel}</Text>
              </>
            )}
          </Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <TaperedCircleBorder
          percentage={loading ? "0%" : percentage}
          borderColor={Colors.light.dullWhiteOpacity}
          size={70}
          variant="illuminated"
        >
          <View style={styles.percentTextContainer}>
            {loading ? (
              <Text style={styles.percentText}>---</Text>
            ) : (
              <>
                <Text style={styles.percentText}>{percentNum}</Text>
                <Text style={styles.percentSymbol}>%</Text>
              </>
            )}
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
    overflow: "hidden",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    minWidth: 0,
    marginRight: 12,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  iconPlaceholder: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 11,
  },
  textWrapper: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  title: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 15,
    textTransform: "uppercase",
    marginBottom: 2,
    flexShrink: 1,
    lineHeight: 20,
  },
  subtitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  boldText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "700",
    fontSize: 14,
  },
  regularText: {
    color: Colors.light.subtext,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
  },
  rightSection: {
    flexShrink: 0,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginRight: 10,
    overflow: "visible",
    width: 50,
    height: 50,
  },
  percentTextContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
  },
  percentText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 14,
    fontWeight: "600",
  },
  percentSymbol: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 9,
    marginLeft: 0.5,
  },
});
