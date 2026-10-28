import type { ImageSourcePropType } from "react-native";
import { BeforeJournalCustomization } from "@/assets/images";
import type {
  BehaviorDetailApiData,
  BehaviorDetailContentBlock,
} from "@/src/api/queries/useGetJournalBehaviorDetils";
import type { PlanJournalConsistencySnapshot } from "../plan/planJournalConsistencyMockData";
import type {
  BehaviorDetailChartBar,
  BehaviorDetailPeriodView,
  BehaviorDetailStreak,
  BehaviorDetailWeekDay,
} from "./behaviorDetailMockData";

export type BehaviorDetailMappedContent = {
  heroImage: ImageSourcePropType;
  impactTitle: string;
  impactBlocks: BehaviorDetailContentBlock[];
  recommendationsTitle: string;
  recommendationBlocks: BehaviorDetailContentBlock[];
};

export type BehaviorDetailMappedView = {
  title: string;
  snapshot: PlanJournalConsistencySnapshot;
  periodView: BehaviorDetailPeriodView;
  content: BehaviorDetailMappedContent;
};

function mapDayStatus(
  status: string | undefined,
): BehaviorDetailWeekDay["status"] {
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

function mapStreak(streak: BehaviorDetailApiData["streaks"]["current"]): BehaviorDetailStreak {
  const count = streak?.count ?? 0;
  return {
    count,
    dateLabel: streak?.dateLabel ?? "—",
    tier: streak?.tier ?? null,
    // 1–7 days map to ~14%–100% ring fill.
    progressPercent:
      count <= 0 ? 0 : Math.min(100, Math.round((count / 7) * 100)),
  };
}

function resolveChartYMax(period: string, values: number[]): number {
  const maxValue = Math.max(...values, 0);
  if (period === "M") return Math.max(7, maxValue);
  if (period === "3M" || period === "6M") return Math.max(28, maxValue);
  return Math.max(maxValue, 4);
}

function mapChartBars(
  chart: BehaviorDetailApiData["chart"],
): BehaviorDetailChartBar[] | undefined {
  if (!chart?.length) return undefined;
  return chart.map((point) => ({
    label: point.label,
    value: point.completedDays ?? 0,
  }));
}

function loadingSnapshot(): PlanJournalConsistencySnapshot {
  return {
    dateRangeLabel: "---",
    consistencyPercent: null,
    previousPeriodDeltaPercent: null,
    consistencyBadge: null,
  };
}

function loadingPeriodView(): BehaviorDetailPeriodView {
  return {
    summaryDescription: "---",
    currentStreak: { count: 0, dateLabel: "—", progressPercent: 0 },
    longestStreak: { count: 0, dateLabel: "—", progressPercent: 0 },
  };
}

export function mapBehaviorDetailToView(
  data: BehaviorDetailApiData | undefined,
  options?: { isLoading?: boolean; fallbackTitle?: string },
): BehaviorDetailMappedView {
  const isLoading = options?.isLoading ?? !data;
  const fallbackTitle = options?.fallbackTitle ?? "Behavior";

  if (isLoading || !data) {
    return {
      title: fallbackTitle,
      snapshot: loadingSnapshot(),
      periodView: loadingPeriodView(),
      content: {
        heroImage: BeforeJournalCustomization,
        impactTitle: "---",
        impactBlocks: [],
        recommendationsTitle: "---",
        recommendationBlocks: [],
      },
    };
  }

  const days = data.days ?? null;
  const chartBars = mapChartBars(data.chart);
  const chartValues = chartBars?.map((bar) => bar.value) ?? [];

  const periodView: BehaviorDetailPeriodView = {
    summaryDescription: data.message,
    periodCount: data.consistency.completedDays,
    weekDays:
      days && days.length > 0
        ? days.map((day) => ({
            label: day.weekday,
            date: String(day.dayOfMonth),
            status: mapDayStatus(day.status),
          }))
        : undefined,
    chartBars,
    chartYMax: chartBars
      ? resolveChartYMax(data.period, chartValues)
      : undefined,
    currentStreak: mapStreak(data.streaks.current),
    longestStreak: mapStreak(data.streaks.longest),
  };

  return {
    title: data.title || fallbackTitle,
    snapshot: {
      dateRangeLabel: data.window.label,
      consistencyPercent: data.consistency.pct,
      previousPeriodDeltaPercent: null,
      consistencyBadge: data.consistency.badge,
    },
    periodView,
    content: {
      heroImage: BeforeJournalCustomization,
      impactTitle: data.impact?.title ?? "Impact",
      impactBlocks: data.impact?.blocks ?? [],
      recommendationsTitle: data.recommendations?.title ?? "Recommendations",
      recommendationBlocks: data.recommendations?.blocks ?? [],
    },
  };
}
