import React, { useMemo, useState, useLayoutEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  useWindowDimensions,
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
import type { LoggingFlowTemplate } from "./types";
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
import { resolvePrayerTypeFromGoalId } from "@/src/utils/prayerGoalMap";
import BottomSheet from "@gorhom/bottom-sheet";
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
import { InformationSheet } from "@/components/molecules/informationsheet";
import { HeaderInfoIcon } from "@/assets/icons";

/** Hero background per prayer / Quran / fasting / sadaqah logging goal. */
function getLoggingBackgroundSource(
  goalId: GoalId,
  template: LoggingFlowTemplate,
): ImageSourcePropType | undefined {
  switch (template) {
    case "tahiyat-ul-wudhu":
      return tahiyyatwudhudetailimage;
    case "five-daily-prayers":
      return fivedailyprayerbottomsheetimage;
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
  const isPrayerFrameRingGoal =
    template === "tahiyat-ul-wudhu" ||
    template === "tahiyat-al-masjid" ||
    template === "missed-prayers" ||
    template === "five-daily-prayers";
  const frameLoading =
    isPrayerFrameRingGoal &&
    (prayerFrame?.isLoading ||
      (!prayerFrame?.frame && !prayerFrame?.isError));
  const liveGoalData = useMemo(
    () => getResolvedGoalById(goalId) ?? goalData,
    [goalData, goalId, weeklyRefreshKey],
  );

  const isMondayThursdayFasts = isMondayThursdayFastsGoalId(goalId);
  const frameAchievementPct = prayerFrame?.frame?.goal.achievementPct;
  const displayPercentage = isPrayerFrameRingGoal
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
  const percentageNum = frameLoading ? "---" : displayPercentage.replace("%", "");
  const frameGoalLabel = prayerFrame?.frame?.goal.label;
  const cleanLabel = frameGoalLabel
    ? frameGoalLabel
    : liveGoalData.target
      ? liveGoalData.target.toString()
      : liveGoalData.label.startsWith("/")
        ? liveGoalData.label.substring(1)
        : liveGoalData.label;
  const ringGoalLabel = isPrayerFrameRingGoal
    ? prayerFrame?.frame
      ? t("homeScreen.weeklyProgress_goalLabel", {
          label: getPrayerFrameRingGoalCountLabel(
            prayerFrame.frame,
            t("progressLogging.unitPrayers"),
          ),
        })
      : "---"
    : isMissedRamadanFastsGoalId(goalId)
      ? t("progressLogging.missedRamadanRingGoal", {
          count: liveGoalData.target ?? cleanLabel,
        })
      : isMondayThursdayFastsGoalId(goalId)
        ? t("progressLogging.mondayThursdayRingGoal", {
            count: liveGoalData.target ?? cleanLabel,
          })
        : t("homeScreen.weeklyProgress_goalLabel", { label: cleanLabel });

  return (
    <>
      <View style={styles.goalInfoContainer}>
        <TaperedCircleBorder
          percentage={displayPercentage}
          borderColor={Colors.light.dullWhiteOpacity}
          size={174}
          variant="illuminated"
        >
          <View style={styles.largeCircleInner}>
            <Text
              style={[
                styles.circleGoalText,
                frameLoading && styles.loadingPlaceholderText,
              ]}
            >
              {frameLoading ? "---" : ringGoalLabel}
            </Text>
            <View style={styles.circlePercentRow}>
              <Text
                style={[
                  styles.circlePercentNumber,
                  frameLoading && styles.loadingPlaceholderText,
                ]}
              >
                {percentageNum}
              </Text>
              <Text
                style={[
                  styles.circlePercentSymbol,
                  frameLoading && styles.loadingPlaceholderText,
                ]}
              >
                %
              </Text>
            </View>
          </View>
        </TaperedCircleBorder>
      </View>

      <LoggingFlowSlot
        goalData={liveGoalData}
        onDropdownOpenChange={onDropdownOpenChange}
        onLogComplete={() => {
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
  onOpenInsights,
}: {
  goalData: NonNullable<ReturnType<typeof getResolvedGoalById>>;
  goalId: GoalId;
  onDropdownOpenChange?: (open: boolean) => void;
  onOpenInsights?: () => void;
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
      <PrayerGoalFrameProvider
        goalId={goalId}
        refreshKey={weeklyRefreshKey}
        onOpenInsights={onOpenInsights}
      >
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
  const navigation = useNavigation();
  const infoSheetRef = useRef<BottomSheet>(null);
  const prayerType = resolvePrayerTypeFromGoalId(goalId);
  const template = getLoggingFlowTemplate(goalId);
  const backgroundSource = getLoggingBackgroundSource(goalId, template);
  const shouldUseBackground = backgroundSource != null;
  const { height: windowHeight } = useWindowDimensions();
  const isTahiyatUlWudhu = template === "tahiyat-ul-wudhu";

  const openInsightsSheet = () => {
    infoSheetRef.current?.expand();
  };

  useLayoutEffect(() => {
    if (!goalData) {
      navigation.setOptions({ headerShown: false });
      return;
    }
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
            rightIcon={<HeaderInfoIcon />}
            onRightPress={prayerType ? openInsightsSheet : undefined}
          />
        ),
      });
    } else {
      navigation.setOptions({ headerShown: false });
    }
  }, [navigation, shouldUseBackground, goalData, prayerType]);

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

  return (
    <View style={styles.container}>
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
            style={[
              styles.backgroundImage,
              isTahiyatUlWudhu
                ? { top: -130, height: windowHeight + 130 }
                : { top: -130, height: 880 },
            ]}
            resizeMode="cover"
          />
        )}
        <GoalProgressLoggingContent
          goalData={goalData}
          goalId={goalId}
          onDropdownOpenChange={(open) => setScreenScrollEnabled(!open)}
          onOpenInsights={openInsightsSheet}
        />
      </ScrollView>
      {prayerType ? (
        <InformationSheet
          ref={infoSheetRef}
          prayerType={prayerType}
          onClose={() => infoSheetRef.current?.close()}
        />
      ) : null}
    </View>
  );
};
