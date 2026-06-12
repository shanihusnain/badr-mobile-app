import { Colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TouchableOpacity, View } from "react-native";
import { styles } from "../styles";
import { FastingPlannedLegend } from "./FastingPlannedLegend";
import { FastingProgressLegend } from "./FastingProgressLegend";

type FastingLegendCardProps = {
  onClose?: () => void;
  variant?: "planned" | "progress";
};

export function FastingLegendCard({
  onClose,
  variant = "progress",
}: FastingLegendCardProps) {
  return (
    <View style={styles.fastingLegendCard}>
      <TouchableOpacity
        style={styles.fastingLegendCardClose}
        onPress={onClose}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={18} color={Colors.light.white} />
      </TouchableOpacity>
      <View style={styles.fastingLegendCardContent}>
        {variant === "planned" ? (
          <FastingPlannedLegend />
        ) : (
          <FastingProgressLegend />
        )}
      </View>
    </View>
  );
}
