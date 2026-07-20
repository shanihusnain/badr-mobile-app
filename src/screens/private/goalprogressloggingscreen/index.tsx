import React, { useMemo, useState, useLayoutEffect } from "react";
import { View, Text, ScrollView, ImageBackground, Image } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  TaperedCircleBorder,
  parsePercent,
} from "@/components/atoms/TaperedCircleBorder";
import { Colors } from "@/constants/theme";
import { getResolvedGoalById, GoalId } from "../home/components/goalsData";
import { styles } from "./styles";
import { useRouter, useNavigation } from "expo-router";
import { HeaderWithCrossTitleDynamicIcon } from "@/components/atoms/HeaderWithCrossTitleDynamicIcon";
import { useTranslation } from "react-i18next";
import { LoggingFlowSlot } from "./components/LoggingFlowSlot";
import { getLoggingFlowTemplate } from "./loggingFlowRegistry";
import type { ProgressLogEntry } from "./types";
import { WeeklyProgressSection } from "./components/WeeklyProgressSection";
import { PastAchievementsSection } from "./components/PastAchievementsSection";
import { MemorisationSurahProvider } from "./memorisationSurahContext";
import { MemorisationHizbProvider } from "./memorisationHizbContext";
import { MemorisationJuzProvider } from "./memorisationJuzContext";
import { RecitationSurahProvider } from "./recitationSurahContext";
import { isSurahRecitationGoalId } from "./quranRecitationTarget";
import { isHizbMemorisationGoalId } from "./quranMemorisationHizbTarget";
import { isJuzMemorisationGoalId } from "./quranMemorisationJuzTarget";
import { isSurahMemorisationGoalId } from "./quranMemorisationTarget";
import { isMissedRamadanFastsGoalId } from "./missedRamadanFastsTarget";
import { isProphetDawoodFastsGoalId } from "./prophetDawoodFastsTarget";
import { isWhiteDaysFastsGoalId } from "./whiteDaysFastsTarget";
import { isMondayThursdayFastsGoalId } from "./mondayThursdayFastsTarget";
import {
  getMondayThursdayFastGoalTarget,
  getMondayThursdayFastRingSegments,
} from "./mondayThursdayFastsData";

interface GoalProgressLoggingScreenProps {
  goalId: string;
}

function GoalProgressLoggingContent({
  goalData,
  goalId,
  onDropdownOpenChange,
}: {
  goalData: NonNullable<ReturnType<typeof getResolvedGoalById>>;
  goalId: GoalId;
  onDropdownOpenChange?: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const [weeklyRefreshKey, setWeeklyRefreshKey] = useState(0);
  const [weekViewPercent, setWeekViewPercent] = useState<number | null>(null);
  const template = getLoggingFlowTemplate(goalId);
  const liveGoalData = useMemo(
    () => getResolvedGoalById(goalId) ?? goalData,
    [goalData, goalId, weeklyRefreshKey],
  );
  const isSurahMemorisation =
    template === "quran-memorisation" && isSurahMemorisationGoalId(goalId);
  const isHizbMemorisation =
    template === "quran-memorisation" && isHizbMemorisationGoalId(goalId);
  const isJuzMemorisation =
    template === "quran-memorisation" && isJuzMemorisationGoalId(goalId);
  const isSurahRecitation =
    template === "quran-recitation" && isSurahRecitationGoalId(goalId);

  const isMondayThursdayFasts = isMondayThursdayFastsGoalId(goalId);
  const displayPercentage =
    isMondayThursdayFasts && weekViewPercent !== null
      ? `${weekViewPercent}%`
      : liveGoalData.percentage;
  const mondayThursdayCompletedCount = useMemo(() => {
    if (!isMondayThursdayFasts) return 0;
    const total = getMondayThursdayFastGoalTarget();
    const percent = parsePercent(displayPercentage);
    return Math.min(total, Math.round((percent / 100) * total));
  }, [isMondayThursdayFasts, displayPercentage, weeklyRefreshKey]);
  const mondayThursdayRingSegments = useMemo(() => {
    if (!isMondayThursdayFasts) return undefined;
    return getMondayThursdayFastRingSegments(mondayThursdayCompletedCount);
  }, [isMondayThursdayFasts, mondayThursdayCompletedCount]);
  const percentageNum = displayPercentage.replace("%", "");
  const isGoalComplete = parsePercent(displayPercentage) >= 100;
  const cleanLabel = liveGoalData.target
    ? liveGoalData.target.toString()
    : liveGoalData.label.startsWith("/")
      ? liveGoalData.label.substring(1)
      : liveGoalData.label;
  const ringGoalLabel = isMissedRamadanFastsGoalId(goalId)
    ? t("progressLogging.missedRamadanRingGoal", {
      count: liveGoalData.target ?? cleanLabel,
    })
    : isMondayThursdayFastsGoalId(goalId)
      ? t("progressLogging.mondayThursdayRingGoal", {
        count: liveGoalData.target ?? cleanLabel,
      })
      : t("homeScreen.weeklyProgress_goalLabel", { label: cleanLabel });

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case "PRAYER":
        return Colors.light.ringPrayer;
      case "QURAN":
        return Colors.light.ringQuran;
      case "FASTING":
        return Colors.light.green;
      case "SADAQAH":
        return Colors.light.ringSadaqah;
      default:
        return Colors.light.green;
    }
  };

  const categoryColor = getCategoryColor(liveGoalData.category);

  const scrollContent = (
    <>
      <View style={styles.goalInfoContainer}>
        {isGoalComplete ? (
          <View style={styles.ringCheckmark}>
            <Ionicons name="checkmark-circle" size={28} color={categoryColor} />
          </View>
        ) : null}
        <TaperedCircleBorder
          percentage={displayPercentage}
          progressColor={categoryColor}
          borderColor={Colors.light.dullWhiteOpacity}
          size={174}
        >
          <View style={styles.largeCircleInner}>
            <Text style={styles.circleGoalText}>{ringGoalLabel}</Text>
            <View style={styles.circlePercentRow}>
              <Text style={styles.circlePercentNumber}>{percentageNum}</Text>
              <Text style={styles.circlePercentSymbol}>%</Text>
            </View>
          </View>
        </TaperedCircleBorder>
      </View>

      <LoggingFlowSlot
        goalData={liveGoalData}
        onDropdownOpenChange={onDropdownOpenChange}
        onLogComplete={(entry: ProgressLogEntry) => {
          console.log("Logged progress:", entry);
          setWeeklyRefreshKey((current) => current + 1);
        }}
      />

      <View style={styles.weeklyDashboardWrapper}>
        <WeeklyProgressSection
          goalData={liveGoalData}
          refreshKey={weeklyRefreshKey}
          onWeekProgressPercentChange={
            isMondayThursdayFasts ? setWeekViewPercent : undefined
          }
        />
      </View>

      <View style={styles.weeklyDashboardWrapper}>
        <PastAchievementsSection
          goalData={liveGoalData}
          refreshKey={weeklyRefreshKey}
        />
      </View>
    </>
  );

  if (isSurahMemorisation) {
    return (
      <MemorisationSurahProvider>{scrollContent}</MemorisationSurahProvider>
    );
  }

  if (isHizbMemorisation) {
    return <MemorisationHizbProvider>{scrollContent}</MemorisationHizbProvider>;
  }

  if (isJuzMemorisation) {
    return <MemorisationJuzProvider>{scrollContent}</MemorisationJuzProvider>;
  }

  if (isSurahRecitation) {
    return (
      <RecitationSurahProvider goalId={goalId}>
        {scrollContent}
      </RecitationSurahProvider>
    );
  }

  return scrollContent;
}

