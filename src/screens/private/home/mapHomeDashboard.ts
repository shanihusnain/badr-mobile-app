import { Colors } from "@/constants/theme";
import type {
  HomeDashboardData,
  HomeDashboardTab,
  HomeDashboardTabKey,
  HomeDashboardWidget,
} from "@/src/api/queries/useGetHomeDashboard";
import {
  goalTypeToGoalId,
  type UiIbadahCategory,
} from "@/src/utils/goalCycleCategoryMap";
import type { GoalId } from "./components/goalsData";

export const HOME_DASHBOARD_FALLBACK_TABS: HomeDashboardTab[] = [
  { key: "ALL", label: "All" },
  { key: "PRAYER", label: "Prayer" },
  { key: "QURAN", label: "Quran" },
  { key: "FASTING", label: "Fasting" },
  { key: "SADAQAH", label: "Sadaqah" },
];

/** Matches DailyProgressBottomSheet CATEGORY_ICON_COLOR. */
export const HOME_DASHBOARD_CATEGORY_COLOR: Record<UiIbadahCategory, string> = {
  PRAYER: Colors.light.ringPrayer,
  QURAN: Colors.light.ringQuran,
  FASTING: Colors.light.green,
  SADAQAH: Colors.light.ringSadaqah,
};

export type HomeDashboardGoalRow = {
  id: string;
  goalId: GoalId | null;
  uiCategory: UiIbadahCategory;
  title: string;
  subtitleCount: string;
  subtitleLabel: string;
  percentage: string;
  progressColor: string;
};

export function normalizeHomeDashboardTabKey(
  tab: string | null | undefined,
): HomeDashboardTabKey {
  const key = String(tab ?? "ALL")
    .trim()
    .toUpperCase();
  return key || "ALL";
}

function resolveUiCategory(
  category: string | null | undefined,
): UiIbadahCategory {
  const key = String(category ?? "")
    .trim()
    .toUpperCase();
  if (
    key === "PRAYER" ||
    key === "QURAN" ||
    key === "FASTING" ||
    key === "SADAQAH"
  ) {
    return key;
  }
  return "PRAYER";
}

function splitProgressLabel(progressLabel: string | null | undefined): {
  subtitleCount: string;
  subtitleLabel: string;
} {
  const raw = String(progressLabel ?? "").trim();
  if (!raw) return { subtitleCount: "0", subtitleLabel: "" };
  const slashIndex = raw.indexOf("/");
  if (slashIndex < 0) return { subtitleCount: raw, subtitleLabel: "" };
  const subtitleCount = raw.slice(0, slashIndex).trim() || "0";
  const rest = raw.slice(slashIndex + 1).trim();
  return {
    subtitleCount,
    subtitleLabel: rest ? `/${rest}` : "/",
  };
}

export function mapHomeDashboardGoalWidget(
  widget: HomeDashboardWidget,
): HomeDashboardGoalRow | null {
  if (String(widget?.kind ?? "").toUpperCase() !== "GOAL") return null;

  const uiCategory = resolveUiCategory(widget.category);
  const goalType = String(widget.goalType ?? widget.key ?? "")
    .trim()
    .toUpperCase();
  const goalId = goalType
    ? goalTypeToGoalId(uiCategory.toLowerCase(), goalType)
    : null;
  const { subtitleCount, subtitleLabel } = splitProgressLabel(
    widget.progressLabel,
  );
  const rawPct = widget.completedPct;
  const pct =
    typeof rawPct === "number" && Number.isFinite(rawPct)
      ? Math.min(100, Math.max(0, Math.round(rawPct)))
      : 0;

  const id =
    String(widget.key ?? widget.goalType ?? "")
      .trim()
      .toLowerCase()
      .replace(/_/g, "-") || `goal-${uiCategory.toLowerCase()}`;

  return {
    id,
    goalId,
    uiCategory,
    title: String(widget.name ?? "").trim() || id,
    subtitleCount,
    subtitleLabel,
    percentage: `${pct}%`,
    progressColor: HOME_DASHBOARD_CATEGORY_COLOR[uiCategory],
  };
}

export function mapHomeDashboardGoalRows(
  widgets: HomeDashboardWidget[] | null | undefined,
): HomeDashboardGoalRow[] {
  if (!Array.isArray(widgets) || widgets.length === 0) return [];
  return widgets
    .map(mapHomeDashboardGoalWidget)
    .filter((row): row is HomeDashboardGoalRow => row != null);
}

export function countTimeSpentWidgets(
  widgets: HomeDashboardWidget[] | null | undefined,
): number {
  if (!Array.isArray(widgets)) return 0;
  return widgets.filter(
    (widget) => String(widget?.kind ?? "").toUpperCase() === "TIME_SPENT",
  ).length;
}

export function resolveHomeDashboardTabs(
  tabs: HomeDashboardTab[] | null | undefined,
): HomeDashboardTab[] {
  if (Array.isArray(tabs) && tabs.length > 0) {
    return tabs.map((tab) => ({
      key: normalizeHomeDashboardTabKey(tab.key),
      label: String(tab.label ?? tab.key ?? "").trim() || String(tab.key),
    }));
  }
  return HOME_DASHBOARD_FALLBACK_TABS;
}

export function resolveGoalVisibleCount(
  data: HomeDashboardData | null | undefined,
): number {
  const raw =
    typeof data?.visibleCount === "number" && Number.isFinite(data.visibleCount)
      ? Math.max(0, Math.round(data.visibleCount))
      : 7;
  const timeSpentCount = countTimeSpentWidgets(data?.widgets);
  return Math.max(0, raw - timeSpentCount);
}
