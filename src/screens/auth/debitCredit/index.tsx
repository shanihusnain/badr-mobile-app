import Checkbox from "expo-checkbox";
import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

import { styles } from "./style";
import { useTranslation } from "react-i18next";
import PrimaryButton from "@/components/atoms/Primary-button";
import BackButton from "@/components/atoms/Backbutton";
import GreyButton from "@/components/atoms/greyButton";
import { Colors } from "@/constants/theme";
import SecondaryButton from "@/components/atoms/Secondary-button";
import { TopSpace } from "@/components/atoms/TopSpace";
export default function DebitCreditScreen() {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [cardNumber, setCardNumber] = useState("");
  const [cardDate, setCardDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [userName, setUserName] = useState("");
  const [saveCard, setSaveCard] = useState(false);

  const handlePayNow = () => {
    // Add payment action here
  };

  const handleCancelPayment = () => {
    // Add cancel action here
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.title}>{t("debitCreditScreen.header")}</Text>
        <View style={styles.placeholder} />
      </View>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.buttonRow}>
          <PrimaryButton
            text={t("debitCreditScreen.debitCardTab")}
            onPress={() => setSelectedPlan("monthly")}
            style={
              selectedPlan === "monthly"
                ? styles.planButton
                : [styles.planButton, styles.unselectedPlanButton]
            }
          />
          <GreyButton
            text={t("debitCreditScreen.creditCardTab")}
            onPress={() => setSelectedPlan("other")}
            style={
              selectedPlan === "other"
                ? [styles.greyButton, styles.selectedGreyButton]
                : styles.greyButton
            }
          />
        </View>
        <View style={styles.cardNumberWrapper}>
          <Text style={styles.cardNumberLabel}>
            {t("debitCreditScreen.cardNumberLabel")}
          </Text>
          <View style={styles.cardNumberContainer}>
            <TextInput
              style={styles.cardNumberInput}
              placeholder={t("debitCreditScreen.cardNumberPlaceholder")}
              placeholderTextColor={Colors.light.placeholder}
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="numeric"
            />
          </View>
        </View>
        <View style={styles.cardDetailsRow}>
          <View style={styles.cardDetailWrapper}>
            <Text style={styles.cardDetailLabel}>
              {t("debitCreditScreen.cardDateLabel")}
            </Text>
            <View style={styles.cardDetailContainer}>
              <TextInput
                style={styles.cardDetailInput}
                placeholder={t("debitCreditScreen.cardDatePlaceholder")}
                placeholderTextColor={Colors.light.placeholder}
                value={cardDate}
                onChangeText={setCardDate}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.cardDetailWrapper}>
            <Text style={styles.cardDetailLabel}>
              {t("debitCreditScreen.cvvLabel")}
            </Text>
            <View style={styles.cardDetailContainer}>
              <TextInput
                style={styles.cardDetailInput}
                placeholder={t("debitCreditScreen.cvvPlaceholder")}
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
          <Text style={styles.userNameLabel}>
            {t("debitCreditScreen.nameLabel")}
          </Text>
          <View style={styles.userNameContainer}>
            <TextInput
              style={styles.userNameInput}
              placeholder={t("debitCreditScreen.namePlaceholder")}
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
            {t("debitCreditScreen.saveCardLabel")}
          </Text>
        </View>
        <View style={styles.actionButtonsWrapper}>
          <TopSpace top={20} />
          <PrimaryButton
            text={t("debitCreditScreen.payNowBtn")}
            onPress={handlePayNow}
            style={styles.primaryActionButton}
          />
            <TopSpace top={10} />
          <SecondaryButton
            text={t("debitCreditScreen.cancelPaymentBtn")}
            onPress={handleCancelPayment}
            style={styles.cancelButton}
            textStyle={styles.cancelButtonText}
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
