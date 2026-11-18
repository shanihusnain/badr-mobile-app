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
  isNotStarted: boolean;
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
  const showPercent = (pct >= 100 || options.cycleEnded) && isItemComplete;

  if (!showPercent) {
    const hasAnyProgress = pct > 0 || options.completed === true;
    if (options.status === "not-started" && !hasAnyProgress) {
      return {
        label: options.t("progressLogging.surahStatusNotStarted"),
        showPercent: false,
        isNotStarted: true,
      };
    }
    return {
      label: options.t("progressLogging.surahStatusInProgress"),
      showPercent: false,
      isNotStarted: false,
    };
  }

  const pill = options.pillLabel?.trim();
  if (pill) return { label: pill, showPercent: true, isNotStarted: false };

  if (options.formatNumber) {
    return {
      label: options.t("progressLogging.surahStatusAchieved", {
        percent: options.formatNumber(Math.min(100, pct)),
      }),
      showPercent: true,
      isNotStarted: false,
    };
  }

  if (isItemComplete) {
    return {
      label: options.t("progressLogging.surahStatusCompleted"),
      showPercent: true,
      isNotStarted: false,
    };
  }

  return {
    label: options.t("progressLogging.surahStatusInProgress"),
    showPercent: false,
    isNotStarted: false,
  };
}
