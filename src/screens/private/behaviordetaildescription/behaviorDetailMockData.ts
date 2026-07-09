import type { ImageSourcePropType } from "react-native";
import { BeforeJournalCustomization } from "@/assets/images";
import type { PlanJournalPeriodId } from "../plan/planJournalConsistencyMockData";
import {
  getPlanJournalConsistencySnapshots,
  type PlanJournalConsistencySnapshot,
} from "../plan/planJournalConsistencyMockData";
import type { JournalInsightDayStatus } from "../journalinsight/journalInsightMockData";
import {
  findBehaviorTemplate,
  getBehaviorConsistencyPercent,
} from "../journalinsight/journalInsightMockData";

export type BehaviorDetailWeekDay = {
  label: string;
  date: string;
  status: JournalInsightDayStatus;
};

export type BehaviorDetailStreak = {
  count: number;
  dateLabel: string;
  progressPercent?: number;
};

export type BehaviorDetailChartBar = {
  label: string;
  value: number;
};

export type BehaviorDetailQuote = {
  text: string;
  source: string;
};

export type BehaviorDetailRecommendation = {
  text: string;
};

export type BehaviorDetailPeriodView = {
  summaryDescription: string;
  periodCount?: number;
  weekDays?: BehaviorDetailWeekDay[];
  chartBars?: BehaviorDetailChartBar[];
  chartYMax?: number;
  currentStreak: BehaviorDetailStreak;
  longestStreak: BehaviorDetailStreak;
};

export type BehaviorDetailContent = {
  heroImage: ImageSourcePropType;
  impactTitle: string;
  impactBody: string;
  impactQuote?: BehaviorDetailQuote;
  recommendationsTitle: string;
  recommendationsIntro: string;
  recommendations: BehaviorDetailRecommendation[];
  recommendationsQuote?: BehaviorDetailQuote;
  recommendationsClosing?: string;
  snapshotsByPeriod: Partial<
    Record<PlanJournalPeriodId, PlanJournalConsistencySnapshot[]>
  >;
  periodViews: Partial<
    Record<PlanJournalPeriodId, BehaviorDetailPeriodView[]>
  >;
};

const EXPRESSING_GRATITUDE_WEEKLY: BehaviorDetailPeriodView = {
  summaryDescription:
    "Over the last 7 days, you completed this behavior on 2 out of 7 days, which is 22% below the week before. Allah says in the Quran:",
  weekDays: [
    { label: "Fri", date: "20", status: "empty" },
    { label: "Sat", date: "21", status: "completed" },
    { label: "Sun", date: "22", status: "empty" },
    { label: "Mon", date: "23", status: "empty" },
    { label: "Tue", date: "24", status: "empty" },
    { label: "Wed", date: "25", status: "empty" },
    { label: "Thu", date: "26", status: "completed" },
  ],
  currentStreak: { count: 1, dateLabel: "Dec 26", progressPercent: 100 },
  longestStreak: { count: 1, dateLabel: "Dec 26", progressPercent: 100 },
};

const PROTECTING_ENVIRONMENT_MONTHLY: BehaviorDetailPeriodView = {
  summaryDescription:
    "Your consistency in the last month is 57%, which is below your previous 28-day consistency.",
  periodCount: 16,
  chartBars: [
    { label: "29 Nov - 5 Dec", value: 3 },
    { label: "6 - 12 Dec", value: 5 },
    { label: "13 - 19 Dec", value: 6 },
    { label: "20 - 26 Dec", value: 8 },
  ],
  chartYMax: 8,
  currentStreak: { count: 0, dateLabel: "Dec 26", progressPercent: 0 },
  longestStreak: {
    count: 4,
    dateLabel: "Dec 21 — Dec 24",
    progressPercent: 100,
  },
};

const PROTECTING_ENVIRONMENT_3M: BehaviorDetailPeriodView = {
  summaryDescription:
    "Your consistency over the last 3 months is 44%, which is below your previous 3-month period.",
  periodCount: 44,
  chartBars: [
    { label: "Oct", value: 10 },
    { label: "Nov", value: 14 },
    { label: "Dec", value: 20 },
  ],
  chartYMax: 24,
  currentStreak: { count: 0, dateLabel: "Dec 26", progressPercent: 0 },
  longestStreak: {
    count: 4,
    dateLabel: "Dec 21 — Dec 24",
    progressPercent: 100,
  },
};

