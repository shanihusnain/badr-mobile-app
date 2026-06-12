import { fonts } from "@/assets/fonts";
import { TopSpace } from "@/components/atoms/TopSpace";
import { Colors } from "@/constants/theme";
import { globalStyles } from "@/src/globalstyles/globalstyles";
import { Image, ImageSource } from "expo-image";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from "react-native-responsive-screen";

interface GoalProgressCardProps {
  currentDay: number;
  totalDays: number;
  lastActiveDays: number;
  overallProgress: number;
  image?: ImageSource;
}

export const GoalProgressCard = ({
  currentDay,
  totalDays,
  lastActiveDays,
  overallProgress,
  image,
}: GoalProgressCardProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      {/* ── Days left header ── */}
      <Text style={styles.currentDayText}>
        {currentDay}
        <Text style={styles.daysLeftText}>
          {`/${totalDays} ${t("setpersonalizedgoals.daysLeft")}`}
        </Text>
      </Text>

      <TopSpace top={20} />

      {/* ── Image ── */}
      <Image style={styles.image} source={image} />

      {/* ── Stats row ── */}
      <View style={[globalStyles.rowCenter, styles.statsRow]}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{t("setpersonalizedgoals.days")}</Text>
          <Text style={styles.statValue}>{lastActiveDays}</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{t("setpersonalizedgoals.overall progress")}</Text>
          <Text style={styles.statValue}>{`${overallProgress}%`}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: Colors.light.calendarBg,
    padding: 16,
    marginTop: 16,
  },
  currentDayText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "700",
  },
  daysLeftText: {
    fontWeight: "400",
    fontFamily: fonts.primary.regular,
    fontSize: 16,
  },
  image: {
    width: widthPercentageToDP(90),
    height: heightPercentageToDP(30),
  },
  statsRow: {
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
    fontSize: 14,
    color: Colors.light.white,
  },
  statValue: {
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    fontSize: 18,
    color: Colors.light.white,
  },
});
