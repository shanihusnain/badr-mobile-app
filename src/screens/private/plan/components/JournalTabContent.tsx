import { TopSpace } from "@/components/atoms/TopSpace";
import { Colors } from "@/constants/theme";
import type { JournalInsightsData } from "@/src/api/queries/useGetJournalInsights";
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
  /** Raw insights payload — customization state comes from backend only. */
  journalInsights?: JournalInsightsData | null;
};

/** Backend: customized when categories exist and customizeJournalCard is null. */
function resolveIsJournalCustomized(
  insights: JournalInsightsData | null | undefined,
): boolean {
  if (!insights) return false;
  if (insights.customizeJournalCard != null) return false;
  return (insights.categories?.length ?? 0) > 0;
}

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
  journalInsights = null,
}: JournalTabContentProps) {
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const isJournalCustomized = resolveIsJournalCustomized(journalInsights);
  const addBehaviorsCard = journalInsights?.addBehaviorsCard ?? null;
  const customizeJournalCard = journalInsights?.customizeJournalCard ?? null;
  // Keep consistency + habit cards mounted while period refetch shows loaders.
  const showCustomizedContent =
    isJournalCustomized ||
    (isLoadingHabits && (activeSnapshot.journalingHabits?.length ?? 0) > 0);
  const showCustomizeCard =
    !isLoadingHabits &&
    journalInsights != null &&
    !isJournalCustomized;

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

      {showCustomizedContent ? (
        <>
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
          {!isLoadingHabits && addBehaviorsCard != null ? (
            <>
              <TopSpace top={20} />
              <PlanNotificationsCard
                title={addBehaviorsCard.title?.trim() || JOURNAL_BEHAVIORS_TITLE}
                description={
                  addBehaviorsCard.body?.trim() ||
                  JOURNAL_NOTIFICATIONS_DESCRIPTION
                }
                callToActionText={
                  addBehaviorsCard.cta?.trim() || "GET STARTED"
                }
                iconSize={35}
                onActionPress={onGetStartedPress}
              />
            </>
          ) : null}
        </>
      ) : null}

      {showCustomizeCard ? (
        <>
          <TopSpace top={20} />
          <JournalCustomizeCard
            onGetStartedPress={onGetStartedPress}
            title={customizeJournalCard?.title}
            description={
              customizeJournalCard?.description ??
              customizeJournalCard?.subtitle ??
              customizeJournalCard?.body
            }
            buttonLabel={
              customizeJournalCard?.button ?? customizeJournalCard?.cta
            }
          />
        </>
      ) : null}
    </ScrollView>
  );
}
