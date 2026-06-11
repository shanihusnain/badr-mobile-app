import { Colors } from "@/constants/theme";
import type { DashboardSubGoal } from "./components/DashboardSubGoalRow";

export const DASHBOARD_FILTER_TABS = [
  "All",
  "Prayer",
  "Quran",
  "Fasting",
  "Sadaqah",
  "Time Spent",
] as const;

export type DashboardFilterTab = (typeof DASHBOARD_FILTER_TABS)[number];

const PRAYER_SUB_GOALS: DashboardSubGoal[] = [
  {
    id: "tahiyyat-wudhu",
    category: "Prayer",
    title: "TAHIYYAT AL-WUDHU",
    value: "0",
    divider: "/25 prayers",
    showCircleTopSpace: true,
  },
  {
    id: "sunnah-rawatib",
    category: "Prayer",
    title: "SUNNAH RAWATIB",
    value: "0",
    divider: "/252",
    showCircleTopSpace: true,
  },
  {
    id: "tahiyyat-masjid",
    category: "Prayer",
    title: "TAHIYYAT AL-MASJID",
    value: "0",
    divider: "/47",
    showCircleTopSpace: true,
  },
  {
    id: "qiyam-layl",
    category: "Prayer",
    title: "QIYAM AL-LAYL",
    value: "0",
    divider: "/23",
    showCircleTopSpace: true,
  },
  {
    id: "missed-prayers",
    category: "Prayer",
    title: "MISSED PAST PRAYERS",
    value: "0",
    divider: "/17",
    showCircleTopSpace: true,
  },
];

const QURAN_SUB_GOALS: DashboardSubGoal[] = [
  {
    id: "quran-recitation",
    category: "Quran",
    title: "QURAN RECITATION (BY COMPLETION)",
    value: "0",
    divider: "/3",
    percentage: "40",
    progressColor: Colors.light.ringQuran,
  },
];

const SADAQAH_SUB_GOALS: DashboardSubGoal[] = [
  {
    id: "sadaqah-jariyah",
    category: "Sadaqah",
    title: "SADAQAH JARIYAH",
    value: "$0",
    divider: "/$1,000",
  },
];

export const DASHBOARD_SUB_GOALS: DashboardSubGoal[] = [
  ...PRAYER_SUB_GOALS,
  ...QURAN_SUB_GOALS,
  ...SADAQAH_SUB_GOALS,
];

export function getVisibleDashboardSubGoals(
  goals: DashboardSubGoal[],
  selectedCategory: DashboardFilterTab | string,
): DashboardSubGoal[] {
  if (selectedCategory === "All") {
    return goals;
  }
  return goals.filter((goal) => goal.category === selectedCategory);
}
