import { CalendarGrid } from "@/components/molecules/CalendarGrid";
import { Colors } from "@/constants/theme";
import moment from "moment-hijri";
import type { FastingCalendarFilterTab } from "../fastingCalendar";
import { getPlannedFastMarkers, PLANNED_FASTS } from "../plannedFasts";

type PlannedProgressFastsCalendarProps = {
  filterTab: FastingCalendarFilterTab;
};

export function PlannedProgressFastsCalendar({
  filterTab,
}: PlannedProgressFastsCalendarProps) {
  const { cycleStartDate, cycleEndDate } = PLANNED_FASTS;
  const currentDate = moment(cycleStartDate, "YYYY-MM-DD")
    .startOf("month")
    .format("YYYY-MM-DD");

  return (
    <CalendarGrid
      mode="planned_progress"
      currentDate={currentDate}
      windowStartDate={cycleStartDate}
      windowEndDate={cycleEndDate}
      plannedFastMarkers={getPlannedFastMarkers(filterTab)}
      bgColor={Colors.light.greybuttonBackground}
    />
  );
}
