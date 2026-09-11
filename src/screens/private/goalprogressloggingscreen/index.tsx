import React, {
  useMemo,
  useState,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  type ImageSourcePropType,
  Platform,
} from "react-native";
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
import {
  QuranGoalFrameProvider,
  useOptionalQuranGoalFrameContext,
} from "./quranGoalFrameContext";
import { getPrayerFrameRingGoalCountLabel } from "@/src/utils/prayerGoalFrameMap";
import { getQuranFrameRingGoalCountLabel, getQuranFrameGoalTitle } from "@/src/utils/quranGoalFrameMap";
import { resolvePrayerTypeFromGoalId } from "@/src/utils/prayerGoalMap";
import { isQuranHoursGoalId } from "./types";
import BottomSheet from "@gorhom/bottom-sheet";
import {
  tahiyyatwudhudetailimage,
  tahiyyatmasjiddetailimage,
  missedprayerdetailimage,
  duhaprayerdetailimage,
  tawbahprayerdetailimage,
  istikharaprayerdetailimage,
  shukarprayerdetailimage,
  qiyamallaylflowbackgroundimage,
  sunnahrawatibdetailimage,
  fivedailyprayerdetailimage,
  quranrecitationbysurahbackgroundimage,
  quranlisteningbackgroundimage,
  qurantajweedbackgroundimage,
  quranrecitationbottomsheetimage,
  quranmemorizationbottomsheetimage,
} from "@/assets/images";
import { InformationSheet } from "@/components/molecules/informationsheet";
import { QuranHoursInformationSheet } from "@/components/molecules/QuranHoursInformationSheet";
import { DeletePrayerGoalOptions } from "@/components/molecules/DeletePrayerLogOptions";
import { HeaderInfoIcon } from "@/assets/icons";
import { TopSpace } from "@/components/atoms/TopSpace";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { setDailyProgressSheetReturn } from "@/src/screens/private/home/dailyProgressSheetReturn";
import { LoadingComponent } from "@/components/atoms/LoadingComponent";
import { resolveQuranTypeFromGoalId } from "@/src/utils/quranGoalMap";

/** Hero background per prayer / Quran / fasting / sadaqah logging goal. */
function getLoggingBackgroundSource(
  goalId: GoalId,
  template: LoggingFlowTemplate,
): ImageSourcePropType | undefined {
  switch (template) {
    case "tahiyat-ul-wudhu":
      return tahiyyatwudhudetailimage;
    case "five-daily-prayers":
      return fivedailyprayerdetailimage;
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
      return qiyamallaylflowbackgroundimage;
    case "sunnah-rawatib":
      return sunnahrawatibdetailimage;
    case "quran-hours":
      return goalId === "quran-Tajweed"
        ? qurantajweedbackgroundimage
        : quranlisteningbackgroundimage;
    case "quran-recitation":
      return quranrecitationbysurahbackgroundimage;
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
        return fivedailyprayerdetailimage;
      }
      return undefined;
  }
}

interface GoalProgressLoggingScreenProps {
  goalId: string;
  fromDailyProgress?: boolean;
  dailyProgressCategory?: string;
}

