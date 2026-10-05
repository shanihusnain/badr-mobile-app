import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useQueries } from "@tanstack/react-query";
import {
  getQuranGoalFrame,
  quranGoalFrameQueryKey,
  useGetQuranGoalFrame,
  type QuranGoalFrameData,
} from "@/src/api/queries/useGetQuranGoalFrame";
import { useGetQuranGoalByType } from "@/src/api/queries/useGetQuranGoalByType";
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
  /** Active surah/juz/hizb for multi-item frames (e.g. MEMORIZATION_SURAH). */
  itemNumber: number | null;
  setItemNumber: (itemNumber: number) => void;
  /**
   * RECITATION_COMPLETION + MEMORIZATION_* — frames for weeks 1‥active
   * (cycle-wide juz/ayah resume). Empty for other goal types.
   */
  completionCycleFrames: QuranGoalFrameData[];
  /** Alias of completionCycleFrames for memorisation callers. */
  memorisationCycleFrames: QuranGoalFrameData[];
  openInsights?: () => void;
};

const QuranGoalFrameContext =
  createContext<QuranGoalFrameContextValue | null>(null);

function quranTypeRequiresItemNumber(quranGoalType: string | null): boolean {
  if (!quranGoalType) return false;
  return (
    quranGoalType === "MEMORIZATION_SURAH" ||
    quranGoalType === "MEMORIZATION_JUZ" ||
    quranGoalType === "MEMORIZATION_HIZB" ||
    quranGoalType === "RECITATION_SURAH"
  );
}

function resolveCycleActiveWeek(
  frame: QuranGoalFrameData | null | undefined,
): number | null {
  if (!frame) return null;
  const fromStreaks = frame.streaks?.weeks?.find(
    (week) => week.isCurrentWeek,
  )?.weekNumber;
  if (typeof fromStreaks === "number" && fromStreaks > 0) return fromStreaks;
  const fromWeek = frame.week?.weekNumber;
  if (typeof fromWeek === "number" && fromWeek > 0) return fromWeek;
  return null;
}

