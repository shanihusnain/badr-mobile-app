import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Animated,
  type LayoutChangeEvent,
  ImageBackground,
  Pressable,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Colors } from "@/constants/theme";
import { FlashIcon } from "@/assets/icons/FlashIcon";
import { CustomizeBadgeSettingIcon } from "@/assets/icons/CustomizeBadgeSettingIcon";
import { UpComingFajrIcon } from "@/assets/icons/UpComingFajrIcon";
import { UpComingDuhrIcon } from "@/assets/icons/UpComingDuhrIcon";
import { UpComingAsrIcon } from "@/assets/icons/UpComingAsrIcon";
import { UpComingMaghrebIcon } from "@/assets/icons/UpComingMaghrebIcon";
import { UpComingIshaIcon } from "@/assets/icons/UpComingIshaIcon";
import { SunriseIcon } from "@/assets/icons/SunriseIcon";
import { BadarNameLogo } from "@/assets/icons/BadarNameLogo";
import type { HomePrayerTimelineItem } from "@/src/api/queries/useGetDashboardDataForDate";
import { TaperedCircleBorder } from "@/components/atoms/TaperedCircleBorder";
import { SwipeCardDeck } from "./components/SwipeCardDeck";
import { DailyProgressBottomSheet } from "./components/DailyProgressBottomSheet";
import BottomSheet from "@gorhom/bottom-sheet";
import { DaysTrackerContainer } from "@/components/molecules/DaysTrackerContainer";
import { NamazGoalBottomSheet } from "@/components/molecules/NamazGoalBottomSheet";

import { BottomSheetWrapper } from "@/components/molecules/BottomSheetWrapper";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { DashboardCustomizeBottomSheet } from "./components/DashboardCustomizeBottomSheet";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TopSpace } from "@/components/atoms/TopSpace";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { styles } from "./styles";
import { Tabs } from "@/components/atoms/Tabs";
import {
  DetailedIbadahsProgressCard,
  getDetailedIbadahIcon,
} from "./components/DetailedIbadahsProgressCards";
import {
  HOME_DASHBOARD_CATEGORY_COLOR,
  mapHomeDashboardGoalRows,
  resolveGoalVisibleCount,
  resolveHomeDashboardTabs,
  normalizeHomeDashboardTabKey,
} from "./mapHomeDashboard";
import { useGetHomeDashboard } from "@/src/api/queries/useGetHomeDashboard";
import { TodayGoalProgressCard } from "./components/TodayGoalProgressCard";
import { consumeDailyProgressSheetReturn } from "./dailyProgressSheetReturn";
import { SwipeToDeleteRow } from "./components/SwipeToDeleteRow";
import {
  canExpandTodayGoalProgress,
  getDisplayedTodayGoalProgress,
} from "./todayGoalsProgress";
import {
  getVisibleMyDayEntries,
  mapMyDayEntries,
  resolveMyDayFilters,
} from "./mapMyDayDetails";
import { fonts } from "@/assets/fonts";
import { hometabcard } from "@/assets/images";
import { FastingOverviewCalendarSection } from "./components/FastingOverviewCalendarSection";
import { TimeSpentOverview } from "./components/TimeSpentOverview";
import { TimeSpentBottomSheet } from "./components/TimeSpentBottomSheet";
import { useTypedTranslation } from "@/i18next/useTypedTranslation";
import { HomeFabSpeedDial } from "./components/HomeFabSpeedDial";
import { JournalingHistoryWeekDashboard } from "./components/JournalingHistoryWeekDashboard";
import { type JournalingDayProgress } from "./journalingHistory";
import { resolveYesterdayJournalPrompt } from "./yesterdayJournalPrompt";
import { JournalFillingScreen } from "@/src/screens/private/journalfilling";
import { useAuth } from "@/provider/useAuth";
import { Image } from "expo-image";
import {
  UI_CATEGORY_TO_API,
  type UiIbadahCategory,
} from "@/src/utils/goalCycleCategoryMap";
import { prepareFigmaForcedSmallCapsText } from "@/src/utils/figmaTypography";
import { useGetMyDayDetails } from "@/src/api/queries/useGetMyDayDetails";
import { useHandleToggleShowMyday } from "@/src/api/mutations/useHandleToggleShowMyday";
import { useDeleteMyDayEntry } from "@/src/api/mutations/useDeleteMyDayEntry";
import { useGetMe } from "@/src/api/queries/useGetMe";
import { useGetGoalCycleById } from "@/src/api/queries/useGetGoalCycleById";
import {
  addDays,
  clampDateKeyToRange,
  getMonthShortUpper,
  isYesterday,
  parseDateKey,
  startOfDay,
  toDateKey,
} from "@/src/screens/private/journalfilling/journalFillingDateUtils";
import WarningModal from "@/components/atoms/WarningModal";
import {
  useGetDashboardDataForDate,
  type HomeDailyContentItem,
  type HomeDashboardCategory,
  type HomeJournalCard,
} from "@/src/api/queries/useGetDashboardDataForDate";
import { useSwipeGreetingCardHomeScreen } from "@/src/api/mutations/useSwipeGreetingCardHomeScreen";

type TextPart = { text: string; highlighted: boolean };

type CategoryItem = {
  title: string;
  /** API slug for DailyProgressBottomSheet (prayer | quran | fasting | sadaqah). */
  apiCategory: string;
  percentage: string;
  progressColor: string;
  tier: string;
};

function resolveHomeUiCategory(category: string): UiIbadahCategory | null {
  const key = category.trim().toUpperCase();
  if (
    key === "PRAYER" ||
    key === "QURAN" ||
    key === "FASTING" ||
    key === "SADAQAH"
  ) {
    return key;
  }
  return null;
}

type InspirationCard = {
  id: number;
  title: string;
  quote: string;
  reference: string;
};

/** Split trailing `(Reference)` from API `dailyContent[].text`. */
function splitDailyContentText(text: string): {
  quote: string;
  reference: string;
} {
  const trimmed = text.trim();
  const match = trimmed.match(/^(.*?)(\s*)(\([^()]+\))\s*$/);
  if (!match) {
    return { quote: trimmed, reference: "" };
  }
  return {
    quote: match[1].trim(),
    reference: match[3].trim(),
  };
}

function mapDailyContentToInspirationCards(
  items: HomeDailyContentItem[] | null | undefined,
): InspirationCard[] {
  if (!Array.isArray(items) || items.length === 0) return [];
  return items
    .map((item, index) => {
      const title = item?.title?.trim() ?? "";
      const rawText = item?.text?.trim() ?? "";
      if (!title && !rawText) return null;
      const { quote, reference } = splitDailyContentText(rawText);
      return {
        id: index + 1,
        title,
        quote,
        reference,
      };
    })
    .filter((card): card is InspirationCard => card != null);
}

