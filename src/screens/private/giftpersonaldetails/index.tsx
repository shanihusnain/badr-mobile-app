import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import PrimaryButton from "@/components/atoms/Primary-button";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { giftPersonalDetailsStyles as styles } from "./style";
import { useLocalSearchParams, useRouter } from "expo-router";

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
    router.push({
      pathname: "/(private)/membershippaymentmethod",
      params: { mode: "saved", quantity },
    });
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
              <Feather name="gift" size={32} color={Colors.light.white} />
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
                <Text style={styles.inputLabel}>Your Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor={Colors.light.placeholder}
                  value={yourName}
                  onChangeText={setYourName}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email address"
                  placeholderTextColor={Colors.light.placeholder}
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
                  <Text style={styles.inputLabel}>Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter recipient name"
                    placeholderTextColor={Colors.light.placeholder}
                    value={recipient.name}
                    onChangeText={(text) => updateRecipient(index, "name", text)}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter recipient email address"
                    placeholderTextColor={Colors.light.placeholder}
                    value={recipient.email}
                    onChangeText={(text) => updateRecipient(index, "email", text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Personalized Message</Text>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Write a short message to make it special."
                    placeholderTextColor={Colors.light.placeholder}
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
              style={isFormValid() ? undefined : { backgroundColor: "#156345" }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BlackScreenWrapper>
  );
}
