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
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import { TaperedCircleBorder } from "@/components/atoms/TaperedCircleBorder";
import { SwipeCardDeck } from "./components/SwipeCardDeck";
import { DailyProgressBottomSheet } from "./components/DailyProgressBottomSheet";
import BottomSheet from "@gorhom/bottom-sheet";
import { DaysTrackerContainer } from "@/components/molecules/DaysTrackerContainer";
import { NamazGoalBottomSheet } from "@/components/molecules/NamazGoalBottomSheet";

import { BottomSheetWrapper } from "@/components/molecules/BottomSheetWrapper";

import { DashboardCustomizeBottomSheet } from "./components/DashboardCustomizeBottomSheet";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TopSpace } from "@/components/atoms/TopSpace";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { styles } from "./styles";
import { Tabs } from "@/components/atoms/Tabs";
import { DashboardSubGoalRow } from "./components/DashboardSubGoalRow";
import {
  DASHBOARD_FILTER_TABS,
  DASHBOARD_SUB_GOALS,
  getVisibleDashboardSubGoals,
} from "./dashboardSubGoals";
import { TodayGoalProgressCard } from "./components/TodayGoalProgressCard";
import { SwipeToDeleteRow } from "./components/SwipeToDeleteRow";
import {
  TODAY_GOALS_PROGRESS,
  canExpandTodayGoalProgress,
  getDisplayedTodayGoalProgress,
  getVisibleTodayGoalProgress,
  type TodayGoalProgressEntry,
} from "./todayGoalsProgress";
import { fonts } from "@/assets/fonts";
import {
  FastingOverviewCalendarSection,
  HOME_FASTING_TRACK_TABS,
} from "./components/FastingOverviewCalendarSection";
import { TimeSpentOverview } from "./components/TimeSpentOverview";
import { TimeSpentBottomSheet } from "./components/TimeSpentBottomSheet";
import { useTypedTranslation } from "@/i18next/useTypedTranslation";
import { HomeFabSpeedDial } from "./components/HomeFabSpeedDial";
import { JournalingHistoryWeekDashboard } from "./components/JournalingHistoryWeekDashboard";
import { JournalingHistoryWeekDays } from "./journalingHistory";
type TextPart = { text: string; highlighted: boolean };

type CategoryItem = {
  title: string;
  percentage: string;
  progressColor: string;
};

type InspirationCard = {
  id: number;
  title: string;
  quote: string;
  reference: string;
};

const SCREEN_CARD_WIDTH = Dimensions.get("window").width - 32;

const GOAL_CATEGORIES: CategoryItem[] = [
  { title: "PRAYERS", percentage: "0", progressColor: Colors.light.ringPrayer },
  { title: "QURAN", percentage: "40", progressColor: Colors.light.ringQuran },
  {
    title: "FASTING",
    percentage: "65",
    progressColor: Colors.light.ringFasting,
  },
  {
    title: "SADAQAH",
    percentage: "85",
    progressColor: Colors.light.ringSadaqah,
  },
];

const WELCOME_CARDS = [
  {
    id: 1,
    title: "Welcome to Badr, Layla!",
    content:
      "Your 28-day goal cycle is set to begin tomorrow at Fajr. Get ready to track your prayer, Quran, fasting, and sadaqah goals. May Allah (SWT) make it easy and rewarding for you!",
    highlightedTexts: ["28-day goal cycle", "tomorrow", "Fajr"],
  },
  {
    id: 2,
    title: "Track Your Progress",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    highlightedTexts: [],
  },
];

