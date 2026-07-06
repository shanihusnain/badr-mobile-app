import type { StudyMaterialItem } from "@/components/molecules/PastAchievementStudyMaterial";
import type { PlanJournalPeriodId } from "../plan/planJournalConsistencyMockData";
import { getPlanJournalConsistencySnapshots } from "../plan/planJournalConsistencyMockData";
import { getPeriodCountPercent } from "./journalInsightProgress";

export type JournalInsightDayStatus =
  | "completed"
  | "missed"
  | "partial"
  | "empty";

export type JournalInsightWeekDay = {
  label: string;
  date: string;
  status: JournalInsightDayStatus;
};

export type JournalInsightBehavior = {
  id: number;
  name: string;
  description: string;
  weekDays?: JournalInsightWeekDay[];
  periodCount?: number;
  periodPercent?: number;
};

export type JournalInsightSummary = {
  behaviorCount: number;
  headerTitle: string;
  description: string;
};

export type JournalInsightSnapshot = {
  dateRangeLabel: string;
  consistencyPercent: number;
  previousPeriodDeltaPercent: number;
  summary: JournalInsightSummary;
  behaviors: JournalInsightBehavior[];
  studyMaterial: StudyMaterialItem[];
};

type BehaviorTemplate = {
  id: number;
  name: string;
  description: string;
  weekPatterns: JournalInsightDayStatus[][];
  periodCounts: Record<PlanJournalPeriodId, number[]>;
};

type HabitInsightDefinition = {
  categoryLabel: string;
  studyMaterial: StudyMaterialItem[];
  behaviors: BehaviorTemplate[];
};

const WEEK_DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEK_DAY_DATES = ["4", "5", "6", "7", "8", "9", "10"];

