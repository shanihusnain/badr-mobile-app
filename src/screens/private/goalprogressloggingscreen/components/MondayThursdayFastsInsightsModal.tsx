import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { TaperedCircleBorder } from "@/components/atoms/TaperedCircleBorder";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import type { MondayThursdayFastInsights } from "../mondayThursdayFastsData";

type Props = {
  visible: boolean;
  insights: MondayThursdayFastInsights;
  onClose: () => void;
};

export function MondayThursdayFastsInsightsModal({
  visible,
  insights,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>
              {t("progressLogging.viewInsights")}
            </Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={Colors.light.white} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <View style={styles.ringWrap}>
              <View style={styles.ringCheckmark}>
                <Ionicons
                  name="checkmark-circle"
                  size={28}
                  color={Colors.light.green}
                />
              </View>
              <TaperedCircleBorder
                percentage="100%"
                progressColor={Colors.light.green}
                borderColor={Colors.light.dullWhiteOpacity}
                size={160}
              >
                <View style={styles.ringInner}>
                  <Text style={styles.ringGoal}>
                    {t("progressLogging.mondayThursdayRingGoal", {
                      count: insights.goalTarget,
                    })}
                  </Text>
                  <View style={styles.ringPercentRow}>
                    <Text style={styles.ringPercent}>100</Text>
                    <Text style={styles.ringPercentSymbol}>%</Text>
                  </View>
                </View>
              </TaperedCircleBorder>
            </View>

            <Text style={styles.congratsTitle}>
              {t("progressLogging.mondayThursdayInsightsTitle", {
                count: insights.goalTarget,
              })}
            </Text>
            <Text style={styles.congratsBody}>
              {t("progressLogging.mondayThursdayInsightsBody")}
            </Text>

            <View style={styles.statsCard}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>
                  {t("progressLogging.mondayThursdayLongestStreak")}
                </Text>
                <Text style={styles.statValue}>
                  {t("progressLogging.mondayThursdayStreakDays", {
                    count: formatNumber(insights.longestStreak),
                  })}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>
                  {t("progressLogging.mondayThursdayWeeklyAverage")}
                </Text>
                <Text style={styles.statValue}>
                  {t("progressLogging.mondayThursdayWeeklyAverageValue", {
                    count: formatNumber(insights.weeklyAverage),
                  })}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.65)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    maxHeight: "92%",
    backgroundColor: Colors.light.blackBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.bold,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  content: {
    alignItems: "center",
    gap: 16,
    paddingBottom: 16,
  },
  ringWrap: {
    alignItems: "center",
    position: "relative",
    marginTop: 8,
  },
  ringCheckmark: {
    position: "absolute",
    top: -12,
    zIndex: 2,
  },
  ringInner: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  ringGoal: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 13,
    opacity: 0.9,
    textAlign: "center",
  },
  ringPercentRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  ringPercent: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 30,
  },
  ringPercentSymbol: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 16,
    marginLeft: 2,
  },
  congratsTitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  congratsBody: {
    color: Colors.light.grey,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  statsCard: {
    width: "100%",
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  statLabel: {
    color: Colors.light.grey,
    fontFamily: fonts.primary.medium,
    fontSize: 13,
    flex: 1,
  },
  statValue: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  statDivider: {
    height: 1,
    backgroundColor: Colors.light.calendarBg,
  },
});
