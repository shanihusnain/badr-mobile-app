import Checkbox from "expo-checkbox";
import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import Backbutton from "../../../components/atoms/Backbutton";
import PrimaryButton from "../../../components/atoms/Primary-button";
import SecondaryButton from "../../../components/atoms/Secondary-button";
import GreyButton from "../../../components/atoms/greyButton";
import { Colors } from "../../../constants/theme";
import { styles } from "./style";
export default function DebitCreditScreen() {
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [cardNumber, setCardNumber] = useState("");
  const [cardDate, setCardDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [userName, setUserName] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Backbutton />
        <Text style={styles.title}>DEBIT / CREDIT CARD</Text>
        <View style={styles.placeholder} />
      </View>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.buttonRow}>
          <PrimaryButton
            text="Debit Card"
            onPress={() => setSelectedPlan("monthly")}
            style={
              selectedPlan === "monthly"
                ? styles.planButton
                : [styles.planButton, styles.unselectedPlanButton]
            }
          />
          <GreyButton
            text="Credit Card"
            onPress={() => setSelectedPlan("other")}
            style={
              selectedPlan === "other"
                ? [styles.greyButton, styles.selectedGreyButton]
                : styles.greyButton
            }
          />
        </View>
        <View style={styles.cardNumberWrapper}>
          <Text style={styles.cardNumberLabel}>Card Number</Text>
          <View style={styles.cardNumberContainer}>
            <TextInput
              style={styles.cardNumberInput}
              placeholder="Enter card number"
              placeholderTextColor={Colors.light.placeholder}
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="numeric"
            />
          </View>
        </View>
        <View style={styles.cardDetailsRow}>
          <View style={styles.cardDetailWrapper}>
            <Text style={styles.cardDetailLabel}>Card Date</Text>
            <View style={styles.cardDetailContainer}>
              <TextInput
                style={styles.cardDetailInput}
                placeholder="MM/YY"
                placeholderTextColor={Colors.light.placeholder}
                value={cardDate}
                onChangeText={setCardDate}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.cardDetailWrapper}>
            <Text style={styles.cardDetailLabel}>CVV</Text>
            <View style={styles.cardDetailContainer}>
              <TextInput
                style={styles.cardDetailInput}
                placeholder="123"
                placeholderTextColor={Colors.light.placeholder}
                value={cvv}
                onChangeText={setCvv}
                keyboardType="numeric"
                secureTextEntry
              />
            </View>
          </View>
        </View>
        <View style={styles.userNameWrapper}>
          <Text style={styles.userNameLabel}>Name</Text>
          <View style={styles.userNameContainer}>
            <TextInput
              style={styles.userNameInput}
              placeholder="Enter name"
              placeholderTextColor={Colors.light.placeholder}
              value={userName}
              onChangeText={setUserName}
            />
          </View>
        </View>
        <View style={styles.checkboxWrapper}>
          <Checkbox
            value={saveCard}
            onValueChange={setSaveCard}
            color={saveCard ? Colors.light.green : undefined}
            style={styles.checkbox}
          />
          <Text style={styles.checkboxLabel}>
            Save card for future checkouts
          </Text>
        </View>
        <View style={styles.actionButtonsWrapper}>
          <PrimaryButton
            text="Pay Now"
            onPress={() => {
              // Add payment action here
            }}
            style={styles.primaryActionButton}
          />
          <SecondaryButton
            text="Cancel Payment"
            onPress={() => {
              // Add cancel action here
            }}
            style={styles.cancelButton}
            textStyle={styles.cancelButtonText}
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