function GoalProgressLoggingBody({
  goalData,
  goalId,
  onDropdownOpenChange,
  weeklyRefreshKey,
  setWeeklyRefreshKey,
  onHeroExtentChange,
}: {
  goalData: NonNullable<ReturnType<typeof getResolvedGoalById>>;
  goalId: GoalId;
  onDropdownOpenChange?: (open: boolean) => void;
  weeklyRefreshKey: number;
  setWeeklyRefreshKey: React.Dispatch<React.SetStateAction<number>>;
  /** Height of ring + flow + weekly (parent adds header for full hero). */
  onHeroExtentChange?: (height: number) => void;
}) {
  const { t } = useTranslation();
  const [weekViewPercent, setWeekViewPercent] = useState<number | null>(null);
  const template = getLoggingFlowTemplate(goalId);
  const prayerFrame = useOptionalPrayerGoalFrameContext();
  const quranFrame = useOptionalQuranGoalFrameContext();
  const isQiyamTemplate = template === "qiyam-al-layl";
  const isPrayerFrameRingGoal =
    template === "tahiyat-ul-wudhu" ||
    template === "tahiyat-al-masjid" ||
    template === "missed-prayers" ||
    template === "five-daily-prayers" ||
    template === "duha-prayer" ||
    template === "tawbah-prayer" ||
    template === "istikhara-prayer" ||
    template === "shukr-prayer" ||
    template === "sunnah-rawatib" ||
    isQiyamTemplate;
  const isQuranHoursFrameGoal =
    template === "quran-hours" && isQuranHoursGoalId(goalId);
  const frameLoading =
    (isPrayerFrameRingGoal &&
      (prayerFrame?.isLoading ||
        (!prayerFrame?.frame && !prayerFrame?.isError))) ||
    (isQuranHoursFrameGoal &&
      (quranFrame?.isLoading || (!quranFrame?.frame && !quranFrame?.isError)));
  const liveGoalData = useMemo(
    () => getResolvedGoalById(goalId) ?? goalData,
    [goalData, goalId, weeklyRefreshKey],
  );

  const isMondayThursdayFasts = isMondayThursdayFastsGoalId(goalId);
  const frameAchievementPct =
    prayerFrame?.frame?.goal.achievementPct ??
    quranFrame?.frame?.goal.achievementPct;
  const displayPercentage = isPrayerFrameRingGoal
    ? frameAchievementPct != null
      ? `${frameAchievementPct}%`
      : "0%"
    : isQuranHoursFrameGoal
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
  const percentageNum = frameLoading
    ? "---"
    : displayPercentage.replace("%", "");
  const frameGoalLabel =
    prayerFrame?.frame?.goal.label ??
    (quranFrame?.frame ? getQuranFrameGoalTitle(quranFrame.frame) : undefined);
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
    : isQuranHoursFrameGoal
      ? quranFrame?.frame
        ? t("homeScreen.weeklyProgress_goalLabel", {
            label: getQuranFrameRingGoalCountLabel(
              quranFrame.frame,
              t("progressLogging.unitHours"),
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
      <View
        style={styles.scrollForeground}
        collapsable={false}
        onLayout={
          onHeroExtentChange
            ? (event) => {
                onHeroExtentChange(event.nativeEvent.layout.height);
              }
            : undefined
        }
      >
        <View style={styles.goalInfoContainer}>
          <TaperedCircleBorder
            percentage={displayPercentage}
            borderColor={Colors.light.dullWhiteOpacity}
            size={145}
            variant="illuminated"
          >
            <View style={styles.largeCircleInner}>
              <Text
                style={[
                  styles.circleGoalText,
                  frameLoading && styles.loadingPlaceholderText,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
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
                {!frameLoading ? (
                  <Text style={styles.circlePercentSymbol}>%</Text>
                ) : null}
              </View>
            </View>
          </TaperedCircleBorder>
        </View>
        <TopSpace top={20} />
        <LoggingFlowSlot
          goalData={liveGoalData}
          onDropdownOpenChange={onDropdownOpenChange}
          onLogComplete={() => {
            setWeeklyRefreshKey((current) => current + 1);
          }}
        />
        <TopSpace top={10} />
        <View style={styles.weeklyDashboardWrapper}>
          <WeeklyProgressSection
            goalData={liveGoalData}
            refreshKey={weeklyRefreshKey}
            onWeekProgressPercentChange={
              isMondayThursdayFasts ? setWeekViewPercent : undefined
            }
          />
        </View>
      </View>

      <View style={styles.pastAchievementsWrapper}>
        <PastAchievementsSection
          goalData={liveGoalData}
          refreshKey={weeklyRefreshKey}
        />
      </View>
    </>
  );
}

function GoalProgressLoggingPrayerLoadingGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const prayerFrame = useOptionalPrayerGoalFrameContext();
  const isGoalDataLoading =
    prayerFrame != null &&
    (prayerFrame.isLoading || (!prayerFrame.frame && !prayerFrame.isError));

  if (isGoalDataLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <LoadingComponent size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

function GoalProgressLoggingQuranHoursLoadingGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const quranFrame = useOptionalQuranGoalFrameContext();
  const isGoalDataLoading =
    quranFrame != null &&
    (quranFrame.isLoading || (!quranFrame.frame && !quranFrame.isError));

  if (isGoalDataLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <LoadingComponent size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

function GoalProgressLoggingContent({
  goalData,
  goalId,
  onDropdownOpenChange,
  weeklyRefreshKey,
  setWeeklyRefreshKey,
  onHeroExtentChange,
}: {
  goalData: NonNullable<ReturnType<typeof getResolvedGoalById>>;
  goalId: GoalId;
  onDropdownOpenChange?: (open: boolean) => void;
  weeklyRefreshKey: number;
  setWeeklyRefreshKey: React.Dispatch<React.SetStateAction<number>>;
  onHeroExtentChange?: (height: number) => void;
}) {
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
      onHeroExtentChange={onHeroExtentChange}
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

  return body;
}

export const GoalProgressLoggingScreen = ({
  goalId: goalIdParam,
  fromDailyProgress = false,
  dailyProgressCategory,
}: GoalProgressLoggingScreenProps) => {
  const goalId = (goalIdParam || "") as GoalId;

  const goalData = goalId ? getResolvedGoalById(goalId) : null;
  const [weeklyRefreshKey, setWeeklyRefreshKey] = useState(0);
  const [screenScrollEnabled, setScreenScrollEnabled] = useState(true);
  const navigation = useNavigation();
  const infoSheetRef = useRef<BottomSheet>(null);
  const deletePrayerSheetRef = useRef<BottomSheet>(null);
  const [deletePrayerLogDate, setDeletePrayerLogDate] = useState<string | null>(
    null,
  );
  const prayerType = resolvePrayerTypeFromGoalId(goalId);
  const quranHoursType = isQuranHoursGoalId(goalId)
    ? resolveQuranTypeFromGoalId(goalId)
    : null;
  const template = getLoggingFlowTemplate(goalId);
  const backgroundSource = getLoggingBackgroundSource(goalId, template);
  const shouldUseBackground = backgroundSource != null;
  const needsHeroDarkScrim = template === "missed-prayers";
  const [headerHeight, setHeaderHeight] = useState(0);
  const [heroContentHeight, setHeroContentHeight] = useState(0);
  const heroBottom =
    shouldUseBackground && headerHeight + heroContentHeight > 0
      ? headerHeight + heroContentHeight
      : 0;
  const insets = useSafeAreaInsets();
  const supportsDeletePrayerOptions =
    prayerType === "FIVE_DAILY_PRAYERS" || prayerType === "SUNNAH_RAWATIB";

  const openInsightsSheet = () => {
    infoSheetRef.current?.expand();
  };

  const openDeletePrayerLogOptions = useCallback((date: string) => {
    setDeletePrayerLogDate(date);
    requestAnimationFrame(() => {
      deletePrayerSheetRef.current?.expand();
    });
  }, []);

  const closeDeletePrayerLogOptions = useCallback(() => {
    deletePrayerSheetRef.current?.close();
    setDeletePrayerLogDate(null);
  }, []);

  const handleHeaderBack = () => {
    if (fromDailyProgress && dailyProgressCategory) {
      setDailyProgressSheetReturn({
        view: "detail",
        category: dailyProgressCategory,
      });
    }
    navigation.goBack();
  };

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useLayoutEffect(() => {
    if (!fromDailyProgress || !dailyProgressCategory) return;
    const unsubscribe = navigation.addListener("beforeRemove", () => {
      setDailyProgressSheetReturn({
        view: "detail",
        category: dailyProgressCategory,
      });
    });
    return unsubscribe;
  }, [navigation, fromDailyProgress, dailyProgressCategory]);

  if (!goalId) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <LoadingComponent size="large" />
      </View>
    );
  }

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

  const isPrayerGoal = goalData.category === "PRAYER";

  const screenShell = (
    <View style={styles.container}>
      {shouldUseBackground && backgroundSource ? (
        <View
          style={[
            styles.heroBackgroundFixed,
            heroBottom > 0 ? { height: heroBottom } : undefined,
          ]}
          pointerEvents="none"
          collapsable={false}
        >
          <Image
            source={backgroundSource}
            style={styles.heroBackgroundImage}
            resizeMode="cover"
          />
          {needsHeroDarkScrim ? (
            <View style={styles.heroBackgroundScrim} pointerEvents="none" />
          ) : null}
        </View>
      ) : null}
      <ScrollView
        style={[
          styles.scrollView,
          shouldUseBackground && styles.transparentBackground,
        ]}
        contentContainerStyle={[
          styles.scrollContent,
          shouldUseBackground && styles.scrollContentWithHero,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={screenScrollEnabled}
        nestedScrollEnabled
        bounces={false}
        removeClippedSubviews={false}
      >
        {shouldUseBackground ? (
          <View
            style={[
              styles.scrollHeader,
              { paddingTop: Platform.OS === "ios" ? insets.top - 40 : 0 },
            ]}
            pointerEvents="box-none"
            onLayout={(event) => {
              setHeaderHeight(event.nativeEvent.layout.height);
            }}
          >
            <HeaderWithCrossTitleDynamicIcon
              title={
                isSurahRecitationGoalId(goalId)
                  ? "QURAN RECITATION BY SURAH"
                  : (goalData.title?.toUpperCase() ??
                    goalData.label.toUpperCase())
              }
              navigation={navigation}
              bgcolor="transparent"
              iconName="chevron-left"
              leftButtonBackground="rgba(255,255,255,0.08)"
              onBackPress={handleHeaderBack}
              rightIcon={<HeaderInfoIcon />}
              onRightPress={
                prayerType || quranHoursType ? openInsightsSheet : undefined
              }
            />
          </View>
        ) : null}
        <GoalProgressLoggingContent
          goalData={goalData}
          goalId={goalId}
          onDropdownOpenChange={(open) => setScreenScrollEnabled(!open)}
          weeklyRefreshKey={weeklyRefreshKey}
          setWeeklyRefreshKey={setWeeklyRefreshKey}
          onHeroExtentChange={
            shouldUseBackground ? setHeroContentHeight : undefined
          }
        />
      </ScrollView>
      {prayerType ? (
        <InformationSheet
          ref={infoSheetRef}
          prayerType={prayerType}
          onClose={() => infoSheetRef.current?.close()}
        />
      ) : null}
      {quranHoursType ? (
        <QuranHoursInformationSheet
          ref={infoSheetRef}
          quranGoalType={quranHoursType}
          onClose={() => infoSheetRef.current?.close()}
        />
      ) : null}
      {supportsDeletePrayerOptions ? (
        <DeletePrayerGoalOptions
          ref={deletePrayerSheetRef}
          date={deletePrayerLogDate}
          onClose={closeDeletePrayerLogOptions}
          onDeleted={() => setWeeklyRefreshKey((k) => k + 1)}
        />
      ) : null}
    </View>
  );

  if (isPrayerGoal) {
    return (
      <PrayerGoalFrameProvider
        goalId={goalId}
        refreshKey={weeklyRefreshKey}
        onOpenInsights={openInsightsSheet}
        onOpenDeletePrayerLogOptions={
          supportsDeletePrayerOptions ? openDeletePrayerLogOptions : undefined
        }
      >
        <GoalProgressLoggingPrayerLoadingGate>
          {screenShell}
        </GoalProgressLoggingPrayerLoadingGate>
      </PrayerGoalFrameProvider>
    );
  }

  if (isQuranHoursGoalId(goalId)) {
    return (
      <QuranGoalFrameProvider
        goalId={goalId}
        refreshKey={weeklyRefreshKey}
        onOpenInsights={openInsightsSheet}
      >
        <GoalProgressLoggingQuranHoursLoadingGate>
          {screenShell}
        </GoalProgressLoggingQuranHoursLoadingGate>
      </QuranGoalFrameProvider>
    );
  }

  return screenShell;
};
