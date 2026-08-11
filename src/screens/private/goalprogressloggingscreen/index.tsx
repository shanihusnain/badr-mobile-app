import React, { useMemo, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  type ImageSourcePropType,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  TaperedCircleBorder,
  parsePercent,
} from "@/components/atoms/TaperedCircleBorder";
import { Colors } from "@/constants/theme";
import { getResolvedGoalById, GoalId } from "../home/components/goalsData";
import { styles } from "./styles";
import { useNavigation } from "expo-router";
import { HeaderWithCrossTitleDynamicIcon } from "@/components/atoms/HeaderWithCrossTitleDynamicIcon";
import { useTranslation } from "react-i18next";
import { LoggingFlowSlot } from "./components/LoggingFlowSlot";
import { getLoggingFlowTemplate } from "./loggingFlowRegistry";
import type { LoggingFlowTemplate, ProgressLogEntry } from "./types";
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
import { isMondayThursdayFastsGoalId } from "./mondayThursdayFastsTarget";
import {
  getMondayThursdayFastGoalTarget,
  getMondayThursdayFastRingSegments,
} from "./mondayThursdayFastsData";
import {
  PrayerGoalFrameProvider,
  useOptionalPrayerGoalFrameContext,
} from "./prayerGoalFrameContext";
import { getPrayerFrameRingGoalCountLabel } from "@/src/utils/prayerGoalFrameMap";
import {
  tahiyyatwudhudetailimage,
  tahiyyatmasjiddetailimage,
  missedprayerdetailimage,
  duhaprayerdetailimage,
  tawbahprayerdetailimage,
  istikharaprayerdetailimage,
  shukarprayerdetailimage,
  qiyamallayldetailimage,
  sunnahrawatibdetailimage,
  fivedailyprayerbottomsheetimage,
  quranlisteningbottomsheetimage,
  qurantajweedbottomsheetimage,
  quranrecitationbottomsheetimage,
  quranmemorizationbottomsheetimage,
} from "@/assets/images";

/** Hero background per prayer / Quran / fasting / sadaqah logging goal. */
function getLoggingBackgroundSource(
  goalId: GoalId,
  template: LoggingFlowTemplate,
): ImageSourcePropType | undefined {
  switch (template) {
    case "tahiyat-ul-wudhu":
      return tahiyyatwudhudetailimage;
    case "tahiyat-al-masjid":
      return tahiyyatmasjiddetailimage;
    case "missed-prayers":
      return missedprayerdetailimage;
    case "duha-prayer":
      return duhaprayerdetailimage;
    case "tawbah-prayer":
      return tawbahprayerdetailimage;
    case "istikhara-prayer":
      return istikharaprayerdetailimage;
    case "shukr-prayer":
      return shukarprayerdetailimage;
    case "qiyam-al-layl":
      return qiyamallayldetailimage;
    case "sunnah-rawatib":
      return sunnahrawatibdetailimage;
    case "quran-hours":
      return goalId === "quran-Tajweed"
        ? qurantajweedbottomsheetimage
        : quranlisteningbottomsheetimage;
    case "quran-recitation":
    case "quran-completion":
    case "quran-juz":
      return quranrecitationbottomsheetimage;
    case "quran-memorisation":
      return quranmemorizationbottomsheetimage;
    case "sadaqah-volunteering":
      return require("@/assets/images/volunteeringservicesimagebackground.png");
    case "sadaqah-jariyah":
      return require("@/assets/images/sadaqahjariyahimagebackground.png");
    case "missed-ramadan-fasts":
      return require("@/assets/images/missedramadanfastsbackgroundimage.png");
    case "white-days-fasts":
      return require("@/assets/images/whitedaysfastsbackgroundimage.jpg");
    case "monday-thursday-fasts":
      return require("@/assets/images/mondays&thursdaysfastsbackgroundimage.jpg");
    case "prophet-dawood-fasts":
      return require("@/assets/images/sadaqahjariyahimagebackground.png");
    case "lillah":
      return require("@/assets/images/lillahdonationsbackgroundimage.png");
    case "fidya":
      return require("@/assets/images/fidyaimagebackground.png");
    case "kaffarah-fasts-oaths":
      return require("@/assets/images/kaffarahImagebackground.png");
    case "missed-zakat":
      return require("@/assets/images/zakatbackgroundimage.png");
    default:
      if (goalId === "prayer-fiveDailyPrayers") {
        return fivedailyprayerbottomsheetimage;
      }
      return undefined;
  }
}

interface GoalProgressLoggingScreenProps {
  goalId: string;
}

