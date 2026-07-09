import { Text, View } from "react-native";
import type { BehaviorDetailWeekDay } from "../behaviorDetailMockData";
import { behaviorDetailStyles as styles } from "../styles";

type BehaviorDetailWeekDaysProps = {
  weekDays: BehaviorDetailWeekDay[];
};

function getDayCircleStyle(status: BehaviorDetailWeekDay["status"]) {
  switch (status) {
    case "completed":
      return styles.dayCircleCompleted;
    case "partial":
      return styles.dayCirclePartial;
    case "missed":
      return styles.dayCircleMissed;
    default:
      return styles.dayCircleEmpty;
  }
}

export function BehaviorDetailWeekDays({ weekDays }: BehaviorDetailWeekDaysProps) {
  return (
    <View style={styles.weekDaysRow}>
      {weekDays.map((day) => (
        <View key={`${day.label}-${day.date}`} style={styles.weekDayItem}>
          <View style={[styles.dayCircle, getDayCircleStyle(day.status)]} />
          <Text style={styles.weekDayLabel}>{day.label}</Text>
          <Text style={styles.weekDayDate}>{day.date}</Text>
        </View>
      ))}
    </View>
  );
}
