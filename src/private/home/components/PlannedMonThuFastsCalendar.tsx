import { CalendarGrid } from "@/components/molecules/CalendarGrid";
import { Colors } from "@/constants/theme";
import moment from "moment-hijri";
import { PLANNED_FASTS } from "../plannedFasts";

export function PlannedMonThuFastsCalendar() {
  const { cycleStartDate, cycleEndDate, missedRamadanDates, monThuDates } =
    PLANNED_FASTS;

  const currentDate = moment(cycleStartDate, "YYYY-MM-DD")
    .startOf("month")
    .format("YYYY-MM-DD");

  return (
    <CalendarGrid
      mode="planned_all"
      currentDate={currentDate}
      windowStartDate={cycleStartDate}
      windowEndDate={cycleEndDate}
      markedDates={missedRamadanDates}
      monThuDates={monThuDates}
      bgColor={Colors.light.greybuttonBackground}
    />
  );
}
