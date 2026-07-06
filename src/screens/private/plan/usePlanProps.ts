import { StudyMaterialItem } from "@/components/molecules/PastAchievementStudyMaterial";
import {
  getPlanJournalConsistencySnapshot,
  getPlanJournalConsistencySnapshots,
  PLAN_JOURNAL_PERIODS,
  PlanJournalPeriod,
} from "./planJournalConsistencyMockData";

import { useEffect, useMemo, useState } from "react";
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
  const [period, setPeriod] = useState<PlanJournalPeriod>(PERIODS[0]);
  const [periodIndex, setPeriodIndex] = useState(0);

  const periodSnapshots = useMemo(
    () => getPlanJournalConsistencySnapshots(period.id),
    [period.id],
  );

  const activeSnapshot = useMemo(
    () => getPlanJournalConsistencySnapshot(period.id, periodIndex),
    [period.id, periodIndex],
  );
  const deltaIsPositive = activeSnapshot.previousPeriodDeltaPercent >= 0;
  const canGoToPreviousPeriod = periodIndex < periodSnapshots.length - 1;
  const canGoToNextPeriod = periodIndex > 0;

  useEffect(() => {
    setPeriodIndex(0);
  }, [period.id]);

  const handlePreviousPeriodRange = () => {
    if (!canGoToPreviousPeriod) return;
    setPeriodIndex((current) => current + 1);
  };

  const handleNextPeriodRange = () => {
    if (!canGoToNextPeriod) return;
    setPeriodIndex((current) => current - 1);
  };
  return {
    tabs,
    PERIODS,
    selectedTab,
    setSelectedTab,
    period,
    setPeriod,
    periodIndex,
    setPeriodIndex,
    periodSnapshots,
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
