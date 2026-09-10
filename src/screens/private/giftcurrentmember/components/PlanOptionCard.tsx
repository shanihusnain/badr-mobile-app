import React from "react";
import { Text, Pressable } from "react-native";
import { giftCurrentMemberStyles as styles } from "../style";

type PlanOptionCardProps = {
  id: "1_month" | "3_months" | "6_months";
  label: string;
  price: string;
  selected: boolean;
  onPress: () => void;
};

export default function PlanOptionCard({
  label,
  price,
  selected,
  onPress,
}: PlanOptionCardProps) {
  return (
    <Pressable
      style={[styles.optionCard, selected && styles.optionCardSelected]}
      onPress={onPress}
    >
      <Text style={styles.optionDuration}>{label}</Text>
      <Text style={styles.optionPrice}>{price}</Text>
    </Pressable>
  );
}
