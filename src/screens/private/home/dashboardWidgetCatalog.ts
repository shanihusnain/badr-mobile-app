import {
  DashboardCategoryType,
  type DashboardApiTab,
} from "@/src/api/queries/useGetDataForDashboardCustomisation";

export type DashboardWidgetCategory =
  | typeof DashboardCategoryType.PRAYER
  | typeof DashboardCategoryType.QURAN
  | typeof DashboardCategoryType.FASTING
  | typeof DashboardCategoryType.SADAQAH;

export type DashboardWidgetCatalogEntry = {
  key: string;
  category: DashboardWidgetCategory;
  name: string;
};

/** Goal widgets that can be POST/DELETE'd. Excludes FASTING_CALENDAR and TIME_SPENT. */
export const DASHBOARD_WIDGET_CATALOG: DashboardWidgetCatalogEntry[] = [
  // Prayer
  {
    key: "FIVE_DAILY_PRAYERS",
    category: DashboardCategoryType.PRAYER,
    name: "The 5 Daily Prayers",
  },
  {
    key: "SUNNAH_RAWATIB",
    category: DashboardCategoryType.PRAYER,
    name: "Sunnah Rawatib",
  },
  {
    key: "TAHIYYAT_AL_WUDHU",
    category: DashboardCategoryType.PRAYER,
    name: "Tahiyyat Al-Wudhu",
  },
  {
    key: "TAHIYYAT_AL_MASJID",
    category: DashboardCategoryType.PRAYER,
    name: "Tahiyyat Al-Masjid",
  },
  {
    key: "MISSED_PAST_PRAYERS",
    category: DashboardCategoryType.PRAYER,
    name: "Missed Past Prayers",
  },
  { key: "DUHA", category: DashboardCategoryType.PRAYER, name: "Duha Prayer" },
  {
    key: "TAWBAH",
    category: DashboardCategoryType.PRAYER,
    name: "Tawbah Prayer",
  },
  {
    key: "ISTIKHARA",
    category: DashboardCategoryType.PRAYER,
    name: "Istikhara Prayer",
  },
  {
    key: "SHUKR",
    category: DashboardCategoryType.PRAYER,
    name: "Shukr Prayer",
  },
  {
    key: "QIYAM_AL_LAYL",
    category: DashboardCategoryType.PRAYER,
    name: "Qiyam Al-Layl",
  },

  // Quran
  {
    key: "LISTENING",
    category: DashboardCategoryType.QURAN,
    name: "Quran Listening",
  },
  {
    key: "RECITATION_SURAH",
    category: DashboardCategoryType.QURAN,
    name: "Quran Recitation (Surah)",
  },
  {
    key: "RECITATION_JUZ",
    category: DashboardCategoryType.QURAN,
    name: "Quran Recitation (Juz)",
  },
  {
    key: "RECITATION_COMPLETION",
    category: DashboardCategoryType.QURAN,
    name: "Quran Recitation Completion",
  },
  {
    key: "MEMORIZATION_SURAH",
    category: DashboardCategoryType.QURAN,
    name: "Quran Memorization (Surah)",
  },
  {
    key: "MEMORIZATION_JUZ",
    category: DashboardCategoryType.QURAN,
    name: "Quran Memorization (Juz)",
  },
  {
    key: "MEMORIZATION_HIZB",
    category: DashboardCategoryType.QURAN,
    name: "Quran Memorization (Hizb)",
  },
  {
    key: "TAJWEED",
    category: DashboardCategoryType.QURAN,
    name: "Quran Tajweed",
  },

  // Fasting (goal widgets only)
  {
    key: "MISSED_RAMADAN",
    category: DashboardCategoryType.FASTING,
    name: "Missed Ramadan Fasts",
  },
  {
    key: "PROPHET_DAWOOD",
    category: DashboardCategoryType.FASTING,
    name: "Prophet Dawood Fast",
  },
  {
    key: "MONDAY_THURSDAY",
    category: DashboardCategoryType.FASTING,
    name: "Monday & Thursday Fasts",
  },
  {
    key: "WHITE_DAYS",
    category: DashboardCategoryType.FASTING,
    name: "White Day Fasts",
  },

  // Sadaqah
  {
    key: "MISSED_ZAKAT",
    category: DashboardCategoryType.SADAQAH,
    name: "Missed Zakat",
  },
  {
    key: "KAFFARAH",
    category: DashboardCategoryType.SADAQAH,
    name: "Kaffarah for Fasts & Oaths",
  },
  { key: "FIDYA", category: DashboardCategoryType.SADAQAH, name: "Fidya" },
  {
    key: "LILLAH",
    category: DashboardCategoryType.SADAQAH,
    name: "Lillah Donations",
  },
  {
    key: "SADAQAH_JARIYAH",
    category: DashboardCategoryType.SADAQAH,
    name: "Sadaqah Jariyah",
  },
  {
    key: "VOLUNTEERING",
    category: DashboardCategoryType.SADAQAH,
    name: "Volunteering Services",
  },
  {
    key: "SADAQAH_PARENTS",
    category: DashboardCategoryType.SADAQAH,
    name: "Sadaqah for Parents",
  },
];

const CATALOG_KEY_SET = new Set(
  DASHBOARD_WIDGET_CATALOG.map((entry) => entry.key),
);

export function isCustomizableDashboardWidgetKey(key: string): boolean {
  return CATALOG_KEY_SET.has(
    String(key ?? "")
      .trim()
      .toUpperCase(),
  );
}

export function getDashboardWidgetCatalogEntry(
  key: string,
): DashboardWidgetCatalogEntry | undefined {
  const normalized = String(key ?? "")
    .trim()
    .toUpperCase();
  return DASHBOARD_WIDGET_CATALOG.find((entry) => entry.key === normalized);
}

export function filterCatalogByTab(
  tab: DashboardApiTab | string,
): DashboardWidgetCatalogEntry[] {
  const normalized = String(tab ?? "ALL")
    .trim()
    .toUpperCase();
  if (normalized === DashboardCategoryType.ALL || !normalized) {
    return DASHBOARD_WIDGET_CATALOG;
  }
  return DASHBOARD_WIDGET_CATALOG.filter(
    (entry) => entry.category === normalized,
  );
}

export const DASHBOARD_CUSTOMIZE_FALLBACK_TABS: {
  key: DashboardApiTab;
  label: string;
}[] = [
  { key: DashboardCategoryType.ALL, label: "All" },
  { key: DashboardCategoryType.PRAYER, label: "Prayer" },
  { key: DashboardCategoryType.QURAN, label: "Quran" },
  { key: DashboardCategoryType.FASTING, label: "Fasting" },
  { key: DashboardCategoryType.SADAQAH, label: "Sadaqah" },
];
