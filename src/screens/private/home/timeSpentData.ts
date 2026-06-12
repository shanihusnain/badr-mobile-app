import moment from "moment-hijri";

export type TimeSpentPeriod = "week" | "month";
export type TimeSpentTab = "All" | "Prayer" | "Quran" | "Fasting" | "Sadaqah";

export const TIME_SPENT_TABS: TimeSpentTab[] = [
  "All",
  "Prayer",
  "Quran",
  "Fasting",
  "Sadaqah",
];

export type TimeSpentChartItem = {
  xLabel: string;
  dayLabel: string;
  dateLabel: string;
  hours: number;
};

export type CategoryRowData = {
  label: string;
  percent: number;
  timeLabel: string;
  progressPercent: number;
};

type SubCategoryDef = {
  label: string;
  weight: number;
};

const CYCLE_WEEKS = 4;
const CYCLE_DAYS = 28;
const DAYS_PER_WEEK = 7;

export const BASE_CYCLE_START = moment("2026-12-20", "YYYY-MM-DD");

const FIGMA_WEEK_HOURS = [1, 9.5, 3, 20 / 60, 14.5, 4 + 40 / 60, 5.5];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTHLY_HOUR_SAMPLES = [
  1, 9.5, 3, 0.33, 14.5, 4.67, 5.5, 2, 0, 6.5, 8, 1.5,
];

const TAB_CHART_SCALE: Record<TimeSpentTab, number> = {
  All: 1,
  Prayer: 0.32,
  Quran: 0.28,
  Fasting: 0.22,
  Sadaqah: 0.18,
};

const TAB_SUBCATEGORIES: Record<TimeSpentTab, SubCategoryDef[]> = {
  All: [
    { label: "Quran", weight: 39 },
    { label: "Fasting", weight: 33 },
    { label: "Prayer", weight: 32 },
    { label: "Sadaqah", weight: 29 },
  ],
  Prayer: [
    { label: "Sunnah Rawatib", weight: 18 },
    { label: "Qiyam Al-Layl", weight: 16 },
    { label: "Missed Fard Prayers", weight: 14 },
    { label: "The 5 Daily Prayers", weight: 22 },
    { label: "Prayer of Wudhu", weight: 8 },
    { label: "Congregational Prayer in Mosque", weight: 12 },
    { label: "Duha Prayer", weight: 6 },
    { label: "Tasbih Prayer", weight: 5 },
    { label: "Ishraq Prayer", weight: 5 },
    { label: "Shukr Prayer", weight: 4 },
  ],
  Quran: [
    { label: "Quran Listening", weight: 24 },
    { label: "Quran Recitation", weight: 28 },
    { label: "Quran Memorization", weight: 26 },
    { label: "Quran Tajweed", weight: 22 },
  ],
  Fasting: [
    { label: "Missed Ramadan Fasts", weight: 30 },
    { label: "The Fast of Prophet Dawud (AS)", weight: 24 },
    { label: "Mondays & Thursdays", weight: 26 },
    { label: "The White Days", weight: 20 },
  ],
  Sadaqah: [
    { label: "Volunteering Services", weight: 18 },
    { label: "Missed Zakat", weight: 16 },
    { label: "Fidya", weight: 12 },
    { label: "Iftaar Donations", weight: 14 },
    { label: "Sadaqah for Parents", weight: 10 },
    { label: "Donating to Mosques", weight: 12 },
    { label: "Donating to Water Well Projects", weight: 9 },
    { label: "Kaffarah for Breaking Fasts or Oaths", weight: 9 },
  ],
};

