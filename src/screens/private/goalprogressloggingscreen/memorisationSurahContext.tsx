import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useGetQuranGoalByType } from "@/src/api/queries/useGetQuranGoalByType";
import type { QuranGoalFrameItem } from "@/src/api/queries/useGetQuranGoalFrame";
import type { QuranGoalDetailItem } from "@/src/utils/quranGoalMap";
import { useOptionalQuranGoalFrameContext } from "./quranGoalFrameContext";
import {
  getSurahMemorisationGoals,
  type MemorisationSurahFilterId,
  type SurahMemorisationGoal,
  type SurahMemorisationStatusKind,
} from "./quranMemorisationSurahGoals";
import {
  getQuranFrameMemorisationItem,
  getQuranFrameMemorisationProgress,
  getQuranFrameMemorisationSurahName,
} from "@/src/utils/quranGoalFrameMap";

type MemorisationSurahContextValue = {
  activeSurahId: MemorisationSurahFilterId;
  setActiveSurahId: (id: MemorisationSurahFilterId) => void;
  /** Quran surah number passed to the frame API as `itemNumber`. */
  activeItemNumber: number | null;
  goals: SurahMemorisationGoal[];
  refreshKey: number;
  bumpRefresh: () => void;
};

const MemorisationSurahContext =
  createContext<MemorisationSurahContextValue | null>(null);

function deriveStatus(
  memorizedAyahs: number,
  totalAyahs: number,
  completed: boolean,
): SurahMemorisationStatusKind {
  if (completed || (totalAyahs > 0 && memorizedAyahs >= totalAyahs)) {
    return "completed";
  }
  if (memorizedAyahs > 0) return "in-progress";
  return "not-started";
}

function bareSurahTitle(title: string | null | undefined, fallback: string) {
  const raw = title?.trim();
  if (!raw) return fallback;
  const bare = raw.replace(/\s*\([^)]*\)\s*$/, "").trim();
  return bare || raw;
}

function mapFrameItemToGoal(item: QuranGoalFrameItem): SurahMemorisationGoal {
  const itemNumber = Number(item.itemNumber);
  const memorizedAyahs = Math.max(0, Math.round(Number(item.completed) || 0));
  const totalAyahs = Math.max(0, Math.round(Number(item.target) || 0));
  const progressPercentage =
    typeof item.achievementPct === "number"
      ? Math.min(100, Math.max(0, Math.round(item.achievementPct)))
      : totalAyahs > 0
        ? Math.min(100, Math.round((memorizedAyahs / totalAyahs) * 100))
        : 0;
  const pillState = String(item.pill?.state ?? "").toUpperCase();
  const completed =
    pillState === "COMPLETED" ||
    (totalAyahs > 0 && memorizedAyahs >= totalAyahs);

  return {
    id: String(itemNumber),
    itemNumber,
    surahName: bareSurahTitle(item.title, `Surah ${itemNumber}`),
    subtitle: item.subtitle?.trim() || undefined,
    pillLabel: item.pill?.label?.trim() || undefined,
    totalAyahs,
    memorizedAyahs,
    progressPercentage,
    completed,
    canLog: item.canLog !== false,
    status: deriveStatus(memorizedAyahs, totalAyahs, completed),
  };
}

function mapDetailItemToGoal(item: QuranGoalDetailItem): SurahMemorisationGoal {
  const itemNumber = Number(item.itemNumber);
  const id = String(itemNumber);
  const raw = item as QuranGoalDetailItem & {
    completed?: number | null;
    target?: number | null;
  };
  const memorizedAyahs = Math.max(
    0,
    Number(raw.completedCount ?? raw.completed ?? 0) || 0,
  );
  const totalFromVerses =
    item.verseStart != null && item.verseEnd != null
      ? Math.max(0, Number(item.verseEnd) - Number(item.verseStart) + 1)
      : 0;
  const totalAyahs = Math.max(
    0,
    Number(raw.targetCount ?? raw.target ?? 0) || totalFromVerses || 0,
  );
  const progressPercentage =
    totalAyahs > 0
      ? Math.min(100, Math.round((memorizedAyahs / totalAyahs) * 100))
      : 0;
  const completed =
    String(item.status ?? "").toUpperCase() === "COMPLETED" ||
    (totalAyahs > 0 && memorizedAyahs >= totalAyahs);
  const surahName = String(item.surahName ?? `Surah ${itemNumber}`);

  return {
    id,
    itemNumber,
    surahName,
    totalAyahs,
    memorizedAyahs,
    progressPercentage,
    completed,
    status: deriveStatus(memorizedAyahs, totalAyahs, completed),
  };
}

