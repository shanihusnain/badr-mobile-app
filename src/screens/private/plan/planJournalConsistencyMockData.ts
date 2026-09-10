export type PlanJournalPeriodId = 1 | 2 | 3 | 4;

export type PlanJournalPeriod = {
  id: PlanJournalPeriodId;
  label: string;
  deltaLabel: string;
};

export type PlanJournalHabit = {
  id: number;
  name: string;
  percent: number;
};

export const PLAN_JOURNAL_HABIT_TITLES: Record<number, string> = {
  1: "Religious Habits",
  2: "Personal Growth",
  3: "Social Responsibility",
  4: "Home Bond",
};

export function getPlanJournalHabitTitleById(
  id: number | string | undefined,
): string {
  const habitId = typeof id === "string" ? Number(id) : id;

  if (!habitId || Number.isNaN(habitId)) {
    return "Journal Insight";
  }

  return PLAN_JOURNAL_HABIT_TITLES[habitId] ?? "Journal Insight";
}

export type PlanJournalConsistencySnapshot = {
  dateRangeLabel: string;
  consistencyPercent: number;
  previousPeriodDeltaPercent: number;
  journalingHabits?: PlanJournalHabit[];
};

export const PLAN_JOURNAL_PERIODS: PlanJournalPeriod[] = [
  { id: 1, label: "W", deltaLabel: "vs. last wk" },
  { id: 2, label: "M", deltaLabel: "vs. last mo" },
  { id: 3, label: "3M", deltaLabel: "vs. last 3 mo" },
  { id: 4, label: "6M", deltaLabel: "vs. last 6 mo" },
];

const PLAN_JOURNAL_CONSISTENCY_SNAPSHOTS: Record<
  PlanJournalPeriodId,
  PlanJournalConsistencySnapshot[]
