import type { QuranPastChartItem } from "./quranHoursPastAchievementData";
import {
  getHizbMemorisationLogsForFilter,
  isHizbFullyMemorized,
  type HizbMemorisationLogRecord,
} from "./quranMemorisationHizbData";
import {
  getHizbMemorisationGoalsForFilter,
  type MemorisationHizbFilterId,
  type HizbMemorisationGoal,
} from "./quranMemorisationHizbGoals";
import { getHizbVerseCount } from "./quranHizbVerseMap";

export type { MemorisationHizbFilterId };

export type HizbMemorisationLogHistoryItem = {
  id: string;
  hizbId: string;
  hizbName: string;
  date: string;
  ayahsMemorizedToday: number;
};

export type HizbMemorisationPastAchievement = {
  hizbId: MemorisationHizbFilterId;
  hizbName: string;
  totalAyahs: number;
  memorizedAyahs: number;
  remainingAyahs: number;
  progressPercent: number;
  completed: boolean;
  chartData: QuranPastChartItem[];
  yMax: number;
  yTicks: number[];
  logHistory: HizbMemorisationLogHistoryItem[];
};

function formatLogDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function buildDailyLogChartData(
  logs: HizbMemorisationLogRecord[],
  goalsById: Map<string, HizbMemorisationGoal>,
): QuranPastChartItem[] {
  return logs.map((log, index) => {
    const goal = goalsById.get(log.hizbId);
    const hizbLabel = goal?.hizbName ?? log.hizbId;

    return {
      xLabel: `d${index + 1}`,
      dateLabel: formatLogDate(log.date),
      completedHours: log.ayahsMemorizedToday,
      incompleteHours: 0,
      hours: log.ayahsMemorizedToday,
      stackTotalHours: log.ayahsMemorizedToday,
      completedLabel: hizbLabel,
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
  log: HizbMemorisationLogRecord,
  goalsById: Map<string, HizbMemorisationGoal>,
): HizbMemorisationLogHistoryItem {
  const goal = goalsById.get(log.hizbId);
  return {
    id: `${log.hizbId}-${log.date}-${log.ayahsMemorizedToday}`,
    hizbId: log.hizbId,
    hizbName: goal?.hizbName ?? log.hizbId,
    date: log.date,
    ayahsMemorizedToday: log.ayahsMemorizedToday,
  };
}

export function getHizbMemorisationPastAchievement(
  hizbId: MemorisationHizbFilterId = "all",
): HizbMemorisationPastAchievement {
  const goals = getHizbMemorisationGoalsForFilter(hizbId);
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
    hizbId === "all"
      ? goals.length > 0 && goals.every((goal) => goal.completed)
      : isHizbFullyMemorized(hizbId);

  const logs = getHizbMemorisationLogsForFilter(hizbId);
  const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const chartData =
    hizbId === "all"
      ? buildAggregateChartData(memorizedAyahs, remainingAyahs)
      : buildDailyLogChartData(sortedLogs, goalsById);

  const yMax = Math.max(
    1,
    ...chartData.map((item) => item.stackTotalHours),
    hizbId === "all" ? totalAyahs : getHizbVerseCount(hizbId),
  );
  const yTicks = Array.from({ length: 4 }, (_, index) =>
    Math.round((yMax / 3) * index),
  );

  const hizbName =
    hizbId === "all" ? "All Hizbs" : (goals[0]?.hizbName ?? hizbId);

  return {
    hizbId,
    hizbName,
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
