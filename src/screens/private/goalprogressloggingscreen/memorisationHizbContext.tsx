import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useGetQuranGoalByType } from "@/src/api/queries/useGetQuranGoalByType";
import type { QuranGoalDetailItem } from "@/src/utils/quranGoalMap";
import {
  getQuranFrameMemorisationItem,
  getQuranFrameMemorisationProgress,
  getQuranFrameMemorisationSurahName,
} from "@/src/utils/quranGoalFrameMap";
import { useOptionalQuranGoalFrameContext } from "./quranGoalFrameContext";
import {
  getHizbMemorisationGoals,
  type HizbMemorisationGoal,
  type HizbMemorisationStatusKind,
  type MemorisationHizbFilterId,
} from "./quranMemorisationHizbGoals";
import { getHizbDisplayName } from "./quranHizbVerseMap";

type MemorisationHizbContextValue = {
  activeHizbId: MemorisationHizbFilterId;
  setActiveHizbId: (id: MemorisationHizbFilterId) => void;
  /** Hizb number passed to the frame API as `itemNumber`. */
  activeItemNumber: number | null;
  goals: HizbMemorisationGoal[];
  refreshKey: number;
  bumpRefresh: () => void;
};

const MemorisationHizbContext =
  createContext<MemorisationHizbContextValue | null>(null);

function deriveStatus(
  memorizedAyahs: number,
  totalAyahs: number,
  completed: boolean,
): HizbMemorisationStatusKind {
  if (completed || (totalAyahs > 0 && memorizedAyahs >= totalAyahs)) {
    return "completed";
  }
  if (memorizedAyahs > 0) return "in-progress";
  return "not-started";
}

function mapDetailItemToGoal(item: QuranGoalDetailItem): HizbMemorisationGoal {
  const itemNumber = Number(item.itemNumber);
  const id = String(itemNumber);
  const memorizedAyahs = Math.max(0, Number(item.completedCount ?? 0) || 0);
  const totalFromVerses =
    item.verseStart != null && item.verseEnd != null
      ? Math.max(0, Number(item.verseEnd) - Number(item.verseStart) + 1)
      : 0;
  const totalAyahs = Math.max(
    0,
    Number(item.targetCount ?? 0) || totalFromVerses || 0,
  );
  const progressPercentage =
    totalAyahs > 0
      ? Math.min(100, Math.round((memorizedAyahs / totalAyahs) * 100))
      : 0;
  const completed =
    String(item.status ?? "").toUpperCase() === "COMPLETED" ||
    (totalAyahs > 0 && memorizedAyahs >= totalAyahs);
  const hizbName = String(
    item.surahName?.trim() || getHizbDisplayName(id) || `Hizb ${itemNumber}`,
  );
  const rangeLabel =
    item.verseStart != null && item.verseEnd != null
      ? `Ayah ${item.verseStart}–${item.verseEnd}`
      : "";

  return {
    id,
    itemNumber,
    hizbName,
    rangeLabel,
    displayName: hizbName,
    totalAyahs,
    memorizedAyahs,
    progressPercentage,
    completed,
    status: deriveStatus(memorizedAyahs, totalAyahs, completed),
  };
}

function enrichGoalFromFrame(
  goal: HizbMemorisationGoal,
  frameGoal: HizbMemorisationGoal | null,
): HizbMemorisationGoal {
  if (!frameGoal || frameGoal.itemNumber !== goal.itemNumber) return goal;
  return { ...goal, ...frameGoal, id: goal.id, itemNumber: goal.itemNumber };
}

