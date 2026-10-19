import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import {
  useGetPrayerGoalFrame,
  type PrayerGoalFrameData,
} from "@/src/api/queries/useGetPrayerGoalFrame";
import { resolvePrayerTypeFromGoalId } from "@/src/utils/prayerGoalMap";
import type { GoalId } from "../home/components/goalsData";

type PrayerGoalFrameContextValue = {
  frame: PrayerGoalFrameData | null | undefined;
  isLoading: boolean;
  /** True while refetching (placeholder data may still be visible). */
  isFetching: boolean;
  /** True when displayed frame data is placeholder from a previous query. */
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
  /**
   * Five Daily / Sunnah Rawatib: open the slot-picker delete sheet for a day.
   * Other prayer goals leave this unset and delete the day log directly.
   */
  openDeletePrayerLogOptions?: (date: string) => void;
};

const PrayerGoalFrameContext =
  createContext<PrayerGoalFrameContextValue | null>(null);

export function PrayerGoalFrameProvider({
  goalId,
  refreshKey = 0,
  children,
  onOpenInsights,
  onOpenDeletePrayerLogOptions,
}: {
  goalId: GoalId;
  refreshKey?: number;
  children: ReactNode;
  onOpenInsights?: () => void;
  onOpenDeletePrayerLogOptions?: (date: string) => void;
}) {
  const prayerType = resolvePrayerTypeFromGoalId(goalId);
  const [weekNumber, setWeekNumberState] = React.useState<number | null>(null);

  React.useEffect(() => {
    setWeekNumberState(null);
  }, [goalId]);

  // Always fetch the current cycle frame — week browsing uses WeeklyBrowseFrameProvider.
  const { data, isLoading, isFetching, isPlaceholderData, isError, refetch } =
    useGetPrayerGoalFrame(prayerType, {
      enabled: !!prayerType,
    });

  useEffect(() => {
    if (refreshKey > 0) {
      refetch();
    }
  }, [refreshKey, refetch]);

  useEffect(() => {
    if (!data?.cycle?.weekNumber) return;
    setWeekNumberState(data.cycle.weekNumber);
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
      openDeletePrayerLogOptions: onOpenDeletePrayerLogOptions,
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
      onOpenDeletePrayerLogOptions,
    ],
  );

  return (
    <PrayerGoalFrameContext.Provider value={value}>
      {children}
    </PrayerGoalFrameContext.Provider>
  );
}

export function useOptionalPrayerGoalFrameContext() {
  return useContext(PrayerGoalFrameContext);
}

export function usePrayerGoalFrameContext() {
  const ctx = useContext(PrayerGoalFrameContext);
  if (!ctx) {
    throw new Error(
      "usePrayerGoalFrameContext must be used within PrayerGoalFrameProvider",
    );
  }
  return ctx;
}