const PROTECTING_ENVIRONMENT_6M: BehaviorDetailPeriodView = {
  summaryDescription:
    "Your consistency over the last 6 months is 42%, which is below your previous 6-month period.",
  periodCount: 86,
  chartBars: [
    { label: "Jul", value: 12 },
    { label: "Aug", value: 14 },
    { label: "Sep", value: 16 },
    { label: "Oct", value: 18 },
    { label: "Nov", value: 20 },
    { label: "Dec", value: 22 },
  ],
  chartYMax: 28,
  currentStreak: { count: 0, dateLabel: "Dec 26", progressPercent: 0 },
  longestStreak: {
    count: 4,
    dateLabel: "Dec 21 — Dec 24",
    progressPercent: 100,
  },
};

const EXPRESSING_GRATITUDE_DETAIL: BehaviorDetailContent = {
  heroImage: BeforeJournalCustomization,
  impactTitle: "Impact of Expressing Gratitude",
  impactBody:
    "Expressing gratitude to family members strengthens bonds, increases mutual love, and fosters a positive home environment. It reminds us of Allah's blessings and encourages us to acknowledge the efforts of those around us.",
  impactQuote: {
    text: '"If you are grateful, I will surely increase you [in favor]."',
    source: "Quran 14:7",
  },
  recommendationsTitle: "Recommendations",
  recommendationsIntro:
    "Here are some ways to express gratitude to your family members:",
  recommendations: [
    {
      text: "Say 'JazakAllah Khair' or 'Thank you' sincerely when someone helps you or does something kind.",
    },
    {
      text: "Write a short note or message expressing your appreciation for a specific act of kindness.",
    },
    {
      text: "Verbally acknowledge the efforts of family members during meals or family gatherings.",
    },
    {
      text: "Make dua for your family members, asking Allah to bless them for their support and love.",
    },
    {
      text: "Perform a small act of kindness in return, such as helping with chores or preparing a meal.",
    },
  ],
  recommendationsQuote: {
    text: '"He who does not thank people, does not thank Allah."',
    source: "Hadith — Tirmidhi",
  },
  recommendationsClosing:
    "By consistently expressing gratitude, you not only strengthen your family ties but also earn Allah's pleasure and increase the blessings in your life.",
  snapshotsByPeriod: {
    1: [
      {
        dateRangeLabel: "20 — 26 Dec, 25",
        consistencyPercent: 29,
        previousPeriodDeltaPercent: -22,
      },
      {
        dateRangeLabel: "13 — 19 Dec, 25",
        consistencyPercent: 51,
        previousPeriodDeltaPercent: 8,
      },
      {
        dateRangeLabel: "6 — 12 Dec, 25",
        consistencyPercent: 43,
        previousPeriodDeltaPercent: -5,
      },
    ],
  },
  periodViews: {
    1: [EXPRESSING_GRATITUDE_WEEKLY],
  },
};

const PROTECTING_ENVIRONMENT_DETAIL: BehaviorDetailContent = {
  heroImage: BeforeJournalCustomization,
  impactTitle: "Impact of Protecting the Environment",
  impactBody:
    "Protecting the environment is an act of stewardship (khilafah) over Allah's creation. Small consistent actions reduce harm, preserve resources, and reflect gratitude for the world we have been entrusted with.",
  impactQuote: {
    text: '"And do not commit abuse on the earth, spreading corruption."',
    source: "Quran 2:60",
  },
  recommendationsTitle: "Recommendations",
  recommendationsIntro:
    "Here are practical ways to protect the environment in daily life:",
  recommendations: [
    { text: "Reduce waste by reusing bags, bottles, and containers when possible." },
    { text: "Conserve water and electricity in your home and workplace." },
    { text: "Choose sustainable options when shopping and disposing of items." },
    { text: "Keep shared spaces clean and encourage others to do the same." },
    { text: "Plant or care for greenery when you have the opportunity." },
  ],
  recommendationsQuote: {
    text: '"The world is green and beautiful, and Allah has appointed you as His stewards over it."',
    source: "Hadith — Muslim",
  },
  recommendationsClosing:
    "Consistent care for the environment is a form of worship when done with the intention of fulfilling our duty as stewards of Allah's creation.",
  snapshotsByPeriod: {
    2: [
      {
        dateRangeLabel: "Nov 29 — Dec 26, 25",
        consistencyPercent: 57,
        previousPeriodDeltaPercent: -20,
      },
    ],
    3: [
      {
        dateRangeLabel: "Oct — Dec, 25",
        consistencyPercent: 44,
        previousPeriodDeltaPercent: -8,
      },
    ],
    4: [
      {
        dateRangeLabel: "Jul — Dec, 25",
        consistencyPercent: 42,
        previousPeriodDeltaPercent: -6,
      },
    ],
  },
  periodViews: {
    2: [PROTECTING_ENVIRONMENT_MONTHLY],
    3: [PROTECTING_ENVIRONMENT_3M],
    4: [PROTECTING_ENVIRONMENT_6M],
  },
};

