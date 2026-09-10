import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { membershipExtensionStyles as styles } from "../style";

type Plan = "3_months" | "6_months" | "12_months" | "24_months" | null;

type MembershipPlanCardProps = {
  plan: {
    id: Plan;
    duration: string;
    save: string;
    price: string;
    perMonth: string;
    popular?: boolean;
  };
  isSelected: boolean;
  onPress: () => void;
};

export default function MembershipPlanCard({
  plan,
  isSelected,
  onPress,
}: MembershipPlanCardProps) {
  return (
    <TouchableOpacity
      style={[styles.planCard, isSelected && styles.planCardSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {plan.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>POPULAR</Text>
        </View>
      )}

      <View
        style={[
          styles.radioCircle,
          isSelected && styles.radioCircleSelected,
        ]}
      >
        {isSelected && <View style={styles.radioInner} />}
      </View>

      <View style={styles.planInfo}>
        <Text style={styles.planDuration}>{plan.duration}</Text>
        <Text style={styles.planSave}>{plan.save}</Text>
      </View>

      <View style={styles.planPriceBlock}>
        <Text style={styles.planPrice}>{plan.price}</Text>
        <Text style={styles.planPerMonth}>{plan.perMonth}</Text>
      </View>
    </TouchableOpacity>
  );
}
