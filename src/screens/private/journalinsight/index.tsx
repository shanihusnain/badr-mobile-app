import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { TopSpace } from "@/components/atoms/TopSpace";
import { JournalConsistencySection } from "@/components/molecules/JournalConsistencySection";
import { PastAchievementStudyMaterial } from "@/components/molecules/PastAchievementStudyMaterial";
import { router } from "expo-router";
import { ScrollView } from "react-native";
import { JournalInsightBehaviorCard } from "./components/JournalInsightBehaviorCard";
import { JournalInsightSummaryCard } from "./components/JournalInsightSummaryCard";
import { journalInsightStyles as styles } from "./styles";
import { useJournalInsightProps } from "./useJournalInsightProps";

type JornalInsightProps = {
  id: string;
  periodLabel?: string;
  endDate?: string;
};

export const JornalInsight = ({
  id,
  periodLabel,
  endDate: initialEndDate,
}: JornalInsightProps) => {
  const {
    periods,
    period,
    setPeriod,
    activeSnapshot,
    deltaIsPositive,
    canGoToPreviousPeriod,
    canGoToNextPeriod,
    handlePreviousPeriodRange,
    handleNextPeriodRange,
    isLoading,
    endDate,
  } = useJournalInsightProps({
    habitCategory: id,
    initialPeriodLabel: periodLabel,
    initialEndDate,
  });

  return (
    <BlackScreenWrapper edges={[]}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <JournalConsistencySection
          activeSnapshot={activeSnapshot}
          periods={periods}
          period={period}
          deltaIsPositive={deltaIsPositive}
          canGoToPreviousPeriod={canGoToPreviousPeriod}
          canGoToNextPeriod={canGoToNextPeriod}
          onSelectPeriod={setPeriod}
          onPreviousPeriodRange={handlePreviousPeriodRange}
          onNextPeriodRange={handleNextPeriodRange}
          isLoading={isLoading}
        />
        <TopSpace top={20} />
        <JournalInsightSummaryCard
          snapshot={activeSnapshot}
          isLoading={isLoading}
        />
        <TopSpace top={16} />
        {activeSnapshot.behaviors.map((behavior) => (
          <JournalInsightBehaviorCard
            key={`${period.id}-${behavior.id}-${behavior.name}`}
            behavior={behavior}
            periodId={period.id}
            periodLabel={period.label}
            endDate={endDate}
          />
        ))}
        {activeSnapshot.studyMaterial.length > 0 ? (
          <>
            <TopSpace top={10} />
            <PastAchievementStudyMaterial
              items={activeSnapshot.studyMaterial}
              title="LEARN MORE"
              onSeeAllPress={() => {
                router.push("/(tabs)/(connect)/learnmorescreen");
              }}
            />
          </>
        ) : null}
      </ScrollView>
    </BlackScreenWrapper>
  );
};