const BEHAVIOR_DETAIL_CONTENT: Record<string, BehaviorDetailContent> = {
  "Expressing Gratitude": EXPRESSING_GRATITUDE_DETAIL,
  "Protecting the Environment": PROTECTING_ENVIRONMENT_DETAIL,
};

function buildFallbackWeekDays(
  pattern: JournalInsightDayStatus[],
): BehaviorDetailWeekDay[] {
  const labels = ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"];
  const dates = ["20", "21", "22", "23", "24", "25", "26"];

  return labels.map((label, index) => ({
    label,
    date: dates[index],
    status: pattern[index] ?? "empty",
  }));
}

function buildFallbackChartBars(
  periodId: PlanJournalPeriodId,
  periodCount: number,
): BehaviorDetailChartBar[] {
  if (periodId === 2) {
    const quarter = Math.max(1, Math.round(periodCount / 4));
    return [
      { label: "29 Nov - 5 Dec", value: quarter },
      { label: "6 - 12 Dec", value: quarter + 1 },
      { label: "13 - 19 Dec", value: quarter + 2 },
      { label: "20 - 26 Dec", value: quarter + 3 },
    ];
  }

  if (periodId === 3) {
    const third = Math.max(1, Math.round(periodCount / 3));
    return [
      { label: "Oct", value: third },
      { label: "Nov", value: third + 2 },
      { label: "Dec", value: third + 4 },
    ];
  }

  const sixth = Math.max(1, Math.round(periodCount / 6));
  return [
    { label: "Jul", value: sixth },
    { label: "Aug", value: sixth + 1 },
    { label: "Sep", value: sixth + 2 },
    { label: "Oct", value: sixth + 3 },
    { label: "Nov", value: sixth + 4 },
    { label: "Dec", value: sixth + 5 },
  ];
}

function getChartYMax(bars: BehaviorDetailChartBar[]): number {
  const maxValue = Math.max(...bars.map((bar) => bar.value), 1);
  if (maxValue <= 8) return 8;
  if (maxValue <= 24) return 24;
  return Math.ceil(maxValue / 4) * 4;
}

function buildFallbackPeriodView(
  behaviorName: string,
  periodId: PlanJournalPeriodId,
  snapshotIndex: number,
  snapshot?: PlanJournalConsistencySnapshot,
): BehaviorDetailPeriodView {
  const behavior = findBehaviorTemplate(behaviorName);
  const weekPattern =
    behavior?.weekPatterns[snapshotIndex] ??
    behavior?.weekPatterns[behavior.weekPatterns.length - 1] ??
    Array(7).fill("empty");
  const periodCount =
    behavior?.periodCounts[periodId][snapshotIndex] ??
    behavior?.periodCounts[periodId][behavior.periodCounts[periodId].length - 1] ??
    0;
  const consistencyPercent = snapshot?.consistencyPercent ?? 0;
  const delta = snapshot?.previousPeriodDeltaPercent ?? 0;
  const comparison = delta >= 0 ? "above" : "below";

  if (periodId === 1) {
    return {
      summaryDescription: behavior
        ? `Over the last 7 days, your consistency for ${behaviorName.toLowerCase()} is ${consistencyPercent}%, which is ${comparison} the week before.`
        : `Track your weekly consistency for ${behaviorName.toLowerCase()}.`,
      weekDays: buildFallbackWeekDays(weekPattern as JournalInsightDayStatus[]),
      currentStreak: { count: 1, dateLabel: "Dec 26", progressPercent: 100 },
      longestStreak: { count: 1, dateLabel: "Dec 26", progressPercent: 100 },
    };
  }

  const chartBars = buildFallbackChartBars(periodId, periodCount);

  return {
    summaryDescription:
      periodId === 2
        ? `Your consistency in the last month is ${consistencyPercent}%, which is ${comparison} your previous 28-day consistency.`
        : periodId === 3
          ? `Your consistency over the last 3 months is ${consistencyPercent}%, which is ${comparison} your previous 3-month period.`
          : `Your consistency over the last 6 months is ${consistencyPercent}%, which is ${comparison} your previous 6-month period.`,
    periodCount,
    chartBars,
    chartYMax: getChartYMax(chartBars),
    currentStreak: { count: 0, dateLabel: "Dec 26", progressPercent: 0 },
    longestStreak: {
      count: 4,
      dateLabel: "Dec 21 — Dec 24",
      progressPercent: 100,
    },
  };
}

