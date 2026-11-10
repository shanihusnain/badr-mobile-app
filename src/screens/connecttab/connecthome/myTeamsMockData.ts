export type TeamRankOption = {
  id: string;
  label: string;
};

export type DisplayRankMetric = {
  id: string;
  label: string;
};

export type DisplayRankPeriod = "today" | "week" | "month";

export type MyTeam = {
  id: string;
  name: string;
  avatarUri: string;
  /** Label shown in the card pill (derived from metric + period). */
  displayRankLabel: string;
  selectedMetricId: string;
  selectedPeriod: DisplayRankPeriod;
  rankPosition: number;
  rankTotal: number;
};

/** Metric ids match connect API `displayMetric` / rank.metric.metric values. */
export const DISPLAY_RANK_METRICS: DisplayRankMetric[] = [
  { id: "PRAYER_MOSQUE", label: "PRAYERS AT THE MOSQUE" },
  { id: "PRAYER_QIYAM", label: "QIYAM AL-LAYL PRAYERS" },
  { id: "QURAN_COMPLETIONS", label: "QURAN COMPLETIONS" },
  { id: "QURAN_SURAHS_MEMORIZED", label: "SURAHS MEMORIZED" },
  { id: "FASTING_MONDAY_THURSDAY", label: "MONDAY & THURSDAY FASTS" },
  { id: "FASTING_WHITE_DAYS", label: "WHITE DAY FASTS" },
  { id: "SADAQAH_MISSED_ZAKAT", label: "MISSED ZAKAT" },
  { id: "SADAQAH_PARENTS", label: "SADAQAH FOR PARENTS" },
];

export function mapDisplayPeriodToApi(
  period: DisplayRankPeriod,
): "DAILY" | "WEEKLY" | "MONTHLY" {
  if (period === "week") return "WEEKLY";
  if (period === "month") return "MONTHLY";
  return "DAILY";
}

export const DISPLAY_RANK_PERIODS: {
  id: DisplayRankPeriod;
  label: string;
}[] = [
  { id: "today", label: "TODAY" },
  { id: "week", label: "THIS WEEK" },
  { id: "month", label: "THIS MONTH" },
];

export function buildDisplayRankLabel(
  metricId: string,
  period: DisplayRankPeriod,
): string {
  const metric =
    DISPLAY_RANK_METRICS.find((item) => item.id === metricId)?.label ??
    "RANK";
  const periodPrefix =
    period === "today" ? "DAILY" : period === "week" ? "WEEKLY" : "MONTHLY";
  return `${periodPrefix} RANK FOR ${metric}`;
}

/** Mock joined teams — replace with API data later. Empty array = empty TEAMS state. */
export const MOCK_MY_TEAMS: MyTeam[] = [
  {
    id: "1",
    name: "BADR'S TEAM",
    avatarUri:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    selectedMetricId: "PRAYER_QIYAM",
    selectedPeriod: "today",
    displayRankLabel: buildDisplayRankLabel("PRAYER_QIYAM", "today"),
    rankPosition: 1,
    rankTotal: 2,
  },
  {
    id: "2",
    name: "LA FAMILA",
    avatarUri:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    selectedMetricId: "PRAYER_QIYAM",
    selectedPeriod: "today",
    displayRankLabel: buildDisplayRankLabel("PRAYER_QIYAM", "today"),
    rankPosition: 2,
    rankTotal: 8,
  },
  {
    id: "3",
    name: "MOM & I ❤️",
    avatarUri:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    selectedMetricId: "PRAYER_QIYAM",
    selectedPeriod: "today",
    displayRankLabel: buildDisplayRankLabel("PRAYER_QIYAM", "today"),
    rankPosition: 1,
    rankTotal: 2,
  },
  {
    id: "4",
    name: "SISTERS CIRCLE",
    avatarUri:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
    selectedMetricId: "PRAYER_MOSQUE",
    selectedPeriod: "week",
    displayRankLabel: buildDisplayRankLabel("PRAYER_MOSQUE", "week"),
    rankPosition: 3,
    rankTotal: 12,
  },
];

export const MY_TEAMS_INITIAL_VISIBLE = 3;

export function formatTeamRank(position: number, total: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const value = position % 100;
  const suffix =
    suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];
  return `${position}${suffix} of ${total}`;
}
