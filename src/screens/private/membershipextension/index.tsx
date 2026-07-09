import React, { useState } from "react";
import { View, Text } from "react-native";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import PrimaryButton from "@/components/atoms/Primary-button";
import { Colors } from "@/constants/theme";
import { membershipExtensionStyles as styles } from "./style";
import { useRouter } from "expo-router";
import MembershipPlanCard from "./components/MembershipPlanCard";

type Plan = "3_months" | "6_months" | "12_months" | "24_months" | null;

const PLANS: {
  id: Plan;
  duration: string;
  save: string;
  price: string;
  perMonth: string;
  popular?: boolean;
}[] = [
  {
    id: "3_months",
    duration: "3 Months",
    save: "Save 15%",
    price: "$33.15",
    perMonth: "$11.05/MO",
  },
  {
    id: "6_months",
    duration: "6 Months",
    save: "Save 25%",
    price: "$58.50",
    perMonth: "$9.75/MO",
  },
  {
    id: "12_months",
    duration: "12 Months",
    save: "Save 36%",
    price: "$99.99",
    perMonth: "$8.33/MO",
    popular: true,
  },
  {
    id: "24_months",
    duration: "24 Months",
    save: "Save 40%",
    price: "$187.20",
    perMonth: "$7.80/MO",
  },
];

export default function MembershipExtensionScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<Plan>(null);

  const handlePlanSelect = (id: Plan) => {
    setSelectedPlan(id);
  };

  const handleContinue = () => {
    if (!selectedPlan) return;
    const chosen = PLANS.find((p) => p.id === selectedPlan);
    router.push({
      pathname: "/(private)/membershippaymentmethod",
      params: {
        mode: "saved",
        plan: selectedPlan,
        price: chosen?.price ?? "",
        quantity: 1,
      },
    });
  };

  return (
    <BlackScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.subtitle}>
          Add extra months to your membership and lock in membership savings.
        </Text>

        {PLANS.map((plan) => (
          <MembershipPlanCard
            key={plan.id}
            plan={plan}
            isSelected={selectedPlan === plan.id}
            onPress={() => handlePlanSelect(plan.id)}
          />
        ))}

        <View style={styles.bottomSection}>
          <PrimaryButton
            text="CONTINUE"
            onPress={handleContinue}
            style={
              selectedPlan
                ? undefined
                : { backgroundColor: Colors.light.inactivegreen }
            }
          />
          <Text style={styles.disclaimer}>
            Your membership will be renewed automatically{"\n"}at your current
            rate after prepaid period.
          </Text>
        </View>
      </View>
    </BlackScreenWrapper>
  );
}
