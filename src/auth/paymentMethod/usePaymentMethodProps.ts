import { useRouter } from "expo-router";
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { styles } from "./styles";

export const usePaymentMethodProps = () => {
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [activeSlide, setActiveSlide] = useState(0);
  const { width } = useWindowDimensions();
  const router = useRouter();

  const slides = [
    {
      id: 0,
      title: "3-Month Plan",
      price: "$9.99 / mo after",
      subtitle: "$0 for 2 months",
      buttonText: "GET BADR 3-MONTH PLAN",
    },
    {
      id: 1,
      title: "6-Month Plan",
      price: "$12.99/mo",
      subtitle: "Most popular",
      buttonText: "GET BADR 6-MONTH PLAN",
    },
    {
      id: 2,
      title: "Annual Plan",
      price: "$19.99/mo",
      subtitle: "Best value",
      secondarySubtitle: "$19.99 / mo after",
      buttonText: "GET BADR ANNUAL PLAN",
    },
  ];

  const handleSlideChange = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
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
    { title: "Debit / Credit Card", onPress: handleDebitCreditPress, style: undefined },
    { title: "Google Pay", onPress: undefined, style: styles.cardSpacing },
    { title: "Apple Pay", onPress: undefined, style: styles.cardSpacing },
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
