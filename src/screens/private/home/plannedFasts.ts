import { Colors } from "@/constants/theme";
import moment, { type Moment } from "moment-hijri";
import type { FastingCalendarFilterTab } from "./fastingCalendar";

function getDatesInCycle(
  startDate: string,
  predicate: (date: Moment) => boolean,
): string[] {
  return Array.from({ length: 28 }, (_, index) => {
    const date = moment(startDate, "YYYY-MM-DD").add(index, "days");
    return predicate(date) ? date.format("YYYY-MM-DD") : null;
  }).filter((date): date is string => date !== null);
}

// Cycle started 14 days ago so the window includes past dates for missed/completed testing.
const cycleStart = moment().subtract(14, "days");
const cycleStartDate = cycleStart.format("YYYY-MM-DD");
const today = moment().format("YYYY-MM-DD");

export type FastingCategory = "ramadan" | "mon_thu" | "white_days";

export type PlannedFastState = "completed" | "missed" | "planned";

export type PlannedFastMarker = {
  date: string;
  category: FastingCategory;
  color: string;
  state: PlannedFastState;
};

const CATEGORY_COLORS: Record<FastingCategory, string> = {
  ramadan: Colors.light.ringRamadan,
  mon_thu: Colors.light.ringMonThu,
  white_days: Colors.light.white,
};

function getFastState(date: string, completedDates: string[]): PlannedFastState {
  if (completedDates.includes(date)) return "completed";
  if (date < today) return "missed";
  return "planned";
}

const monThuDates = getDatesInCycle(
  cycleStartDate,
  (date) => date.day() === 1 || date.day() === 4,
);

const whiteDayDates = getDatesInCycle(cycleStartDate, (date) => {
  const hijriDay = date.iDate();
  return hijriDay === 13 || hijriDay === 14 || hijriDay === 15;
});

// Past missed Ramadan fast (warning) + one completed + one future planned.
const missedRamadanDates = [
  cycleStart.clone().add(2, "days").format("YYYY-MM-DD"),
  cycleStart.clone().add(5, "days").format("YYYY-MM-DD"),
  cycleStart.clone().add(20, "days").format("YYYY-MM-DD"),
];

const completedMissedRamadanDates = [
  cycleStart.clone().add(5, "days").format("YYYY-MM-DD"),
];

const completedMonThuDates = monThuDates
  .filter((date) => date < today)
  .slice(0, 1);

const completedWhiteDayDates = whiteDayDates
  .filter((date) => date < today)
  .slice(0, 0);

function getDawoodDatesInCycle(
  startDate: string,
  dawoodStartDay: 1 | 2,
): string[] {
  const dates: string[] = [];

  for (let index = 0; index < 28; index += 1) {
    const cycleDay = index + 1;
    const isFastDay =
      dawoodStartDay === 1 ? cycleDay % 2 === 1 : cycleDay % 2 === 0;

    if (isFastDay) {
      dates.push(
        moment(startDate, "YYYY-MM-DD").add(index, "days").format("YYYY-MM-DD"),
      );
    }
  }

  return dates;
}

const dawoodStartDay = 1 as const;
const dawoodDates = getDawoodDatesInCycle(cycleStartDate, dawoodStartDay);

const pastDawoodDates = dawoodDates.filter((date) => date < today);
const missedDawoodDate = pastDawoodDates.at(-1);
const completedBeforeMiss = pastDawoodDates.slice(0, -1);
// After a miss, the user observes again — new cycle starts from that fast date.
const restartDawoodDate = missedDawoodDate
  ? dawoodDates.find((date) => date > missedDawoodDate && date <= today)
  : undefined;
const completedDawoodDates = [
  ...completedBeforeMiss,
  ...(restartDawoodDate ? [restartDawoodDate] : []),
];

function buildCategoryMarkers(
  dates: string[],
  category: FastingCategory,
  completedDates: string[],
): PlannedFastMarker[] {
  return dates.map((date) => ({
    date,
    category,
    color: CATEGORY_COLORS[category],
    state: getFastState(date, completedDates),
  }));
}

const ALL_PLANNED_FAST_MARKERS: PlannedFastMarker[] = [
  ...buildCategoryMarkers(
    missedRamadanDates,
    "ramadan",
    completedMissedRamadanDates,
  ),
  ...buildCategoryMarkers(monThuDates, "mon_thu", completedMonThuDates),
  ...buildCategoryMarkers(whiteDayDates, "white_days", completedWhiteDayDates),
];

const STATE_PRIORITY: Record<PlannedFastState, number> = {
  completed: 3,
  missed: 2,
  planned: 1,
};

const CATEGORY_PRIORITY: Record<FastingCategory, number> = {
  ramadan: 3,
  mon_thu: 2,
  white_days: 1,
};

function pickMarkerForDate(
  markers: PlannedFastMarker[],
): Map<string, PlannedFastMarker> {
  const byDate = new Map<string, PlannedFastMarker>();

  markers.forEach((marker) => {
    const existing = byDate.get(marker.date);
    if (!existing) {
      byDate.set(marker.date, marker);
      return;
    }

    const markerScore =
      STATE_PRIORITY[marker.state] * 10 + CATEGORY_PRIORITY[marker.category];
    const existingScore =
      STATE_PRIORITY[existing.state] * 10 + CATEGORY_PRIORITY[existing.category];

    if (markerScore > existingScore) {
      byDate.set(marker.date, marker);
    }
  });

  return byDate;
}

const FILTER_CATEGORY_MAP: Partial<
  Record<FastingCalendarFilterTab, FastingCategory>
> = {
  "Missed Ramadan Fasts": "ramadan",
  "Monday & Thursday Fasts": "mon_thu",
  "White Days Fasts": "white_days",
};

export function getPlannedFastMarkers(
  filterTab: FastingCalendarFilterTab = "All",
): PlannedFastMarker[] {
  const category = FILTER_CATEGORY_MAP[filterTab];
  const filtered = category
    ? ALL_PLANNED_FAST_MARKERS.filter((marker) => marker.category === category)
    : ALL_PLANNED_FAST_MARKERS;

  return Array.from(pickMarkerForDate(filtered).values());
}

export const PLANNED_FASTS = {
  cycleStartDate,
  cycleEndDate: cycleStart.clone().add(27, "days").format("YYYY-MM-DD"),
  missedRamadanDates,
  monThuDates,
  whiteDayDates,
  dawoodDates,
  dawoodStartDay,
  goalTotal: 10,
  completedCount:
    completedMissedRamadanDates.length +
    completedMonThuDates.length +
    completedWhiteDayDates.length +
    completedDawoodDates.length,
  completedMissedRamadanDates,
  completedMonThuDates,
  completedWhiteDayDates,
  completedDawoodDates,
};