export function formatHoursToTimeLabel(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

export function formatTotalTime(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
}

function formatWeekRangeLabel(
  start: moment.Moment,
  end: moment.Moment,
): string {
  if (start.month() === end.month()) {
    return `${start.format("MMM D")}-${end.format("D")}`;
  }

  return `${start.format("MMM D")} — ${end.format("MMM D")}`;
}

function getDailyHours(
  cycleOffset: number,
  dayIndex: number,
  tab: TimeSpentTab,
): number {
  const weekIndex = Math.floor(dayIndex / DAYS_PER_WEEK);
  const dayInWeek = dayIndex % DAYS_PER_WEEK;
  const scale = TAB_CHART_SCALE[tab];

  let hours: number;
  if (cycleOffset === 0 && weekIndex === 0) {
    hours = FIGMA_WEEK_HOURS[dayInWeek];
  } else {
    hours =
      MONTHLY_HOUR_SAMPLES[
        (dayIndex + cycleOffset * 3) % MONTHLY_HOUR_SAMPLES.length
      ];
  }

  return hours * scale;
}

export function buildWeeklyChartData(
  weekOffset: number,
  tab: TimeSpentTab = "All",
): TimeSpentChartItem[] {
  const weekStart = BASE_CYCLE_START.clone().add(weekOffset * 7, "days");
  const scale = TAB_CHART_SCALE[tab];

  return DAY_LABELS.map((dayLabel, index) => {
    const date = weekStart.clone().add(index, "days");
    const baseHours =
      weekOffset === 0
        ? FIGMA_WEEK_HOURS[index]
        : MONTHLY_HOUR_SAMPLES[index % MONTHLY_HOUR_SAMPLES.length];

    return {
      xLabel: dayLabel,
      dayLabel,
      dateLabel: date.format("D"),
      hours: baseHours * scale,
    };
  });
}

export function buildCycleWeeklyChartData(
  cycleOffset: number,
  tab: TimeSpentTab = "All",
): TimeSpentChartItem[] {
  const cycleStart = BASE_CYCLE_START.clone().add(
    cycleOffset * CYCLE_DAYS,
    "days",
  );

  return Array.from({ length: CYCLE_WEEKS }, (_, weekIndex) => {
    const weekStart = cycleStart.clone().add(weekIndex * DAYS_PER_WEEK, "days");
    const weekEnd = weekStart.clone().add(DAYS_PER_WEEK - 1, "days");

    const hours = Array.from({ length: DAYS_PER_WEEK }, (_, dayInWeek) => {
      const dayIndex = weekIndex * DAYS_PER_WEEK + dayInWeek;
      return getDailyHours(cycleOffset, dayIndex, tab);
    }).reduce((sum, value) => sum + value, 0);

    return {
      xLabel: formatWeekRangeLabel(weekStart, weekEnd),
      dayLabel: "",
      dateLabel: formatWeekRangeLabel(weekStart, weekEnd),
      hours,
    };
  });
}

export function getPeriodRangeLabel(
  selectedPeriod: TimeSpentPeriod,
  weekOffset: number,
  cycleOffset: number,
): string {
  if (selectedPeriod === "week") {
    const start = BASE_CYCLE_START.clone().add(weekOffset * 7, "days");
    const end = start.clone().add(6, "days");
    return `${start.format("MMM D")} — ${end.format("MMM D")}`;
  }

  const cycleStart = BASE_CYCLE_START.clone().add(
    cycleOffset * CYCLE_DAYS,
    "days",
  );
  const cycleEnd = cycleStart.clone().add(CYCLE_DAYS - 1, "days");
  return `${cycleStart.format("MMM D")} — ${cycleEnd.format("MMM D")}`;
}

function getSubcategoryWeights(
  tab: TimeSpentTab,
  barIndex: number,
  selectedPeriod: TimeSpentPeriod,
): number[] {
  return TAB_SUBCATEGORIES[tab].map((category, categoryIndex) => {
    const seed =
      barIndex * 11 +
      categoryIndex * 7 +
      (selectedPeriod === "month" ? 13 : 0) +
      tab.length * 3;
    const variation = (seed * 17) % 21;
    return Math.max(5, category.weight + variation - 10);
  });
}

function buildBreakdownFromWeights(
  categories: SubCategoryDef[],
  weights: number[],
  totalHours: number,
  useStaticPercents: boolean,
): CategoryRowData[] {
  if (totalHours <= 0) {
    return categories.map((category) => ({
      label: category.label,
      percent: 0,
      timeLabel: "0:00",
      progressPercent: 0,
    }));
  }

  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);

  return categories.map((category, index) => {
    const share = weights[index] / weightSum;
    const hours = totalHours * share;
    const progressPercent = useStaticPercents
      ? category.weight
      : share * 100;

    return {
      label: category.label,
      percent: Math.round(
        useStaticPercents ? category.weight : progressPercent,
      ),
      timeLabel: formatHoursToTimeLabel(hours),
      progressPercent,
    };
  });
}

export function buildCategoryBreakdown(
  tab: TimeSpentTab,
  totalHours: number,
  selectedBarIndex: number | null,
  selectedPeriod: TimeSpentPeriod,
): CategoryRowData[] {
  const categories = TAB_SUBCATEGORIES[tab];

  if (selectedBarIndex !== null) {
    const weights = getSubcategoryWeights(tab, selectedBarIndex, selectedPeriod);
    return buildBreakdownFromWeights(categories, weights, totalHours, false);
  }

  const weights = categories.map((category) => category.weight);
  return buildBreakdownFromWeights(categories, weights, totalHours, tab === "All");
}

export function getSummaryText(
  selectedPeriod: TimeSpentPeriod,
  totalHours: number,
): string {
  const formatted = formatTotalTime(totalHours);
  if (selectedPeriod === "week") {
    return `You dedicated ${formatted} on your goals this 7-day period — 23% of the week and 8h 32m (28%) more than the last week.`;
  }

  return `You dedicated ${formatted} on your goals this month — it's 20% of the month and 30.35% (18h) more than the month before.`;
}