function GoalProgressLoggingBody({
  goalData,
  goalId,
  onDropdownOpenChange,
  weeklyRefreshKey,
  setWeeklyRefreshKey,
}: {
  goalData: NonNullable<ReturnType<typeof getResolvedGoalById>>;
  goalId: GoalId;
  onDropdownOpenChange?: (open: boolean) => void;
  weeklyRefreshKey: number;
  setWeeklyRefreshKey: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { t } = useTranslation();
  const [weekViewPercent, setWeekViewPercent] = useState<number | null>(null);
  const template = getLoggingFlowTemplate(goalId);
  const prayerFrame = useOptionalPrayerGoalFrameContext();
  const isTahiyatUlWudhu = template === "tahiyat-ul-wudhu";
  const liveGoalData = useMemo(
    () => getResolvedGoalById(goalId) ?? goalData,
    [goalData, goalId, weeklyRefreshKey],
  );

  const isMondayThursdayFasts = isMondayThursdayFastsGoalId(goalId);
  const frameAchievementPct = prayerFrame?.frame?.goal.achievementPct;
  const displayPercentage = isTahiyatUlWudhu
    ? frameAchievementPct != null
      ? `${frameAchievementPct}%`
      : "0%"
    : isMondayThursdayFasts && weekViewPercent !== null
      ? `${weekViewPercent}%`
      : frameAchievementPct != null
        ? `${frameAchievementPct}%`
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
  const isGoalComplete = isTahiyatUlWudhu
    ? frameAchievementPct != null && frameAchievementPct >= 100
    : parsePercent(displayPercentage) >= 100;
  const frameGoalLabel = prayerFrame?.frame?.goal.label;
  const cleanLabel = frameGoalLabel
    ? frameGoalLabel
    : liveGoalData.target
      ? liveGoalData.target.toString()
      : liveGoalData.label.startsWith("/")
        ? liveGoalData.label.substring(1)
        : liveGoalData.label;
  const ringGoalLabel = isTahiyatUlWudhu
    ? prayerFrame?.frame
      ? t("homeScreen.weeklyProgress_goalLabel", {
          label: getPrayerFrameRingGoalCountLabel(
            prayerFrame.frame,
            t("progressLogging.unitPrayers"),
          ),
        })
      : t("homeScreen.weeklyProgress_goalLabel", { label: "" })
    : isMissedRamadanFastsGoalId(goalId)
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

  const categoryColor = isTahiyatUlWudhu
    ? Colors.light.ringPrayer
    : getCategoryColor(liveGoalData.category);

  return (
    <>
      <View style={styles.goalInfoContainer}>
        {isGoalComplete ? (
          <View style={styles.ringCheckmark}>
            <Ionicons name="checkmark-circle" size={28} color={categoryColor} />
          </View>
        ) : null}
        {/* Illuminated ring colors itself by percentage stage, not category. */}
        <TaperedCircleBorder
          percentage={displayPercentage}
          borderColor={Colors.light.dullWhiteOpacity}
          size={174}
          variant="illuminated"
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
  const [weeklyRefreshKey, setWeeklyRefreshKey] = useState(0);
  const template = getLoggingFlowTemplate(goalId);
  const isSurahMemorisation =
    template === "quran-memorisation" && isSurahMemorisationGoalId(goalId);
  const isHizbMemorisation =
    template === "quran-memorisation" && isHizbMemorisationGoalId(goalId);
  const isJuzMemorisation =
    template === "quran-memorisation" && isJuzMemorisationGoalId(goalId);
  const isSurahRecitation =
    template === "quran-recitation" && isSurahRecitationGoalId(goalId);

  const body = (
    <GoalProgressLoggingBody
      goalData={goalData}
      goalId={goalId}
      onDropdownOpenChange={onDropdownOpenChange}
      weeklyRefreshKey={weeklyRefreshKey}
      setWeeklyRefreshKey={setWeeklyRefreshKey}
    />
  );

  if (isSurahMemorisation) {
    return <MemorisationSurahProvider>{body}</MemorisationSurahProvider>;
  }

  if (isHizbMemorisation) {
    return <MemorisationHizbProvider>{body}</MemorisationHizbProvider>;
  }

  if (isJuzMemorisation) {
    return <MemorisationJuzProvider>{body}</MemorisationJuzProvider>;
  }

  if (isSurahRecitation) {
    return (
      <RecitationSurahProvider goalId={goalId}>{body}</RecitationSurahProvider>
    );
  }

  if (goalData.category === "PRAYER") {
    return (
      <PrayerGoalFrameProvider goalId={goalId} refreshKey={weeklyRefreshKey}>
        {body}
      </PrayerGoalFrameProvider>
    );
  }

  return body;
}

export const GoalProgressLoggingScreen = ({
  goalId: goalIdParam,
}: GoalProgressLoggingScreenProps) => {
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
  const backgroundSource = getLoggingBackgroundSource(goalId, template);
  const shouldUseBackground = backgroundSource != null;

  const scrollView = (
    <ScrollView
      style={[
        styles.container,
        shouldUseBackground && styles.transparentBackground,
      ]}
      contentContainerStyle={[
        styles.scrollContent,
        shouldUseBackground ? { paddingTop: 100 } : undefined,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      scrollEnabled={screenScrollEnabled}
      nestedScrollEnabled
    >
      {shouldUseBackground && backgroundSource && (
        <Image
          source={backgroundSource}
          style={[styles.backgroundImage, { top: -130, height: 880 }]}
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
            title={
              goalData.title?.toUpperCase() ?? goalData.label.toUpperCase()
            }
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
