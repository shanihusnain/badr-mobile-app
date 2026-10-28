import type { HabitDetailData } from "@/src/api/queries/usGetHabitDetail";
import type { JournalInsightSnapshot } from "./journalInsightMockData";

function mapDayStatus(
  status: string | undefined,
): "completed" | "missed" | "partial" | "empty" {
  switch ((status ?? "").toUpperCase()) {
    case "DONE":
    case "COMPLETED":
    case "COMPLETE":
      return "completed";
    case "PARTIAL":
      return "partial";
    case "MISSED":
    case "INCOMPLETE":
      return "missed";
    case "NOT_STARTED":
    default:
      return "empty";
  }
}

export function mapHabitDetailToSnapshot(
  data: HabitDetailData | undefined,
  options?: { isLoading?: boolean; habitTitle?: string },
): JournalInsightSnapshot {
  const isLoading = options?.isLoading ?? !data;

  if (isLoading || !data) {
    return {
      dateRangeLabel: "---",
      consistencyPercent: null,
      previousPeriodDeltaPercent: null,
      consistencyBadge: null,
      summary: {
        behaviorCount: 0,
        headerTitle: "---",
        description: "---",
      },
      behaviors: [],
      studyMaterial: [],
    };
  }

  const trackedDays = Math.max(data.consistency?.trackedDays || 0, 1);

  const behaviors = [...(data.behaviors ?? [])]
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((behavior) => {
      const days = behavior.days ?? null;
      const dayCount = days?.length ?? 0;
      const completedDays = behavior.completedDays ?? 0;
      const periodPercent =
        dayCount > 0
          ? Math.round((completedDays / dayCount) * 100)
          : Math.min(100, Math.round((completedDays / trackedDays) * 100));

      return {
        id: behavior.behaviorId,
        name: behavior.title,
        description: behavior.summary,
        weekDays:
          days && days.length > 0
            ? days.map((day) => ({
                label: day.weekday,
                date: String(day.dayOfMonth),
                status: mapDayStatus(day.status),
              }))
            : undefined,
        periodCount: completedDays,
        periodPercent,
      };
    });

  return {
    dateRangeLabel: data.window.label,
    consistencyPercent: data.consistency.pct,
    previousPeriodDeltaPercent: null,
    consistencyBadge: data.consistency.badge,
    summary: {
      behaviorCount: data.consistency.behaviorCount ?? behaviors.length,
      headerTitle: data.headline,
      description: data.message,
    },
    behaviors,
    studyMaterial: [],
  };
}
