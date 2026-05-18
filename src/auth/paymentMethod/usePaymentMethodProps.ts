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
      price: "$9.99 / month after",
      subtitle: "$0 for 2 months",
      description: "Save 9%",
      description1: "Billed every 3 months",
      buttonText: "GET BADR 3-MONTH PLAN",
      fulldescription: "$0 for 2 months, then $29.99 every 3 months after. If you've already used your free trial before, billing begins immediately."
    },
    {
      id: 1,
      title: "6-Month Plan",
      price: "$9.17 / month after",
      subtitle: "$0 for 2 months ",
      description: "Save 17%",
      description1: "Billed every 6 months",
      buttonText: "GET BADR 6-MONTH PLAN",
      fulldescription: "$0 for 2 months, then $54.99 every 3 months after. If you've already used your free trial before, billing begins immediately."
    },
    {
      id: 2,
      title: "Annual Plan",
      price: "$8.33 / month after",
      subtitle: "$0 for 2 months ",
      description: "save 24%",
      description1: "Billed yearly",
      buttonText: "GET BADR ANNUAL PLAN",
      fulldescription: "$0 for 2 months, then $99.99 every 3 months after. If you've already used your free trial before, billing begins immediately."
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