export const GoalProgressLoggingScreen = ({
  goalId: goalIdParam,
}: GoalProgressLoggingScreenProps) => {
  const router = useRouter();
  const goalId = (goalIdParam || "") as GoalId;
  const goalData = getResolvedGoalById(goalId);
  const [screenScrollEnabled, setScreenScrollEnabled] = useState(true);

  if (!goalData) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Goal data not found: {goalId}
          </Text>
        </View>
      </View>
    );
  }

  const template = getLoggingFlowTemplate(goalId);
  const isSadaqahJariyah = template === "sadaqah-jariyah";
  const isSadaqahVolunteering = template === "sadaqah-volunteering";
  const isLillah = template === "lillah";
  const isFidya = template === "fidya";
  const isKaffarah = template === "kaffarah-fasts-oaths";
  const isMissedZakat = template === "missed-zakat";
  const isProphetDawood = isProphetDawoodFastsGoalId(goalId);
  const isMissedRamadan = isMissedRamadanFastsGoalId(goalId);
  const isWhiteDays = isWhiteDaysFastsGoalId(goalId);
  const isMondayThursdayFasts = isMondayThursdayFastsGoalId(goalId);

  const shouldUseBackground =
    isSadaqahJariyah || isSadaqahVolunteering || isLillah || isFidya || isKaffarah || isMissedZakat || isProphetDawood || isMissedRamadan || isWhiteDays || isMondayThursdayFasts;

  const backgroundSource = isSadaqahVolunteering
    ? require("@/assets/images/volunteeringservicesimagebackground.png")
    : (isSadaqahJariyah || isProphetDawood)
      ? require("@/assets/images/sadaqahjariyahimagebackground.png")
      : isMissedRamadan
        ? require("@/assets/images/missedramadanfastsbackgroundimage.png")
        : isWhiteDays
          ? require("@/assets/images/whitedaysfastsbackgroundimage.jpg")
          : isMondayThursdayFasts
            ? require("@/assets/images/mondays&thursdaysfastsbackgroundimage.jpg")
            : isLillah
              ? require("@/assets/images/lillahdonationsbackgroundimage.png")
              : isFidya
                ? require("@/assets/images/fidyaimagebackground.png")
                : isKaffarah
                  ? require("@/assets/images/kaffarahImagebackground.png")
                  : isMissedZakat
                    ? require("@/assets/images/zakatbackgroundimage.png")
                    : undefined;

  const scrollView = (
    <ScrollView
      style={[styles.container, shouldUseBackground && styles.transparentBackground]}
      contentContainerStyle={[styles.scrollContent, shouldUseBackground ? { paddingTop: 100 } : undefined]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      scrollEnabled={screenScrollEnabled}
      nestedScrollEnabled
    >
      {shouldUseBackground && backgroundSource && (
        <Image
          source={backgroundSource}
          style={[styles.backgroundImage, { top: -90, height: 880 }]}
          resizeMode="cover"
        />
      )}
      <GoalProgressLoggingContent
        goalData={goalData}
        goalId={goalId}
        onDropdownOpenChange={(open) => setScreenScrollEnabled(!open)}
      />
    </ScrollView>
  );

  const navigation = useNavigation();

  useLayoutEffect(() => {
    if (shouldUseBackground) {
      navigation.setOptions({
        headerShown: true,
        header: () => (
          <HeaderWithCrossTitleDynamicIcon
            title={goalData.title ?? goalData.label}
            navigation={navigation}
            bgcolor="transparent"
            iconName="chevron-left"
            leftButtonBackground="rgba(255,255,255,0.08)"
            onBackPress={() => navigation.goBack()}
          />
        ),
      });
    } else {
      navigation.setOptions({ headerShown: false });
    }
  }, [navigation, shouldUseBackground, goalData]);

  return scrollView;
};
