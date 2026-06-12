import { TopSpace } from "@/components/atoms/TopSpace";
import { View, Text, type ViewStyle } from "react-native";
import type { CategoryRowData } from "../timeSpentData";
import { styles } from "../styles";

type Props = CategoryRowData;

export function TimeSpentCategoryRow({
  label,
  percent,
  timeLabel,
  progressPercent,
}: Props) {
  const clampedPercent = Math.min(100, Math.max(0, progressPercent));

  return (
    <View>
      <View style={styles.timeSpentCategoryRowHeader}>
        <Text style={styles.timeSpentCategoryLabel}>
          {label} ({percent}%)
        </Text>
        <View style={styles.timeSpentCategoryTimeBadge}>
          <Text style={styles.timeSpentCategoryTimeBadgeText}>{timeLabel}</Text>
        </View>
      </View>
      <TopSpace top={13} />
      <View style={styles.timeSpentCategoryProgressTrack}>
        <View
          style={[
            styles.timeSpentCategoryProgressFill,
            { width: `${clampedPercent}%` as ViewStyle["width"] },
          ]}
        />
      </View>
    </View>
  );
}
