import { Text, View } from "react-native";
import { useTypedTranslation } from "@/i18next/useTypedTranslation";
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
  const { t } = useTypedTranslation();
  const isCompleted = variant === "completed";
  
  const translatedLabel = label === "COMPLETED" ? t("homeScreen.fastingCalendar_completed") : label;

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
            {t("homeScreen.fastingCalendar_fasts")}
          </Text>
        </View>
      </View>
    </View>
  );
}
