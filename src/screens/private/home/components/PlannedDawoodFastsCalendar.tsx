import { CalendarGrid } from "@/components/molecules/CalendarGrid";
import { Colors } from "@/constants/theme";
import moment from "moment-hijri";
import { PLANNED_FASTS } from "../plannedFasts";

export function PlannedDawoodFastsCalendar() {
  const { cycleStartDate, cycleEndDate, dawoodStartDay } = PLANNED_FASTS;

  const currentDate = moment(cycleStartDate, "YYYY-MM-DD")
    .startOf("month")
    .format("YYYY-MM-DD");

  return (
    <CalendarGrid
      mode="dawood"
      currentDate={currentDate}
      windowStartDate={cycleStartDate}
      windowEndDate={cycleEndDate}
      dawoodStartDay={dawoodStartDay}
      bgColor={Colors.light.greybuttonBackground}
    />
  );
}
