import React from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PrimaryButton from "../../../components/atoms/Primary-button";
import CustomSlider from "./components/CustomSlider";
import PaymentMethodCard from "./components/PaymentMethodCard";
import { usePaymentMethodProps } from "./usePaymentMethodProps";
import { useTranslation } from "react-i18next";

export default function PaymentMethodScreen() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
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

        <Text style={styles.text}>{t("paymentMethodScreen.header")}</Text>

        <Text style={styles.subtitletext}>
          {t("paymentMethodScreen.subtitle")}
        </Text>

        <Text style={styles.undertext}>
          {t("paymentMethodScreen.trialPricingNote")}
        </Text>

        <View style={styles.buttonRow}>
          <PrimaryButton
            text={t("paymentMethodScreen.monthlyPlanTab")}
            onPress={handleSelectMonthly}
            style={getTabButtonStyle("monthly")}
          />
          <PrimaryButton
            text={t("paymentMethodScreen.otherPlansTab")}
            onPress={handleSelectOther}
            style={getTabButtonStyle("other")}
          />
        </View>
        {selectedPlan === "monthly" && (
          <Text style={styles.underbuttontext}>{t("paymentMethodScreen.choosePaymentMethod")}</Text>
        )}
        <View style={styles.formWrapper}>
          {selectedPlan === "other" ? (
            <>
              <View style={{ width: Math.min(width - 50, 343) }}>
                <CustomSlider
                  slides={slides}
                  activeSlide={activeSlide}
                  slideWidth={Math.min(width - 50, 343)}
                  onSlideChange={handleSlideChange}
                />
              </View>
              <View style={[styles.paginationContainer, { flexDirection: isRtl ? "row-reverse" : "row" }]}>
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
              style={{ width: "100%" }}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
