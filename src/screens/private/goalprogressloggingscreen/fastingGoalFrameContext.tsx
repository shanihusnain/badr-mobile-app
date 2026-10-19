import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import {
  useGetFastingGoalFrame,
  type FastingGoalFrameData,
} from "@/src/api/queries/useGetFastingGoalFrame";
import { resolveFastingTypeFromGoalId } from "@/src/utils/fastingGoalMap";
import type { GoalId } from "../home/components/goalsData";

type FastingGoalFrameContextValue = {
  frame: FastingGoalFrameData | null | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isPlaceholderData: boolean;
  isError: boolean;
  refetch: () => void;
  /** Current cycle week from the latest current-frame response. */
  weekNumber: number | null;
  /**
   * @deprecated Week browsing is owned by WeeklyBrowseFrameProvider.
   * Kept as a no-op so existing call sites do not change the screen frame.
   */
  setWeekNumber: (weekNumber: number) => void;
  openInsights?: () => void;
};

const FastingGoalFrameContext =
  createContext<FastingGoalFrameContextValue | null>(null);

export function FastingGoalFrameProvider({
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
  const fastingType = resolveFastingTypeFromGoalId(goalId);
  const [weekNumber, setWeekNumberState] = React.useState<number | null>(null);

  React.useEffect(() => {
    setWeekNumberState(null);
  }, [goalId]);

  // Always fetch the current cycle frame — week browsing uses WeeklyBrowseFrameProvider.
  const { data, isLoading, isFetching, isPlaceholderData, isError, refetch } =
    useGetFastingGoalFrame(fastingType, {
      enabled: !!fastingType,
    });

  useEffect(() => {
    if (refreshKey > 0) {
      refetch();
    }
  }, [refreshKey, refetch]);

  useEffect(() => {
    const fromWeek = data?.week?.weekNumber;
    if (typeof fromWeek === "number" && fromWeek > 0) {
      setWeekNumberState(fromWeek);
      return;
    }
    const fromCycle = data?.cycle?.weekNumber;
    if (typeof fromCycle === "number" && fromCycle > 0) {
      setWeekNumberState(fromCycle);
    }
  }, [data]);

  const setWeekNumber = React.useCallback((_nextWeek: number) => {
    // No-op: browse week is handled by WeeklyBrowseFrameProvider.
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
    <FastingGoalFrameContext.Provider value={value}>
      {children}
    </FastingGoalFrameContext.Provider>
  );
}

export function useOptionalFastingGoalFrameContext() {
  return useContext(FastingGoalFrameContext);
}

export function useFastingGoalFrameContext() {
  const ctx = useContext(FastingGoalFrameContext);
  if (!ctx) {
    throw new Error(
      "useFastingGoalFrameContext must be used within FastingGoalFrameProvider",
    );
  }
  return ctx;
}
