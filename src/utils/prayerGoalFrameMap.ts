import moment from "moment-hijri";
import type { PrayerGoalFrameData } from "@/src/api/queries/useGetPrayerGoalFrame";
import type { TahiyatUlWudhuDayProgress } from "@/components/molecules/TahiyatUlWudhuWeeklyProgressDashboard";

export function formatPrayerFrameWeekRange(weekStart: string, weekEnd: string) {
  const start = moment(weekStart, "YYYY-MM-DD");
  const end = moment(weekEnd, "YYYY-MM-DD");
  if (!start.isValid() || !end.isValid()) return "";
  if (start.month() === end.month()) {
    return `${start.format("MMM D")} — ${end.format("D")}`;
  }
  return `${start.format("MMM D")} — ${end.format("MMM D")}`;
}

export function mapPrayerFrameWeekDays(
  frame: PrayerGoalFrameData,
): TahiyatUlWudhuDayProgress[] {
  return frame.week.days.map((day) => ({
    day: day.dayLabel,
    prayersLogged: day.count,
    isLogged: !day.isFuture && day.count > 0,
    isBestDay: day.isBestDay,
    isFuture: day.isFuture,
    isToday: day.isToday,
  }));
}

export function getPrayerFrameTodayIndex(frame: PrayerGoalFrameData): number {
  const todayIndex = frame.week.days.findIndex((day) => day.isToday);
  return todayIndex >= 0 ? todayIndex : frame.week.days.length - 1;
}

export function getPrayerFrameWeekFraction(frame: PrayerGoalFrameData): string {
  return `${frame.cycle.weekNumber}/${frame.cycle.totalWeeks}`;
}

export type PrayerGoalFrameStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type PrayerFrameBadge = {
  text: string;
  type: "in-progress" | "completed" | "not-started";
};

export function normalizePrayerGoalFrameStatus(
  status: string | undefined | null,
): PrayerGoalFrameStatus {
  const normalized = (status ?? "NOT_STARTED").toUpperCase().replace(/-/g, "_");
  if (normalized === "IN_PROGRESS") return "IN_PROGRESS";
  if (normalized === "COMPLETED") return "COMPLETED";
  return "NOT_STARTED";
}

type PrayerFrameTranslate = (
  key: string,
  options?: Record<string, string | number>,
) => string;

export function getPrayerFrameAchievementLabel(
  frame: PrayerGoalFrameData,
  t: PrayerFrameTranslate,
): PrayerFrameBadge {
  const status = normalizePrayerGoalFrameStatus(frame.goal.status);
  const pct = frame.goal.achievementPct ?? 0;

  switch (status) {
    case "NOT_STARTED":
      return {
        text: t("progressLogging.notStarted"),
        type: "not-started",
      };
    case "IN_PROGRESS":
      // If backend says "in progress" but progress is still 0, show the purple "In Progress" chip
      // and hide insights (matches Figma).
      if (pct <= 0 || pct <= 90) {
        return {
          text: t("progressLogging.inProgress"),
          type: "in-progress",
        };
      }
      if (pct >= 100) {
        return {
          text: t("progressLogging.fullyAchieved"),
          type: "completed",
        };
      }
      return {
        text: t("progressLogging.surahStatusAchieved", { percent: pct }),
        type: "completed",
      };
    case "COMPLETED":
      return {
        text: t("progressLogging.fullyAchieved"),
        type: "completed",
      };
    default:
      return {
        text: t("progressLogging.inProgress"),
        type: "in-progress",
      };
  }
}

/** Show insights once the user has started logging progress. */
export function prayerFrameShowsInsights(frame: PrayerGoalFrameData): boolean {
  const status = normalizePrayerGoalFrameStatus(frame.goal.status);
  const pct = frame.goal.achievementPct ?? 0;
  if (status === "COMPLETED") return true;
  if (status === "IN_PROGRESS") return pct > 0;
  return false;
}

/** Compact ring inner label, e.g. "25 prayers" — pair with weeklyProgress_goalLabel i18n. */
export function getPrayerFrameRingGoalCountLabel(
  frame: PrayerGoalFrameData,
  unitLabel: string,
): string {
  const count = frame.goal.targetCount ?? 0;
  return `${count} ${unitLabel}`;
}
