type GoalCardStatus =
  | "not-started"
  | "in-progress"
  | "completed"
  | "achieved";

type Translate = (key: string, options?: Record<string, string | number>) => string;

export type QuranGoalCardStatusChip = {
  label: string;
  /** True when the chip shows a percentage (green theme). */
  showPercent: boolean;
};

/**
 * Mid-cycle chips stay "In Progress" / "Not Started".
 * Percentage pills only after item is 100% or the 28-day cycle has ended.
 */
export function resolveQuranGoalCardStatusLabel(options: {
  status: GoalCardStatus;
  pillLabel?: string | null;
  progressPercent?: number | null;
  completed?: boolean;
  cycleEnded: boolean;
  t: Translate;
  formatNumber?: (value: number) => string;
}): QuranGoalCardStatusChip {
  const pct = Math.max(0, Math.round(Number(options.progressPercent) || 0));
  const isItemComplete =
    options.completed === true ||
    options.status === "completed" ||
    options.status === "achieved" ||
    pct >= 100;
  const showPercent = isItemComplete || options.cycleEnded;

  if (!showPercent) {
    if (options.status === "not-started") {
      return {
        label: options.t("progressLogging.surahStatusNotStarted"),
        showPercent: false,
      };
    }
    return {
      label: options.t("progressLogging.surahStatusInProgress"),
      showPercent: false,
    };
  }

  const pill = options.pillLabel?.trim();
  if (pill) return { label: pill, showPercent: true };

  if (options.formatNumber) {
    return {
      label: options.t("progressLogging.surahStatusAchieved", {
        percent: options.formatNumber(Math.min(100, pct)),
      }),
      showPercent: true,
    };
  }

  if (isItemComplete) {
    return {
      label: options.t("progressLogging.surahStatusCompleted"),
      showPercent: true,
    };
  }

  return {
    label: options.t("progressLogging.surahStatusInProgress"),
    showPercent: false,
  };
}
