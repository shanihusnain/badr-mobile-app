import { Text, View } from "react-native";
import { Colors } from "@/constants/theme";
import { CalendarGrid } from "@/components/molecules/CalendarGrid";
import type { PlannedFastMarker } from "../plannedFasts";
import { styles } from "../styles";
import { FastingCycleDates } from "./FastingCycleDates";
import { FastingGoalTotalCard } from "./FastingGoalTotalCard";
import { FastingLegendCard } from "./FastingLegendCard";
import type { FastingLegendEntry } from "../fastingLegend";

type FastingCalendarTrackProps = {
  variant: "planned" | "progress";
  showLegendCard: boolean;
  onCloseLegendCard: () => void;
  markers: PlannedFastMarker[];
  legendEntries?: FastingLegendEntry[];
  windowStartDate?: string;
  windowEndDate?: string;
  rangeLabel?: string;
  hijriRangeLabel?: string;
  completedLabel?: string;
  completedCount?: number;
  completedUnit?: string;
  footnote?: string;
  hasCalendar?: boolean;
};

export function FastingCalendarTrack({
  variant,
  showLegendCard,
  onCloseLegendCard,
  markers,
  legendEntries,
  windowStartDate,
  windowEndDate,
  rangeLabel,
  hijriRangeLabel,
  completedLabel = "COMPLETED",
  completedCount = 0,
  completedUnit,
  footnote,
  hasCalendar = true,
}: FastingCalendarTrackProps) {
  const currentDate = windowStartDate
    ? windowStartDate.slice(0, 8) + "01"
    : undefined;

  return (
    <View style={styles.fastingCalendarTrack}>
      {variant === "progress" ? (
        <FastingGoalTotalCard
          label={completedLabel}
          count={completedCount}
          unit={completedUnit}
          variant="completed"
        />
      ) : null}
      <FastingCycleDates
        startDate={windowStartDate}
        endDate={windowEndDate}
        rangeLabel={rangeLabel}
        hijriRangeLabel={hijriRangeLabel}
      />
      {showLegendCard ? (
        <FastingLegendCard
          variant={variant}
          legendEntries={legendEntries}
          onClose={onCloseLegendCard}
        />
      ) : null}
      {hasCalendar && windowStartDate && windowEndDate ? (
        <View style={styles.fastingCalendarWrapper}>
          <CalendarGrid
            mode="planned_progress"
            currentDate={currentDate ?? windowStartDate}
            windowStartDate={windowStartDate}
            windowEndDate={windowEndDate}
            plannedFastMarkers={markers}
            bgColor={Colors.light.greybuttonBackground}
          />
        </View>
      ) : null}
      {footnote?.trim() ? (
        <Text style={styles.fastingInfoBannerText}>{footnote.trim()}</Text>
      ) : null}
    </View>
  );
}
