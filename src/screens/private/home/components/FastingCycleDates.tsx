import { Text, View } from "react-native";
import {
  getGregorianDateRangeLabel,
  getIslamicDateRangeLabel,
} from "../fastingCalendar";
import { styles } from "../styles";

type FastingCycleDatesProps = {
  startDate?: string;
  endDate?: string;
  rangeLabel?: string;
  hijriRangeLabel?: string;
};

export function FastingCycleDates({
  startDate,
  endDate,
  rangeLabel,
  hijriRangeLabel,
}: FastingCycleDatesProps) {
  const gregorian =
    rangeLabel?.trim() ||
    (startDate && endDate
      ? getGregorianDateRangeLabel(startDate, endDate)
      : "");
  const islamic =
    hijriRangeLabel?.trim() ||
    (startDate && endDate
      ? getIslamicDateRangeLabel(startDate, endDate)
      : "");

  if (!gregorian && !islamic) return null;

  return (
    <View style={styles.fastingCycleDatesContainer}>
      {gregorian ? (
        <Text style={styles.fastingCycleGregorianDate}>{gregorian}</Text>
      ) : null}
      {islamic ? (
        <Text style={styles.fastingCycleIslamicDate}>{islamic}</Text>
      ) : null}
    </View>
  );
}
