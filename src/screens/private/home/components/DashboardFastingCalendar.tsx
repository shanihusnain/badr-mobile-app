import { TopSpace } from "@/components/atoms/TopSpace";
import { View } from "react-native";
import type { FastingCalendarFilterTab } from "../fastingCalendar";
import { styles } from "../styles";
import { PlannedDawoodFastsCalendar } from "./PlannedDawoodFastsCalendar";
import { PlannedFastsCalendar } from "./PlannedFastsCalendar";
import { PlannedMissedRamadanFastsCalendar } from "./PlannedMissedRamadanFastsCalendar";
import { PlannedMonThuFastsCalendar } from "./PlannedMonThuFastsCalendar";
import { PlannedProgressFastsCalendar } from "./PlannedProgressFastsCalendar";
import { PlannedWhiteDaysFastsCalendar } from "./PlannedWhiteDaysFastsCalendar";

type DashboardFastingCalendarProps = {
  filterTab: FastingCalendarFilterTab;
  trackVariant?: "planned" | "progress";
};

export function DashboardFastingCalendar({
  filterTab,
  trackVariant = "planned",
}: DashboardFastingCalendarProps) {
  const isProgress = trackVariant === "progress";

  const calendar = (() => {
    switch (filterTab) {
      case "All":
        return isProgress ? (
          <PlannedProgressFastsCalendar filterTab={filterTab} />
        ) : (
          <PlannedFastsCalendar />
        );
      case "White Days Fasts":
        return isProgress ? (
          <PlannedProgressFastsCalendar filterTab={filterTab} />
        ) : (
          <PlannedWhiteDaysFastsCalendar />
        );
      case "Missed Ramadan Fasts":
        return isProgress ? (
          <PlannedProgressFastsCalendar filterTab={filterTab} />
        ) : (
          <PlannedMissedRamadanFastsCalendar />
        );
      case "Monday & Thursday Fasts":
        return isProgress ? (
          <PlannedProgressFastsCalendar filterTab={filterTab} />
        ) : (
          <PlannedMonThuFastsCalendar />
        );
      case "Dawood Fasts":
        return <PlannedDawoodFastsCalendar />;
      default:
        return null;
    }
  })();

  if (!calendar) return null;

  return (
    <>
      <TopSpace top={16} />
      <View style={styles.fastingCalendarWrapper}>{calendar}</View>
    </>
  );
}
