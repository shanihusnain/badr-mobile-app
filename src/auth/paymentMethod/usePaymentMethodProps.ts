import { useRouter } from "expo-router";
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { styles } from "./styles";
import { useTranslation } from "react-i18next";

export const usePaymentMethodProps = () => {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [activeSlide, setActiveSlide] = useState(0);
  const { width } = useWindowDimensions();
  const router = useRouter();

  const slides = [
    {
      id: 0,
      title: t("paymentMethodScreen.plan3Month"),
      price: t("paymentMethodScreen.price3Month"),
      subtitle: t("paymentMethodScreen.subtitle3Month"),
      description: t("paymentMethodScreen.save3Month"),
      description1: t("paymentMethodScreen.billing3Month"),
      buttonText: t("paymentMethodScreen.btn3Month"),
      fulldescription: t("paymentMethodScreen.desc3Month")
    },
    {
      id: 1,
      title: t("paymentMethodScreen.plan6Month"),
      price: t("paymentMethodScreen.price6Month"),
      subtitle: t("paymentMethodScreen.subtitle6Month"),
      description: t("paymentMethodScreen.save6Month"),
      description1: t("paymentMethodScreen.billing6Month"),
      buttonText: t("paymentMethodScreen.btn6Month"),
      fulldescription: t("paymentMethodScreen.desc6Month")
    },
    {
      id: 2,
      title: t("paymentMethodScreen.planAnnual"),
      price: t("paymentMethodScreen.priceAnnual"),
      subtitle: t("paymentMethodScreen.subtitleAnnual"),
      description: t("paymentMethodScreen.saveAnnual"),
      description1: t("paymentMethodScreen.billingAnnual"),
      buttonText: t("paymentMethodScreen.btnAnnual"),
      fulldescription: t("paymentMethodScreen.descAnnual")
    },
  ];

  const handleSlideChange = (index: number) => {
    setActiveSlide(index);
  };

  const handleSelectMonthly = () => {
    setSelectedPlan("monthly");
  };

  const handleSelectOther = () => {
    setSelectedPlan("other");
  };

  const handleDebitCreditPress = () => {
    router.push("/debitCredit");
  };

  const getTabButtonStyle = (plan: string) => {
    if (plan === "monthly") {
      return selectedPlan === "monthly"
        ? styles.planButton
        : [styles.planButton, styles.unselectedPlanButton];
    } else {
      return selectedPlan === "other"
        ? [styles.greyButton, styles.selectedGreyButton]
        : styles.greyButton;
    }
  };
  const paymentMethods = [
    { title: t("paymentMethodScreen.debitCreditCard"), onPress: handleDebitCreditPress, style: undefined },
    { title: t("paymentMethodScreen.googlePay"), onPress: undefined, style: styles.cardSpacing },
    { title: t("paymentMethodScreen.applePay"), onPress: undefined, style: styles.cardSpacing },
  ];
  return {
    selectedPlan,
    activeSlide,
    styles,
    width,
    router,
    slides,
    handleSlideChange,
    handleSelectMonthly,
    handleSelectOther,
    handleDebitCreditPress,
    getTabButtonStyle,
    setSelectedPlan,
    paymentMethods,
  };
};
