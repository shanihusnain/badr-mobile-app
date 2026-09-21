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
import {
  getQuranFrameMemorisationItem,
  getQuranFrameMemorisationProgress,
  getQuranFrameMemorisationSurahName,
} from "@/src/utils/quranGoalFrameMap";
import { useOptionalQuranGoalFrameContext } from "./quranGoalFrameContext";
import {
  getJuzMemorisationGoals,
  type JuzMemorisationGoal,
  type JuzMemorisationStatusKind,
  type MemorisationJuzFilterId,
} from "./quranMemorisationJuzGoals";

type MemorisationJuzContextValue = {
  activeJuzId: MemorisationJuzFilterId;
  setActiveJuzId: (id: MemorisationJuzFilterId) => void;
  /** Juz number passed to the frame API as `itemNumber`. */
  activeItemNumber: number | null;
  goals: JuzMemorisationGoal[];
  refreshKey: number;
  bumpRefresh: () => void;
};

const MemorisationJuzContext =
  createContext<MemorisationJuzContextValue | null>(null);

function isTotalVersesLabel(value: string) {
  return /^\(?\s*total\b/i.test(value) || /\bverses?\s*\)?\s*$/i.test(value);
}

function rangeFromTitle(title: string) {
  if (!title.includes("|")) return "";
  const right = title.split("|").slice(1).join("|").trim();
  return right && !isTotalVersesLabel(right) ? right : "";
}

function getJuzDisplayName(id: string): string {
  const n = Number(String(id).replace(/^juz-/i, ""));
  if (Number.isFinite(n) && n > 0) return `Juz ${n}`;
  return String(id);
}


function deriveStatus(
  memorizedAyahs: number,
  totalAyahs: number,
  completed: boolean,
): JuzMemorisationStatusKind {
  if (completed || (totalAyahs > 0 && memorizedAyahs >= totalAyahs)) {
    return "completed";
  }
  if (memorizedAyahs > 0) return "in-progress";
  return "not-started";
}

function bareTitle(title: string | null | undefined, fallback: string) {
  const raw = title?.trim();
  if (!raw) return fallback;
  const bare = raw.replace(/\s*\([^)]*\)\s*$/, "").trim();
  return bare || raw;
}

function mapFrameItemToGoal(item: QuranGoalFrameItem): JuzMemorisationGoal {
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
  const juzNameRaw = bareTitle(
    item.title,
    `Juz ${itemNumber}`,
  );
  const juzName = juzNameRaw.includes("|")
    ? juzNameRaw.split("|")[0]!.trim()
    : juzNameRaw;
  const rangeFromTitleSpan = rangeFromTitle(juzNameRaw);
  const rangeFromSubtitle = item.subtitle?.trim() || "";
  const localDisplay =
    getJuzDisplayName(`juz-${itemNumber}`) ||
    getJuzDisplayName(String(itemNumber));
  const rangeFromLocal = rangeFromTitle(localDisplay);
  const rangeLabel =
    rangeFromTitleSpan ||
    (rangeFromSubtitle && !isTotalVersesLabel(rangeFromSubtitle)
      ? rangeFromSubtitle
      : "") ||
    rangeFromLocal;
  const displayName = rangeLabel ? `${juzName} | ${rangeLabel}` : juzName;

  return {
    id: String(itemNumber),
    itemNumber,
    juzNumber: itemNumber,
    juzName,
    endLabel: "",
    rangeLabel,
    displayName,
    subtitle: rangeLabel || undefined,
    pillLabel: item.pill?.label?.trim() || undefined,
    totalAyahs,
    memorizedAyahs,
    progressPercentage,
    completed,
    canLog: item.canLog !== false,
    status: deriveStatus(memorizedAyahs, totalAyahs, completed),
  };
}

function mapDetailItemToGoal(item: QuranGoalDetailItem): JuzMemorisationGoal {
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
  const juzName = String(
    item.surahName?.trim() || getJuzDisplayName(id) || `Juz ${itemNumber}`,
  );
  const rangeLabel =
    item.verseStart != null && item.verseEnd != null
      ? `Ayah ${item.verseStart}–${item.verseEnd}`
      : "";

  return {
    id,
    itemNumber,
    juzNumber: itemNumber,
    juzName,
    endLabel: "",
    rangeLabel,
    displayName: juzName,
    totalAyahs,
    memorizedAyahs,
    progressPercentage,
    completed,
    status: deriveStatus(memorizedAyahs, totalAyahs, completed),
  };
}

function enrichGoalFromFrame(
  goal: JuzMemorisationGoal,
  frameGoal: JuzMemorisationGoal | null,
): JuzMemorisationGoal {
  if (!frameGoal || frameGoal.itemNumber !== goal.itemNumber) return goal;
  return { ...goal, ...frameGoal, id: goal.id, itemNumber: goal.itemNumber };
}

