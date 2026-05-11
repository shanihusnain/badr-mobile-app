import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PrimaryButton from "../../../components/atoms/Primary-button";
import GreyButton from "../../../components/atoms/greyButton";
import CustomSlider from "./components/CustomSlider";
import PaymentMethodCard from "./components/PaymentMethodCard";
import { usePaymentMethodProps } from "./usePaymentMethodProps";

export default function PaymentMethodScreen() {
  const {
    selectedPlan,
    activeSlide,
    styles,
    slides,
    handleSlideChange,
    handleSelectMonthly,
    handleSelectOther,
    handleDebitCreditPress,
    getTabButtonStyle,
  } = usePaymentMethodProps();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        //make component of it
        <Text style={styles.text}>We're Not Charging You Yet</Text>
        //make component of it
        <Text style={styles.subtitletext}>
          A valid payment method is required to start your free trial. You can
          change plans or cancel anytime.
        </Text>
        //make component of it
        <Text style={styles.undertext}>
          First 2 months free, then just $10.99/month. Cancel anytime.
        </Text>
        //make component of it
        <View style={styles.buttonRow}>
          <PrimaryButton
            text="Monthly Plan"
            onPress={handleSelectMonthly}
            style={getTabButtonStyle("monthly")}
          />
          <GreyButton
            text="View Other Plans"
            onPress={handleSelectOther}
            style={getTabButtonStyle("other")}
          />
        </View>
        <Text style={styles.underbuttontext}>Choose Payment Method</Text>
        <View style={styles.formWrapper}>
          {selectedPlan === "other" ? (
            <View style={styles.cardContainer}>
              <CustomSlider
                slides={slides}
                activeSlide={activeSlide}
                onSlideChange={handleSlideChange}
              />
            </View>
          ) : (
            <>
              <PaymentMethodCard
                title="Debit / Credit Card"
                onPress={handleDebitCreditPress}
              />
              <PaymentMethodCard
                title="Google Pay"
                style={styles.cardSpacing}
              />
              <PaymentMethodCard title="Apple Pay" style={styles.cardSpacing} />
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
