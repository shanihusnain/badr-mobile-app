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
  FASTING_CALENDAR_FILTER_TABS,
  FastingCalendarTabs,
  type FastingCalendarFilterTab,
} from "./fastingCalendar";
import { FastingCalendarTrack } from "./components/FastingCalendarTrack";
import { FastingGoalTotalCard } from "./components/FastingGoalTotalCard";
import { PLANNED_FASTS } from "./plannedFasts";
import { TimeSpentOverview } from "./components/TimeSpentOverview";
import { TimeSpentBottomSheet } from "./components/TimeSpentBottomSheet";
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

export default function HomeScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const router = useRouter();
  const namazBottomSheetRef = useRef<BottomSheet>(null);
  const goldenBottomSheetRef = useRef<BottomSheet>(null);
  const dashboardSheetRef = useRef<BottomSheet>(null);
  const timeSpentSheetRef = useRef<BottomSheet>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isPrayerCardVisible, setIsPrayerCardVisible] = useState(true);
  const [activeInspirationIndex, setActiveInspirationIndex] = useState(0);
  const [selectedDashboardCategory, setSelectedDashboardCategory] =
    useState("All");
  const [fastingCalendarSelectedTab, setFastingCalendarSelectedTab] =
    useState<FastingCalendarFilterTab>("All");
  const [selectedDayTab, setSelectedDayTab] = useState("All");
  const [todayGoalsProgress, setTodayGoalsProgress] =
    useState<TodayGoalProgressEntry[]>(TODAY_GOALS_PROGRESS);
  const [isTodayProgressExpanded, setIsTodayProgressExpanded] = useState(false);
  const [openTodayProgressRowId, setOpenTodayProgressRowId] = useState<
    string | null
  >(null);
  const [fastCalendarSelectedTrack, setFastingCalendarSelectedTrack] =
    useState("Planned");
  const [showFastingLegendCard, setShowFastingLegendCard] = useState(true);
  const [scrollCollapseThreshold, setScrollCollapseThreshold] = useState(260);

  useEffect(() => {
    setShowFastingLegendCard(true);
  }, [fastCalendarSelectedTrack]);
  const [showDailyProgress, setShowDailyProgress] = useState(false);
  const [isAnyBottomSheetOpen, setIsAnyBottomSheetOpen] = useState(false);
  const openBottomSheetsRef = useRef(new Set<string>());
  const scrollY = useRef(new Animated.Value(0)).current;

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
    <View style={{ flex: 1 }}>
      <BlackScreenWrapper>
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
                  <Text style={styles.collapsedLabel}>{category.title}</Text>
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
                  <Text style={styles.upcomingText}>Upcoming</Text>
                  <Text style={styles.prayerNameText}>ASR</Text>
                  <Text style={styles.timeText}>3:53 PM</Text>
                </View>
                <View style={styles.dateRight}>
                  <Text style={styles.dateText}>June 1, 2026</Text>
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
                  <Text style={styles.categoryLabel}>{category.title}</Text>
                  <MaterialIcons
                    name="chevron-right"
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
              data={WELCOME_CARDS}
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
              {INSPIRATION_CARDS.map((card) => (
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
              {INSPIRATION_CARDS.map((card, i) => (
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
              <Text style={styles.menstruationText}>LOG MENSTRUATION</Text>
            </View>
          </TouchableOpacity>

          {/* Customize journal */}
          <View style={styles.journalContainer}>
            <Text style={styles.journalTitle}>Customize Your Journal</Text>
            <Text style={styles.journalDescription}>
              Choose from over 100 behaviors to track daily, fostering growth in
              your character and helping you become your best self.
            </Text>
            <TouchableOpacity style={styles.getStartedButton}>
              <Text style={styles.getStartedText}>GET STARTED</Text>
              <Entypo
                name="chevron-right"
                size={24}
                color={Colors.light.green}
              />
            </TouchableOpacity>
          </View>
          {/* My Day */}

          <View style={[styles.dashboardSection]}>
            <Text style={styles.dashboardText}>My Day</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.customizeContainer, { gap: 8 }]}
              onPress={handleShowHideTodayProgress}
            >
              <Text style={styles.customizeText}>
                {showDailyProgress ? "HIDE" : "SHOW"}
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
                    label={label}
                    onPress={() => setSelectedDayTab(label)}
                    selectedTab={selectedDayTab}
                  />
                ))}
              </ScrollView>
              <TopSpace top={16} />

              <View style={styles.todayGoalsProgressSection}>
                <Text style={styles.todayGoalsProgressTitle}>
                  TODAY'S GOALS PROGRESS
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
                        {isTodayProgressExpanded ? "Show Less" : "Show More"}
                      </Text>
                      <Entypo
                        name={
                          isTodayProgressExpanded
                            ? "chevron-up"
                            : "chevron-down"
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
          {/* My Dashboard */}
          <View style={styles.dashboardSection}>
            <Text style={styles.dashboardText}>My Dashboard</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.customizeContainer}
              onPress={() => dashboardSheetRef.current?.expand()}
            >
              <Text style={styles.customizeText}>CUSTOMIZE</Text>
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
                label={label}
                onPress={() => setSelectedDashboardCategory(label)}
                selectedTab={selectedDashboardCategory}
              />
            ))}
          </ScrollView>

          {visibleDashboardSubGoals.map((goal) => (
            <DashboardSubGoalRow key={goal.id} goal={goal} />
          ))}

          <TouchableOpacity style={styles.showMoreButton}>
            <Text style={styles.showMoreText}>Show More</Text>
            <Entypo name="chevron-down" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.fastingCalendarSection}>
            <Text style={styles.dashboardText}>YOUR FASTING CALENDAR</Text>
            <TopSpace top={16} />
            <View style={styles.fastingInfoBanner}>
              <Text style={styles.fastingInfoBannerText}>
                Stay on top of your monthly fasting goals — view your planned
                fasts, track completed days, and see what’s skipped or
                remaining.
              </Text>
              <TouchableOpacity
                style={styles.fastingInfoBannerClose}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={18} color={Colors.light.white} />
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              style={styles.fastingCalendarTabsScroll}
              contentContainerStyle={styles.categoryFilterContent}
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled
              scrollEventThrottle={16}
            >
              {FASTING_CALENDAR_FILTER_TABS.map((label) => (
                <Tabs
                  key={label}
                  label={label}
                  onPress={() => setFastingCalendarSelectedTab(label)}
                  selectedTab={fastingCalendarSelectedTab}
                  bgColor={Colors.light.blackBackground}
                />
              ))}
            </ScrollView>
            <TopSpace top={16} />
            <FastingGoalTotalCard
              label="GOAL TOTAL"
              count={PLANNED_FASTS.goalTotal}
            />
            <TopSpace top={16} />
            <ScrollView
              horizontal
              style={styles.fastingCalendarTabsScroll}
              contentContainerStyle={styles.categoryFilterContent}
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled
              scrollEventThrottle={16}
            >
              {FastingCalendarTabs.map((label) => (
                <Tabs
                  key={label}
                  label={label}
                  onPress={() => setFastingCalendarSelectedTrack(label)}
                  selectedTab={fastCalendarSelectedTrack}
                  bgColor={Colors.light.blackBackground}
                />
              ))}
            </ScrollView>
            {fastCalendarSelectedTrack === "Planned" && (
              <FastingCalendarTrack
                variant="planned"
                filterTab={fastingCalendarSelectedTab}
                showLegendCard={showFastingLegendCard}
                onCloseLegendCard={() => setShowFastingLegendCard(false)}
              />
            )}
            {fastCalendarSelectedTrack === "Planned vs. Progress" && (
              <FastingCalendarTrack
                variant="progress"
                filterTab={fastingCalendarSelectedTab}
                showLegendCard={showFastingLegendCard}
                onCloseLegendCard={() => setShowFastingLegendCard(false)}
              />
            )}
          </View>
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
        onClose={() => goldenBottomSheetRef.current?.close()}
        onChange={(index) => handleBottomSheetChange("dailyProgress", index)}
      >
        <DailyProgressBottomSheet
          onClose={() => goldenBottomSheetRef.current?.close()}
        />
      </BottomSheetWrapper>

      {/* Golden action FAB */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => goldenBottomSheetRef.current?.expand()}
        style={[styles.goldenFab, { bottom: safeAreaInsets.bottom + 20 }]}
      >
        <TaperedCircleBorder variant="golden" size={30}>
          <View style={styles.goldenFabInner}>
            <Text style={styles.goldenFabPlus}>+</Text>
          </View>
        </TaperedCircleBorder>
      </TouchableOpacity>
    </BlackScreenWrapper>
    </View>
  );
}
