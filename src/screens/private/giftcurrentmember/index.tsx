import React, { useState } from "react";
import { View, Text, SafeAreaView, Pressable, TextInput, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import BackButton from "@/components/atoms/Backbutton";
import PrimaryButton from "@/components/atoms/Primary-button";
import SecondaryButton from "@/components/atoms/Secondary-button";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { giftCurrentMemberStyles as styles } from "./style";
import { useRouter } from "expo-router";

type Plan = "1_month" | "3_months" | "6_months" | null;
type DeliveryMethod = "recipient" | "me";

export default function GiftCurrentMemberScreen() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPlan, setSelectedPlan] = useState<Plan>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("recipient");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [yourName, setYourName] = useState("");

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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.flex1} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <View style={styles.header}>
              <BackButton 
                bgcolor={Colors.light.greybuttonversion} 
                onPress={step === 2 ? handleBack : undefined} 
              />
            </View>

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
                  <Pressable
                    style={[
                      styles.optionCard,
                      selectedPlan === "1_month" && styles.optionCardSelected,
                    ]}
                    onPress={() => setSelectedPlan("1_month")}
                  >
                    <Text style={styles.optionDuration}>1 Month</Text>
                    <Text style={styles.optionPrice}>$9.99</Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.optionCard,
                      selectedPlan === "3_months" && styles.optionCardSelected,
                    ]}
                    onPress={() => setSelectedPlan("3_months")}
                  >
                    <Text style={styles.optionDuration}>3 Months</Text>
                    <Text style={styles.optionPrice}>$29.99</Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.optionCard,
                      selectedPlan === "6_months" && styles.optionCardSelected,
                    ]}
                    onPress={() => setSelectedPlan("6_months")}
                  >
                    <Text style={styles.optionDuration}>6 Months</Text>
                    <Text style={styles.optionPrice}>$54.99</Text>
                  </Pressable>
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
                    <Text style={styles.inputLabel}>Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter recipient name"
                      placeholderTextColor={Colors.light.icon}
                      value={recipientName}
                      onChangeText={setRecipientName}
                    />

                    <Text style={styles.inputLabel}>Email Address</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter recipient email address"
                      placeholderTextColor={Colors.light.icon}
                      value={recipientEmail}
                      onChangeText={setRecipientEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />

                    <Text style={styles.inputLabel}>Personalized Message</Text>
                    <View style={styles.multilineInputContainer}>
                      <TextInput
                        style={styles.multilineInputInner}
                        placeholder="Write a short message to make it special."
                        placeholderTextColor={Colors.light.icon}
                        value={personalMessage}
                        onChangeText={setPersonalMessage}
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
                    <Text style={styles.inputLabel}>Your Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Layla Najia"
                      placeholderTextColor={Colors.light.icon}
                      value={yourName}
                      onChangeText={setYourName}
                    />

                    <Text style={styles.inputLabel}>Email Address</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="layla.najia@gmail.com"
                      placeholderTextColor={Colors.light.icon}
                      value={recipientEmail}
                      onChangeText={setRecipientEmail}
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
    </SafeAreaView>
  );
}