function mapJournalCardWeek(
  journalCard: HomeJournalCard | null | undefined,
): JournalingDayProgress[] {
  const week = journalCard?.week;
  if (!Array.isArray(week) || week.length === 0) return [];

  return week.map((day, index) => {
    const date = typeof day?.date === "string" ? day.date.trim() : "";
    const dayLabel =
      typeof day?.dayLabel === "string" ? day.dayLabel.trim() : "";
    const dayNumber =
      typeof day?.dayNumber === "number" && Number.isFinite(day.dayNumber)
        ? Math.round(day.dayNumber)
        : undefined;

    return {
      id: date || String(index + 1),
      day: dayLabel,
      date,
      loggedJournal: Boolean(day?.logged),
      isToday: Boolean(day?.isSelected),
      isFuture: Boolean(day?.isFuture),
      dayNumber,
    };
  });
}

const SCREEN_CARD_WIDTH = Dimensions.get("window").width - 32;

/** Home ring order + colors; percentages come from dashboard categories. */
const HOME_CATEGORY_META: {
  uiCategory: UiIbadahCategory;
  title: string;
  progressColor: string;
}[] = [
  {
    uiCategory: "PRAYER",
    title: "PRAYERS",
    progressColor: Colors.light.ringPrayer,
  },
  {
    uiCategory: "QURAN",
    title: "QURAN",
    progressColor: Colors.light.ringQuran,
  },
  {
    uiCategory: "FASTING",
    title: "FASTING",
    progressColor: Colors.light.ringFasting,
  },
  {
    uiCategory: "SADAQAH",
    title: "SADAQAH",
    progressColor: Colors.light.ringSadaqah,
  },
];

function mapDashboardCategoryToItem(
  item: HomeDashboardCategory,
): CategoryItem | null {
  const ui = resolveHomeUiCategory(String(item.category ?? ""));
  if (!ui) return null;
  const meta = HOME_CATEGORY_META.find((entry) => entry.uiCategory === ui);
  const rawPct = item.completedPct;
  const pct =
    typeof rawPct === "number" && Number.isFinite(rawPct)
      ? Math.min(100, Math.max(0, Math.round(rawPct)))
      : 0;
  const tier = String(item.tier ?? "NONE").toUpperCase();
  return {
    title: item.label?.trim() || meta?.title || ui,
    apiCategory: UI_CATEGORY_TO_API[ui],
    progressColor: meta?.progressColor ?? Colors.light.ringPrayer,
    percentage: String(pct),
    tier,
  };
}

function buildTextParts(text: string, highlightedTexts: string[]): TextPart[] {
  const parts: TextPart[] = [];
  let lastIndex = 0;

  highlightedTexts.forEach((highlighted) => {
    const index = text.indexOf(highlighted, lastIndex);
    if (index !== -1) {
      if (index > lastIndex) {
        parts.push({
          text: text.substring(lastIndex, index),
          highlighted: false,
        });
      }
      parts.push({ text: highlighted, highlighted: true });
      lastIndex = index + highlighted.length;
    }
  });

  if (lastIndex < text.length) {
    parts.push({ text: text.substring(lastIndex), highlighted: false });
  }

  return parts.length > 0 ? parts : [{ text, highlighted: false }];
}

// Helper function to map category title to translation key
function getCategoryTranslationKey(title: string): any {
  const keyMap: Record<string, string> = {
    PRAYERS: "homeScreen.prayers",
    QURAN: "homeScreen.quran",
    FASTING: "homeScreen.fasting",
    SADAQAH: "homeScreen.sadaqah",
  };
  return keyMap[title] || title;
}

// Helper function to map filter tab to translation key
function getFilterTabTranslationKey(tab: string): any {
  const keyMap: Record<string, string> = {
    All: "homeScreen.filterAll",
    ALL: "homeScreen.filterAll",
    Prayer: "homeScreen.filterPrayer",
    PRAYER: "homeScreen.filterPrayer",
    Quran: "homeScreen.filterQuran",
    QURAN: "homeScreen.filterQuran",
    Fasting: "homeScreen.filterFasting",
    FASTING: "homeScreen.filterFasting",
    Sadaqah: "homeScreen.filterSadaqah",
    SADAQAH: "homeScreen.filterSadaqah",
    "Time Spent": "homeScreen.filterTimeSpent",
  };
  return keyMap[tab] || tab;
}

