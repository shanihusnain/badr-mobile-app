export type LeaderboardCategoryId =
  | "prayer"
  | "quran"
  | "fasting"
  | "sadaqah";

export type LeaderboardOption = {
  id: string;
  label: string;
};

export type LeaderboardCategory = {
  id: LeaderboardCategoryId;
  label: string;
  options: LeaderboardOption[];
};

export const LEADERBOARD_CATEGORIES: LeaderboardCategory[] = [
  {
    id: "prayer",
    label: "Prayer",
    options: [
      { id: "sunnah-rawatib", label: "SUNNAH RAWATIB PRAYERS" },
      { id: "wudhu", label: "WUDHU PRAYERS" },
      { id: "mosque", label: "PRAYERS AT THE MOSQUE" },
      { id: "duha", label: "DUHA PRAYERS" },
      { id: "qiyam", label: "QIYAM AL-LAYL PRAYERS" },
    ],
  },
  {
    id: "quran",
    label: "Quran",
    options: [
      { id: "juz-recited", label: "JUZ RECITED" },
      { id: "quran-completions", label: "QURAN COMPLETIONS" },
      { id: "surahs-memorized", label: "SURAHS MEMORIZED" },
      { id: "hizb-memorized", label: "HIZB MEMORIZED" },
      { id: "juz-memorized", label: "JUZ MEMORIZED" },
    ],
  },
  {
    id: "fasting",
    label: "Fasting",
    options: [
      { id: "missed-ramadan", label: "MISSED RAMADAN FASTS" },
      { id: "monday-thursday", label: "MONDAY & THURSDAY FASTS" },
      { id: "white-days", label: "WHITE DAY FASTS" },
      { id: "dawood", label: "DAWOOD FASTS" },
    ],
  },
  {
    id: "sadaqah",
    label: "Sadaqah",
    options: [
      { id: "missed-zakat", label: "MISSED ZAKAT" },
      { id: "sadaqah-parents", label: "SADAQAH FOR PARENTS" },
      { id: "volunteering", label: "VOLUNTEERING SERVICES" },
      { id: "water-well", label: "WATER WELL DONATIONS" },
      { id: "mosque-donations", label: "MOSQUE DONATIONS" },
    ],
  },
];

export const MAX_LEADERBOARDS_PER_CATEGORY = 2;

/** Default selections matching Figma mockups (up to 2 per category). */
export const DEFAULT_SELECTED_LEADERBOARDS: Record<
  LeaderboardCategoryId,
  string[]
> = {
  prayer: ["mosque", "qiyam"],
  quran: ["quran-completions", "surahs-memorized"],
  fasting: ["monday-thursday", "white-days"],
  sadaqah: ["missed-zakat", "sadaqah-parents"],
};