export function MemorisationJuzProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const quranFrame = useOptionalQuranGoalFrameContext();
  const { data: detail } = useGetQuranGoalByType("MEMORIZATION_JUZ");

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

  const frameActiveGoal = useMemo((): JuzMemorisationGoal | null => {
    const frame = quranFrame?.frame;
    const itemNumber = quranFrame?.itemNumber;
    if (!frame || itemNumber == null || itemNumber <= 0) return null;

    const item = getQuranFrameMemorisationItem(frame, itemNumber);
    const progress = getQuranFrameMemorisationProgress(frame, itemNumber);
    const rawName =
      getQuranFrameMemorisationSurahName(frame, itemNumber) ||
      item?.title?.trim() ||
      `Juz ${itemNumber}`;
    const juzName = rawName.includes("|")
      ? rawName.split("|")[0]!.trim()
      : bareTitle(rawName, `Juz ${itemNumber}`);
    const localDisplay =
      getJuzDisplayName(`juz-${itemNumber}`) ||
      getJuzDisplayName(String(itemNumber));
    const rangeFromLocal = rangeFromTitle(localDisplay);
    const rangeFromSubtitle = item?.subtitle?.trim() || "";
    const rangeLabel =
      rangeFromTitle(rawName) ||
      (rangeFromSubtitle && !isTotalVersesLabel(rangeFromSubtitle)
        ? rangeFromSubtitle
        : "") ||
      rangeFromLocal;
    const pillLabel = item?.pill?.label?.trim() || undefined;
    const canLog = item?.canLog !== false;
    const displayName = rangeLabel ? `${juzName} | ${rangeLabel}` : juzName;

    return {
      id: String(itemNumber),
      itemNumber,
      juzNumber: itemNumber,
      juzName,
      endLabel: "",
      rangeLabel,
      displayName,
      subtitle: rangeLabel || undefined,
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
      frameGoals && frameGoals.length > 0
        ? frameGoals
        : detailGoals && detailGoals.length > 0
          ? detailGoals
          : frameActiveGoal
            ? [frameActiveGoal]
            : getJuzMemorisationGoals();

    return base.map((goal) => enrichGoalFromFrame(goal, frameActiveGoal));
  }, [detailGoals, frameActiveGoal, frameGoals]);

  const [activeJuzId, setActiveJuzIdState] =
    useState<MemorisationJuzFilterId>("all");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (activeJuzId !== "all") return;
    const first = goals[0];
    if (!first) return;
    setActiveJuzIdState(first.id);
  }, [goals, activeJuzId]);

  const activeItemNumber = useMemo(() => {
    if (activeJuzId === "all") return goals[0]?.itemNumber ?? null;
    const fromId = Number(activeJuzId);
    if (Number.isFinite(fromId) && fromId > 0) return fromId;
    const match = goals.find((goal) => goal.id === activeJuzId);
    return match?.itemNumber ?? null;
  }, [activeJuzId, goals]);

  const setFrameItemNumber = quranFrame?.setItemNumber;
  const frameItemNumber = quranFrame?.itemNumber;
  const refetchFrame = quranFrame?.refetch;

  useEffect(() => {
    if (activeItemNumber == null || !setFrameItemNumber) return;
    if (frameItemNumber === activeItemNumber) return;
    setFrameItemNumber(activeItemNumber);
  }, [activeItemNumber, frameItemNumber, setFrameItemNumber]);

  const setActiveJuzId = useCallback((id: MemorisationJuzFilterId) => {
    setActiveJuzIdState(id);
  }, []);

  const bumpRefresh = useCallback(() => {
    setRefreshKey((current) => current + 1);
    refetchFrame?.();
  }, [refetchFrame]);

  const value = useMemo(
    () => ({
      activeJuzId,
      setActiveJuzId,
      activeItemNumber,
      goals,
      refreshKey,
      bumpRefresh,
    }),
    [
      activeJuzId,
      setActiveJuzId,
      activeItemNumber,
      goals,
      refreshKey,
      bumpRefresh,
    ],
  );

  return (
    <MemorisationJuzContext.Provider value={value}>
      {children}
    </MemorisationJuzContext.Provider>
  );
}

export function useMemorisationJuzContext(): MemorisationJuzContextValue {
  const context = useContext(MemorisationJuzContext);
  if (!context) {
    throw new Error(
      "useMemorisationJuzContext must be used within MemorisationJuzProvider",
    );
  }
  return context;
}

export function useOptionalMemorisationJuzContext():
  | MemorisationJuzContextValue
  | null {
  return useContext(MemorisationJuzContext);
}
