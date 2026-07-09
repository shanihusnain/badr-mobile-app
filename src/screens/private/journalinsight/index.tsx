import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { TopSpace } from "@/components/atoms/TopSpace";
import { JournalConsistencySection } from "@/components/molecules/JournalConsistencySection";
import { PastAchievementStudyMaterial } from "@/components/molecules/PastAchievementStudyMaterial";
import { ScrollView } from "react-native";
import { JournalInsightBehaviorCard } from "./components/JournalInsightBehaviorCard";
import { JournalInsightSummaryCard } from "./components/JournalInsightSummaryCard";
import { useJournalInsightProps } from "./useJournalInsightProps";
import { journalInsightStyles as styles } from "./styles";

export const JornalInsight = ({ id }: { id: string }) => {
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
  } = useJournalInsightProps(id);

  return (
    <BlackScreenWrapper>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TopSpace top={20} />
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
        />
        <TopSpace top={20} />
        <JournalInsightSummaryCard snapshot={activeSnapshot} />
        <TopSpace top={16} />
        {activeSnapshot.behaviors.map((behavior) => (
          <JournalInsightBehaviorCard
            key={`${period.id}-${behavior.id}`}
            behavior={behavior}
            periodId={period.id}
          />
        ))}
        <TopSpace top={10} />
        <PastAchievementStudyMaterial
          items={activeSnapshot.studyMaterial}
          title="LEARN MORE"
        />
      </ScrollView>
    </BlackScreenWrapper>
  );
};
