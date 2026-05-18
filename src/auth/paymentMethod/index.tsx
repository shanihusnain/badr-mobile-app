import React from "react";
import { FlatList, Text, View } from "react-native";
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
    paymentMethods,
    width,
  } = usePaymentMethodProps();

  const renderPaymentCard = ({ item }: { item: { title: string; onPress?: () => void; style?: any } }) => (
    <PaymentMethodCard
      title={item.title}
      onPress={item.onPress}
      style={item.style}
    />
  );
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
     
        <Text style={styles.text}>We're Not Charging You Yet</Text>
      
        <Text style={styles.subtitletext}>
          A valid payment method is required to start your free trial. You can
          change plans or cancel anytime.
        </Text>
        
        <Text style={styles.undertext}>
          First 2 months free, then just $10.99/month. Cancel anytime.
        </Text>
        
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
            <>
              <View style={[styles.cardContainer, { width: Math.min(width - 50, 343) }] }>
                <CustomSlider
                  slides={slides}
                  activeSlide={activeSlide}
                  slideWidth={Math.min(width - 50, 343)}
                  onSlideChange={handleSlideChange}
                />
              </View>
              <View style={styles.paginationContainer}>
                {slides.map((slide) => (
                  <View
                    key={slide.id}
                    style={
                      activeSlide === slide.id
                        ? [styles.paginationDot, styles.activeDot]
                        : styles.paginationDot
                    }
                  />
                ))}
              </View>
            </>
          ) : (
            <FlatList
              data={paymentMethods}
              renderItem={renderPaymentCard}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
