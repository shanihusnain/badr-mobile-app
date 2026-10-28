import { TaperedCircleBorder } from "@/components/atoms/TaperedCircleBorder";
import { Colors } from "@/constants/theme";
import { Text, View } from "react-native";
import type { JournalInsightSnapshot } from "../journalInsightMockData";
import { getJournalInsightProgressColor } from "../journalInsightProgress";
import { journalInsightStyles as styles } from "../styles";

type JournalInsightSummaryCardProps = {
  snapshot: JournalInsightSnapshot;
  isLoading?: boolean;
};

export function JournalInsightSummaryCard({
  snapshot,
  isLoading = false,
}: JournalInsightSummaryCardProps) {
  const showPlaceholder = isLoading || snapshot.consistencyPercent == null;
  const percentValue = snapshot.consistencyPercent ?? 0;
  const percentLabel = showPlaceholder ? "---" : String(percentValue);

  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryRingWrap}>
        <TaperedCircleBorder
          size={200}
          percentage={showPlaceholder ? "0%" : `${percentValue}%`}
          borderColor={Colors.light.ringTrackEmpty}
          progressColor={getJournalInsightProgressColor(percentValue)}
          variant="illuminated"
        >
          <View style={styles.summaryRingContent}>
            <Text style={styles.summaryBehaviorCount}>
              {showPlaceholder
                ? "---"
                : `${snapshot.summary.behaviorCount} Behaviors`}
            </Text>
            <Text style={styles.summaryPercent}>
              {showPlaceholder ? "---" : `${percentLabel}%`}
            </Text>
          </View>
        </TaperedCircleBorder>
      </View>
      <Text style={styles.summaryHeader}>
        {showPlaceholder ? "---" : snapshot.summary.headerTitle}
      </Text>
      <Text style={styles.summaryDescription}>
        {showPlaceholder ? "---" : snapshot.summary.description}
      </Text>
    </View>
  );
}
