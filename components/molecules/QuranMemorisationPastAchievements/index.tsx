import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useWindowDimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import {
  formatMemorisationAyahLabel,
  getMemorisationPastAchievement,
} from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationPastAchievementData";
import { getHizbMemorisationPastAchievement } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationHizbPastAchievementData";
import type {
  HizbMemorisationGoalId,
  SurahMemorisationGoalId,
} from "@/src/screens/private/goalprogressloggingscreen/types";
import { isHizbMemorisationGoalId } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationHizbTarget";
import { useOptionalMemorisationSurahContext } from "@/src/screens/private/goalprogressloggingscreen/memorisationSurahContext";
import { useOptionalMemorisationHizbContext } from "@/src/screens/private/goalprogressloggingscreen/memorisationHizbContext";
import { QuranHoursPastAchievementChartBlock } from "../QuranHoursPastAchievements/QuranHoursPastAchievementChartBlock";
import { TopSpace } from "@/components/atoms/TopSpace";
import {
  getGoalById,
  GoalData,
} from "@/src/screens/private/home/components/goalsData";
import { Image } from "expo-image";

type Props = {
  goalId: SurahMemorisationGoalId | HizbMemorisationGoalId;
};
const STUDY_CARD_WIDTH_RATIO = 0.42;
const STUDY_CARD_GAP = 10;
export function QuranMemorisationPastAchievements({ goalId }: Props) {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const studyCardWidth = screenWidth * STUDY_CARD_WIDTH_RATIO;
  const formatNumber = useLocaleNumber();
  const isHizb = isHizbMemorisationGoalId(goalId);
  const surahContext = useOptionalMemorisationSurahContext();
  const hizbContext = useOptionalMemorisationHizbContext();
  const activeFilterId = isHizb
    ? (hizbContext?.activeHizbId ?? "all")
    : (surahContext?.activeSurahId ?? "all");
  const refreshKey = isHizb
    ? (hizbContext?.refreshKey ?? 0)
    : (surahContext?.refreshKey ?? 0);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [hintDismissed, setHintDismissed] = useState(false);
  const goalData = getGoalById(goalId);
  const studyMaterial = goalData?.studyMaterial ?? [];
  const achievement = useMemo(() => {
    if (isHizb) {
      return getHizbMemorisationPastAchievement(activeFilterId);
    }
    return getMemorisationPastAchievement(activeFilterId);
  }, [activeFilterId, isHizb, refreshKey]);
  const unitName = isHizb
    ? (achievement as ReturnType<typeof getHizbMemorisationPastAchievement>)
        .hizbName
    : (achievement as ReturnType<typeof getMemorisationPastAchievement>)
        .surahName;
  type StudyMaterialItem = NonNullable<GoalData["studyMaterial"]>[number];
  useEffect(() => {
    setSelectedBarIndex(null);
    setHintDismissed(false);
  }, [activeFilterId, goalId, refreshKey]);

  const handleBarPress = useCallback((index: number) => {
    setHintDismissed(true);
    setSelectedBarIndex((current) => (current === index ? null : index));
  }, []);

  const selectedBar =
    selectedBarIndex !== null ? achievement.chartData[selectedBarIndex] : null;

  const displayMemorized =
    selectedBar?.completedHours ?? achievement.memorizedAyahs;
  const displayRemaining =
    selectedBar?.incompleteHours ?? achievement.remainingAyahs;

  const showChartHint = !hintDismissed && selectedBarIndex === null;

  const formatAyahValue = useCallback(
    (value: number) =>
      t("progressLogging.memorisationAyahCount", {
        count: formatNumber(value),
      }),
    [formatNumber, t],
  );

  const studyMaterialKeyExtractor = useCallback(
    (item: StudyMaterialItem) => String(item.id),
    [],
  );
  const renderStudyMaterialItem = useCallback(
    ({ item }: { item: StudyMaterialItem }) => (
      <View style={[styles.studyCard, { width: studyCardWidth }]}>
        <View style={styles.studyThumbnailWrap}>
          <Image
            source={{ uri: item.thumbnail }}
            style={styles.studyThumbnail}
            contentFit="cover"
          />
          <View style={styles.studyTypeBadge}>
            <Text
              style={{
                color: Colors.light.white,
                fontSize: 10,
                fontFamily: fonts.primary.medium,
                fontWeight: "500",
              }}
            >
              {item.type === "video"
                ? "VIDEO"
                : item.type === "podcast"
                  ? "PODCAST"
                  : "ARTICLE"}
            </Text>
          </View>
        </View>
        <Text style={styles.studyDescription} numberOfLines={3}>
          {item.description}
        </Text>
      </View>
    ),
    [studyCardWidth],
  );

  const studyItemSeparator = useCallback(
    () => <View style={{ width: STUDY_CARD_GAP }} />,
    [],
  );
  return (
    <View style={styles.section}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons
            name="trophy-outline"
            size={16}
            color={Colors.light.white}
          />
          <Text style={styles.sectionTitle}>
            {t("progressLogging.pastGoalAchievements")}
          </Text>
        </View>

        <View style={styles.achievementRow}>
          <View style={styles.achievementBlock}>
            <Text style={styles.achievementCaption}>
              {t("progressLogging.memorisationCumulativeProgress")}
            </Text>
            <Text style={styles.achievementPercent}>
              {formatNumber(achievement.progressPercent)}
              <Text style={styles.achievementPercentSymbol}>%</Text>
            </Text>
            {achievement.completed ? (
              <View style={styles.completedBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={12}
                  color={Colors.light.green}
                />
                <Text style={styles.completedBadgeText}>
                  {t("progressLogging.surahStatusCompleted")}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <Text style={styles.summaryText}>
          {t("progressLogging.memorisationCumulativeSummary", {
            memorized: formatNumber(achievement.memorizedAyahs),
            total: formatNumber(achievement.totalAyahs),
            surah: unitName,
          })}
        </Text>

        <View style={styles.goalHeader}>
          <Text style={styles.goalLabel}>
            {t("progressLogging.analyticsCompletedVsIncomplete")}
          </Text>
          <View style={styles.goalPillRow}>
            <Text style={styles.goalPillValue}>
              {formatNumber(achievement.totalAyahs)}{" "}
            </Text>
            <View style={styles.goalPill}>
              <Text style={styles.goalPillText}>
                {t("progressLogging.unitAyahs")}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statColumn}>
            <Text style={styles.statLabel}>
              {t("progressLogging.completed")}
            </Text>
            <Text style={styles.statValueCompleted}>
              {formatMemorisationAyahLabel(displayMemorized)}
            </Text>
          </View>
          <View style={styles.statColumn}>
            <Text style={styles.statLabel}>
              {t("progressLogging.remaining")}
            </Text>
            <Text style={styles.statValueIncomplete}>
              {formatMemorisationAyahLabel(displayRemaining)}
            </Text>
          </View>
        </View>

        <View
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => false}
        >
          <QuranHoursPastAchievementChartBlock
            chartData={achievement.chartData}
            selectedBarIndex={selectedBarIndex}
            onBarPress={handleBarPress}
            chartKey={`${goalId}-${activeFilterId}-${refreshKey}`}
            yMax={achievement.yMax}
            yTicks={achievement.yTicks}
            showHint={showChartHint}
            onDismissHint={() => setHintDismissed(true)}
            hintText={t("progressLogging.chartTapHint")}
            hintActionText={t("progressLogging.okGotIt")}
            pageCount={achievement.chartData.length}
            activePageIndex={selectedBarIndex ?? 0}
            formatBarValue={formatAyahValue}
          />
        </View>
      </View>
      {studyMaterial.length > 0 ? (
        <>
          <TopSpace top={16} />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.insightsTitle}>
              {t("progressLogging.studyMaterial")}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Text style={styles.insightsTitle}>See All</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={16}
                color={Colors.light.white}
              />
            </View>
          </View>
          <TopSpace top={16} />
          <FlatList
            horizontal
            data={studyMaterial}
            keyExtractor={studyMaterialKeyExtractor}
            renderItem={renderStudyMaterialItem}
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={studyItemSeparator}
            contentContainerStyle={styles.studyListContent}
            decelerationRate="fast"
            snapToInterval={studyCardWidth + STUDY_CARD_GAP}
            snapToAlignment="start"
          />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
  },
  card: {
    borderRadius: 14,
    backgroundColor: Colors.light.greybuttonBackground,
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    color: Colors.light.subtext,
    fontSize: 11,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    flexShrink: 1,
  },
  achievementRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  achievementBlock: {
    alignItems: "flex-start",
    gap: 4,
  },
  achievementCaption: {
    color: Colors.light.subtext,
    fontSize: 13,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  achievementPercent: {
    color: Colors.light.white,
    fontSize: 40,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    lineHeight: 44,
  },
  achievementPercentSymbol: {
    fontSize: 22,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.light.lightgreen,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 2,
  },
  completedBadgeText: {
    color: Colors.light.green,
    fontSize: 11,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  summaryText: {
    color: Colors.light.grey,
    fontSize: 12,
    fontFamily: fonts.primary.regular,
    lineHeight: 17,
    textAlign: "center",
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
    backgroundColor: Colors.light.blackBackground,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
  },
  goalLabel: {
    color: Colors.light.subtext,
    fontSize: 11,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    flex: 1,
    marginRight: 8,
  },
  goalPillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  goalPill: {
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 8,
    paddingHorizontal: 2,
    paddingVertical: 5,
  },
  goalPillText: {
    color: Colors.light.white,
    fontSize: 12,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    opacity: 0.8,
  },
  goalPillValue: {
    color: Colors.light.white,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    fontSize: 22,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statColumn: {
    gap: 4,
  },
  statLabel: {
    color: Colors.light.subtext,
    fontSize: 11,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  statValueCompleted: {
    color: Colors.light.green,
    fontSize: 22,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  statValueIncomplete: {
    color: Colors.light.goldenBright,
    fontSize: 22,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  historySection: {
    marginTop: 4,
    gap: 8,
  },
  historyTitle: {
    color: Colors.light.subtext,
    fontSize: 11,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  historyItem: {
    backgroundColor: Colors.light.blackBackground,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  historyItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  historySurah: {
    color: Colors.light.white,
    fontSize: 13,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    flexShrink: 1,
  },
  historyDate: {
    color: Colors.light.grey,
    fontSize: 11,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  historyDetail: {
    color: Colors.light.grey,
    fontSize: 12,
    fontFamily: fonts.primary.regular,
    lineHeight: 17,
  },
  studyListContent: {
    paddingRight: 4,
  },
  studyCard: {
    padding: 8,
    paddingBottom: 12,
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 8,
    gap: 8,
  },
  studyThumbnailWrap: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 6,
    overflow: "hidden",
    position: "relative",
  },
  studyThumbnail: {
    width: "100%",
    height: "100%",
  },
  studyTypeBadge: {
    position: "absolute",
    right: 0,
    top: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: Colors.light.greybuttonBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  studyDescription: {
    color: Colors.light.white,
    fontSize: 12,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    lineHeight: 16,
  },
  insightsTitle: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