function enrichGoalFromFrame(
  goal: SurahMemorisationGoal,
  frameGoal: SurahMemorisationGoal | null,
): SurahMemorisationGoal {
  if (!frameGoal || frameGoal.itemNumber !== goal.itemNumber) return goal;
  return { ...goal, ...frameGoal, id: goal.id, itemNumber: goal.itemNumber };
}

export function MemorisationSurahProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const quranFrame = useOptionalQuranGoalFrameContext();
  const { data: detail } = useGetQuranGoalByType("MEMORIZATION_SURAH");

  const frameGoals = useMemo(() => {
    const items = quranFrame?.frame?.items ?? [];
    if (items.length === 0) return null;
    return items
      .map(mapFrameItemToGoal)
      .filter((goal) => goal.itemNumber != null && goal.itemNumber > 0);
  }, [quranFrame?.frame?.items]);

  const detailGoals = useMemo(() => {
    const items = detail?.items ?? [];
    if (items.length === 0) return null;
    return items
      .map(mapDetailItemToGoal)
      .filter((goal) => goal.itemNumber != null && goal.itemNumber > 0);
  }, [detail]);

  const frameActiveGoal = useMemo((): SurahMemorisationGoal | null => {
    const frame = quranFrame?.frame;
    const itemNumber = quranFrame?.itemNumber;
    if (!frame || itemNumber == null || itemNumber <= 0) return null;

    const item = getQuranFrameMemorisationItem(frame, itemNumber);
    const progress = getQuranFrameMemorisationProgress(frame, itemNumber);
    const surahName =
      getQuranFrameMemorisationSurahName(frame, itemNumber) ||
      item?.title?.trim() ||
      `Surah ${itemNumber}`;
    const pillLabel = item?.pill?.label?.trim() || undefined;
    const subtitle = item?.subtitle?.trim() || undefined;
    const canLog = item?.canLog !== false;

    return {
      id: String(itemNumber),
      itemNumber,
      surahName,
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
    // Frame `items` carry the correct per-surah `completed` / `target` ayah counts.
    const base =
      frameGoals && frameGoals.length > 0
        ? frameGoals
        : detailGoals && detailGoals.length > 0
          ? detailGoals
          : frameActiveGoal
            ? [frameActiveGoal]
            : getSurahMemorisationGoals();

    return base.map((goal) => enrichGoalFromFrame(goal, frameActiveGoal));
  }, [detailGoals, frameActiveGoal, frameGoals]);

  const [activeSurahId, setActiveSurahIdState] =
    useState<MemorisationSurahFilterId>("all");
  const [refreshKey, setRefreshKey] = useState(0);

  // Seed active surah once goals are known.
  useEffect(() => {
    if (activeSurahId !== "all") return;
    const first = goals[0];
    if (!first) return;
    setActiveSurahIdState(first.id);
  }, [goals, activeSurahId]);

  const activeItemNumber = useMemo(() => {
    if (activeSurahId === "all") return goals[0]?.itemNumber ?? null;
    const fromId = Number(activeSurahId);
    if (Number.isFinite(fromId) && fromId > 0) return fromId;
    const match = goals.find((goal) => goal.id === activeSurahId);
    return match?.itemNumber ?? null;
  }, [activeSurahId, goals]);

  const setFrameItemNumber = quranFrame?.setItemNumber;
  const frameItemNumber = quranFrame?.itemNumber;
  const refetchFrame = quranFrame?.refetch;

  // Drive frame `?itemNumber=` from the carousel selection.
  useEffect(() => {
    if (activeItemNumber == null || !setFrameItemNumber) return;
    if (frameItemNumber === activeItemNumber) return;
    setFrameItemNumber(activeItemNumber);
  }, [activeItemNumber, frameItemNumber, setFrameItemNumber]);

  const setActiveSurahId = useCallback((id: MemorisationSurahFilterId) => {
    setActiveSurahIdState(id);
  }, []);

  const bumpRefresh = useCallback(() => {
    setRefreshKey((current) => current + 1);
    refetchFrame?.();
  }, [refetchFrame]);

  const value = useMemo(
    () => ({
      activeSurahId,
      setActiveSurahId,
      activeItemNumber,
      goals,
      refreshKey,
      bumpRefresh,
    }),
    [
      activeSurahId,
      setActiveSurahId,
      activeItemNumber,
      goals,
      refreshKey,
      bumpRefresh,
    ],
  );

  return (
    <MemorisationSurahContext.Provider value={value}>
      {children}
    </MemorisationSurahContext.Provider>
  );
}

export function useMemorisationSurahContext(): MemorisationSurahContextValue {
  const context = useContext(MemorisationSurahContext);
  if (!context) {
    throw new Error(
      "useMemorisationSurahContext must be used within MemorisationSurahProvider",
    );
  }
  return context;
}

export function useOptionalMemorisationSurahContext():
  | MemorisationSurahContextValue
  | null {
  return useContext(MemorisationSurahContext);
}
