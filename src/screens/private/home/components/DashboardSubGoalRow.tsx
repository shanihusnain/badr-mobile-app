import {
  TaperedCircleBorder,
  parsePercent,
} from "@/components/atoms/TaperedCircleBorder";
import { TopSpace } from "@/components/atoms/TopSpace";
import { Colors } from "@/constants/theme";
import { Text, View } from "react-native";
import { styles } from "../styles";
import { useTypedTranslation } from "@/i18next/useTypedTranslation";
import i18next from "i18next";

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

/** Resolve the translated title for a sub-goal by its id.
 *  Falls back to the static English title when no key exists. */
function getSubGoalTitle(id: string, fallback: string): string {
  const key = `homeScreen.subGoal_${id}` as any;
  const result = i18next.t(key);
  // i18next returns the key itself when not found
  return result === key ? fallback : result;
}

export function DashboardSubGoalRow({ goal }: Props) {
  const { t } = useTypedTranslation();
  const ringPercent = goal.percentage ? parsePercent(goal.percentage) : "0";
  const translatedTitle = getSubGoalTitle(goal.id, goal.title);

  return (
    <View style={styles.tahiyyatContainer}>
      <View style={styles.tahiyyatLeft}>
        <Text style={styles.tahiyyatTitle}>{translatedTitle}</Text>
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
