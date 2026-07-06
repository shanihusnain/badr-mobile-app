import { TaperedCircleBorder } from "@/components/atoms/TaperedCircleBorder";
import { Colors } from "@/constants/theme";
import type { PlanJournalPeriodId } from "@/src/screens/private/plan/planJournalConsistencyMockData";
import { Text, View } from "react-native";
import type { JournalInsightBehavior } from "../journalInsightMockData";
import { getJournalInsightProgressColor } from "../journalInsightProgress";
import { journalInsightStyles as styles } from "../styles";

const PERIOD_RING_SIZE = 24;

type JournalInsightBehaviorCardProps = {
  behavior: JournalInsightBehavior;
  periodId: PlanJournalPeriodId;
};

function getDayCircleStyle(
  status: NonNullable<JournalInsightBehavior["weekDays"]>[number]["status"],
) {
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

export function JournalInsightBehaviorCard({
  behavior,
  periodId,
}: JournalInsightBehaviorCardProps) {
  const isWeekly = periodId === 1;
  const periodPercent = behavior.periodPercent ?? 0;

  if (isWeekly && behavior.weekDays) {
    return (
      <View style={styles.behaviorCard}>
        <Text style={styles.behaviorName}>{behavior.name}</Text>
        <Text style={styles.behaviorDescription}>{behavior.description}</Text>
        <View style={styles.weekDaysRow}>
          {behavior.weekDays.map((day) => (
            <View key={`${day.label}-${day.date}`} style={styles.weekDayItem}>
              <View style={[styles.dayCircle, getDayCircleStyle(day.status)]} />
              <Text style={styles.weekDayLabel}>{day.label}</Text>
              <Text style={styles.weekDayDate}>{day.date}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.behaviorCard}>
      <Text style={styles.behaviorName}>{behavior.name}</Text>
      <View style={styles.behaviorRow}>
        <Text
          style={[
            styles.behaviorDescription,
            {
              flex: 1,
              flexShrink: 1,
              minWidth: 0,
              marginTop: 0,
            },
          ]}
        >
          {behavior.description}
        </Text>
        <View style={styles.periodRingWrap}>
          <TaperedCircleBorder
            size={PERIOD_RING_SIZE}
            percentage={String(periodPercent)}
            progressColor={getJournalInsightProgressColor(periodPercent)}
            borderColor={Colors.light.calendarBg}
          >
            <Text style={styles.periodCountText}>
              {behavior.periodCount ?? 0}
            </Text>
          </TaperedCircleBorder>
        </View>
      </View>
    </View>
  );
}
