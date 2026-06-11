import {
  TaperedCircleBorder,
  parsePercent,
} from "@/components/atoms/TaperedCircleBorder";
import { TopSpace } from "@/components/atoms/TopSpace";
import { Colors } from "@/constants/theme";
import { Text, View } from "react-native";
import { styles } from "../styles";

export type DashboardSubGoal = {
  id: string;
  category: "Prayer" | "Quran" | "Fasting" | "Sadaqah" | "Time Spent";
  title: string;
  value: string;
  divider: string;
  percentage?: string;
  progressColor?: string;
  showCircleTopSpace?: boolean;
};

type Props = {
  goal: DashboardSubGoal;
};

export function DashboardSubGoalRow({ goal }: Props) {
  const ringPercent = goal.percentage ? parsePercent(goal.percentage) : "0";

  return (
    <View style={styles.tahiyyatContainer}>
      <View style={styles.tahiyyatLeft}>
        <Text style={styles.tahiyyatTitle}>{goal.title}</Text>
        <Text style={styles.tahiyyatSubtitle}>
          <Text style={styles.tahiyyatNumber}>{goal.value}</Text>
          <Text style={styles.tahiyyatDivider}>{goal.divider}</Text>
        </Text>
      </View>
      <View style={styles.tahiyyatCircleWrapper}>
        <TaperedCircleBorder
          percentage={goal.percentage}
          progressColor={goal.progressColor}
          borderColor={Colors.light.calendarBg}
          size={48}
        >
          <View style={styles.circleTextContainer}>
            <Text style={styles.circleMainText}>{ringPercent}</Text>
            <Text style={styles.circlePercentText}>%</Text>
          </View>
        </TaperedCircleBorder>
        {goal.showCircleTopSpace ? <TopSpace top={8} /> : null}
      </View>
    </View>
  );
}