function buildFallbackContent(behaviorName: string): BehaviorDetailContent {
  const behavior = findBehaviorTemplate(behaviorName);

  return {
    heroImage: BeforeJournalCustomization,
    impactTitle: `Impact of ${behaviorName}`,
    impactBody:
      behavior?.description ??
      `Building the habit of ${behaviorName.toLowerCase()} supports your personal growth and strengthens your character.`,
    recommendationsTitle: "Recommendations",
    recommendationsIntro: `Here are some ways to improve at ${behaviorName.toLowerCase()}:`,
    recommendations: [
      {
        text: "Set a daily reminder to practice this behavior at a consistent time.",
      },
      {
        text: "Reflect on the benefits and intention behind this habit before you begin.",
      },
      {
        text: "Start small and build consistency before increasing the difficulty.",
      },
    ],
    snapshotsByPeriod: {},
    periodViews: {},
  };
}

export function getBehaviorDetailContent(
  behaviorName: string,
): BehaviorDetailContent {
  return (
    BEHAVIOR_DETAIL_CONTENT[behaviorName] ?? buildFallbackContent(behaviorName)
  );
}

export function getBehaviorDetailPeriodView(
  behaviorName: string,
  periodId: PlanJournalPeriodId,
  snapshotIndex: number,
  snapshot?: PlanJournalConsistencySnapshot,
): BehaviorDetailPeriodView {
  const detail = getBehaviorDetailContent(behaviorName);
  const customViews = detail.periodViews[periodId];

  if (customViews?.[snapshotIndex]) {
    return customViews[snapshotIndex];
  }

  if (customViews?.[0] && snapshotIndex >= customViews.length) {
    return customViews[0];
  }

  return buildFallbackPeriodView(
    behaviorName,
    periodId,
    snapshotIndex,
    snapshot,
  );
}

export function getBehaviorDetailSnapshots(
  behaviorName: string,
  periodId: PlanJournalPeriodId,
): PlanJournalConsistencySnapshot[] {
  const detail = getBehaviorDetailContent(behaviorName);
  const customSnapshots = detail.snapshotsByPeriod[periodId];

  if (customSnapshots?.length) {
    return customSnapshots;
  }

  const behavior = findBehaviorTemplate(behaviorName);
  const overallSnapshots = getPlanJournalConsistencySnapshots(periodId);

  return overallSnapshots.map((snapshot, index) => {
    const consistencyPercent = behavior
      ? getBehaviorConsistencyPercent(behavior, periodId, index)
      : 0;

    const previousIndex = index + 1;
    const previousPercent =
      behavior && previousIndex < overallSnapshots.length
        ? getBehaviorConsistencyPercent(behavior, periodId, previousIndex)
        : consistencyPercent;

    return {
      dateRangeLabel: snapshot.dateRangeLabel,
      consistencyPercent,
      previousPeriodDeltaPercent: consistencyPercent - previousPercent,
    };
  });
}

export const BEHAVIOR_DETAIL_PERIOD_LABELS: Record<PlanJournalPeriodId, string> =
  {
    1: "1W",
    2: "1M",
    3: "3M",
    4: "6M",
  };

export const BEHAVIOR_DETAIL_DELTA_LABELS: Record<PlanJournalPeriodId, string> =
  {
    1: "past week",
    2: "past month",
    3: "past 3 months",
    4: "past 6 months",
  };
