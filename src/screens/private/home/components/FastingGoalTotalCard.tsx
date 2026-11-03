import { Text, View } from "react-native";
import { useTypedTranslation } from "@/i18next/useTypedTranslation";
import { styles } from "../styles";

type FastingGoalTotalCardProps = {
  label: string;
  count: number;
  unit?: string;
  variant?: "default" | "completed";
};

export function FastingGoalTotalCard({
  label,
  count,
  unit,
  variant = "default",
}: FastingGoalTotalCardProps) {
  const { t } = useTypedTranslation();
  const isCompleted = variant === "completed";

  const normalizedLabel = label.trim().toUpperCase();
  const translatedLabel =
    normalizedLabel === "COMPLETED"
      ? t("homeScreen.fastingCalendar_completed")
      : label.trim() || t("homeScreen.fastingGoalTotal");
  const unitLabel = unit?.trim() || t("homeScreen.fastingCalendar_fasts");

  return (
    <View
      style={[
        styles.fastingGoalTotalCard,
        isCompleted && styles.fastingGoalTotalCardCompleted,
      ]}
    >
      <Text style={styles.fastingGoalTotalLabel}>{translatedLabel}</Text>
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
            {unitLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}