export function MemorisationHizbProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const quranFrame = useOptionalQuranGoalFrameContext();
  const { data: detail } = useGetQuranGoalByType("MEMORIZATION_HIZB");

  const detailGoals = useMemo(() => {
    const items = detail?.items ?? [];
    if (items.length === 0) return null;
    return items
      .map(mapDetailItemToGoal)
      .filter((goal) => goal.itemNumber != null && goal.itemNumber > 0);
  }, [detail]);

  const frameActiveGoal = useMemo((): HizbMemorisationGoal | null => {
    const frame = quranFrame?.frame;
    if (!frame) return null;
    const item = getQuranFrameMemorisationItem(frame);
    const itemNumber =
      typeof item?.itemNumber === "number"
        ? item.itemNumber
        : quranFrame?.itemNumber;
    if (itemNumber == null || itemNumber <= 0) return null;

    const progress = getQuranFrameMemorisationProgress(frame);
    const hizbName =
      getQuranFrameMemorisationSurahName(frame) ||
      item?.title?.trim() ||
      getHizbDisplayName(String(itemNumber)) ||
      `Hizb ${itemNumber}`;
    const pillLabel = item?.pill?.label?.trim() || undefined;
    const subtitle = item?.subtitle?.trim() || undefined;
    const canLog = item?.canLog !== false;

    return {
      id: String(itemNumber),
      itemNumber,
      hizbName,
      rangeLabel: subtitle ?? "",
      displayName: hizbName,
      subtitle,
      pillLabel,
      totalAyahs: progress.totalAyahs,
      memorizedAyahs: progress.memorizedAyahs,
      progressPercentage: progress.progressPercent,
      completed: progress.completed,
      canLog,
      status: deriveStatus(
        progress.memorizedAyahs,
        progress.totalAyahs,
        progress.completed,
      ),
    };
  }, [quranFrame?.frame, quranFrame?.itemNumber]);

  const goals = useMemo(() => {
    const base =
      detailGoals && detailGoals.length > 0
        ? detailGoals
        : frameActiveGoal
          ? [frameActiveGoal]
          : getHizbMemorisationGoals();

    return base.map((goal) => enrichGoalFromFrame(goal, frameActiveGoal));
  }, [detailGoals, frameActiveGoal]);

  const [activeHizbId, setActiveHizbIdState] =
    useState<MemorisationHizbFilterId>("all");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (activeHizbId !== "all") return;
    const first = goals[0];
    if (!first) return;
    setActiveHizbIdState(first.id);
  }, [goals, activeHizbId]);

  const activeItemNumber = useMemo(() => {
    if (activeHizbId === "all") return goals[0]?.itemNumber ?? null;
    const fromId = Number(activeHizbId);
    if (Number.isFinite(fromId) && fromId > 0) return fromId;
    const match = goals.find((goal) => goal.id === activeHizbId);
    return match?.itemNumber ?? null;
  }, [activeHizbId, goals]);

  const setFrameItemNumber = quranFrame?.setItemNumber;
  const frameItemNumber = quranFrame?.itemNumber;
  const refetchFrame = quranFrame?.refetch;

  useEffect(() => {
    if (activeItemNumber == null || !setFrameItemNumber) return;
    if (frameItemNumber === activeItemNumber) return;
    setFrameItemNumber(activeItemNumber);
  }, [activeItemNumber, frameItemNumber, setFrameItemNumber]);

  const setActiveHizbId = useCallback((id: MemorisationHizbFilterId) => {
    setActiveHizbIdState(id);
  }, []);

  const bumpRefresh = useCallback(() => {
    setRefreshKey((current) => current + 1);
    refetchFrame?.();
  }, [refetchFrame]);

  const value = useMemo(
    () => ({
      activeHizbId,
      setActiveHizbId,
      activeItemNumber,
      goals,
      refreshKey,
      bumpRefresh,
    }),
    [
      activeHizbId,
      setActiveHizbId,
      activeItemNumber,
      goals,
      refreshKey,
      bumpRefresh,
    ],
  );

  return (
    <MemorisationHizbContext.Provider value={value}>
      {children}
    </MemorisationHizbContext.Provider>
  );
}

export function useMemorisationHizbContext(): MemorisationHizbContextValue {
  const context = useContext(MemorisationHizbContext);
  if (!context) {
    throw new Error(
      "useMemorisationHizbContext must be used within MemorisationHizbProvider",
    );
  }
  return context;
}

export function useOptionalMemorisationHizbContext():
  | MemorisationHizbContextValue
  | null {
  return useContext(MemorisationHizbContext);
}
