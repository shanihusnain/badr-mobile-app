import React from "react";
import { View, Text, Pressable } from "react-native";
import { changeMembershipStyles as styles } from "../styles";

type Plan = {
  id: string;
  name: string;
  savings?: string;
  price: string;
  pricePerMonth: string;
};

type Props = {
  plan: Plan;
  isSelected: boolean;
  onPress: () => void;
};

export default function PlanCard({ plan, isSelected, onPress }: Props) {
  return (
    <Pressable
      style={[styles.planCard, isSelected && styles.planCardSelected]}
      onPress={onPress}
    >
      <View style={styles.planLeft}>
        <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
        <View style={styles.planNameContainer}>
          <Text style={isSelected ? styles.planName : styles.planNameInactive}>
            {plan.name}
          </Text>
          {plan.savings ? <Text style={styles.planSavings}>{plan.savings}</Text> : null}
        </View>
      </View>

      <View style={styles.planRight}>
        <Text style={styles.planPrice}>{plan.price}</Text>
        <Text style={styles.planPriceSub}>{plan.pricePerMonth}</Text>
      </View>
    </Pressable>
  );
}
