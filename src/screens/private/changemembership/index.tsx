import React, { useState } from "react";
import {
    View,
    Text,
    SafeAreaView,
    Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { changeMembershipStyles as styles } from "./styles";
import { useRouter } from "expo-router";
import PrimaryButton from "@/components/atoms/Primary-button";
import SecondaryButton from "@/components/atoms/Secondary-button";
import WarningModal from "@/components/atoms/WarningModal";

type Plan = {
    id: string;
    name: string;
    savings?: string;
    price: string;
    pricePerMonth: string;
};

const PLANS: Plan[] = [
    {
        id: "annual",
        name: "Annual",
        savings: "Save 36%",
        price: "$99.99",
        pricePerMonth: "$8.33/MO",
    },
    {
        id: "six_months",
        name: "6 Months",
        savings: "Save 25%",
        price: "$58.50",
        pricePerMonth: "$9.75/MO",
    },
    {
        id: "monthly",
        name: "Monthly",
        price: "$13.00",
        pricePerMonth: "$13.00/MO",
    },
];

export default function ChangeMembershipScreen() {
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState("annual");
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleBack = () => {
        router.back();
    };

    const handlePrimaryAction = () => {
        if (selectedPlan === "annual") {
            router.back();
        } else {
            setIsModalVisible(true);
        }
    };

    const handleConfirmChange = () => {
        setIsModalVisible(false);
        router.back();
    };

    const handleCancel = () => {
        router.back();
    };

    const buttonLabel = selectedPlan === "annual"
        ? "KEEP ANNUAL MEMBERSHIP"
        : selectedPlan === "six_months"
            ? "CHANGE TO 6 MONTH PLAN"
            : "CHANGE TO MONTHLY PLAN";

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={handleBack}>
                    <Feather name="chevron-left" size={24} color={Colors.light.white} />
                </Pressable>
            </View>

            <View style={styles.content}>
                <Text style={styles.screenTitle}>CHANGE MEMBERSHIP</Text>
                <Text style={styles.subtitle}>
                    Your current plan remains the same. Changes{"\n"}take effect from the start of the new period.
                </Text>

                {PLANS.map((plan) => {
                    const isSelected = selectedPlan === plan.id;
                    return (
                        <Pressable
                            key={plan.id}
                            style={[styles.planCard, isSelected && styles.planCardSelected]}
                            onPress={() => setSelectedPlan(plan.id)}
                        >
                            <View style={styles.planLeft}>
                                <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                                    {isSelected && <View style={styles.radioInner} />}
                                </View>
                                <View style={styles.planNameContainer}>
                                    <Text style={isSelected ? styles.planName : styles.planNameInactive}>
                                        {plan.name}
                                    </Text>
                                    {plan.savings ? (
                                        <Text style={styles.planSavings}>{plan.savings}</Text>
                                    ) : null}
                                </View>
                            </View>

                            <View style={styles.planRight}>
                                <Text style={styles.planPrice}>{plan.price}</Text>
                                <Text style={styles.planPriceSub}>{plan.pricePerMonth}</Text>
                            </View>
                        </Pressable>
                    );
                })}
            </View>

            <View style={styles.bottomContainer}>
                <PrimaryButton text={buttonLabel} onPress={handlePrimaryAction} />
                <SecondaryButton text="CANCEL" onPress={handleCancel} variant="green" />
            </View>

            <WarningModal
                visible={isModalVisible}
                title="ARE YOU SURE?"
                message={
                    selectedPlan === "monthly"
                        ? "By switching to monthly, you'd miss\n out non 36% annual savings and will\n be billed monthly."
                        : "By switching to 6 months, you'd miss\n out on 25% annual savings and will\n be billed every 6 months."
                }
                primaryButtonText={
                    selectedPlan === "monthly"
                        ? "Yes, Switch to Monthly"
                        : "Yes, Switch to 6-Months Plan"
                }
                secondaryButtonText="Keep Annual Membership"
                onPrimaryPress={handleConfirmChange}
                onSecondaryPress={() => setIsModalVisible(false)}
                onBackdropPress={() => setIsModalVisible(false)}
            />
        </SafeAreaView>
    );
}
