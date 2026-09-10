import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { planStyles as styles } from "../styles";

type PlanSectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function PlanSectionHeader({
  title,
  actionLabel,
  onActionPress,
}: PlanSectionHeaderProps) {
  return (
    <View style={styles.sectionHeaderRow}>
      <Text style={styles.sectionHeaderTitle}>{title}</Text>
      {actionLabel ? (
        <Pressable style={styles.sectionHeaderActionRow} onPress={onActionPress}>
          <Text style={styles.sectionHeaderTitle}>{actionLabel}</Text>
          <Feather name="chevron-right" size={18} color={Colors.light.white} />
        </Pressable>
      ) : null}
    </View>
  );
}
