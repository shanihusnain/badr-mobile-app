import { CurrentStreakBorder } from "@/assets/icons/CurrentStreakBorder";
import { LongestStreakBorder } from "@/assets/icons/LongestStreakBorder";
import { TaperedCircleBorder } from "@/components/atoms/TaperedCircleBorder";
import { Colors } from "@/constants/theme";
import { Text, View } from "react-native";
import type { BehaviorDetailStreak } from "../behaviorDetailMockData";
import { behaviorDetailStyles as styles } from "../styles";

const STREAK_RING_SIZE = 72;
/** Full (100%) illuminated fill is reached at a 7-day streak. */
const STREAK_FILL_MAX_DAYS = 7;

type StreakKind = "current" | "longest";

type BehaviorDetailStreakCardProps = {
  currentStreak: BehaviorDetailStreak;
  longestStreak: BehaviorDetailStreak;
};

function streakFillPercent(count: number): number {
  if (count <= 0) return 0;
  return Math.min(100, Math.round((count / STREAK_FILL_MAX_DAYS) * 100));
}

function StreakItem({
  label,
  streak,
  kind,
}: {
  label: string;
  streak: BehaviorDetailStreak;
  kind: StreakKind;
}) {
  const fillPercent = streakFillPercent(streak.count);

  return (
    <View style={styles.streakItem}>
      <View style={styles.streakRingWrap}>
        <TaperedCircleBorder
          size={STREAK_RING_SIZE}
          percentage={`${fillPercent}%`}
          progressColor={Colors.light.white}
          borderColor={Colors.light.ringTrackEmpty}
          variant="illuminated"
          showCompleteCheckIcon={false}
          ringBadge={({ size, glowColor }) =>
            kind === "current" ? (
              <CurrentStreakBorder size={size} glowColor={glowColor} />
            ) : (
              <LongestStreakBorder size={size} glowColor={glowColor} />
            )
          }
        >
          <Text style={styles.streakCount}>{streak.count}</Text>
        </TaperedCircleBorder>
      </View>
      <Text style={styles.streakLabel}>{label}</Text>
      <Text style={styles.streakDate}>{streak.dateLabel}</Text>
    </View>
  );
}

export function BehaviorDetailStreakCard({
  currentStreak,
  longestStreak,
}: BehaviorDetailStreakCardProps) {
  return (
    <View style={styles.streakCard}>
      <StreakItem
        label="CURRENT STREAK"
        streak={currentStreak}
        kind="current"
      />
      <View style={styles.streakDivider} />
      <StreakItem
        label="LONGEST STREAK"
        streak={longestStreak}
        kind="longest"
      />
    </View>
  );
}