const HABIT_INSIGHT_DEFINITIONS: Record<number, HabitInsightDefinition> = {
  1: {
    categoryLabel: "religious habits",
    studyMaterial: [
      {
        id: 1,
        thumbnail:
          "https://images.unsplash.com/photo-1564769662533-4f00a87b9756?w=400",
        type: "article",
        description:
          "Purity Unveiled: The Profound Impact of Staying in a State of Wudhu",
      },
      {
        id: 2,
        thumbnail:
          "https://images.unsplash.com/photo-1585036156171-3841649478f8?w=400",
        type: "podcast",
        description:
          "Waves of Purity: Exploring the Power of Constant wudhu in Daily Life",
      },
    ],
    behaviors: [
      {
        id: 1,
        name: "Wudhu & Dua Before Sleeping",
        description:
          "You performed wudhu before going to sleep on most nights this week.",
        weekPatterns: [
          ["empty", "empty", "empty", "empty", "empty", "completed", "completed"],
          ["empty", "empty", "completed", "completed", "completed", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
        ],
        periodCounts: { 1: [0, 0, 0], 2: [12, 10, 11], 3: [34, 30, 32], 4: [68, 62, 65] },
      },
      {
        id: 2,
        name: "Joining a Study Circle (Halaqah)",
        description:
          "You joined a study circle to learn and grow in your religious knowledge.",
        weekPatterns: [
          ["empty", "empty", "empty", "empty", "empty", "completed", "partial"],
          ["empty", "empty", "completed", "empty", "completed", "completed", "partial"],
          ["empty", "empty", "completed", "empty", "completed", "completed", "completed"],
        ],
        periodCounts: { 1: [0, 0, 0], 2: [8, 7, 9], 3: [22, 20, 24], 4: [44, 40, 46] },
      },
      {
        id: 3,
        name: "Learning Arabic",
        description:
          "You dedicated time to learning Arabic to better understand the Quran.",
        weekPatterns: [
          ["empty", "empty", "empty", "empty", "empty", "completed", "partial"],
          ["empty", "empty", "completed", "empty", "completed", "partial", "partial"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
        ],
        periodCounts: { 1: [0, 0, 0], 2: [10, 9, 11], 3: [28, 25, 30], 4: [56, 50, 58] },
      },
      {
        id: 4,
        name: "Learning Hadith & Sunnah",
        description:
          "You studied the sayings and practices of the Prophet (PBUH).",
        weekPatterns: [
          ["empty", "empty", "empty", "empty", "empty", "empty", "completed"],
          ["empty", "empty", "empty", "empty", "empty", "empty", "completed"],
          ["empty", "empty", "empty", "empty", "empty", "completed", "completed"],
        ],
        periodCounts: { 1: [0, 0, 0], 2: [6, 5, 7], 3: [18, 16, 20], 4: [36, 32, 38] },
      },
      {
        id: 5,
        name: "Staying in Wudhu",
        description:
          "You maintained a state of wudhu throughout your day whenever possible.",
        weekPatterns: [
          ["empty", "empty", "empty", "empty", "empty", "completed", "partial"],
          ["empty", "empty", "empty", "empty", "empty", "completed", "partial"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
        ],
        periodCounts: { 1: [0, 0, 0], 2: [14, 12, 13], 3: [40, 36, 38], 4: [78, 72, 75] },
      },
      {
        id: 6,
        name: "Studying Quranic Tafsir",
        description:
          "You studied the interpretation of the Quran to deepen your understanding.",
        weekPatterns: [
          ["empty", "empty", "empty", "empty", "empty", "completed", "completed"],
          ["empty", "empty", "empty", "empty", "empty", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
        ],
        periodCounts: { 1: [0, 0, 0], 2: [9, 8, 10], 3: [26, 24, 28], 4: [52, 48, 54] },
      },
    ],
  },
  2: {
    categoryLabel: "personal growth habits",
    studyMaterial: [
      {
        id: 1,
        thumbnail:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        type: "article",
        description: "Compassion: The Core of Humanity and Personal Growth",
      },
      {
        id: 2,
        thumbnail:
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
        type: "podcast",
        description: "Building Better Habits One Day at a Time",
      },
    ],
    behaviors: [
      {
        id: 1,
        name: "Practicing Moderation",
        description:
          "Your moderation in all your deeds is impressive and shows self-discipline.",
        weekPatterns: [
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "partial"],
          ["completed", "completed", "partial", "completed", "completed", "completed", "completed"],
        ],
        periodCounts: { 1: [0, 0, 0], 2: [18, 16, 17], 3: [52, 48, 50], 4: [102, 96, 99] },
      },
      {
        id: 2,
        name: "Observing Humility",
        description:
          "You showed humility in your interactions and avoided arrogance.",
        weekPatterns: [
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "partial", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
        ],
        periodCounts: { 1: [0, 0, 0], 2: [16, 14, 15], 3: [46, 42, 44], 4: [90, 84, 88] },
      },
      {
        id: 3,
        name: "Being Forgiving",
        description:
          "You forgave others and let go of resentment when faced with difficulty.",
        weekPatterns: [
          ["missed", "missed", "completed", "completed", "completed", "completed", "completed"],
          ["missed", "missed", "completed", "completed", "completed", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
        ],
        periodCounts: { 1: [0, 0, 0], 2: [12, 11, 13], 3: [34, 32, 36], 4: [68, 64, 70] },
      },
      {
        id: 4,
        name: "Reading the Quran Daily",
        description:
          "You read the Quran daily, even if it was just a few verses.",
        weekPatterns: [
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
          ["completed", "completed", "completed", "partial", "completed", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
        ],
        periodCounts: { 1: [0, 0, 0], 2: [20, 18, 19], 3: [58, 54, 56], 4: [114, 108, 112] },
      },
    ],
  },
  3: {
    categoryLabel: "social responsibility",
    studyMaterial: [
      {
        id: 1,
        thumbnail:
          "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400",
        type: "article",
        description: "The Role of Community Service in Building Strong Societies",
      },
      {
        id: 2,
        thumbnail:
          "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400",
        type: "podcast",
        description: "Giving Back: How Small Acts Create Lasting Impact",
      },
    ],
    behaviors: [
      {
        id: 1,
        name: "Reducing Food Waste",
        description:
          "You made conscious efforts to minimize food waste in your daily life.",
        weekPatterns: [
          ["completed", "completed", "partial", "completed", "completed", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "partial", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
        ],
        periodCounts: { 1: [0, 0, 0], 2: [21, 19, 20], 3: [58, 54, 56], 4: [112, 106, 110] },
      },
      {
        id: 2,
        name: "Support for Aspirations",
        description:
          "You supported others in pursuing their goals and aspirations.",
        weekPatterns: [
          ["completed", "partial", "completed", "completed", "completed", "completed", "completed"],
          ["completed", "completed", "completed", "partial", "completed", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
        ],
        periodCounts: { 1: [0, 0, 0], 2: [17, 15, 16], 3: [48, 44, 46], 4: [94, 88, 92] },
      },
      {
        id: 3,
        name: "Protecting the Environment",
        description:
          "You took steps to protect the environment as an act of stewardship.",
        weekPatterns: [
          ["completed", "completed", "completed", "partial", "completed", "completed", "completed"],
          ["completed", "completed", "partial", "completed", "completed", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
        ],
        periodCounts: { 1: [0, 0, 0], 2: [16, 14, 15], 3: [44, 40, 42], 4: [86, 80, 84] },
      },
      {
        id: 4,
        name: "Building Neighborly Bonds",
        description:
          "You showed kindness and consideration to your neighbors.",
        weekPatterns: [
          ["partial", "completed", "completed", "completed", "completed", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "partial", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
        ],
        periodCounts: { 1: [0, 0, 0], 2: [15, 13, 14], 3: [42, 38, 40], 4: [82, 76, 80] },
      },
      {
        id: 5,
        name: "Charitable Acts",
        description:
          "You engaged in charitable work and gave to those in need.",
        weekPatterns: [
          ["completed", "completed", "completed", "completed", "completed", "completed", "partial"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
        ],
        periodCounts: { 1: [0, 0, 0], 2: [17, 15, 16], 3: [48, 44, 46], 4: [94, 88, 92] },
      },
      {
        id: 6,
        name: "Showing Hospitality",
        description:
          "You welcomed guests and showed hospitality to visitors.",
        weekPatterns: [
          ["completed", "partial", "completed", "completed", "completed", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "partial", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
        ],
        periodCounts: { 1: [0, 0, 0], 2: [10, 9, 11], 3: [28, 26, 30], 4: [56, 52, 58] },
      },
      {
        id: 7,
        name: "Promoting Islamic Ethics",
        description:
          "You encouraged good behavior and Islamic ethics in your community.",
        weekPatterns: [
          ["completed", "completed", "partial", "completed", "completed", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "partial"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
        ],
        periodCounts: { 1: [0, 0, 0], 2: [8, 7, 9], 3: [22, 20, 24], 4: [44, 40, 46] },
      },
      {
        id: 8,
        name: "Kindness to Animals",
        description:
          "You fulfilled your trust as a caretaker by being kind to animals.",
        weekPatterns: [
          ["completed", "completed", "completed", "completed", "partial", "completed", "completed"],
          ["completed", "completed", "completed", "partial", "completed", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
        ],
        periodCounts: { 1: [0, 0, 0], 2: [8, 7, 9], 3: [22, 20, 24], 4: [44, 40, 46] },
      },
    ],
  },
  4: {
    categoryLabel: "family bonds",
    studyMaterial: [
      {
        id: 1,
        thumbnail:
          "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400",
        type: "article",
        description: "Strengthening Family Ties Through Daily Acts of Love",
      },
      {
        id: 2,
        thumbnail:
          "https://images.unsplash.com/photo-1609220138106-9e39ec31a8b9?w=400",
        type: "podcast",
        description: "Building a Home Filled with Mercy and Understanding",
      },
    ],
    behaviors: [
      {
        id: 1,
        name: "Honoring Parents",
        description:
          "You showed respect to your parents through kind words and actions.",
        weekPatterns: [
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
        ],
        periodCounts: { 1: [0, 0, 0], 2: [22, 20, 21], 3: [62, 58, 60], 4: [122, 116, 120] },
      },
      {
        id: 2,
        name: "Elderly Care",
        description:
          "You cared for elderly family members with patience and compassion.",
        weekPatterns: [
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "partial", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
        ],
        periodCounts: { 1: [0, 0, 0], 2: [18, 16, 17], 3: [50, 46, 48], 4: [98, 92, 96] },
      },
      {
        id: 3,
        name: "Financial Support",
        description:
          "You provided financial support to family members who needed it.",
        weekPatterns: [
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "partial"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
        ],
        periodCounts: { 1: [0, 0, 0], 2: [14, 12, 13], 3: [40, 36, 38], 4: [78, 72, 75] },
      },
      {
        id: 4,
        name: "Sibling Harmony",
        description:
          "You maintained harmony with your siblings and resolved conflicts peacefully.",
        weekPatterns: [
          ["missed", "missed", "missed", "completed", "completed", "completed", "completed"],
          ["missed", "missed", "completed", "completed", "completed", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
        ],
        periodCounts: { 1: [0, 0, 0], 2: [16, 14, 15], 3: [44, 40, 42], 4: [86, 80, 84] },
      },
      {
        id: 5,
        name: "Spending Quality Time",
        description:
          "You spent meaningful time with family members without distractions.",
        weekPatterns: [
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
        ],
        periodCounts: { 1: [0, 0, 0], 2: [20, 18, 19], 3: [56, 52, 54], 4: [110, 104, 108] },
      },
      {
        id: 6,
        name: "Expressing Gratitude",
        description:
          "You expressed gratitude to family members for their support and love.",
        weekPatterns: [
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "partial", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
        ],
        periodCounts: { 1: [0, 0, 0], 2: [17, 15, 16], 3: [48, 44, 46], 4: [94, 88, 92] },
      },
      {
        id: 7,
        name: "Helping with Chores",
        description:
          "You helped with household responsibilities to ease the burden on family.",
        weekPatterns: [
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
        ],
        periodCounts: { 1: [0, 0, 0], 2: [19, 17, 18], 3: [54, 50, 52], 4: [106, 100, 104] },
      },
      {
        id: 8,
        name: "Family Meals Together",
        description:
          "You shared meals with your family and engaged in meaningful conversation.",
        weekPatterns: [
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "partial"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
        ],
        periodCounts: { 1: [0, 0, 0], 2: [18, 16, 17], 3: [50, 46, 48], 4: [98, 92, 96] },
      },
      {
        id: 9,
        name: "Active Listening",
        description:
          "You listened attentively when family members shared their thoughts and feelings.",
        weekPatterns: [
          ["completed", "partial", "completed", "completed", "completed", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
        ],
        periodCounts: { 1: [0, 0, 0], 2: [15, 13, 14], 3: [42, 38, 40], 4: [82, 76, 80] },
      },
      {
        id: 10,
        name: "Weekly Family Check-in",
        description:
          "You checked in with family members about their well-being and needs.",
        weekPatterns: [
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
          ["completed", "completed", "completed", "completed", "completed", "completed", "completed"],
        ],
        periodCounts: { 1: [0, 0, 0], 2: [14, 12, 13], 3: [40, 36, 38], 4: [78, 72, 75] },
      },
    ],
  },
};

const JOURNAL_INSIGHT_CONSISTENCY: Record<
  number,
  Record<PlanJournalPeriodId, { percents: number[]; deltas: number[] }>
> = {
  1: {
    1: { percents: [50, 58, 55], deltas: [0, 8, -3] },
    2: { percents: [52, 48, 51], deltas: [6, -4, 3] },
    3: { percents: [54, 46, 50], deltas: [9, -5, 4] },
    4: { percents: [56, 48, 52], deltas: [11, -3, 4] },
  },
  2: {
    1: { percents: [71, 68, 65], deltas: [5, -3, 4] },
    2: { percents: [66, 62, 64], deltas: [4, -4, 2] },
    3: { percents: [64, 58, 61], deltas: [7, -5, 3] },
    4: { percents: [62, 56, 59], deltas: [8, -2, 3] },
  },
  3: {
    1: { percents: [62, 58, 55], deltas: [4, -4, -3] },
    2: { percents: [49, 45, 47], deltas: [-10, -4, 2] },
    3: { percents: [47, 42, 44], deltas: [-8, -5, 2] },
    4: { percents: [45, 40, 42], deltas: [-6, -5, 2] },
  },
  4: {
    1: { percents: [67, 65, 62], deltas: [5, -2, -3] },
    2: { percents: [64, 60, 62], deltas: [4, -4, 2] },
    3: { percents: [62, 56, 59], deltas: [6, -6, 3] },
    4: { percents: [60, 54, 57], deltas: [7, -6, 3] },
  },
};

function normalizeHabitId(id: number | string | undefined): number {
  const habitId = typeof id === "string" ? Number(id) : id;

  if (!habitId || Number.isNaN(habitId)) {
    return 1;
  }

  return habitId;
}

function buildWeekDays(pattern: JournalInsightDayStatus[]): JournalInsightWeekDay[] {
  return pattern.map((status, index) => ({
    label: WEEK_DAY_LABELS[index],
    date: WEEK_DAY_DATES[index],
    status,
  }));
}

function getWeeklyHeaderTitle(percent: number): string {
  if (percent >= 70) return "Steady Progress This Week";
  if (percent >= 65) return "Very Good Weekly Progress";
  return "A Week of Small but Steady Steps";
}

function getPeriodHeaderTitle(periodId: PlanJournalPeriodId, percent: number): string {
  switch (periodId) {
    case 2:
      return percent >= 50
        ? "Strong Commitment This Month"
        : "Room to Grow This Month";
    case 3:
      return percent >= 50
        ? "Solid Progress This Quarter"
        : "Building Momentum This Quarter";
    case 4:
      return percent >= 50
        ? "Meaningful Progress This Cycle"
        : "A Foundation for Growth";
    default:
      return getWeeklyHeaderTitle(percent);
  }
}

function buildSummaryDescription(
  periodId: PlanJournalPeriodId,
  categoryLabel: string,
  behaviorCount: number,
  percent: number,
  delta: number,
): string {
  const comparison =
    delta >= 0 ? "above" : "below";

  switch (periodId) {
    case 1:
      return `Over the last 7 days, your consistency across ${behaviorCount} ${categoryLabel} is ${percent}%, which is ${comparison} the week before.`;
    case 2:
      return `Over the last month, your consistency across ${behaviorCount} ${categoryLabel} is ${percent}%, which is ${comparison} your previous 28-day consistency.`;
    case 3:
      return `Over the last 3 months, your consistency across ${behaviorCount} ${categoryLabel} is ${percent}%, which is ${comparison} your previous 3-month period.`;
    case 4:
      return `Over the last 6 months, your consistency across ${behaviorCount} ${categoryLabel} is ${percent}%, which is ${comparison} your previous 6-month period.`;
    default:
      return `Your consistency across ${behaviorCount} ${categoryLabel} is ${percent}%.`;
  }
}

function buildSummary(
  periodId: PlanJournalPeriodId,
  categoryLabel: string,
  behaviorCount: number,
  percent: number,
  delta: number,
): JournalInsightSummary {
  return {
    behaviorCount,
    headerTitle:
      periodId === 1
        ? getWeeklyHeaderTitle(percent)
        : getPeriodHeaderTitle(periodId, percent),
    description: buildSummaryDescription(
      periodId,
      categoryLabel,
      behaviorCount,
      percent,
      delta,
    ),
  };
}

function buildBehaviors(
  definition: HabitInsightDefinition,
  periodId: PlanJournalPeriodId,
  snapshotIndex: number,
): JournalInsightBehavior[] {
  return definition.behaviors.map((behavior) => {
    const weekPattern =
      behavior.weekPatterns[snapshotIndex] ??
      behavior.weekPatterns[behavior.weekPatterns.length - 1];
    const periodCount =
      behavior.periodCounts[periodId][snapshotIndex] ??
      behavior.periodCounts[periodId][behavior.periodCounts[periodId].length - 1];

    if (periodId === 1) {
      return {
        id: behavior.id,
        name: behavior.name,
        description: behavior.description,
        weekDays: buildWeekDays(weekPattern),
      };
    }

    return {
      id: behavior.id,
      name: behavior.name,
      description: behavior.description,
      periodCount,
      periodPercent: getPeriodCountPercent(periodCount, periodId),
    };
  });
}

export function getJournalInsightSnapshots(
  habitId: number | string,
  periodId: PlanJournalPeriodId,
): JournalInsightSnapshot[] {
  const resolvedHabitId = normalizeHabitId(habitId);
  const definition =
    HABIT_INSIGHT_DEFINITIONS[resolvedHabitId] ?? HABIT_INSIGHT_DEFINITIONS[1];
  const overallSnapshots = getPlanJournalConsistencySnapshots(periodId);
  const insightConfig = JOURNAL_INSIGHT_CONSISTENCY[resolvedHabitId]?.[periodId];
  const behaviorCount = definition.behaviors.length;

  return overallSnapshots.map((snapshot, index) => {
    const consistencyPercent =
      insightConfig?.percents[index] ?? snapshot.consistencyPercent;
    const previousPeriodDeltaPercent = insightConfig?.deltas[index] ?? 0;

    return {
      dateRangeLabel: snapshot.dateRangeLabel,
      consistencyPercent,
      previousPeriodDeltaPercent,
      summary: buildSummary(
        periodId,
        definition.categoryLabel,
        behaviorCount,
        consistencyPercent,
        previousPeriodDeltaPercent,
      ),
      behaviors: buildBehaviors(definition, periodId, index),
      studyMaterial: definition.studyMaterial,
    };
  });
}

export function getJournalInsightSnapshot(
  habitId: number | string,
  periodId: PlanJournalPeriodId,
  index: number,
): JournalInsightSnapshot {
  const snapshots = getJournalInsightSnapshots(habitId, periodId);
  const safeIndex = Math.min(Math.max(index, 0), snapshots.length - 1);

  return snapshots[safeIndex];
}
