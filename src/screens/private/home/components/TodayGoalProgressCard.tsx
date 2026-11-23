import { Text, View } from "react-native";
import {
  hasDurationDetails,
  hasDurationTimeline,
  hasLoggedTime,
  type TodayGoalProgressEntry,
} from "../todayGoalsProgress";
import { styles } from "../styles";
import i18next from "i18next";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { Colors } from "@/constants/theme";
import { resolveMyDayEntryIcon } from "../resolveMyDayEntryIcon";

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
  const showLoggedAt = hasLoggedTime(entry);
  const showDuration = hasDurationDetails(entry);
  const showTimeline = hasDurationTimeline(entry);
  const { duration } = entry;

  const translatedTitle = getTodayGoalTitle(entry.id, entry.goalTitle);
  const translatedDesc = getTodayGoalDesc(entry.id, entry.description);
  // Larger circle + ~72% glyph fill to match Figma weight (still clipped safely).
  const iconCircleSize = Math.min(hp(3.2), wp(11.5));
  const iconSize = iconCircleSize * 0.7;
  const entryIcon = resolveMyDayEntryIcon(entry, Colors.light.white, iconSize);

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
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            minWidth: 0,
          }}
        >
          <View
            style={{
              height: iconCircleSize,
              width: iconCircleSize,
              borderRadius: iconCircleSize / 2,
              backgroundColor: Colors.light.ibadahIconCircleBg,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {entryIcon}
          </View>
          <Text
            style={[
              styles.dayProgressDescription,
              !showDuration && styles.dayProgressDescriptionFull,
              { flex: 1, flexShrink: 1 },
            ]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {translatedDesc}
          </Text>
        </View>

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
