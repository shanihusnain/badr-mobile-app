import { Text, View } from "react-native";
import {
  hasDurationDetails,
  hasDurationTimeline,
  hasLoggedTime,
  type TodayGoalProgressEntry,
} from "../todayGoalsProgress";
import { styles } from "../styles";

type Props = {
  entry: TodayGoalProgressEntry;
};

function DurationTimeline() {
  return (
    <View style={styles.dayProgressTimeline}>
      <View style={styles.dayProgressTimelineDot} />
      <View style={styles.dayProgressTimelineLine} />
      <View style={styles.dayProgressTimelineDot} />
    </View>
  );
}

export function TodayGoalProgressCard({ entry }: Props) {
  const showLoggedAt = hasLoggedTime(entry);
  const showDuration = hasDurationDetails(entry);
  const showTimeline = hasDurationTimeline(entry);
  const { duration } = entry;

  return (
    <View style={[styles.dayProgressCard, styles.dayProgressCardSwipeChild]}>
      <View style={styles.dayProgressHeaderRow}>
        {showLoggedAt ? (
          <View style={styles.dayProgressTimeBadgeWrapper}>
            <Text style={styles.dayProgressTimeBadge}>{entry.loggedAt}</Text>
          </View>
        ) : null}
        <Text
          style={[
            styles.dayProgressGoalTitle,
            !showLoggedAt && styles.dayProgressGoalTitleFull,
          ]}
        >
          {entry.goalTitle}
        </Text>
      </View>

      <View style={styles.dayProgressDetailRow}>
        <Text
          style={[
            styles.dayProgressDescription,
            !showDuration && styles.dayProgressDescriptionFull,
          ]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {entry.description}
        </Text>

        {showDuration ? (
          <View style={styles.dayProgressDurationRow}>
            {duration?.startTime || duration?.endTime ? (
              <View style={styles.dayProgressTimesColumn}>
                {duration?.startTime ? (
                  <Text style={styles.dayProgressMutedTime}>
                    {duration.startTime}
                  </Text>
                ) : (
                  <View style={styles.dayProgressTimePlaceholder} />
                )}
                {duration?.endTime ? (
                  <Text style={styles.dayProgressMutedTime}>
                    {duration.endTime}
                  </Text>
                ) : null}
              </View>
            ) : null}

            {showTimeline ? <DurationTimeline /> : null}

            {duration?.label ? (
              <Text style={styles.dayProgressMutedTime}>{duration.label}</Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}
