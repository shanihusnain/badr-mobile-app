import { Text, View } from "react-native";
import {
  getGregorianDateRangeLabel,
  getIslamicDateRangeLabel,
} from "../fastingCalendar";
import { styles } from "../styles";

type FastingCycleDatesProps = {
  startDate: string;
  endDate: string;
};

export function FastingCycleDates({
  startDate,
  endDate,
}: FastingCycleDatesProps) {
  return (
    <View style={styles.fastingCycleDatesContainer}>
      <Text style={styles.fastingCycleGregorianDate}>
        {getGregorianDateRangeLabel(startDate, endDate)}
      </Text>
      <Text style={styles.fastingCycleIslamicDate}>
        {getIslamicDateRangeLabel(startDate, endDate)}
      </Text>
    </View>
  );
}
