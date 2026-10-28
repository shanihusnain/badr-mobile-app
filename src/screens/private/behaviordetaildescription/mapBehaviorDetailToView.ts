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

/** Dark navy placeholder while remote hero images decode (matches screen bg). */
export const BEHAVIOR_DETAIL_HERO_BLURHASH = "L02rs+j[fQj[j[fQfQfQfQfQfQfQ";

export type BehaviorDetailMappedContent = {
  heroImage: ImageSourcePropType;
  /** BlurHash shown by expo-image until the remote hero finishes loading. */
  heroBlurhash: string | null;
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

function mapStreak(
  streak: BehaviorDetailApiData["streaks"]["current"],
): BehaviorDetailStreak {
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

function resolveHeroImage(
  data: BehaviorDetailApiData,
): ImageSourcePropType {
  const url = data.image?.url?.trim();
  if (url) return { uri: url };
  return BeforeJournalCustomization;
}

function resolveHeroBlurhash(
  data: BehaviorDetailApiData | undefined,
): string | null {
  const url = data?.image?.url?.trim();
  if (!url) return null;
  const fromApi = data?.image?.blurhash?.trim();
  if (fromApi) return fromApi;
  return BEHAVIOR_DETAIL_HERO_BLURHASH;
}

export function mapBehaviorDetailToView(
  data: BehaviorDetailApiData | undefined,
  options?: { isLoading?: boolean; title?: string },
): BehaviorDetailMappedView {
  const isLoading = options?.isLoading ?? !data;
  const fallbackTitle = options?.title?.trim() || "Behavior";

  if (isLoading || !data) {
    return {
      title: fallbackTitle,
      snapshot: loadingSnapshot(),
      periodView: loadingPeriodView(),
      content: {
        heroImage: BeforeJournalCustomization,
        heroBlurhash: null,
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
    currentStreak: mapStreak(data.streaks?.current),
    longestStreak: mapStreak(data.streaks?.longest),
  };

  return {
    title: data.title?.trim() || fallbackTitle,
    snapshot: {
      dateRangeLabel: data.window?.label ?? "---",
      consistencyPercent: data.consistency?.pct ?? null,
      previousPeriodDeltaPercent: null,
      consistencyBadge: data.consistency?.badge ?? null,
    },
    periodView,
    content: {
      heroImage: resolveHeroImage(data),
      heroBlurhash: resolveHeroBlurhash(data),
      impactTitle: data.impact?.title ?? "Impact",
      impactBlocks: data.impact?.blocks ?? [],
      recommendationsTitle: data.recommendations?.title ?? "Recommendations",
      recommendationBlocks: data.recommendations?.blocks ?? [],
    },
  };
}