const INSPIRATION_CARDS: InspirationCard[] = [
  {
    id: 1,
    title: "Daily Light from the Quran",
    quote: '"Indeed, it is We who guide whom We will to our ways."',
    reference: "(Surah Al-Ankabut, 29:69)",
  },
  {
    id: 2,
    title: "Hadith of the Day",
    quote: '"The best of you are those who learn the Quran and teach it."',
    reference: "(Sahih Al-Bukhari)",
  },
  {
    id: 3,
    title: "Reflection & Gratitude",
    quote:
      '"And if you should count the favors of Allah, you could not enumerate them."',
    reference: "(Surah Ibrahim, 14:34)",
  },
];

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
    Prayer: "homeScreen.filterPrayer",
    Quran: "homeScreen.filterQuran",
    Fasting: "homeScreen.filterFasting",
    Sadaqah: "homeScreen.filterSadaqah",
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
  const [isLoading, setIsLoading] = useState(true);

  const [isPrayerCardVisible, setIsPrayerCardVisible] = useState(true);
  const [activeInspirationIndex, setActiveInspirationIndex] = useState(0);
  const [selectedDashboardCategory, setSelectedDashboardCategory] =
    useState("All");
  const [selectedDayTab, setSelectedDayTab] = useState("All");
  const [todayGoalsProgress, setTodayGoalsProgress] =
    useState<TodayGoalProgressEntry[]>(TODAY_GOALS_PROGRESS);
  const [isTodayProgressExpanded, setIsTodayProgressExpanded] = useState(false);
  const [openTodayProgressRowId, setOpenTodayProgressRowId] = useState<
    string | null
  >(null);
  const [scrollCollapseThreshold, setScrollCollapseThreshold] = useState(260);
  const [showDailyProgress, setShowDailyProgress] = useState(false);
  const [isAnyBottomSheetOpen, setIsAnyBottomSheetOpen] = useState(false);
  const openBottomSheetsRef = useRef(new Set<string>());
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleAddDailyProgress = useCallback(() => {
    goldenBottomSheetRef.current?.expand();
  }, []);

  // Create translated welcome cards
  const translatedWelcomeCards = useMemo(
    () => [
      {
        id: 1,
        title: t("homeScreen.welcomeTitle").replace("{{name}}", "Layla"),
        content: t("homeScreen.welcomeContent"),
        highlightedTexts: [
          t("homeScreen.welcomeHighlightCycle"),
          t("homeScreen.welcomeHighlightTomorrow"),
          t("homeScreen.welcomeHighlightFajr"),
        ],
      },
      {
        id: 2,
        title: t("homeScreen.trackProgressTitle"),
        content: t("homeScreen.trackProgressContent"),
        highlightedTexts: [],
      },
    ],
    [t],
  );

  // Create translated inspiration cards
  const translatedInspirationCards = useMemo(
    () => [
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
    ],
    [t],
  );

  const handleBottomSheetChange = useCallback(
    (sheetId: string, index: number) => {
      if (index === -1) {
        openBottomSheetsRef.current.delete(sheetId);
      } else {
        openBottomSheetsRef.current.add(sheetId);
      }
      setIsAnyBottomSheetOpen(openBottomSheetsRef.current.size > 0);
    },
    [],
  );

  const quranCategory = GOAL_CATEGORIES.find((c) => c.title === "QURAN");

  const visibleDashboardSubGoals = useMemo(() => {
    const goals = DASHBOARD_SUB_GOALS.map((goal) =>
      goal.id === "quran-recitation"
        ? {
            ...goal,
            percentage: quranCategory?.percentage ?? goal.percentage,
            progressColor: quranCategory?.progressColor ?? goal.progressColor,
          }
        : goal,
    );

    return getVisibleDashboardSubGoals(goals, selectedDashboardCategory);
  }, [selectedDashboardCategory, quranCategory]);

  const visibleTodayGoalsProgress = useMemo(
    () => getVisibleTodayGoalProgress(todayGoalsProgress, selectedDayTab),
    [todayGoalsProgress, selectedDayTab],
  );

  const displayedTodayGoalsProgress = useMemo(
    () =>
      getDisplayedTodayGoalProgress(
        visibleTodayGoalsProgress,
        isTodayProgressExpanded,
      ),
    [visibleTodayGoalsProgress, isTodayProgressExpanded],
  );
  const handleShowHideTodayProgress = useCallback(() => {
    setShowDailyProgress((show) => !show);
  }, [setShowDailyProgress, showDailyProgress]);
  const showTodayProgressToggle = canExpandTodayGoalProgress(
    visibleTodayGoalsProgress,
  );

  useEffect(() => {
    setIsTodayProgressExpanded(false);
    setOpenTodayProgressRowId(null);
  }, [selectedDayTab]);

  const handleTodayProgressSwipeOpen = useCallback((rowId: string | null) => {
    setOpenTodayProgressRowId(rowId);
  }, []);

  const handleTodayProgressDelete = useCallback((entryId: string) => {
    setTodayGoalsProgress((entries) =>
      entries.filter((entry) => entry.id !== entryId),
    );
    setOpenTodayProgressRowId(null);
  }, []);

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
    <BlackScreenWrapper edges={["top", "bottom"]}>
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
            {GOAL_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={`sticky-${category.title}`}
                style={styles.collapsedItem}
                activeOpacity={0.7}
              >
                <TaperedCircleBorder
                  percentage={category.percentage}
                  progressColor={category.progressColor}
                  borderColor={Colors.light.calendarBg}
                  size={16}
                >
                  <View />
                </TaperedCircleBorder>
                <Text style={styles.collapsedLabel}>
                  {t(getCategoryTranslationKey(category.title))}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      ) : null}

      <Animated.ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
      >
        {/* Avatar + Streak row */}
        <View style={styles.topSection}>
          <View style={styles.avatarContainer}>
            <AntDesign size={40} color={Colors.light.white} />
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/streakcounter")}
          >
            <View style={styles.streakBox}>
              <Text style={styles.streakText}>0</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Upcoming prayer card */}
        {isPrayerCardVisible && (
          <View style={styles.prayerCardWrapper}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsPrayerCardVisible(false)}
            >
              <AntDesign name="close" size={20} color={Colors.light.white} />
            </TouchableOpacity>
            <View style={styles.prayerCardContainer}>
              <View style={styles.prayerDetailsLeft}>
                <Text style={styles.upcomingText}>
                  {t("homeScreen.upcoming")}
                </Text>
                <Text style={styles.prayerNameText}>
                  {t("homeScreen.asrPrayer")}
                </Text>
                <Text style={styles.timeText}>{t("homeScreen.asrTime")}</Text>
              </View>
              <View style={styles.dateRight}>
                <Text style={styles.dateText}>{t("homeScreen.juneDate")}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Goal category rings */}
        <Animated.View
          onLayout={handleCategoriesLayout}
          style={[
            styles.categoriesContainer,
            { opacity: categorySectionOpacity },
          ]}
        >
          {GOAL_CATEGORIES.map((category) => (
            <View key={category.title} style={styles.categoryItemWrapper}>
              <TaperedCircleBorder
                percentage={category.percentage}
                borderColor={Colors.light.calendarBg}
                progressColor={category.progressColor}
                size={50}
              />
              <TopSpace top={16} />
              <View style={styles.categoryLabelWrapper}>
                <Text style={styles.categoryLabel}>
                  {t(getCategoryTranslationKey(category.title))}
                </Text>
                <MaterialIcons
                  name={
                    i18n.language === "ar" ? "chevron-left" : "chevron-right"
                  }
                  size={16}
                  color={Colors.light.white}
                />
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Welcome / info card deck */}
        <View style={styles.containersSection}>
          <SwipeCardDeck
            data={translatedWelcomeCards}
            renderTextWithHighlight={buildTextParts}
          />
        </View>

        {/* Days tracker */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => namazBottomSheetRef.current?.expand()}
          style={{
            width: SCREEN_CARD_WIDTH,
            alignSelf: "center",
            marginTop: 16,
          }}
        >
          <DaysTrackerContainer isBottomSheetView={false} />
        </TouchableOpacity>

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
              <View key={card.id} style={styles.inspirationCard}>
                <Text style={styles.inspirationTitle}>{card.title}</Text>
                <Text style={styles.inspirationQuote}>
                  {card.quote}{" "}
                  <Text style={styles.inspirationReference}>
                    {card.reference}
                  </Text>
                </Text>
              </View>
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
          activeOpacity={0.8}
          style={styles.menstruationContainer}
          onPress={() =>
            router.push({
              pathname: "/menstruationlog",
              params: { cycleStartDate: "2026-05-08" },
            })
          }
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

        {/* Customize journal */}
        <View style={styles.journalContainer}>
          <Text style={styles.journalTitle}>
            {t("homeScreen.customizeJournalTitle")}
          </Text>
          <Text style={styles.journalDescription}>
            {t("homeScreen.customizeJournalDesc")}
          </Text>
          <TouchableOpacity style={styles.getStartedButton}>
            <Text style={styles.getStartedText}>
              {t("homeScreen.getStarted")}
            </Text>
            <Entypo
              name={i18n.language === "ar" ? "chevron-left" : "chevron-right"}
              size={24}
              color={Colors.light.green}
            />
          </TouchableOpacity>
        </View>
        {/* My Day */}

        <View style={[styles.dashboardSection]}>
          <Text style={styles.dashboardText}>{t("homeScreen.myDay")}</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.customizeContainer, { gap: 8 }]}
            onPress={handleShowHideTodayProgress}
          >
            <Text style={styles.customizeText}>
              {showDailyProgress ? t("homeScreen.hide") : t("homeScreen.show")}
            </Text>
            {showDailyProgress ? (
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
        {showDailyProgress && (
          <>
            <ScrollView
              horizontal
              style={styles.categoryFilterScroll}
              contentContainerStyle={styles.categoryFilterContent}
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled
              scrollEventThrottle={16}
            >
              {DASHBOARD_FILTER_TABS.map((label) => (
                <Tabs
                  key={label}
                  label={t(getFilterTabTranslationKey(label))}
                  onPress={() => setSelectedDayTab(label)}
                  selectedTab={t(getFilterTabTranslationKey(selectedDayTab))}
                />
              ))}
            </ScrollView>
            <TopSpace top={16} />

            <View style={styles.todayGoalsProgressSection}>
              <Text style={styles.todayGoalsProgressTitle}>
                {t("homeScreen.todayGoalsProgress")}
              </Text>
              <TopSpace top={24} />
              {displayedTodayGoalsProgress.map((entry) => (
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
              ))}
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
                        ? t("homeScreen.showLess")
                        : t("homeScreen.showMore")}
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
        )}
        <JournalingHistoryWeekDashboard weekDays={JournalingHistoryWeekDays} />
        {/* My Dashboard */}
        <View style={styles.dashboardSection}>
          <Text style={styles.dashboardText}>
            {t("homeScreen.myDashboard")}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.customizeContainer}
            onPress={() => dashboardSheetRef.current?.expand()}
          >
            <Text style={styles.customizeText}>
              {t("homeScreen.customize")}
            </Text>
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
          {DASHBOARD_FILTER_TABS.map((label) => (
            <Tabs
              key={label}
              label={t(getFilterTabTranslationKey(label))}
              onPress={() => setSelectedDashboardCategory(label)}
              selectedTab={t(
                getFilterTabTranslationKey(selectedDashboardCategory),
              )}
            />
          ))}
        </ScrollView>

        {visibleDashboardSubGoals.map((goal) => (
          <DashboardSubGoalRow key={goal.id} goal={goal} />
        ))}

        <TouchableOpacity style={styles.showMoreButton}>
          <Text style={styles.showMoreText}>{t("homeScreen.showMore")}</Text>
          <Entypo name="chevron-down" size={24} color="white" />
        </TouchableOpacity>
        <FastingOverviewCalendarSection trackTabs={HOME_FASTING_TRACK_TABS} />
        <TopSpace top={16} />
        <TimeSpentOverview
          onExpandPress={() => timeSpentSheetRef.current?.expand()}
        />
      </Animated.ScrollView>

      <NamazGoalBottomSheet
        ref={namazBottomSheetRef}
        onClose={() => {}}
        onChange={(index) => handleBottomSheetChange("namaz", index)}
      />
      <TimeSpentBottomSheet
        ref={timeSpentSheetRef}
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
      >
        <DailyProgressBottomSheet
          onClose={() => goldenBottomSheetRef.current?.close()}
        />
      </BottomSheetWrapper>

      <HomeFabSpeedDial
        bottomInset={safeAreaInsets.bottom}
        onAddDailyProgress={handleAddDailyProgress}
      />
    </BlackScreenWrapper>
  );
}
