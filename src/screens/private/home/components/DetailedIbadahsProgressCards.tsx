import React, { useMemo } from "react";
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
import { HeadPhoneQuranListeningIcon } from "@/assets/icons/HeadPhoneQuranListeningIcon";
import { QuranImageIcon } from "@/assets/icons/QuranImageIcon";
import { QuranMemorizationIcon } from "@/assets/icons/QuranMemorizationIcon";
import { ManQuranTajweedIcon } from "@/assets/icons/ManQuranTajweedIcon";
import { MissedRamadanGreenCardIcon } from "@/assets/icons/MissedRamadanGreenCardIcon";
import { SvgComponent as MissedRamadanFasticonNew } from "@/assets/icons/MissedRamadanFasticonNew";
import { FastingFlowCardMondayFasts } from "@/assets/icons/FastingFlowCardMondayFasts";
import { FastingFlowCardProphetDawoodCalender } from "@/assets/icons/FastingFlowCardProphetDawoodCalender";
import { MissedZakatFlowCardIcon } from "@/assets/icons/MissedZakatFlowCardIcon";
import { FlowCardFoodReliefIcon } from "@/assets/icons/FlowCardFoodReleifIcon";
import { FlowCardHandHeartIcon } from "@/assets/icons/FlowCardHandHeartIcon";
import { AllahNameIcon } from "@/assets/icons/AllahNameIcon";
import { ThreeHeartIcon } from "@/assets/icons/ThreeHeartIcon";
import { VolunteeringServicesFlowCardIcon } from "@/assets/icons/VolunteeringServicesFlowCardIcon";
import {
  getFigmaForcedSmallCapsTextStyle,
  prepareFigmaForcedSmallCapsText,
} from "@/src/utils/figmaTypography";

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
  centerIconOnMultiLine?: boolean;
  /** Show "---" for progress count + ring until the category goals API responds. */
  loading?: boolean;
  category?: string;
  isQuranGoal?: boolean;
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
      return (
        <FiveDailyPrayerIDetailedIbadhasIcon color={color} size={size + 1} />
      );
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
      return <IstikharaPrayerDetailedIcon color={color} size={size + 2} />;
    case "prayer-shukr":
      return (
        <ShukrPrayerDetailedIbadhasIcon color={color} size={Math.round(size * 1.25)} />
      );
    case "prayer-qiyam":
      return <QiyamAlLaylDetailedIbadhasIcon color={color} size={size} />;
    case "quran-listening":
      return <HeadPhoneQuranListeningIcon color={color} size={size} />;
    case "quran-recitationBySurah-daily":
    case "quran-recitationBySurah-weekly":
    case "quran-recitationByCompletion":
    case "quran-recitationByJuz":
      // Slightly larger book glyph only — circle (iconWrapper) stays 32.
      return <QuranImageIcon color={color} size={Math.round(size * 1.3)} />;
    case "quran-memorisationBySurah":
    case "quran-memorisationByHizb":
    case "quran-memorisationByJuz":
      return <QuranMemorizationIcon color={color} size={size} />;
    case "quran-Tajweed":
      return (
        <ManQuranTajweedIcon color={color} size={Math.round(size * 1.1)} />
      );
    case "fasting-ramadan":
      return (
        <MissedRamadanFasticonNew color={color} size={Math.round(size * 1.1)} />
      );
    case "fasting-mondayThursday":
      return <FastingFlowCardMondayFasts color={color} size={size} />;
    case "fasting-Dawwod":
      return <FastingFlowCardProphetDawoodCalender color={color} size={size} />;
    case "fasting-whiteDays": {
      const diameter = Math.round(size * 1.1);
      return (
        <View
          style={{
            width: diameter,
            height: diameter,
            borderRadius: diameter / 2,
            backgroundColor: color,
          }}
        />
      );
    }
    case "sadaqah-zakat":
      return <MissedZakatFlowCardIcon color={color} size={size} />;
    case "sadaqah-fidya":
      return <FlowCardFoodReliefIcon color={color} size={size} />;
    case "sadaqah-kafarah":
      return <FlowCardHandHeartIcon color={color} size={size} />;
    case "sadaqah-Lillah":
      return <AllahNameIcon color={color} size={size} />;
    case "sadaqah-jariyah":
      return <ThreeHeartIcon color={color} size={size} />;
    case "sadaqah-volunteering":
      return <VolunteeringServicesFlowCardIcon color={color} size={size} />;
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
  centerIconOnMultiLine = false,
  loading = false,
  category,
  isQuranGoal,
}: Props) => {
  const percentNum = percentage.replace("%", "");
  const isFiveDailyPrayerIcon =
    React.isValidElement(icon) &&
    icon.type === FiveDailyPrayerIDetailedIbadhasIcon;
  const isIstikharaIcon =
    React.isValidElement(icon) && icon.type === IstikharaPrayerDetailedIcon;
  const isQuran = Boolean(
    centerIconOnMultiLine ||
    isQuranGoal ||
    category?.toUpperCase() === "QURAN" ||
    progressColor === Colors.light.ringQuran ||
    title?.toLowerCase().includes("quran"),
  );
  const displayTitle = useMemo(
    () => (loading ? "---" : prepareFigmaForcedSmallCapsText(title)),
    [loading, title],
  );
  const titleStyle = useMemo(
    () => [
      styles.title,
      // Prior style: base fontSize 15 + lineHeight 20; callers may override
      // fontSize via titleFontSize (14 / 14.5) while lineHeight stays 20.
      getFigmaForcedSmallCapsTextStyle({
        fontSize: titleFontSize,
        lineHeight: 20,
        letterSpacing: 0,
        color: Colors.light.white,
      }),
    ],
    [titleFontSize],
  );
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
      <View style={[styles.leftSection, isQuran && styles.leftSectionCentered]}>
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: iconBgColor || Colors.light.ibadahIconCircleBg,
              marginTop: isQuran ? 0 : 2,
              paddingBottom: isFiveDailyPrayerIcon ? 2 : 0,
              paddingTop: isIstikharaIcon ? 3 : 0,
              paddingLeft: isIstikharaIcon ? 2 : 0,
              alignSelf: isQuran ? "center" : "flex-start",
            },
          ]}
        >
          {loading ? <Text style={styles.iconPlaceholder}>---</Text> : icon}
        </View>
        <View style={styles.textWrapper}>
          <Text style={titleStyle}>{displayTitle}</Text>
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
          borderColor={Colors.light.ringTrackEmpty}
          size={64}
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
    backgroundColor: Colors.light.ibadahProgressCardBg,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    minWidth: 0,
    marginRight: 12,
  },
  leftSectionCentered: {
    alignItems: "center",
    justifyContent: "center",
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
    marginBottom: 2,
    flexShrink: 1,
  },
  subtitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  boldText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 14,
  },
  regularText: {
    color: Colors.light.subtext,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    fontWeight: "500",
  },
  rightSection: {
    flexShrink: 0,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginRight: 10,
    overflow: "visible",
    width: 40,
    height: 40,
  },
  percentTextContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
  },
  percentText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 13,
    fontWeight: "500",
  },
  percentSymbol: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 8,
    marginLeft: 0.5,
  },
});
