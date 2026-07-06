import { TopSpace } from "@/components/atoms/TopSpace";
import { ScrollView, Text, View } from "react-native";
import type {
  PlanJournalConsistencySnapshot,
  PlanJournalPeriod,
} from "../planJournalConsistencyMockData";
import { JournalConsistencySection } from "../../../../../components/atoms/JournalConsistencySection";
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
};

export function JournalTabContent({
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
}: JournalTabContentProps) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      contentContainerStyle={styles.journalTabContent}
    >
      <View style={styles.journalBanner}>
        <Text style={styles.journalBannerDismiss}>X</Text>
        <Text style={styles.journalBannerText}>{JOURNAL_BANNER_TEXT}</Text>
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
      />
      <TopSpace top={20} />
      {activeSnapshot.journalingHabits?.map((habit) => (
        <JournalHabitCard
          key={habit.id}
          habit={habit}
          onPress={() => {
            router.push(`/(tabs)/(plan)/journalinsight/${habit.id}`);
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