export function QuranGoalFrameProvider({
  goalId,
  refreshKey = 0,
  children,
  onOpenInsights,
  /** Seed itemNumber before the carousel reports the active surah. */
  initialItemNumber,
}: {
  goalId: GoalId;
  refreshKey?: number;
  children: ReactNode;
  onOpenInsights?: () => void;
  initialItemNumber?: number | null;
}) {
  const quranGoalType = resolveQuranTypeFromGoalId(goalId);
  const requiresItemNumber = quranTypeRequiresItemNumber(quranGoalType);
  const isCompletionGoal = quranGoalType === "RECITATION_COMPLETION";
  const isMemorisationGoal =
    quranGoalType === "MEMORIZATION_SURAH" ||
    quranGoalType === "MEMORIZATION_JUZ" ||
    quranGoalType === "MEMORIZATION_HIZB";
  const isRecitationJuzGoal = quranGoalType === "RECITATION_JUZ";
  /** Prefetch weeks 1‥active for cycle-wide verse/juz resume. */
  const needsCycleWeekPrefetch =
    isCompletionGoal || isMemorisationGoal || isRecitationJuzGoal;
  const [weekNumber, setWeekNumberState] = React.useState<number | null>(null);
  const [hasUserSelectedWeek, setHasUserSelectedWeek] = React.useState(false);
  const [itemNumber, setItemNumberState] = React.useState<number | null>(
    () => initialItemNumber ?? null,
  );
  /** Sticky "today" week so viewing past weeks doesn't shrink cycle prefetch. */
  const [cycleActiveWeek, setCycleActiveWeek] = React.useState<number | null>(
    null,
  );

  const {
    data: detail,
    isFetched: isDetailFetched,
    isError: isDetailError,
  } = useGetQuranGoalByType(requiresItemNumber ? quranGoalType : null, {
    enabled: requiresItemNumber && !!quranGoalType,
  });

  React.useEffect(() => {
    setWeekNumberState(null);
    setHasUserSelectedWeek(false);
    setItemNumberState(initialItemNumber ?? null);
    setCycleActiveWeek(null);
  }, [goalId, initialItemNumber]);

  /** Prefer detail list so the first frame call already includes `itemNumber`. */
  useEffect(() => {
    if (itemNumber != null) return;
    if (initialItemNumber != null) {
      setItemNumberState(initialItemNumber);
      return;
    }
    const first = detail?.items?.[0]?.itemNumber;
    if (typeof first === "number" && Number.isFinite(first) && first > 0) {
      setItemNumberState(first);
    }
  }, [detail, itemNumber, initialItemNumber]);

  const canFetchFrameWithoutItem =
    requiresItemNumber &&
    (isDetailError || (isDetailFetched && !(detail?.items?.length)));

  const frameEnabled =
    !!quranGoalType &&
    (!requiresItemNumber || itemNumber != null || canFetchFrameWithoutItem);

  const { data, isLoading, isFetching, isPlaceholderData, isError, refetch } =
    useGetQuranGoalFrame(quranGoalType, {
      enabled: frameEnabled,
      weekNumber: hasUserSelectedWeek ? (weekNumber ?? undefined) : undefined,
      itemNumber: itemNumber ?? undefined,
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

  useEffect(() => {
    const active = resolveCycleActiveWeek(data);
    if (active == null) return;
    setCycleActiveWeek((prev) =>
      prev == null ? active : Math.max(prev, active),
    );
  }, [data]);

  /** Fallback if detail had no items but frame returned one. */
  useEffect(() => {
    if (itemNumber != null) return;
    const first = data?.items?.[0]?.itemNumber;
    if (typeof first === "number" && Number.isFinite(first) && first > 0) {
      setItemNumberState(first);
    }
  }, [data, itemNumber]);

  const cycleWeekNumbers = useMemo(() => {
    if (!needsCycleWeekPrefetch || !frameEnabled) return [] as number[];
    const active = cycleActiveWeek ?? resolveCycleActiveWeek(data);
    if (active == null || active < 1) return [];
    return Array.from({ length: active }, (_, index) => index + 1);
  }, [needsCycleWeekPrefetch, frameEnabled, cycleActiveWeek, data]);

  const cycleWeekQueries = useQueries({
    queries: cycleWeekNumbers.map((week) => ({
      queryKey: quranGoalFrameQueryKey(
        quranGoalType ?? "",
        week,
        itemNumber ?? "all",
      ),
      queryFn: () =>
        getQuranGoalFrame(quranGoalType!, {
          week,
          itemNumber: itemNumber ?? undefined,
        }),
      enabled: Boolean(quranGoalType) && frameEnabled,
    })),
  });

  const cycleFrames = useMemo(() => {
    if (!needsCycleWeekPrefetch) return [] as QuranGoalFrameData[];
    const frames: QuranGoalFrameData[] = [];
    for (const query of cycleWeekQueries) {
      if (query.data) frames.push(query.data);
    }
    // Include the primary "current" response if week queries haven't landed yet.
    if (
      data &&
      !frames.some((frame) => frame.week.weekNumber === data.week.weekNumber)
    ) {
      frames.push(data);
    }
    return frames;
  }, [needsCycleWeekPrefetch, cycleWeekQueries, data]);

  const completionCycleFrames = cycleFrames;
  const memorisationCycleFrames =
    isMemorisationGoal || isRecitationJuzGoal ? cycleFrames : [];

  const setWeekNumber = React.useCallback((nextWeek: number) => {
    setHasUserSelectedWeek(true);
    setWeekNumberState(nextWeek);
  }, []);

  const setItemNumber = React.useCallback((nextItem: number) => {
    if (!Number.isFinite(nextItem) || nextItem <= 0) return;
    setItemNumberState(nextItem);
  }, []);

  const waitingForItemNumber =
    requiresItemNumber && itemNumber == null && !canFetchFrameWithoutItem;

  const value = useMemo(
    () => ({
      frame: data,
      isLoading: waitingForItemNumber || isLoading,
      isFetching,
      isPlaceholderData,
      isError,
      refetch,
      weekNumber,
      setWeekNumber,
      itemNumber,
      setItemNumber,
      completionCycleFrames,
      memorisationCycleFrames,
      openInsights: onOpenInsights,
    }),
    [
      data,
      waitingForItemNumber,
      isLoading,
      isFetching,
      isPlaceholderData,
      isError,
      refetch,
      weekNumber,
      setWeekNumber,
      itemNumber,
      setItemNumber,
      completionCycleFrames,
      memorisationCycleFrames,
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
