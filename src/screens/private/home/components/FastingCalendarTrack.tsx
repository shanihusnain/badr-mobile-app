import { TopSpace } from "@/components/atoms/TopSpace";
import type { FastingCalendarFilterTab } from "../fastingCalendar";
import { PLANNED_FASTS } from "../plannedFasts";
import { DashboardFastingCalendar } from "./DashboardFastingCalendar";
import { FastingCycleDates } from "./FastingCycleDates";
import { FastingGoalTotalCard } from "./FastingGoalTotalCard";
import { FastingLegendCard } from "./FastingLegendCard";

type FastingCalendarTrackProps = {
  variant: "planned" | "progress";
  filterTab: FastingCalendarFilterTab;
  showLegendCard: boolean;
  onCloseLegendCard: () => void;
};

export function FastingCalendarTrack({
  variant,
  filterTab,
  showLegendCard,
  onCloseLegendCard,
}: FastingCalendarTrackProps) {
  return (
    <>
      <TopSpace top={16} />
      {variant === "progress" ? (
        <FastingGoalTotalCard
          label="COMPLETED"
          count={PLANNED_FASTS.completedCount}
          variant="completed"
        />
      ) : null}
      {variant === "progress" ? <TopSpace top={16} /> : null}
      <FastingCycleDates
        startDate={PLANNED_FASTS.cycleStartDate}
        endDate={PLANNED_FASTS.cycleEndDate}
      />
      <TopSpace top={24} />
      {showLegendCard ? (
        <FastingLegendCard variant={variant} onClose={onCloseLegendCard} />
      ) : null}
      <TopSpace top={16} />
      <DashboardFastingCalendar filterTab={filterTab} trackVariant={variant} />
    </>
  );
}
