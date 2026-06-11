import { Text, View } from "react-native";
import { styles } from "../styles";

type FastingGoalTotalCardProps = {
  label: string;
  count: number;
  variant?: "default" | "completed";
};

export function FastingGoalTotalCard({
  label,
  count,
  variant = "default",
}: FastingGoalTotalCardProps) {
  const isCompleted = variant === "completed";

  return (
    <View
      style={[
        styles.fastingGoalTotalCard,
        isCompleted && styles.fastingGoalTotalCardCompleted,
      ]}
    >
      <Text style={styles.fastingGoalTotalLabel}>{label}</Text>
      <View style={styles.fastingGoalTotalValueRow}>
        <Text
          style={[
            styles.fastingGoalTotalValue,
            isCompleted && styles.fastingGoalTotalValueCompleted,
          ]}
        >
          {count}
        </Text>
        <View
          style={[
            styles.fastingGoalTotalBadge,
            isCompleted && styles.fastingGoalTotalBadgeCompleted,
          ]}
        >
          <Text
            style={[
              styles.fastingGoalTotalBadgeText,
              isCompleted && styles.fastingGoalTotalBadgeTextCompleted,
            ]}
          >
            fasts
          </Text>
        </View>
      </View>
    </View>
  );
}
