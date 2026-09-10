import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import {
  useGetQuranGoalFrame,
  type QuranGoalFrameData,
} from "@/src/api/queries/useGetQuranGoalFrame";
import { resolveQuranTypeFromGoalId } from "@/src/utils/quranGoalMap";
import type { GoalId } from "../home/components/goalsData";

type QuranGoalFrameContextValue = {
  frame: QuranGoalFrameData | null | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isPlaceholderData: boolean;
  isError: boolean;
  refetch: () => void;
  weekNumber: number | null;
  setWeekNumber: (weekNumber: number) => void;
  openInsights?: () => void;
};

const QuranGoalFrameContext =
  createContext<QuranGoalFrameContextValue | null>(null);

export function QuranGoalFrameProvider({
  goalId,
  refreshKey = 0,
  children,
  onOpenInsights,
}: {
  goalId: GoalId;
  refreshKey?: number;
  children: ReactNode;
  onOpenInsights?: () => void;
}) {
  const quranGoalType = resolveQuranTypeFromGoalId(goalId);
  const [weekNumber, setWeekNumberState] = React.useState<number | null>(null);
  const [hasUserSelectedWeek, setHasUserSelectedWeek] = React.useState(false);

  React.useEffect(() => {
    setWeekNumberState(null);
    setHasUserSelectedWeek(false);
  }, [goalId]);

  const { data, isLoading, isFetching, isPlaceholderData, isError, refetch } =
    useGetQuranGoalFrame(quranGoalType, {
      enabled: !!quranGoalType,
      weekNumber: hasUserSelectedWeek ? (weekNumber ?? undefined) : undefined,
    });

  useEffect(() => {
    if (refreshKey > 0) {
      refetch();
    }
  }, [refreshKey, refetch]);

  useEffect(() => {
    if (weekNumber != null) return;
    if (!data?.week?.weekNumber) return;
    setWeekNumberState(data.week.weekNumber);
  }, [data, weekNumber]);

  const setWeekNumber = React.useCallback((nextWeek: number) => {
    setHasUserSelectedWeek(true);
    setWeekNumberState(nextWeek);
  }, []);

  const value = useMemo(
    () => ({
      frame: data,
      isLoading,
      isFetching,
      isPlaceholderData,
      isError,
      refetch,
      weekNumber,
      setWeekNumber,
      openInsights: onOpenInsights,
    }),
    [
      data,
      isLoading,
      isFetching,
      isPlaceholderData,
      isError,
      refetch,
      weekNumber,
      setWeekNumber,
      onOpenInsights,
    ],
  );

  return (
    <QuranGoalFrameContext.Provider value={value}>
      {children}
    </QuranGoalFrameContext.Provider>
  );
}

export function useOptionalQuranGoalFrameContext() {
  return useContext(QuranGoalFrameContext);
}

export function useQuranGoalFrameContext() {
  const ctx = useContext(QuranGoalFrameContext);
  if (!ctx) {
    throw new Error(
      "useQuranGoalFrameContext must be used within QuranGoalFrameProvider",
    );
  }
  return ctx;
}
