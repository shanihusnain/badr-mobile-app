import { Text, View } from "react-native";
import {
  hasDurationDetails,
  hasDurationTimeline,
  hasLoggedTime,
  type TodayGoalProgressEntry,
} from "../todayGoalsProgress";
import { styles } from "../styles";
import { useTypedTranslation } from "@/i18next/useTypedTranslation";
import i18next from "i18next";

type Props = {
  entry: TodayGoalProgressEntry;
};

/** Resolve the translated title for a today goal by its id.
 *  Falls back to the static English title when no key exists. */
function getTodayGoalTitle(id: string, fallback: string): string {
  const key = `homeScreen.todayGoal_${id}` as any;
  const result = i18next.t(key);
  // i18next returns the key itself when not found
  return result === key ? fallback : result;
}

/** Resolve the translated description for a today goal by its id.
 *  Falls back to the static English description when no key exists. */
function getTodayGoalDesc(id: string, fallback: string): string {
  const key = `homeScreen.todayGoalDesc_${id}` as any;
  const result = i18next.t(key);
  // i18next returns the key itself when not found
  return result === key ? fallback : result;
}

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
  const { t } = useTypedTranslation();
  const showLoggedAt = hasLoggedTime(entry);
  const showDuration = hasDurationDetails(entry);
  const showTimeline = hasDurationTimeline(entry);
  const { duration } = entry;

  const translatedTitle = getTodayGoalTitle(entry.id, entry.goalTitle);
  const translatedDesc = getTodayGoalDesc(entry.id, entry.description);

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
          {translatedTitle}
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
          {translatedDesc}
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
