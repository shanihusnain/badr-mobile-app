import React, { useState } from "react";
import {
    View,
    Text,
    Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { changeMembershipStyles as styles } from "./styles";
import { useRouter } from "expo-router";
import PrimaryButton from "@/components/atoms/Primary-button";
import SecondaryButton from "@/components/atoms/Secondary-button";
import WarningModal from "@/components/atoms/WarningModal";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import PlanCard from "./components/PlanCard";

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

const getWarningModalContent = (planId: string) => {
    if (planId === "monthly") {
        return {
            message: "By switching to monthly, you'd miss\n out non 36% annual savings and will\n be billed monthly.",
            primaryButtonText: "Yes, Switch to Monthly",
        };
    }

    return {
        message: "By switching to 6 months, you'd miss\n out on 25% annual savings and will\n be billed every 6 months.",
        primaryButtonText: "Yes, Switch to 6-Months Plan",
    };
};

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

    const warningModalContent = getWarningModalContent(selectedPlan);

    return (
        <BlackScreenWrapper>
            <View style={styles.content}>
                <Text style={styles.screenTitle}>CHANGE MEMBERSHIP</Text>
                <Text style={styles.subtitle}>
                    Your current plan remains the same. Changes{"\n"}take effect from the start of the new period.
                </Text>

                {PLANS.map((plan) => {
                    const isSelected = selectedPlan === plan.id;
                    return (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            isSelected={isSelected}
                            onPress={() => setSelectedPlan(plan.id)}
                        />
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
                message={warningModalContent.message}
                primaryButtonText={warningModalContent.primaryButtonText}
                secondaryButtonText="Keep Annual Membership"
                onPrimaryPress={handleConfirmChange}
                onSecondaryPress={() => setIsModalVisible(false)}
                onBackdropPress={() => setIsModalVisible(false)}
            />
        </BlackScreenWrapper>
    );
}
