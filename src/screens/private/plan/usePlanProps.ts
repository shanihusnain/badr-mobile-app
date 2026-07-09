import { StudyMaterialItem } from "@/components/molecules/PastAchievementStudyMaterial";
import { useJournalConsistencySection } from "@/hooks/useJournalConsistencySection";
import {
  getPlanJournalConsistencySnapshots,
  PLAN_JOURNAL_PERIODS,
} from "./planJournalConsistencyMockData";

import { useCallback, useState } from "react";
export const usePlanProps = () => {
  const tabs = [
    {
      id: 1,
      title: "Goal",
    },
    {
      id: 2,
      title: "Journal",
    },
  ];
  const journalTabs = [
    {
      id: 1,
      title: "All",
    },
    {
      id: 2,
      title: "RELIGIOUS HABITS",
    },
    {
      id: 3,
      title: "PERSONAL GROWTH",
    },
    { id: 4, title: "FAMILY BONDS" },
    { id: 5, title: "SOCIAL RESPONSIBILITY" },
  ];

  const [selectedJournalTab, setSelectedJournalTab] = useState<number>(
    journalTabs[0].id,
  );
  const PERIODS = PLAN_JOURNAL_PERIODS;

  const studyMaterial: StudyMaterialItem[] = [
    {
      id: 1,
      thumbnail: "https://via.placeholder.com/150",
      type: "video",
      description: "Exploring Scholarly Views on Making Up  Tajweed Lessons",
    },
    {
      id: 2,
      thumbnail: "https://via.placeholder.com/150",
      type: "podcast",
      description: "How to make up  with missed Khatm-e-Quran",
    },
    {
      id: 3,
      thumbnail: "https://via.placeholder.com/150",
      type: "video",
      description: "10 Ways to increase Your Dhikr with Omar  Sulieman",
    },
  ];
  const [selectedTab, setSelectedTab] = useState<number>(tabs[0].id);
  const resolveSnapshots = useCallback(
    (periodId: (typeof PLAN_JOURNAL_PERIODS)[number]["id"]) =>
      getPlanJournalConsistencySnapshots(periodId),
    [],
  );
  const {
    period,
    setPeriod,
    activeSnapshot,
    deltaIsPositive,
    canGoToPreviousPeriod,
    canGoToNextPeriod,
    handlePreviousPeriodRange,
    handleNextPeriodRange,
  } = useJournalConsistencySection(resolveSnapshots);
  return {
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
  };
};