> = {
  1: [
    {
      dateRangeLabel: "Jun 9 — Jun 15",
      consistencyPercent: 72,
      previousPeriodDeltaPercent: 8,
      journalingHabits: [
        {
          id: 1,
          name: "Religious Habits",
          percent: 72,
        },
        {
          id: 2,
          name: "Personal Growth",
          percent: 64,
        },
        {
          id: 3,
          name: "Social Responsibility",
          percent: 69,
        },
        {
          id: 4,
          name: "Home Bond",
          percent: 62,
        },
      ],
    },
    {
      dateRangeLabel: "Jun 2 — Jun 8",
      consistencyPercent: 64,
      previousPeriodDeltaPercent: -5,
      journalingHabits: [
        {
          id: 1,
          name: "Religious Habits",
          percent: 72,
        },
        {
          id: 2,
          name: "Personal Growth",
          percent: 64,
        },
        {
          id: 3,
          name: "Social Responsibility",
          percent: 69,
        },
        {
          id: 4,
          name: "Home Bond",
          percent: 62,
        },
      ],
    },
    {
      dateRangeLabel: "May 26 — Jun 1",
      consistencyPercent: 69,
      previousPeriodDeltaPercent: 12,
      journalingHabits: [
        {
          id: 1,
          name: "Religious Habits",
          percent: 72,
        },
        {
          id: 2,
          name: "Personal Growth",
          percent: 64,
        },
        {
          id: 3,
          name: "Social Responsibility",
          percent: 69,
        },
        {
          id: 4,
          name: "Home Bond",
          percent: 62,
        },
      ],
    },
  ],
  2: [
    {
      dateRangeLabel: "Jun 1 — Jun 30, 26",
      consistencyPercent: 68,
      previousPeriodDeltaPercent: 6,
      journalingHabits: [
        {
          id: 1,
          name: "Religious Habits",
          percent: 72,
        },
        {
          id: 2,
          name: "Personal Growth",
          percent: 64,
        },
        {
          id: 3,
          name: "Social Responsibility",
          percent: 69,
        },
        {
          id: 4,
          name: "Home Bond",
          percent: 62,
        },
      ],
    },
    {
      dateRangeLabel: "May 1 — May 31, 26",
      consistencyPercent: 62,
      previousPeriodDeltaPercent: -3,
      journalingHabits: [
        {
          id: 1,
          name: "Religious Habits",
          percent: 72,
        },
        {
          id: 2,
          name: "Personal Growth",
          percent: 64,
        },
        {
          id: 3,
          name: "Social Responsibility",
          percent: 69,
        },
        {
          id: 4,
          name: "Home Bond",
          percent: 62,
        },
      ],
    },
    {
      dateRangeLabel: "Apr 1 — Apr 30, 26",
      consistencyPercent: 65,
      previousPeriodDeltaPercent: 4,
      journalingHabits: [
        {
          id: 1,
          name: "Religious Habits",
          percent: 72,
        },
        {
          id: 2,
          name: "Personal Growth",
          percent: 64,
        },
        {
          id: 3,
          name: "Social Responsibility",
          percent: 69,
        },
        {
          id: 4,
          name: "Home Bond",
          percent: 62,
        },
      ],
    },
  ],
  3: [
    {
      dateRangeLabel: "Apr – Jun 2026",
      consistencyPercent: 71,
      previousPeriodDeltaPercent: 9,
      journalingHabits: [
        {
          id: 1,
          name: "Religious Habits",
          percent: 72,
        },
        {
          id: 2,
          name: "Personal Growth",
          percent: 64,
        },
        {
          id: 3,
          name: "Social Responsibility",
          percent: 69,
        },
        {
          id: 4,
          name: "Home Bond",
          percent: 62,
        },
      ],
    },
    {
      dateRangeLabel: "Jan – Mar 2026",
      consistencyPercent: 58,
      previousPeriodDeltaPercent: -7,
      journalingHabits: [
        {
          id: 1,
          name: "Religious Habits",
          percent: 72,
        },
        {
          id: 2,
          name: "Personal Growth",
          percent: 64,
        },
        {
          id: 3,
          name: "Social Responsibility",
          percent: 69,
        },
        {
          id: 4,
          name: "Home Bond",
          percent: 62,
        },
      ],
    },
    {
      dateRangeLabel: "Oct – Dec 2025",
      consistencyPercent: 63,
      previousPeriodDeltaPercent: 5,
      journalingHabits: [
        {
          id: 1,
          name: "Religious Habits",
          percent: 72,
        },
        {
          id: 2,
          name: "Personal Growth",
          percent: 64,
        },
        {
          id: 3,
          name: "Social Responsibility",
          percent: 69,
        },
        {
          id: 4,
          name: "Home Bond",
          percent: 62,
        },
      ],
    },
  ],
  4: [
    {
      dateRangeLabel: "Jan – Jun 2026",
      consistencyPercent: 66,
      previousPeriodDeltaPercent: 11,
      journalingHabits: [
        {
          id: 1,
          name: "Religious Habits",
          percent: 72,
        },
        {
          id: 2,
          name: "Personal Growth",
          percent: 64,
        },
        {
          id: 3,
          name: "Social Responsibility",
          percent: 69,
        },
        {
          id: 4,
          name: "Home Bond",
          percent: 62,
        },
      ],
    },
    {
      dateRangeLabel: "Jul – Dec 2025",
      consistencyPercent: 55,
      previousPeriodDeltaPercent: -4,
      journalingHabits: [
        {
          id: 1,
          name: "Religious Habits",
          percent: 72,
        },
        {
          id: 2,
          name: "Personal Growth",
          percent: 64,
        },
        {
          id: 3,
          name: "Social Responsibility",
          percent: 69,
        },
        {
          id: 4,
          name: "Home Bond",
          percent: 62,
        },
      ],
    },
    {
      dateRangeLabel: "Jan – Jun 2025",
      consistencyPercent: 59,
      previousPeriodDeltaPercent: 2,
      journalingHabits: [
        {
          id: 1,
          name: "Religious Habits",
          percent: 72,
        },
        {
          id: 2,
          name: "Personal Growth",
          percent: 64,
        },
        {
          id: 3,
          name: "Social Responsibility",
          percent: 69,
        },
        {
          id: 4,
          name: "Home Bond",
          percent: 62,
        },
      ],
    },
  ],
};

export function getPlanJournalConsistencySnapshots(
  periodId: PlanJournalPeriodId,
): PlanJournalConsistencySnapshot[] {
  return PLAN_JOURNAL_CONSISTENCY_SNAPSHOTS[periodId];
}

export function getPlanJournalConsistencySnapshot(
  periodId: PlanJournalPeriodId,
  index: number,
): PlanJournalConsistencySnapshot {
  const snapshots = getPlanJournalConsistencySnapshots(periodId);
  const safeIndex = Math.min(Math.max(index, 0), snapshots.length - 1);
  return snapshots[safeIndex];
}
