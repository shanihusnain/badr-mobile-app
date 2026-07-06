import {
  CresentAndStarIcon,
  HomeBondIcon,
  PersonalGrowthIcon,
  SocialResponsibilityIcon,
} from "@/assets/icons";
import { TaperedCircleBorder } from "@/components/atoms/TaperedCircleBorder";
import { Colors } from "@/constants/theme";
import { Pressable, Text, View } from "react-native";
import type { PlanJournalHabit } from "../planJournalConsistencyMockData";
import { planStyles as styles } from "../styles";

type JournalHabitCardProps = {
  habit: PlanJournalHabit;
  onPress: () => void;
};

function getHabitIcon(id: number) {
  switch (id) {
    case 1:
      return <CresentAndStarIcon color={Colors.light.white} />;
    case 2:
      return <PersonalGrowthIcon color={Colors.light.white} />;
    case 3:
      return <SocialResponsibilityIcon color={Colors.light.white} />;
    default:
      return <HomeBondIcon color={Colors.light.white} />;
  }
}

function getProgressColor(percent: number) {
  if (percent <= 33) return Colors.light.white;
  if (percent <= 66) return Colors.light.yellow;
  return Colors.light.green;
}

export function JournalHabitCard({ habit, onPress }: JournalHabitCardProps) {
  const percentLabel = habit.percent.toString() || "0";

  return (
    <Pressable style={styles.journalHabitCard} onPress={onPress}>
      <View style={styles.journalHabitRow}>
        <View style={styles.journalHabitIconWrap}>
          {getHabitIcon(habit.id)}
        </View>
        <Text style={styles.journalHabitName}>{habit.name}</Text>
        <TaperedCircleBorder
          size={20}
          percentage={percentLabel}
          progressColor={getProgressColor(habit.percent)}
          borderColor={Colors.light.calendarBg}
        >
          <View style={styles.journalHabitPercentRow}>
            <Text style={styles.journalHabitPercentText}>{percentLabel}%</Text>
          </View>
        </TaperedCircleBorder>
      </View>
    </Pressable>
  );
}
