import React, { useState } from "react";
import { View, Text, SafeAreaView, Pressable } from "react-native";
import BackButton from "@/components/atoms/Backbutton";
import PrimaryButton from "@/components/atoms/Primary-button";
import { Colors } from "@/constants/theme";
import { membershipExtensionStyles as styles } from "./style";
import { useRouter } from "expo-router";

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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton bgcolor={Colors.light.greybuttonversion} />
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>MEMBERSHIP EXTENSION</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          Add extra months to your membership and lock{"\n"}in membership
          savings.
        </Text>

        {PLANS.map((plan) => (
          <Pressable
            key={plan.id}
            style={[
              styles.planCard,
              selectedPlan === plan.id && styles.planCardSelected,
            ]}
            onPress={() => handlePlanSelect(plan.id)}
          >
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>POPULAR</Text>
              </View>
            )}

            <View
              style={[
                styles.radioCircle,
                selectedPlan === plan.id && styles.radioCircleSelected,
              ]}
            >
              {selectedPlan === plan.id && <View style={styles.radioInner} />}
            </View>

            <View style={styles.planInfo}>
              <Text style={styles.planDuration}>{plan.duration}</Text>
              <Text style={styles.planSave}>{plan.save}</Text>
            </View>

            <View style={styles.planPriceBlock}>
              <Text style={styles.planPrice}>{plan.price}</Text>
              <Text style={styles.planPerMonth}>{plan.perMonth}</Text>
            </View>
          </Pressable>
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
    </SafeAreaView>
  );
}
