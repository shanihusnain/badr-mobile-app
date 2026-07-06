import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { TopSpace } from "@/components/atoms/TopSpace";
import { GoalTabContent } from "./components/GoalTabContent";
import { JournalCustomizeBottomSheet } from "./components/JournalCustomizeBottomSheet";
import { JournalTabContent } from "./components/JournalTabContent";
import { PlanTabBar } from "./components/PlanTabBar";
import { usePlanProps } from "./usePlanProps";
import BottomSheet from "@gorhom/bottom-sheet";
import { useCallback, useRef } from "react";

export default function PlanScreen() {
  const {
    tabs,
    PERIODS,
    selectedTab,
    setSelectedTab,
    period,
    setPeriod,
    activeSnapshot,
    deltaIsPositive,
    canGoToPreviousPeriod,
    canGoToNextPeriod,
    handlePreviousPeriodRange,
    handleNextPeriodRange,
    studyMaterial,
    journalTabs,
    selectedJournalTab,
    setSelectedJournalTab,
  } = usePlanProps();

  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleCustomizePress = useCallback((addedHabitIds: number[]) => {
    console.log("Added journal habits:", addedHabitIds);
    bottomSheetRef.current?.close();
  }, []);

  return (
    <BlackScreenWrapper>
      <PlanTabBar
        tabs={tabs}
        selectedTab={selectedTab}
        onSelectTab={setSelectedTab}
      />
      <TopSpace top={16} />
      {selectedTab === 1 ? (
        <GoalTabContent studyMaterial={studyMaterial} />
      ) : (
        <JournalTabContent
          activeSnapshot={activeSnapshot}
          periods={PERIODS}
          period={period}
          deltaIsPositive={deltaIsPositive}
          canGoToPreviousPeriod={canGoToPreviousPeriod}
          canGoToNextPeriod={canGoToNextPeriod}
          onSelectPeriod={setPeriod}
          onPreviousPeriodRange={handlePreviousPeriodRange}
          onNextPeriodRange={handleNextPeriodRange}
          onGetStartedPress={() => bottomSheetRef.current?.expand()}
        />
      )}
      <JournalCustomizeBottomSheet
        ref={bottomSheetRef}
        journalTabs={journalTabs}
        selectedJournalTab={selectedJournalTab}
        onSelectJournalTab={setSelectedJournalTab}
        onCustomizePress={handleCustomizePress}
      />
    </BlackScreenWrapper>
  );
}
