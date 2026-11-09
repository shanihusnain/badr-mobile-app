import { TopSpace } from "@/components/atoms/TopSpace";
import { Colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import type {
  PlanJournalConsistencySnapshot,
  PlanJournalPeriod,
} from "../planJournalConsistencyMockData";
import { JournalConsistencySection } from "@/components/molecules/JournalConsistencySection";
import { JournalCustomizeCard } from "./JournalCustomizeCard";
import { JournalHabitCard } from "./JournalHabitCard";
import { PlanNotificationsCard } from "./PlanNotificationsCard";
import { planStyles as styles } from "../styles";
import { router } from "expo-router";

const JOURNAL_BANNER_TEXT =
  "Gain insights from your daily journal entries to track your progress and celebrate your consistency. You can use these reflections to guide your growth.";

const JOURNAL_BEHAVIORS_TITLE = "Add More Behaviors to Your Journal";
const JOURNAL_NOTIFICATIONS_DESCRIPTION =
  "Choose from over 100 behaviors to track daily, fostering growth in your character and helping you become your best self.";

type JournalTabContentProps = {
  bannerText?: string;
  activeSnapshot: PlanJournalConsistencySnapshot;
  periods: PlanJournalPeriod[];
  period: PlanJournalPeriod;
  deltaIsPositive: boolean;
  canGoToPreviousPeriod: boolean;
  canGoToNextPeriod: boolean;
  onSelectPeriod: (period: PlanJournalPeriod) => void;
  onPreviousPeriodRange: () => void;
  onNextPeriodRange: () => void;
  onGetStartedPress: () => void;
  isLoadingHabits?: boolean;
  insightsEndDate: string;
};

export function JournalTabContent({
  bannerText,
  activeSnapshot,
  periods,
  period,
  deltaIsPositive,
  canGoToPreviousPeriod,
  canGoToNextPeriod,
  onSelectPeriod,
  onPreviousPeriodRange,
  onNextPeriodRange,
  onGetStartedPress,
  isLoadingHabits = false,
  insightsEndDate,
}: JournalTabContentProps) {
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      contentContainerStyle={styles.journalTabContent}
    >
      {isBannerVisible ? (
        <>
          <View style={styles.journalBanner}>
            <Pressable
              style={styles.journalBannerDismiss}
              onPress={() => setIsBannerVisible(false)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Dismiss journal insights banner"
            >
              <Ionicons name="close" size={22} color={Colors.light.white} />
            </Pressable>
            <Text
              style={styles.journalBannerText}
              adjustsFontSizeToFit
              numberOfLines={5}
              minimumFontScale={0.85}
            >
              {bannerText || JOURNAL_BANNER_TEXT}
            </Text>
          </View>
          <TopSpace top={34} />
        </>
      ) : null}
      <JournalConsistencySection
        activeSnapshot={activeSnapshot}
        periods={periods}
        period={period}
        deltaIsPositive={deltaIsPositive}
        canGoToPreviousPeriod={canGoToPreviousPeriod}
        canGoToNextPeriod={canGoToNextPeriod}
        onSelectPeriod={onSelectPeriod}
        onPreviousPeriodRange={onPreviousPeriodRange}
        onNextPeriodRange={onNextPeriodRange}
        isLoading={isLoadingHabits}
      />
      <TopSpace top={20} />
      {activeSnapshot.journalingHabits?.map((habit) => (
        <JournalHabitCard
          key={habit.id}
          habit={habit}
          isLoading={isLoadingHabits}
          onPress={() => {
            router.push({
              pathname: "/(tabs)/(plan)/journalinsight/[id]",
              params: {
                id: String(habit.id),
                period: period.label,
                endDate: insightsEndDate,
                title: habit.name,
              },
            });
          }}
        />
      ))}
      <TopSpace top={20} />
      <PlanNotificationsCard
        title={JOURNAL_BEHAVIORS_TITLE}
        description={JOURNAL_NOTIFICATIONS_DESCRIPTION}
        callToActionText="GET STARTED"
        iconSize={35}
        onActionPress={onGetStartedPress}
      />
      <TopSpace top={20} />
      <JournalCustomizeCard onGetStartedPress={onGetStartedPress} />
    </ScrollView>
  );
}
