import { DISPLAY_RANK_METRICS } from "@/src/screens/connecttab/connecthome/myTeamsMockData";
import {
  CURRENT_USER,
  EXTRA_TEAM_MEMBERS,
  type TeamMember,
} from "./mockData";

export type RankPeriod = "daily" | "week" | "monthly";

export const RANK_PERIODS: { id: RankPeriod; label: string }[] = [
  { id: "daily", label: "DAILY" },
  { id: "week", label: "MON - SUN" },
  { id: "monthly", label: "MONTHLY" },
];

export const RANK_METRICS = DISPLAY_RANK_METRICS;

export type RankLeaderboardEntry = TeamMember & {
  score: number;
};

type RankSnapshot = {
  totalLabel: string;
  periodLabel: string;
  lastUpdated: string;
  entries: RankLeaderboardEntry[];
};

const RANK_MEMBERS: TeamMember[] = [CURRENT_USER, ...EXTRA_TEAM_MEMBERS];

function withScores(
  scores: Record<string, number>,
): RankLeaderboardEntry[] {
  return RANK_MEMBERS.map((member) => ({
    ...member,
    isAdmin: false,
    score: scores[member.id] ?? 0,
  })).sort((a, b) => b.score - a.score);
}

/** Mock leaderboard data keyed by metric + period. */
export const RANK_SNAPSHOTS: Record<
  string,
  Partial<Record<RankPeriod, RankSnapshot>>
> = {
  mosque: {
    daily: {
      totalLabel: "6 total",
      periodLabel: "TODAY",
      lastUpdated: "Last Updated: 2:03 pm",
      entries: withScores({ me: 0, "2": 4, "3": 2 }),
    },
  },
  "white-days": {
    week: {
      totalLabel: "3 total",
      periodLabel: "TODAY",
      lastUpdated: "Last Updated: 2:03 pm",
      entries: withScores({ me: 1, "2": 2, "3": 0 }),
    },
  },
  "quran-completions": {
    monthly: {
      totalLabel: "8.1 total",
      periodLabel: "TODAY",
      lastUpdated: "Last Updated: 2:03 pm",
      entries: withScores({ me: 4.2, "2": 2.4, "3": 1.5 }),
    },
  },
};

export function getRankSnapshot(
  metricId: string,
  period: RankPeriod,
): RankSnapshot {
  const byMetric = RANK_SNAPSHOTS[metricId];
  const exact = byMetric?.[period];
  if (exact) return exact;

  const fallback =
    byMetric?.daily ??
    byMetric?.week ??
    byMetric?.monthly ??
    RANK_SNAPSHOTS.mosque.daily!;

  return {
    ...fallback,
    entries: withScores({
      me: fallback.entries.find((e) => e.id === "me")?.score ?? 0,
      "2": fallback.entries.find((e) => e.id === "2")?.score ?? 0,
      "3": fallback.entries.find((e) => e.id === "3")?.score ?? 0,
    }),
  };
}

export function formatRankScore(score: number): string {
  return Number.isInteger(score) ? String(score) : score.toFixed(1);
}

export type TeamChatMessage = {
  id: string;
  memberId: string;
  text: string;
  time: string;
  isMine: boolean;
};

export const MOCK_TEAM_CHAT: TeamChatMessage[] = [
  {
    id: "1",
    memberId: "2",
    text: "Assalamu alaikum everyone! Ready for white day fasts this week?",
    time: "2:01 pm",
    isMine: false,
  },
  {
    id: "2",
    memberId: "me",
    text: "Wa alaikum assalam — I'm in. Let's keep each other accountable.",
    time: "2:03 pm",
    isMine: true,
  },
  {
    id: "3",
    memberId: "3",
    text: "Same here. Just logged today's prayers at the mosque.",
    time: "2:05 pm",
    isMine: false,
  },
];