export default function HomeScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const router = useRouter();
  const { t, i18n } = useTypedTranslation();
  const namazBottomSheetRef = useRef<BottomSheet>(null);
  const goldenBottomSheetRef = useRef<BottomSheet>(null);
  const dashboardSheetRef = useRef<BottomSheet>(null);
  const timeSpentSheetRef = useRef<BottomSheet>(null);
  const yesterdayJournalSheetRef = useRef<BottomSheet>(null);
  const yesterdayJournalPromptShownRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  const [isPrayerCardVisible, setIsPrayerCardVisible] = useState(true);
  const [activeInspirationIndex, setActiveInspirationIndex] = useState(0);
  const [selectedDashboardTab, setSelectedDashboardTab] = useState("ALL");
  const [isDashboardExpanded, setIsDashboardExpanded] = useState(false);
  const [selectedDayTab, setSelectedDayTab] = useState("ALL");
  const [isTodayProgressExpanded, setIsTodayProgressExpanded] = useState(false);
  const [openTodayProgressRowId, setOpenTodayProgressRowId] = useState<
    string | null
  >(null);
  const [scrollCollapseThreshold, setScrollCollapseThreshold] = useState(260);
  const [hideMyDayConfirmVisible, setHideMyDayConfirmVisible] = useState(false);
  const [deleteMyDayConfirmVisible, setDeleteMyDayConfirmVisible] =
    useState(false);
  const [pendingDeleteEntryId, setPendingDeleteEntryId] = useState<
    string | null
  >(null);
  const [isAnyBottomSheetOpen, setIsAnyBottomSheetOpen] = useState(false);
  const [isNamazSheetOpen, setIsNamazSheetOpen] = useState(false);
  const [dailyProgressResume, setDailyProgressResume] = useState<{
    view: "detail";
    category: string;
    goalId?: string;
  } | null>(null);
  const openBottomSheetsRef = useRef(new Set<string>());
  const scrollY = useRef(new Animated.Value(0)).current;
  const { user } = useAuth();
  console.log("user in redux", user);

  const normalizeGender = (value?: string | null) =>
    value?.toString().trim().toUpperCase();

  const isFemaleUser = [
    user?.gender,
    user?.user?.gender,
    user?.data?.gender,
  ].some((value) => normalizeGender(value) === "FEMALE");

  const handleAddDailyProgress = useCallback(() => {
    goldenBottomSheetRef.current?.expand();
  }, []);

  const handleCategoryRingPress = useCallback((apiCategory: string) => {
    setDailyProgressResume({ view: "detail", category: apiCategory });
    requestAnimationFrame(() => {
      goldenBottomSheetRef.current?.expand();
    });
  }, []);

  const handleDailyProgressResumeConsumed = useCallback(() => {
    setDailyProgressResume(null);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const target = consumeDailyProgressSheetReturn();
      if (!target) return;
      setDailyProgressResume(target);
      // Expand after state is set so the sheet opens on select-goal.
      requestAnimationFrame(() => {
        goldenBottomSheetRef.current?.expand();
      });
    }, []),
  );

  const handleCompleteJournal = useCallback(() => {
    router.push("/(private)/journalfilling");
  }, [router]);

  const todayDateKey = useMemo(() => toDateKey(startOfDay(new Date())), []);

  console.log("today date key is", todayDateKey);
  const { data: meUser } = useGetMe();
  const goalCycleId = meUser?.goalCycleId ?? null;
  const { data: goalCycle } = useGetGoalCycleById(goalCycleId);
  const cycleStartDateKey = goalCycle?.startDate?.slice(0, 10) ?? null;
  /** My Day can look back to cycle start, but never past today. */
  const myDayMinDateKey = cycleStartDateKey ?? todayDateKey;
  const myDayMaxDateKey = todayDateKey;

  const [selectedMyDayDate, setSelectedMyDayDate] = useState(todayDateKey);

  useEffect(() => {
    setSelectedMyDayDate((current) =>
      clampDateKeyToRange(current, myDayMinDateKey, myDayMaxDateKey),
    );
  }, [myDayMinDateKey, myDayMaxDateKey]);

  const canGoToPreviousMyDay = selectedMyDayDate > myDayMinDateKey;
  const canGoToNextMyDay = selectedMyDayDate < myDayMaxDateKey;

  const handlePreviousMyDay = useCallback(() => {
    if (!canGoToPreviousMyDay) return;
    setSelectedMyDayDate((current) =>
      clampDateKeyToRange(
        toDateKey(addDays(parseDateKey(current), -1)),
        myDayMinDateKey,
        myDayMaxDateKey,
      ),
    );
  }, [canGoToPreviousMyDay, myDayMinDateKey, myDayMaxDateKey]);

  const handleNextMyDay = useCallback(() => {
    if (!canGoToNextMyDay) return;
    setSelectedMyDayDate((current) =>
      clampDateKeyToRange(
        toDateKey(addDays(parseDateKey(current), 1)),
        myDayMinDateKey,
        myDayMaxDateKey,
      ),
    );
  }, [canGoToNextMyDay, myDayMinDateKey, myDayMaxDateKey]);

  const handleResetMyDayToToday = useCallback(() => {
    setSelectedMyDayDate(todayDateKey);
  }, [todayDateKey]);

  const myDayDateLabel = useMemo(() => {
    if (selectedMyDayDate === todayDateKey) {
      return t("homeScreen.today");
    }
    const selectedDate = parseDateKey(selectedMyDayDate);
    if (isYesterday(selectedDate, parseDateKey(todayDateKey))) {
      return "YESTERDAY";
    }
    return `${selectedDate.getDate()} ${getMonthShortUpper(selectedDate)}`;
  }, [selectedMyDayDate, t, todayDateKey]);

  const { data: dashboardData } = useGetDashboardDataForDate(selectedMyDayDate);
  const dashboardHeader = dashboardData?.header;
  const headerDateLabel =
    typeof dashboardHeader?.dateLabel === "string"
      ? dashboardHeader.dateLabel.trim()
      : "";
  const headerIsToday =
    typeof dashboardHeader?.isToday === "boolean"
      ? dashboardHeader.isToday
      : selectedMyDayDate === todayDateKey;
  const headerStreak =
    typeof dashboardHeader?.streak === "number" &&
    Number.isFinite(dashboardHeader.streak)
      ? Math.max(0, Math.round(dashboardHeader.streak))
      : 0;
  const headerAvatarName =
    typeof dashboardHeader?.avatarName === "string"
      ? dashboardHeader.avatarName.trim()
      : "";
  const avatarInitial = (headerAvatarName || user?.username || "?")
    .charAt(0)
    .toUpperCase();

  const prayerTimesCard = dashboardData?.prayerTimesCard ?? null;
  const goalCategories = useMemo((): CategoryItem[] => {
    const fromApi = Array.isArray(dashboardData?.categories)
      ? dashboardData.categories
      : [];
    if (fromApi.length > 0) {
      return fromApi
        .map(mapDashboardCategoryToItem)
        .filter((item): item is CategoryItem => item != null);
    }
    // Fallback while dashboard is loading.
    return HOME_CATEGORY_META.map(
      ({ uiCategory, title, progressColor }): CategoryItem => ({
        title,
        apiCategory: UI_CATEGORY_TO_API[uiCategory],
        progressColor,
        percentage: "0",
        tier: "NONE",
      }),
    );
  }, [dashboardData?.categories]);

  const prayerTimeline = useMemo(
    () =>
      Array.isArray(prayerTimesCard?.timeline) ? prayerTimesCard.timeline : [],
    [prayerTimesCard],
  );
  const upcomingPrayerKey = (
    prayerTimesCard?.upcoming?.key ?? ""
  ).toUpperCase();

  useEffect(() => {
    // Re-show the prayer card when the selected home date changes.
    setIsPrayerCardVisible(true);
  }, [selectedMyDayDate]);

  const renderPrayerTimelineIcon = useCallback(
    (item: HomePrayerTimelineItem, index: number) => {
      const key = (item.key ?? "").toUpperCase();
      const isUpcoming = key === upcomingPrayerKey;
      const color = isUpcoming ? Colors.light.green : Colors.light.white;
      const size = 16;
      let icon: React.ReactNode = null;
      switch (key) {
        case "FAJR":
          icon = <UpComingFajrIcon color={color} size={size} />;
          break;
        case "SUNRISE":
          icon = <SunriseIcon color={color} size={size} />;
          break;
        case "DHUHR":
        case "DUHR":
          icon = <UpComingDuhrIcon color={color} size={size} />;
          break;
        case "ASR":
          icon = <UpComingAsrIcon color={color} size={size} />;
          break;
        case "MAGHRIB":
        case "MAGHREB":
          icon = <UpComingMaghrebIcon color={color} size={size} />;
          break;
        case "ISHA":
          icon = <UpComingIshaIcon color={color} size={size} />;
          break;
        default:
          return null;
      }

      return (
        <React.Fragment key={`${key}-${index}`}>
          {index > 0 ? <View style={styles.prayerTimelineDash} /> : null}
          <View
            style={[
              styles.prayerTimelineIcon,
              isUpcoming && { borderColor: Colors.light.green },
            ]}
          >
            {icon}
          </View>
        </React.Fragment>
      );
    },
    [upcomingPrayerKey],
  );

  const { data: myDayDetails } = useGetMyDayDetails(
    selectedMyDayDate,
    selectedDayTab.toUpperCase(),
    0,
    100,
  );
  const { mutate: toggleMyDayVisibility, isPending: isTogglingMyDay } =
    useHandleToggleShowMyday();
  const { mutate: deleteMyDayEntry, isPending: isDeletingMyDayEntry } =
    useDeleteMyDayEntry();

  const isMyDayVisible = !myDayDetails?.hidden;
  const myDayFilters = useMemo(
    () => resolveMyDayFilters(myDayDetails?.filters),
    [myDayDetails?.filters],
  );
  const myDayEntries = useMemo(
    () => mapMyDayEntries(myDayDetails?.entries),
    [myDayDetails?.entries],
  );
  const journalCard = dashboardData?.journalCard ?? null;
  const customizeJournalCard = dashboardData?.customizeJournalCard ?? null;
  const journalingWeekDays = useMemo(
    () => mapJournalCardWeek(journalCard),
    [journalCard],
  );
  const journalCardTitle = journalCard?.title?.trim() || undefined;
  const journalCardButton = journalCard?.button?.trim() || undefined;
  const yesterdayJournalPrompt = useMemo(
    () => resolveYesterdayJournalPrompt(journalCard, todayDateKey),
    [journalCard, todayDateKey],
  );
  const journalPromptDisplayName = useMemo(() => {
    const fromUsername = user?.username?.trim();
    if (fromUsername) return fromUsername;
    const email = user?.email?.trim() || "";
    return email.split("@")[0]?.trim() || "";
  }, [user?.email, user?.username]);
  const { mutate: swipeGreetingCard } = useSwipeGreetingCardHomeScreen();

  const handleGreetingCardsFullySwiped = useCallback(() => {
    swipeGreetingCard("GREETING");
  }, [swipeGreetingCard]);

  const handleJournalDayPress = useCallback(
    (index: number) => {
      const day = journalingWeekDays[index];
      if (!day?.date || day.isFuture) return;
      router.push({
        pathname: "/(private)/journalfilling",
        params: { date: day.date },
      });
    },
    [journalingWeekDays, router],
  );

  const handleJournalCardButtonPress = useCallback(() => {
    const date = journalCard?.journalDate?.trim();
    if (!date) {
      router.push("/(private)/journalfilling");
      return;
    }
    router.push({
      pathname: "/(private)/journalfilling",
      params: { date },
    });
  }, [journalCard?.journalDate, router]);

  const handleCustomizeJournalPress = useCallback(() => {
    router.push("/(private)/journalappsetting");
  }, [router]);

  const closeYesterdayJournalSheet = useCallback(() => {
    yesterdayJournalPromptShownRef.current = true;
    yesterdayJournalSheetRef.current?.close();
  }, []);

  // Auto-open journal filling (day pills + calendar) when yesterday is unlogged.
  useFocusEffect(
    useCallback(() => {
      if (!yesterdayJournalPrompt) return;
      if (selectedMyDayDate !== todayDateKey) return;
      if (yesterdayJournalPromptShownRef.current) return;
      if (isAnyBottomSheetOpen) return;

      const timer = setTimeout(() => {
        if (yesterdayJournalPromptShownRef.current) return;
        // yesterdayJournalPromptShownRef.current = true;
        // yesterdayJournalSheetRef.current?.expand();
      }, 450);

      return () => clearTimeout(timer);
    }, [
      isAnyBottomSheetOpen,
      selectedMyDayDate,
      todayDateKey,
      yesterdayJournalPrompt,
    ]),
  );

  // Greeting / welcome cards — backend-only; hide entirely when greetingCard is null.
  // Keep the same highlight phrases so ContainerCard bold/white styling still applies.
  const welcomeHighlightTexts = useMemo(
    () => [
      t("homeScreen.welcomeHighlightCycle"),
      t("homeScreen.welcomeHighlightTomorrow"),
      t("homeScreen.welcomeHighlightFajr"),
    ],
    [t],
  );

  const translatedWelcomeCards = useMemo(() => {
    const greeting = dashboardData?.greetingCard;
    if (!greeting) return [];

    const title =
      typeof greeting.title === "string" ? greeting.title.trim() : "";
    const description =
      typeof greeting.description === "string"
        ? greeting.description.trim()
        : "";

    if (!title && !description) return [];

    return [
      {
        id: 1,
        title,
        content: description,
        highlightedTexts: welcomeHighlightTexts,
      },
    ];
  }, [dashboardData?.greetingCard, welcomeHighlightTexts]);

  // Inspiration carousel — prefer dashboard `dailyContent`, else i18n fallbacks.
  const translatedInspirationCards = useMemo(() => {
    const fromApi = mapDailyContentToInspirationCards(
      dashboardData?.dailyContent,
    );
    if (fromApi.length > 0) return fromApi;

    return [
      {
        id: 1,
        title: t("homeScreen.dailyLightTitle"),
        quote: t("homeScreen.dailyLightQuote"),
        reference: t("homeScreen.dailyLightRef"),
      },
      {
        id: 2,
        title: t("homeScreen.hadithTitle"),
        quote: t("homeScreen.hadithQuote"),
        reference: t("homeScreen.hadithRef"),
      },
      {
        id: 3,
        title: t("homeScreen.reflectionTitle"),
        quote: t("homeScreen.reflectionQuote"),
        reference: t("homeScreen.reflectionRef"),
      },
    ];
  }, [dashboardData?.dailyContent, t]);

  const handleBottomSheetChange = useCallback(
    (sheetId: string, index: number) => {
      if (index === -1) {
        openBottomSheetsRef.current.delete(sheetId);
      } else {
        openBottomSheetsRef.current.add(sheetId);
      }
      setIsAnyBottomSheetOpen(openBottomSheetsRef.current.size > 0);
      if (sheetId === "namaz") {
        setIsNamazSheetOpen(index >= 0);
      }
    },
    [],
  );

  const openNamazSheet = useCallback(() => {
    setIsNamazSheetOpen(true);
    namazBottomSheetRef.current?.expand();
  }, []);

  const { data: homeDashboard } = useGetHomeDashboard(selectedDashboardTab);
  const dashboardTabs = useMemo(
    () => resolveHomeDashboardTabs(homeDashboard?.tabs),
    [homeDashboard?.tabs],
  );
  const dashboardGoalRows = useMemo(
    () => mapHomeDashboardGoalRows(homeDashboard?.widgets),
    [homeDashboard?.widgets],
  );
  const dashboardVisibleCount = useMemo(
    () => resolveGoalVisibleCount(homeDashboard),
    [homeDashboard],
  );
  const visibleDashboardSubGoals = useMemo(() => {
    if (isDashboardExpanded) return dashboardGoalRows;
    return dashboardGoalRows.slice(0, dashboardVisibleCount);
  }, [dashboardGoalRows, dashboardVisibleCount, isDashboardExpanded]);
  const canExpandDashboard = dashboardGoalRows.length > dashboardVisibleCount;
  const selectedDashboardTabLabel = useMemo(() => {
    const match = dashboardTabs.find(
      (tab) => normalizeHomeDashboardTabKey(tab.key) === selectedDashboardTab,
    );
    const labelKey = getFilterTabTranslationKey(selectedDashboardTab);
    const translated = t(labelKey);
    if (translated !== labelKey) return translated;
    return match?.label?.trim() || selectedDashboardTab;
  }, [dashboardTabs, selectedDashboardTab, t]);

  const visibleTodayGoalsProgress = useMemo(
    () => getVisibleMyDayEntries(myDayEntries, selectedDayTab),
    [myDayEntries, selectedDayTab],
  );

  const displayedTodayGoalsProgress = useMemo(
    () =>
      getDisplayedTodayGoalProgress(
        visibleTodayGoalsProgress,
        isTodayProgressExpanded,
      ),
    [visibleTodayGoalsProgress, isTodayProgressExpanded],
  );

  const showTodayProgressToggle = canExpandTodayGoalProgress(
    visibleTodayGoalsProgress,
  );

  const handleShowHideTodayProgress = useCallback(() => {
    if (isTogglingMyDay) return;
    if (isMyDayVisible) {
      setHideMyDayConfirmVisible(true);
      return;
    }
    toggleMyDayVisibility(false); // show section → hidden: false
  }, [isMyDayVisible, isTogglingMyDay, toggleMyDayVisibility]);

  const handleConfirmHideMyDay = useCallback(() => {
    toggleMyDayVisibility(true, {
      // hide section → hidden: true
      onSettled: () => setHideMyDayConfirmVisible(false),
    });
  }, [toggleMyDayVisibility]);

  useEffect(() => {
    setIsTodayProgressExpanded(false);
    setOpenTodayProgressRowId(null);
  }, [selectedDayTab, selectedMyDayDate]);

  const handleTodayProgressSwipeOpen = useCallback((rowId: string | null) => {
    setOpenTodayProgressRowId(rowId);
  }, []);

  const handleTodayProgressDelete = useCallback((entryId: string) => {
    setPendingDeleteEntryId(entryId);
    setDeleteMyDayConfirmVisible(true);
    setOpenTodayProgressRowId(null);
  }, []);

  const handleConfirmDeleteMyDayEntry = useCallback(() => {
    if (!pendingDeleteEntryId) {
      setDeleteMyDayConfirmVisible(false);
      return;
    }
    const entry = myDayEntries.find((item) => item.id === pendingDeleteEntryId);
    const action = entry?.deleteAction;
    if (!action?.path) {
      setDeleteMyDayConfirmVisible(false);
      setPendingDeleteEntryId(null);
      return;
    }
    deleteMyDayEntry(action, {
      onSettled: () => {
        setDeleteMyDayConfirmVisible(false);
        setPendingDeleteEntryId(null);
      },
    });
  }, [deleteMyDayEntry, myDayEntries, pendingDeleteEntryId]);

  const stickyHeaderOpacity = scrollY.interpolate({
    inputRange: [scrollCollapseThreshold - 50, scrollCollapseThreshold],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const stickyHeaderTranslateY = scrollY.interpolate({
    inputRange: [scrollCollapseThreshold - 50, scrollCollapseThreshold],
    outputRange: [-14, 0],
    extrapolate: "clamp",
  });
  const categorySectionOpacity = scrollY.interpolate({
    inputRange: [scrollCollapseThreshold - 60, scrollCollapseThreshold - 10],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const handleCategoriesLayout = (e: LayoutChangeEvent) => {
    const { y, height } = e.nativeEvent.layout;
    setScrollCollapseThreshold(Math.max(80, y + height * 0.6));
  };

  const handleInspirationScroll = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const idx = Math.round(
      e.nativeEvent.contentOffset.x / (SCREEN_CARD_WIDTH + 16),
    );
    setActiveInspirationIndex(idx);
  };

  return (
    <BlackScreenWrapper edges={["top"]}>
      {/* Sticky collapsed category bar (fades in as big rings scroll away) */}
      {!isAnyBottomSheetOpen ? (
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.collapsedHeader,
            {
              paddingTop: safeAreaInsets.top + 10,
              opacity: stickyHeaderOpacity,
              transform: [{ translateY: stickyHeaderTranslateY }],
            },
          ]}
        >
          <View style={styles.collapsedRow}>
            {goalCategories.map((category) => (
              <TouchableOpacity
                key={`sticky-${category.apiCategory}`}
                style={styles.collapsedItem}
                activeOpacity={0.7}
                onPress={() => handleCategoryRingPress(category.apiCategory)}
              >
                <TaperedCircleBorder
                  percentage={category.percentage}
                  borderColor={Colors.light.grey}
                  size={30}
                  variant="illuminated"
                >
                  <View />
                </TaperedCircleBorder>
                <Text style={styles.collapsedLabel}>
                  {prepareFigmaForcedSmallCapsText(
                    t(getCategoryTranslationKey(category.title)),
                  )}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      ) : null}

      {/* Plain ScrollView (not Animated.ScrollView): Rive moon never paints
          inside Animated.ScrollView on this screen, even with useNativeDriver:false. */}
      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        removeClippedSubviews={false}
        onScroll={(e) => {
          scrollY.setValue(e.nativeEvent.contentOffset.y);
        }}
      >
        {/* Avatar + Streak row */}
        <View style={styles.topSection}>
          <View style={styles.avatarContainer}>
            {user?.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
                contentFit="cover"
              />
            ) : (
              <Text style={styles.streakText}>{avatarInitial}</Text>
            )}
          </View>

          {/* Today Button */}
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              alignItems: "center",
              justifyContent: "center",
            }}
            pointerEvents="box-none"
          >
            <View style={styles.todayButtonContainer}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handlePreviousMyDay}
                disabled={!canGoToPreviousMyDay}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Previous day"
              >
                <Entypo
                  name={
                    i18n.language === "ar" ? "chevron-right" : "chevron-left"
                  }
                  size={18}
                  color={
                    canGoToPreviousMyDay
                      ? Colors.light.white
                      : Colors.light.grey
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleResetMyDayToToday}
                disabled={headerIsToday}
              >
                <View style={styles.todayButtonTextContainer}>
                  <Text style={styles.todayButtonText}>
                    {headerDateLabel || myDayDateLabel}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleNextMyDay}
                disabled={!canGoToNextMyDay}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Next day"
              >
                <Entypo
                  name={
                    i18n.language === "ar" ? "chevron-left" : "chevron-right"
                  }
                  size={18}
                  color={
                    canGoToNextMyDay ? Colors.light.white : Colors.light.grey
                  }
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              router.push({
                pathname: "/(private)/streakcounter/[date]",
                params: { date: selectedMyDayDate },
              })
            }
          >
            <View style={styles.streakBox}>
              <FlashIcon size={12} />
              <Text style={styles.streakText}>{headerStreak}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Badr Logo */}
        <View style={styles.badrLogoContainer}>
          <BadarNameLogo size={32} />
        </View>

        {/* Upcoming prayer card */}
        {isPrayerCardVisible && prayerTimesCard ? (
          <View style={styles.prayerCardWrapper}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsPrayerCardVisible(false)}
            >
              <AntDesign name="close" size={20} color={Colors.light.white} />
            </TouchableOpacity>
            <ImageBackground
              source={require("@/assets/images/homescreennamazbackgroundimage.png")}
              style={styles.prayerCardContainer}
              imageStyle={{ borderRadius: 16 }}
            >
              <View style={styles.prayerCardTopRow}>
                <View style={styles.prayerDetailsLeft}>
                  <Text style={styles.upcomingText}>
                    {prayerTimesCard.upcomingLabel?.trim() ||
                      t("homeScreen.upcoming")}
                  </Text>
                  <Text style={styles.prayerNameText}>
                    {prayerTimesCard.upcoming?.name?.trim() || "—"}
                  </Text>
                  <Text style={styles.timeText}>
                    {prayerTimesCard.upcoming?.time?.trim() || "—"}
                  </Text>
                </View>
                <View style={styles.dateRight}>
                  {prayerTimesCard.hijriDate ? (
                    <Text style={styles.dateText}>
                      {prayerTimesCard.hijriDate}
                    </Text>
                  ) : null}
                  {prayerTimesCard.gregorianDate ? (
                    <Text style={styles.dateText}>
                      {prayerTimesCard.gregorianDate}
                    </Text>
                  ) : null}
                </View>
              </View>

              {prayerTimeline.length > 0 ? (
                <View style={styles.prayerTimelineRow}>
                  {prayerTimeline.map(renderPrayerTimelineIcon)}
                </View>
              ) : null}
            </ImageBackground>
          </View>
        ) : null}

        {/* Goal category rings */}
        <Animated.View
          onLayout={handleCategoriesLayout}
          style={[
            styles.categoriesContainer,
            { opacity: categorySectionOpacity },
          ]}
        >
          {goalCategories.map((category) => (
            <Pressable
              key={category.apiCategory}
              style={styles.categoryItemWrapper}
              onPress={() => handleCategoryRingPress(category.apiCategory)}
              accessibilityRole="button"
              accessibilityLabel={t(getCategoryTranslationKey(category.title))}
            >
              <TaperedCircleBorder
                percentage={category.percentage}
                borderColor={Colors.light.grey}
                size={66 * (SCREEN_CARD_WIDTH / 320)}
                percentageFontSize={17}
                variant="illuminated"
              />
              <TopSpace top={3} />
              <View style={styles.categoryLabelWrapper}>
                <View style={styles.categoryLabelInner}>
                  <View style={styles.categoryLabelChevronSlot} />
                  <Text style={styles.categoryLabel}>
                    {prepareFigmaForcedSmallCapsText(
                      category.title ||
                        t(getCategoryTranslationKey(category.title)),
                    )}
                  </Text>
                  <View style={styles.categoryLabelChevronSlot}>
                    <MaterialIcons
                      name={
                        i18n.language === "ar"
                          ? "chevron-left"
                          : "chevron-right"
                      }
                      size={16}
                      color={Colors.light.white}
                    />
                  </View>
                </View>
              </View>
            </Pressable>
          ))}
        </Animated.View>

        {/* Welcome / info card deck — only when home API sends greetingCard */}
        {translatedWelcomeCards.length > 0 ? (
          <View style={styles.containersSection}>
            <SwipeCardDeck
              data={translatedWelcomeCards}
              renderTextWithHighlight={buildTextParts}
              onAllCardsSwiped={handleGreetingCardsFullySwiped}
              showPagination={false}
            />
          </View>
        ) : null}

        {/* Plain View only around Rive — press targets live inside DaysTracker
            on the text rows, never wrapping the moon itself. */}
        <Pressable
          style={{
            width: SCREEN_CARD_WIDTH,
            alignSelf: "center",
            marginTop: hp(2),
          }}
          collapsable={false}
          onPress={openNamazSheet}
        >
          <DaysTrackerContainer
            isBottomSheetView={false}
            moonCard={dashboardData?.moonCard ?? null}
            onPress={openNamazSheet}
          />
        </Pressable>

        {/* Inspiration cards */}
        <View style={styles.inspirationSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={SCREEN_CARD_WIDTH + 16}
            decelerationRate="fast"
            contentContainerStyle={styles.inspirationScrollContainer}
            onScroll={handleInspirationScroll}
            scrollEventThrottle={16}
          >
            {translatedInspirationCards.map((card) => (
              <ImageBackground
                key={card.id}
                source={hometabcard}
                style={styles.inspirationCard}
                imageStyle={styles.inspirationCardImage}
              >
                <Text style={styles.inspirationTitle}>
                  {prepareFigmaForcedSmallCapsText(card.title)}
                </Text>
                <Text style={styles.inspirationQuote}>
                  {card.quote}{" "}
                  <Text style={styles.inspirationReference}>
                    {card.reference}
                  </Text>
                </Text>
              </ImageBackground>
            ))}
          </ScrollView>
          <View style={styles.inspirationDots}>
            {translatedInspirationCards.map((card, i) => (
              <View
                key={card.id}
                style={[
                  styles.inspirationDot,
                  i === activeInspirationIndex && styles.inspirationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Log menstruation */}
        <TouchableOpacity
          activeOpacity={isFemaleUser ? 0.8 : 1}
          disabled={!isFemaleUser}
          style={[
            styles.menstruationContainer,
            !isFemaleUser && { opacity: 0.5 },
          ]}
          onPress={() => {
            if (!isFemaleUser) return;
            router.push({
              pathname: "/menstruationlog",
              params: { cycleStartDate: "2026-05-08" },
            });
          }}
        >
          <View style={styles.menstruationInner}>
            <View style={styles.greenPlusCircle}>
              <Ionicons name="add" size={16} color="white" />
            </View>
            <Text style={styles.menstruationText}>
              {t("homeScreen.logMenstruation")}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Customize journal — only when home API sends customizeJournalCard */}
        {customizeJournalCard != null ? (
          <View style={styles.journalContainer}>
            <Text style={styles.journalTitle}>
              {customizeJournalCard.title?.trim() ||
                t("homeScreen.customizeJournalTitle")}
            </Text>
            <Text style={styles.journalDescription}>
              {customizeJournalCard.description?.trim() ||
                customizeJournalCard.subtitle?.trim() ||
                t("homeScreen.customizeJournalDesc")}
            </Text>
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={handleCustomizeJournalPress}
              activeOpacity={0.8}
            >
              <Text style={styles.getStartedText}>
                {customizeJournalCard.button?.trim() ||
                  t("homeScreen.getStarted")}
              </Text>
              <Entypo
                name={i18n.language === "ar" ? "chevron-left" : "chevron-right"}
                size={24}
                color={Colors.light.green}
              />
            </TouchableOpacity>
          </View>
        ) : null}
        {/* My Day */}

        <View style={[styles.dashboardSection]}>
          <Text style={styles.dashboardText}>
            {myDayDetails?.title?.trim() || t("homeScreen.myDay")}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.customizeContainer, { gap: 8 }]}
            onPress={handleShowHideTodayProgress}
            disabled={isTogglingMyDay}
          >
            <Text style={styles.customizeText}>
              {isMyDayVisible
                ? myDayDetails?.toggleLabel?.trim() || t("homeScreen.hide")
                : t("homeScreen.show")}
            </Text>
            {isMyDayVisible ? (
              <AntDesign
                name="eye-invisible"
                size={16}
                color={Colors.light.green}
              />
            ) : (
              <AntDesign name="eye" size={16} color={Colors.light.green} />
            )}
          </TouchableOpacity>
        </View>
        {isMyDayVisible ? (
          <>
            <ScrollView
              horizontal
              style={styles.categoryFilterScroll}
              contentContainerStyle={styles.categoryFilterContent}
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled
              scrollEventThrottle={16}
            >
              {myDayFilters.map((filter) => (
                <Tabs
                  key={filter.key}
                  label={filter.label}
                  onPress={() => setSelectedDayTab(filter.key)}
                  selectedTab={
                    myDayFilters.find((item) => item.key === selectedDayTab)
                      ?.label ?? selectedDayTab
                  }
                />
              ))}
            </ScrollView>

            <TopSpace top={16} />

            <View style={styles.todayGoalsProgressSection}>
              <Text style={styles.todayGoalsProgressTitle}>
                {myDayDetails?.sectionTitle?.trim() ||
                  t("homeScreen.todayGoalsProgress")}
              </Text>
              <TopSpace top={24} />
              {displayedTodayGoalsProgress.length === 0 ? (
                myDayDetails?.emptyText ? (
                  <Text style={styles.todayGoalsProgressTitle}>
                    {myDayDetails.emptyText}
                  </Text>
                ) : null
              ) : (
                displayedTodayGoalsProgress.map((entry) => (
                  <SwipeToDeleteRow
                    key={entry.id}
                    rowId={entry.id}
                    onDelete={handleTodayProgressDelete}
                    onSwipeOpen={handleTodayProgressSwipeOpen}
                    openRowId={openTodayProgressRowId}
                    wrapperStyle={styles.todayProgressSwipeWrapper}
                    contentStyle={styles.todayProgressSwipeContent}
                  >
                    <TodayGoalProgressCard entry={entry} />
                  </SwipeToDeleteRow>
                ))
              )}
              {showTodayProgressToggle ? (
                <>
                  <TopSpace top={10} />
                  <TouchableOpacity
                    style={styles.showMoreButton}
                    onPress={() =>
                      setIsTodayProgressExpanded((expanded) => !expanded)
                    }
                  >
                    <Text style={styles.showMoreText}>
                      {isTodayProgressExpanded
                        ? myDayDetails?.showLessLabel?.trim() ||
                          t("homeScreen.showLess")
                        : myDayDetails?.showMoreLabel?.trim() ||
                          t("homeScreen.showMore")}
                    </Text>
                    <Entypo
                      name={
                        isTodayProgressExpanded ? "chevron-up" : "chevron-down"
                      }
                      size={24}
                      color="white"
                    />
                  </TouchableOpacity>
                </>
              ) : null}
            </View>
          </>
        ) : null}
        {/* Journal week card — only when home API sends journalCard */}
        {journalCard != null ? (
          <JournalingHistoryWeekDashboard
            weekDays={journalingWeekDays}
            title={journalCardTitle}
            buttonLabel={journalCardButton}
            onDayPress={handleJournalDayPress}
            onPressHeader={handleJournalCardButtonPress}
            onBehaviorInsightsPress={handleJournalCardButtonPress}
          />
        ) : null}
        {/* My Dashboard */}
        <View style={styles.dashboardSection}>
          <Text style={styles.dashboardText}>
            {homeDashboard?.title?.trim() || t("homeScreen.myDashboard")}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.customizeContainer, { gap: 6 }]}
            onPress={() => dashboardSheetRef.current?.expand()}
          >
            <Text style={styles.customizeText}>
              {homeDashboard?.customizeLabel?.trim() ||
                t("homeScreen.customize")}
            </Text>
            <CustomizeBadgeSettingIcon size={16} color={Colors.light.green} />
          </TouchableOpacity>
        </View>

        {/* Dashboard category filter */}
        <ScrollView
          horizontal
          style={styles.categoryFilterScroll}
          contentContainerStyle={styles.categoryFilterContent}
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          scrollEventThrottle={16}
        >
          {dashboardTabs.map((tab) => {
            const tabKey = normalizeHomeDashboardTabKey(tab.key);
            const labelKey = getFilterTabTranslationKey(tabKey);
            const translated = t(labelKey);
            const label =
              translated === labelKey
                ? tab.label?.trim() || tabKey
                : translated;
            return (
              <Tabs
                key={tabKey}
                label={label}
                onPress={() => {
                  setSelectedDashboardTab(tabKey);
                  setIsDashboardExpanded(false);
                }}
                selectedTab={selectedDashboardTabLabel}
              />
            );
          })}
        </ScrollView>

        {visibleDashboardSubGoals.map((goal) => {
          const iconColor = Colors.light.white;
          const icon = goal.goalId ? (
            getDetailedIbadahIcon(goal.goalId, iconColor)
          ) : (
            <FontAwesome6
              name="person-praying"
              size={19}
              color={
                HOME_DASHBOARD_CATEGORY_COLOR[goal.uiCategory] ??
                Colors.light.ringPrayer
              }
            />
          );
          return (
            <DetailedIbadahsProgressCard
              key={goal.id}
              category={goal.uiCategory}
              title={goal.title}
              subtitleCount={goal.subtitleCount}
              subtitleLabel={goal.subtitleLabel}
              icon={icon}
              iconBgColor={Colors.light.ibadahIconCircleBg}
              percentage={goal.percentage}
              progressColor={goal.progressColor}
              centerIconOnMultiLine={goal.goalId?.startsWith("quran-") ?? false}
            />
          );
        })}

        {canExpandDashboard ? (
          <TouchableOpacity
            style={styles.showMoreButton}
            activeOpacity={0.8}
            onPress={() => setIsDashboardExpanded((prev) => !prev)}
          >
            <Text style={styles.showMoreText}>
              {isDashboardExpanded
                ? t("homeScreen.showLess")
                : homeDashboard?.showMoreLabel?.trim() ||
                  t("homeScreen.showMore")}
            </Text>
            <Entypo
              name={isDashboardExpanded ? "chevron-up" : "chevron-down"}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        ) : null}
        <FastingOverviewCalendarSection date={todayDateKey} />
        <TopSpace top={16} />
        <TimeSpentOverview
          onExpandPress={() => timeSpentSheetRef.current?.expand()}
          selectedDate={todayDateKey}
          showChartHint={false}
        />
      </ScrollView>

      <NamazGoalBottomSheet
        ref={namazBottomSheetRef}
        onClose={() => setIsNamazSheetOpen(false)}
        onChange={(index) => handleBottomSheetChange("namaz", index)}
        date={selectedMyDayDate}
        isOpen={isNamazSheetOpen}
      />
      <TimeSpentBottomSheet
        ref={timeSpentSheetRef}
        selectedDate={todayDateKey}
        onClose={() => {
          timeSpentSheetRef.current?.close();
        }}
        onChange={(index) => handleBottomSheetChange("timeSpent", index)}
      />
      <DashboardCustomizeBottomSheet
        ref={dashboardSheetRef}
        onClose={() => {
          dashboardSheetRef.current?.close();
        }}
        onChange={(index) => handleBottomSheetChange("dashboard", index)}
      />

      <BottomSheetWrapper
        ref={goldenBottomSheetRef}
        snapPoints={["50%", "92%"]}
        bgColor={Colors.light.blackBackground}
        borderRadius={30}
        handleTopInset={15}
        onChange={(index) => handleBottomSheetChange("dailyProgress", index)}
      >
        <DailyProgressBottomSheet
          onClose={() => goldenBottomSheetRef.current?.close()}
          resumeTarget={dailyProgressResume}
          onResumeConsumed={handleDailyProgressResumeConsumed}
        />
      </BottomSheetWrapper>

      {/* <BottomSheetWrapper
        ref={yesterdayJournalSheetRef}
        snapPoints={["92%"]}
        bgColor={Colors.light.blackBackground}
        borderRadius={30}
        handleTopInset={8}
        scrollable={false}
        onChange={(index) => handleBottomSheetChange("yesterdayJournal", index)}
      >
        {yesterdayJournalPrompt ? (
          <View
            style={{ flex: 1, height: Dimensions.get("window").height * 0.88 }}
          >
            <JournalFillingScreen
              presentation="sheet"
              initialDateKey={yesterdayJournalPrompt.date}
              userName={journalPromptDisplayName || undefined}
              onClose={closeYesterdayJournalSheet}
            />
          </View>
        ) : null}
      </BottomSheetWrapper> */}

      {!isAnyBottomSheetOpen ? (
        <HomeFabSpeedDial
          bottomInset={0}
          onAddDailyProgress={handleAddDailyProgress}
          onCompleteJournal={handleCompleteJournal}
        />
      ) : null}

      <WarningModal
        visible={hideMyDayConfirmVisible}
        title={
          myDayDetails?.hidePopup?.title?.trim() ||
          "HIDE YOUR DAILY GOAL ENTRIES?"
        }
        message={
          myDayDetails?.hidePopup?.description?.trim() ||
          "Your data stays saved, but you won't see the daily breakdown."
        }
        primaryButtonText={
          myDayDetails?.hidePopup?.confirm?.trim() || "YES, HIDE"
        }
        secondaryButtonText={
          myDayDetails?.hidePopup?.cancel?.trim() || "CANCEL"
        }
        primaryButtonVariant="green"
        primaryButtonLoading={isTogglingMyDay}
        onPrimaryPress={handleConfirmHideMyDay}
        onSecondaryPress={() => setHideMyDayConfirmVisible(false)}
        onBackdropPress={() => setHideMyDayConfirmVisible(false)}
      />

      <WarningModal
        visible={deleteMyDayConfirmVisible}
        title={
          myDayDetails?.deletePopup?.title?.trim() || "DELETE GOAL PROGRESS?"
        }
        message={
          myDayDetails?.deletePopup?.description?.trim() ||
          "This will permanently remove your progress entry. This can't be undone."
        }
        primaryButtonText={
          myDayDetails?.deletePopup?.confirm?.trim() || "YES, DELETE"
        }
        secondaryButtonText={
          myDayDetails?.deletePopup?.cancel?.trim() || "CANCEL"
        }
        primaryButtonVariant="red"
        primaryButtonLoading={isDeletingMyDayEntry}
        onPrimaryPress={handleConfirmDeleteMyDayEntry}
        onSecondaryPress={() => {
          setDeleteMyDayConfirmVisible(false);
          setPendingDeleteEntryId(null);
        }}
        onBackdropPress={() => {
          setDeleteMyDayConfirmVisible(false);
          setPendingDeleteEntryId(null);
        }}
      />
    </BlackScreenWrapper>
  );
}
