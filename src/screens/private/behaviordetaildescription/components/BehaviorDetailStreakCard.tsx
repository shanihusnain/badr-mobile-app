import { TaperedCircleBorder } from "@/components/atoms/TaperedCircleBorder";
import { Colors } from "@/constants/theme";
import { Text, View } from "react-native";
import type { BehaviorDetailStreak } from "../behaviorDetailMockData";
import { behaviorDetailStyles as styles } from "../styles";

const STREAK_RING_SIZE = 64;

type BehaviorDetailStreakCardProps = {
  currentStreak: BehaviorDetailStreak;
  longestStreak: BehaviorDetailStreak;
};

function StreakItem({
  label,
  streak,
}: {
  label: string;
  streak: BehaviorDetailStreak;
}) {
  const progressPercent = String(streak.progressPercent ?? (streak.count > 0 ? 100 : 0));

  return (
    <View style={styles.streakItem}>
      <View style={styles.streakRingWrap}>
        <TaperedCircleBorder
          size={STREAK_RING_SIZE}
          percentage={progressPercent}
          progressColor={Colors.light.green}
          borderColor={Colors.light.calendarBg}
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
      <StreakItem label="CURRENT STREAK" streak={currentStreak} />
      <StreakItem label="LONGEST STREAK" streak={longestStreak} />
    </View>
  );
}
