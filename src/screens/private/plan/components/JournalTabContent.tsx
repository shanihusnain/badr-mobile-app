import { TopSpace } from "@/components/atoms/TopSpace";
import { ScrollView, Text, View } from "react-native";
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
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      contentContainerStyle={styles.journalTabContent}
    >
      <View style={styles.journalBanner}>
        <Text style={styles.journalBannerDismiss}>X</Text>
        <Text style={styles.journalBannerText}>
          {bannerText || JOURNAL_BANNER_TEXT}
        </Text>
      </View>
      <TopSpace top={20} />
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
        description={JOURNAL_NOTIFICATIONS_DESCRIPTION}
        iconSize={35}
      />
      <TopSpace top={20} />
      <JournalCustomizeCard onGetStartedPress={onGetStartedPress} />
    </ScrollView>
  );
}
