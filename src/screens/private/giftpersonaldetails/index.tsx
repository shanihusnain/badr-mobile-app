import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import CustomTextInput from "@/components/atoms/CustomTextInput";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import PrimaryButton from "@/components/atoms/Primary-button";
import { Colors } from "@/constants/theme";
import { giftPersonalDetailsStyles as styles } from "./style";
import { useLocalSearchParams, useRouter } from "expo-router";
import { GiftIconWithMoon } from "@/assets/icons";
import { TopSpace } from "@/components/atoms/TopSpace";

type DeliveryMethod = "recipient" | "me";

type Recipient = {
  name: string;
  email: string;
  message: string;
};

export default function GiftPersonalDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const quantityParam = parseInt(params.quantity as string, 10);
  const quantity = isNaN(quantityParam) || quantityParam < 1 ? 1 : quantityParam;

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("recipient");
  const [yourName, setYourName] = useState("");
  const [yourEmail, setYourEmail] = useState("");

  const [recipients, setRecipients] = useState<Recipient[]>([]);

  useEffect(() => {
    // Initialize recipients array based on quantity
    setRecipients(
      Array.from({ length: quantity }, () => ({ name: "", email: "", message: "" }))
    );
  }, [quantity]);

  const updateRecipient = (index: number, field: keyof Recipient, value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index][field] = value;
    setRecipients(newRecipients);
  };

  const isFormValid = () => {
    if (deliveryMethod === "me") {
      return yourName.trim().length > 0 && yourEmail.trim().length > 0;
    } else {
      return recipients.every(
        (r) => r.name.trim().length > 0 && r.email.trim().length > 0
      );
    }
  };

  const handleNext = () => {
    if (!isFormValid()) return;
    try {
      router.push(`/(private)/membershippaymentmethod?mode=saved&quantity=${quantity}` as any);
    } catch (e: any) {
      Alert.alert("Navigation Error", e.message || "Failed to navigate");
    }
  };

  return (
    <BlackScreenWrapper>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.iconContainer}>
            <View style={styles.iconBox}>
              <GiftIconWithMoon color={Colors.light.white} size={35} />
            </View>
          </View>

          <Text style={styles.title}>ADD A PERSONAL TOUCH{"\n"}TO YOUR GIFT</Text>
          <Text style={styles.subtitle}>
            Send your gift recipient a personalized message.
          </Text>

          <View style={styles.radioGroup}>
            <Pressable
              style={styles.radioOption}
              onPress={() => setDeliveryMethod("recipient")}
            >
              <View
                style={[
                  styles.radioCircle,
                  deliveryMethod === "recipient" && styles.radioCircleSelected,
                ]}
              >
                {deliveryMethod === "recipient" && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioLabel}>
                Email to my recipient (your gift will be sent immediately upon purchase)
              </Text>
            </Pressable>

            <Pressable
              style={styles.radioOption}
              onPress={() => setDeliveryMethod("me")}
            >
              <View
                style={[
                  styles.radioCircle,
                  deliveryMethod === "me" && styles.radioCircleSelected,
                ]}
              >
                {deliveryMethod === "me" && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioLabel}>
                Email to me, so i can print it out or forward it
              </Text>
            </Pressable>
          </View>



          {deliveryMethod === "me" ? (
            <View style={styles.recipientBlock}>
              <View style={styles.inputGroup}>
                <TopSpace top={4} />
                <CustomTextInput
                  label="Your Name"
                  labelStyle={styles.inputLabel}
                  inputStyle={styles.input}
                  placeholder="Enter your name"
                  value={yourName}
                  onChangeText={setYourName}
                />
              </View>
              <TopSpace top={4} />
              <View style={styles.inputGroup}>

                <CustomTextInput
                  label="Email Address"
                  labelStyle={styles.inputLabel}
                  inputStyle={styles.input}
                  placeholder="Enter your email address"
                  value={yourEmail}
                  onChangeText={setYourEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
          ) : (
            recipients.map((recipient, index) => (
              <View key={index} style={styles.recipientBlock}>
                {quantity > 1 && (
                  <Text style={styles.recipientBlockTitle}>Recipient #{index + 1}</Text>
                )}

                <View style={styles.inputGroup}>
                  <TopSpace top={4} />
                  <CustomTextInput
                    label="Name"
                    labelStyle={styles.inputLabel}
                    inputStyle={styles.input}
                    placeholder="Enter recipient name"
                    value={recipient.name}
                    onChangeText={(text) => updateRecipient(index, "name", text)}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <TopSpace top={4} />
                  <CustomTextInput
                    label="Email Address"
                    labelStyle={styles.inputLabel}
                    inputStyle={styles.input}
                    placeholder="Enter recipient email address"
                    value={recipient.email}
                    onChangeText={(text) => updateRecipient(index, "email", text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <TopSpace top={4} />
                  <CustomTextInput
                    label="Personalized Message"
                    labelStyle={styles.inputLabel}
                    inputStyle={[styles.textArea,{
                      height:"100%",
                      width:"100%",
                      padding:0
                    }]}
                    containerStyle={{height: 150}}
                    placeholder="Write a short message to make it special."
                    value={recipient.message}
                    onChangeText={(text) => updateRecipient(index, "message", text)}
                    multiline
                  />
                </View>
              </View>
            ))
          )}

          <View style={styles.bottomSection}>
            <PrimaryButton
              text="NEXT"
              onPress={handleNext}
              style={isFormValid() ? undefined : { backgroundColor: Colors.light.inactivegreen }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BlackScreenWrapper>
  );
}
