export type JournalingDayProgress = {
  id: string;
  day: string;
  date: string;
  loggedJournal: boolean;
  isToday?: boolean;
};

export const JournalingHistoryWeekDays: JournalingDayProgress[] = [
  {
    id: "1",
    day: "Sun",
    date: "2026-01-04",
    loggedJournal: true,
    isToday: false,
  },
  {
    id: "2",
    day: "Mon",
    date: "2026-01-05",
    loggedJournal: false,
    isToday: false,
  },
  {
    id: "3",
    day: "Tue",
    date: "2026-01-06",
    loggedJournal: true,
    isToday: false,
  },
  {
    id: "4",
    day: "Wed",
    date: "2026-01-07",
    loggedJournal: true,
    isToday: false,
  },
  {
    id: "5",
    day: "Thu",
    date: "2026-01-08",
    loggedJournal: false,
    isToday: false,
  },
  {
    id: "6",
    day: "Fri",
    date: "2026-01-09",
    loggedJournal: false,
    isToday: false,
  },
  {
    id: "7",
    day: "Sat",
    date: "2026-01-10",
    loggedJournal: true,
    isToday: true,
  },
];

/** @deprecated Use JournalingHistoryWeekDays */
export const JournalingHistory = JournalingHistoryWeekDays;
