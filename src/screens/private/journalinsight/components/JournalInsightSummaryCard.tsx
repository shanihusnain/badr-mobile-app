import { TaperedCircleBorder } from "@/components/atoms/TaperedCircleBorder";
import { Colors } from "@/constants/theme";
import { Text, View } from "react-native";
import type { JournalInsightSnapshot } from "../journalInsightMockData";
import { getJournalInsightProgressColor } from "../journalInsightProgress";
import { journalInsightStyles as styles } from "../styles";

type JournalInsightSummaryCardProps = {
  snapshot: JournalInsightSnapshot;
};

export function JournalInsightSummaryCard({
  snapshot,
}: JournalInsightSummaryCardProps) {
  const percentLabel = snapshot.consistencyPercent.toString();

  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryRingWrap}>
        <TaperedCircleBorder
          size={120}
          percentage={percentLabel}
          progressColor={getJournalInsightProgressColor(
            snapshot.consistencyPercent,
          )}
          borderColor={Colors.light.calendarBg}
        >
          <View style={styles.summaryRingContent}>
            <Text style={styles.summaryBehaviorCount}>
              {snapshot.summary.behaviorCount} Behaviors
            </Text>
            <Text style={styles.summaryPercent}>{percentLabel}%</Text>
          </View>
        </TaperedCircleBorder>
      </View>
      <Text style={styles.summaryHeader}>{snapshot.summary.headerTitle}</Text>
      <Text style={styles.summaryDescription}>
        {snapshot.summary.description}
      </Text>
    </View>
  );
}
