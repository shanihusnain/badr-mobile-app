import React, { useState } from "react";
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import PrimaryButton from "@/components/atoms/Primary-button";
import SecondaryButton from "@/components/atoms/Secondary-button";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { giftCurrentMemberStyles as styles } from "./style";
import { useRouter } from "expo-router";
import PlanOptionCard from "./components/PlanOptionCard";
import CustomTextInput from "@/components/atoms/CustomTextInput";
import { useForm } from "react-hook-form";

type Plan = "1_month" | "3_months" | "6_months" | null;
type DeliveryMethod = "recipient" | "me";

const PLAN_OPTIONS: { id: "1_month" | "3_months" | "6_months"; label: string; price: string }[] = [
  { id: "1_month", label: "1 Month", price: "$9.99" },
  { id: "3_months", label: "3 Months", price: "$29.99" },
  { id: "6_months", label: "6 Months", price: "$54.99" },
];

export default function GiftCurrentMemberScreen() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPlan, setSelectedPlan] = useState<Plan>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("recipient");
  const { control, watch } = useForm({
    defaultValues: {
      recipientName: "",
      recipientEmail: "",
      personalMessage: "",
      yourName: "",
    },
  });
  const { recipientName = "", recipientEmail = "", personalMessage = "", yourName = "" } = watch();

  const handleNext = () => {
    if (step === 1 && selectedPlan) {
      setStep(2);
    } else if (step === 2) {
      router.push({
        pathname: "/(private)/membershippaymentmethod",
        params: { plan: selectedPlan, deliveryMethod, mode: "new" },
      });
    }
  };

  const handleSavedPayment = () => {
    router.push({
      pathname: "/(private)/membershippaymentmethod",
      params: { plan: selectedPlan, deliveryMethod, mode: "saved" },
    });
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const isStep2Valid = () => {
    if (deliveryMethod === "recipient") {
      return recipientName.trim().length > 0 && recipientEmail.trim().length > 0;
    } else {
      return yourName.trim().length > 0 && recipientEmail.trim().length > 0;
    }
  };

  return (
    <BlackScreenWrapper>
      <KeyboardAvoidingView 
        style={styles.flex1} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            {step === 1 && (
              <>
                <View style={styles.headerTitleContainer}>
                  <Text style={styles.title}>SELECT GIFT EXTENSION</Text>
                  <Text style={styles.subtitle}>
                    Current members apply this digital{"\n"}extension to their membership
                  </Text>
                </View>

                <View style={styles.moonContainer}>
                  {/* Placeholder for the moon image */}
                  <View style={styles.moonPlaceholder} />
                </View>

                <View style={styles.optionsContainer}>
                  {PLAN_OPTIONS.map((option) => (
                    <PlanOptionCard
                      key={option.id}
                      id={option.id}
                      label={option.label}
                      price={option.price}
                      selected={selectedPlan === option.id}
                      onPress={() => setSelectedPlan(option.id)}
                    />
                  ))}
                </View>
              </>
            )}

            {step === 2 && (
              <View style={styles.step2Container}>
                <View style={styles.iconContainer}>
                  <View style={styles.circleIcon}>
                    <Feather name="gift" size={32} color={Colors.light.white} />
                  </View>
                </View>

                <Text style={styles.step2Title}>ADD A PERSONAL TOUCH{"\n"}TO YOUR GIFT</Text>
                <Text style={styles.step2Subtitle}>
                  Send your gift recipient a personalized message.
                </Text>

                <Pressable style={styles.radioRow} onPress={() => setDeliveryMethod("recipient")}>
                  <View style={[styles.radioOuter, deliveryMethod === "recipient" && styles.radioOuterSelected]}>
                    {deliveryMethod === "recipient" && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>
                    Email to my recipient (your gift will be sent immediately upon purchase)
                  </Text>
                </Pressable>

                <Pressable style={styles.radioRow} onPress={() => setDeliveryMethod("me")}>
                  <View style={[styles.radioOuter, deliveryMethod === "me" && styles.radioOuterSelected]}>
                    {deliveryMethod === "me" && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>
                    Email to me, so i can print it out or forward it
                  </Text>
                </Pressable>

                {deliveryMethod === "recipient" ? (
                  <>
                    <CustomTextInput
                      label="Name"
                      placeholder="Enter recipient name"
                      control={control}
                      name="recipientName"
                      inputStyle={styles.input}
                    />

                    <CustomTextInput
                      label="Email Address"
                      placeholder="Enter recipient email address"
                      control={control}
                      name="recipientEmail"
                      inputStyle={styles.input}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />

                    <Text style={styles.inputLabel}>Personalized Message</Text>
                    <View style={styles.multilineInputContainer}>
                      <CustomTextInput
                        placeholder="Write a short message to make it special."
                        control={control}
                        name="personalMessage"
                        inputStyle={styles.multilineInputInner}
                        multiline
                      />
                      <PrimaryButton
                        text="NEXT"
                        onPress={handleNext}
                        style={isStep2Valid() ? undefined : styles.nextButtonInactiveGray}
                      />
                    </View>
                  </>
                ) : (
                  <>
                    <CustomTextInput
                      label="Your Name"
                      placeholder="Layla Najia"
                      control={control}
                      name="yourName"
                      inputStyle={styles.input}
                    />

                    <CustomTextInput
                      label="Email Address"
                      placeholder="layla.najia@gmail.com"
                      control={control}
                      name="recipientEmail"
                      inputStyle={styles.input}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </>
                )}
              </View>
            )}
            {/* Render bottom button for Step 1 or Step 2 (me) */}
            {!(step === 2 && deliveryMethod === "recipient") && (
              <View style={styles.buttonContainer}>
                <PrimaryButton
                  text="NEXT"
                  onPress={handleNext}
                  style={
                    (step === 1 && selectedPlan) || (step === 2 && isStep2Valid())
                      ? undefined
                      : styles.nextButtonInactive
                  }
                />
                {step === 2 && (
                  <SecondaryButton
                    text="SAVED PAYMENT"
                    onPress={handleSavedPayment}
                    variant="green"
                    style={styles.savedPaymentButton}
                  />
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BlackScreenWrapper>
  );
}
