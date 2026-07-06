export type JournalHabitOption = {
  id: number;
  title: string;
  description: string;
};

export const JOURNAL_HABITS_BY_CATEGORY: Record<string, JournalHabitOption[]> = {
  All: [
    {
      id: 1,
      title: "Staying in Wudhu",
      description:
        "Kept renewing your wudhu after breaking it to maintain a constant state of purity?",
    },
  ],
  "RELIGIOUS HABITS": [
    {
      id: 2,
      title: "Praying Five Times a Day",
      description:
        "Consistently prayed five times a day, even when traveling or busy?",
    },
  ],
  "PERSONAL GROWTH": [
    {
      id: 3,
      title: "Reading the Quran Daily",
      description: "Read the Quran daily, even if it's just a few verses?",
    },
  ],
  "FAMILY BONDS": [
    {
      id: 4,
      title: "Spending Time with Family",
      description:
        "Spent quality time with family, even if it's just a few hours?",
    },
  ],
  "SOCIAL RESPONSIBILITY": [
    {
      id: 5,
      title: "Volunteering",
      description: "Volunteered for a cause, even if it's just a few hours?",
    },
  ],
};

export type JournalHabitOptionWithStatus = JournalHabitOption & {
  isAdded: boolean;
};

export function getJournalHabitsForCategory(
  categoryTitle: string,
  addedHabitIds: number[],
): JournalHabitOptionWithStatus[] {
  const habits = JOURNAL_HABITS_BY_CATEGORY[categoryTitle] ?? [];

  return habits.map((habit) => ({
    ...habit,
    isAdded: addedHabitIds.includes(habit.id),
  }));
}
