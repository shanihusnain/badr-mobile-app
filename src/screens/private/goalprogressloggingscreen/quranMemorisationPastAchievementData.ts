import type { QuranPastChartItem } from "./quranHoursPastAchievementData";
import {
  getMemorisationLogsForFilter,
  isSurahFullyMemorized,
  type SurahMemorisationLogRecord,
} from "./quranMemorisationSurahData";
import {
  getMemorisationGoalsForFilter,
  type MemorisationSurahFilterId,
  type SurahMemorisationGoal,
} from "./quranMemorisationSurahGoals";
import { getSurahVerseCount } from "./quranSurahVerseMap";

export type { MemorisationSurahFilterId };

export type MemorisationLogHistoryItem = {
  id: string;
  surahId: string;
  surahName: string;
  date: string;
  ayahsMemorizedToday: number;
};

export type MemorisationPastAchievement = {
  surahId: MemorisationSurahFilterId;
  surahName: string;
  totalAyahs: number;
  memorizedAyahs: number;
  remainingAyahs: number;
  progressPercent: number;
  completed: boolean;
  chartData: QuranPastChartItem[];
  yMax: number;
  yTicks: number[];
  logHistory: MemorisationLogHistoryItem[];
};

function formatLogDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function buildDailyLogChartData(
  logs: SurahMemorisationLogRecord[],
  goalsById: Map<string, SurahMemorisationGoal>,
): QuranPastChartItem[] {
  return logs.map((log, index) => {
    const goal = goalsById.get(log.surahId);
    const surahLabel = goal?.surahName ?? log.surahId;

    return {
      xLabel: `d${index + 1}`,
      dateLabel: formatLogDate(log.date),
      completedHours: log.ayahsMemorizedToday,
      incompleteHours: 0,
      hours: log.ayahsMemorizedToday,
      stackTotalHours: log.ayahsMemorizedToday,
      completedLabel: surahLabel,
    };
  });
}

function buildAggregateChartData(
  memorizedAyahs: number,
  remainingAyahs: number,
): QuranPastChartItem[] {
  const total = memorizedAyahs + remainingAyahs;
  return [
    {
      xLabel: "overall",
      dateLabel: "Overall",
      completedHours: memorizedAyahs,
      incompleteHours: remainingAyahs,
      hours: memorizedAyahs,
      stackTotalHours: total,
    },
  ];
}

function toLogHistoryItem(
  log: SurahMemorisationLogRecord,
  goalsById: Map<string, SurahMemorisationGoal>,
): MemorisationLogHistoryItem {
  const goal = goalsById.get(log.surahId);
  return {
    id: `${log.surahId}-${log.date}-${log.ayahsMemorizedToday}`,
    surahId: log.surahId,
    surahName: goal?.surahName ?? log.surahId,
    date: log.date,
    ayahsMemorizedToday: log.ayahsMemorizedToday,
  };
}

export function getMemorisationPastAchievement(
  surahId: MemorisationSurahFilterId = "all",
): MemorisationPastAchievement {
  const goals = getMemorisationGoalsForFilter(surahId);
  const goalsById = new Map(goals.map((goal) => [goal.id, goal]));

  const totalAyahs = goals.reduce((sum, goal) => sum + goal.totalAyahs, 0);
  const memorizedAyahs = goals.reduce(
    (sum, goal) => sum + goal.memorizedAyahs,
    0,
  );
  const remainingAyahs = Math.max(0, totalAyahs - memorizedAyahs);
  const progressPercent =
    totalAyahs > 0
      ? Math.min(100, Math.round((memorizedAyahs / totalAyahs) * 1000) / 10)
      : 0;
  const completed =
    surahId === "all"
      ? goals.length > 0 && goals.every((goal) => goal.completed)
      : isSurahFullyMemorized(surahId);

  const logs = getMemorisationLogsForFilter(surahId);
  const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const chartData =
    surahId === "all"
      ? buildAggregateChartData(memorizedAyahs, remainingAyahs)
      : buildDailyLogChartData(sortedLogs, goalsById);

  const yMax = Math.max(
    1,
    ...chartData.map((item) => item.stackTotalHours),
    surahId === "all" ? totalAyahs : getSurahVerseCount(surahId),
  );
  const yTicks = Array.from({ length: 4 }, (_, index) =>
    Math.round((yMax / 3) * index),
  );

  const surahName =
    surahId === "all"
      ? "All Surahs"
      : (goals[0]?.surahName ?? surahId);

  return {
    surahId,
    surahName,
    totalAyahs,
    memorizedAyahs,
    remainingAyahs,
    progressPercent,
    completed,
    chartData,
    yMax,
    yTicks,
    logHistory: sortedLogs
      .map((log) => toLogHistoryItem(log, goalsById))
      .reverse(),
  };
}

export function formatMemorisationAyahLabel(value: number): string {
  return `${value}`;
}
