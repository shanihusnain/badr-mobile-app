import React, { useState, useRef } from "react";
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
import {
  TaperedCircleBorder,
  parsePercent,
} from "@/components/atoms/TaperedCircleBorder";
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
  const [isLoading, setIsLoading] = useState(true);

  const [isPrayerCardVisible, setIsPrayerCardVisible] = useState(true);
  const [activeInspirationIndex, setActiveInspirationIndex] = useState(0);
  const [selectedDashboardCategory, setSelectedDashboardCategory] =
    useState("All");
  const [scrollCollapseThreshold, setScrollCollapseThreshold] = useState(260);

  const scrollY = useRef(new Animated.Value(0)).current;

  const quranCategory = GOAL_CATEGORIES.find((c) => c.title === "QURAN");

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
            {(
              [
                "All",
                "Prayer",
                "Quran",
                "Fasting",
                "Sadaqah",
                "Time Spent",
              ] as const
            ).map((label) => (
              <Tabs
                key={label}
                label={label}
                onPress={() => setSelectedDashboardCategory(label)}
                selectedTab={selectedDashboardCategory}
              />
            ))}
          </ScrollView>

          {/* Prayer sub-goals */}
          {(selectedDashboardCategory === "All" ||
            selectedDashboardCategory === "Prayer") && (
            <>
              {[
                { title: "TAHIYYAT AL-WUDHU", divider: "/25 prayers" },
                { title: "SUNNAH RAWATIB", divider: "/252" },
                { title: "TAHIYYAT AL-MASJID", divider: "/47" },
                { title: "QIYAM AL-LAYL", divider: "/23" },
                { title: "MISSED PAST PRAYERS", divider: "/17" },
              ].map((row) => (
                <View key={row.title} style={styles.tahiyyatContainer}>
                  <View style={styles.tahiyyatLeft}>
                    <Text style={styles.tahiyyatTitle}>{row.title}</Text>
                    <Text style={styles.tahiyyatSubtitle}>
                      <Text style={styles.tahiyyatNumber}>0</Text>
                      <Text style={styles.tahiyyatDivider}>{row.divider}</Text>
                    </Text>
                  </View>
                  <View style={styles.tahiyyatCircleWrapper}>
                    <TaperedCircleBorder
                      borderColor={Colors.light.calendarBg}
                      size={48}
                    >
                      <View style={styles.circleTextContainer}>
                        <Text style={styles.circleMainText}>0</Text>
                        <Text style={styles.circlePercentText}>%</Text>
                      </View>
                    </TaperedCircleBorder>
                    <TopSpace top={8} />
                  </View>
                </View>
              ))}
            </>
          )}

          {/* Quran sub-goals */}
          {(selectedDashboardCategory === "All" ||
            selectedDashboardCategory === "Quran") && (
            <View style={styles.tahiyyatContainer}>
              <View style={styles.tahiyyatLeft}>
                <Text style={styles.tahiyyatTitle}>
                  QURAN RECITATION (BY COMPLETION)
                </Text>
                <Text style={styles.tahiyyatSubtitle}>
                  <Text style={styles.tahiyyatNumber}>0</Text>
                  <Text style={styles.tahiyyatDivider}>/3</Text>
                </Text>
              </View>
              <View style={styles.tahiyyatCircleWrapper}>
                <TaperedCircleBorder
                  percentage={quranCategory?.percentage}
                  progressColor={quranCategory?.progressColor}
                  borderColor={Colors.light.calendarBg}
                  size={48}
                >
                  <View style={styles.circleTextContainer}>
                    <Text style={styles.circleMainText}>
                      {parsePercent(quranCategory?.percentage)}
                    </Text>
                    <Text style={styles.circlePercentText}>%</Text>
                  </View>
                </TaperedCircleBorder>
              </View>
            </View>
          )}

          {/* Sadaqah sub-goals */}
          {(selectedDashboardCategory === "All" ||
            selectedDashboardCategory === "Sadaqah") && (
            <View style={styles.tahiyyatContainer}>
              <View style={styles.tahiyyatLeft}>
                <Text style={styles.tahiyyatTitle}>SADAQAH JARIYAH</Text>
                <Text style={styles.tahiyyatSubtitle}>
                  <Text style={styles.tahiyyatNumber}>$0</Text>
                  <Text style={styles.tahiyyatDivider}>/$1,000</Text>
                </Text>
              </View>
              <View style={styles.tahiyyatCircleWrapper}>
                <TaperedCircleBorder
                  borderColor={Colors.light.calendarBg}
                  size={48}
                >
                  <View style={styles.circleTextContainer}>
                    <Text style={styles.circleMainText}>0</Text>
                    <Text style={styles.circlePercentText}>%</Text>
                  </View>
                </TaperedCircleBorder>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.showMoreButton}>
            <Text style={styles.showMoreText}>Show More</Text>
            <Entypo name="chevron-down" size={24} color="white" />
          </TouchableOpacity>
        </Animated.ScrollView>

        <NamazGoalBottomSheet ref={namazBottomSheetRef} onClose={() => {}} />
        <DashboardCustomizeBottomSheet
          ref={dashboardSheetRef}
          onClose={() => {
            dashboardSheetRef.current?.close();
          }}
        />

      <BottomSheetWrapper ref={goldenBottomSheetRef} snapPoints={["50%", "92%"]}>
        <DailyProgressBottomSheet onClose={() => goldenBottomSheetRef.current?.close()} />
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
  );
}
