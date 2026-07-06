import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import PrimaryButton from "@/components/atoms/Primary-button";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { newMemberCartStyles as styles } from "./style";
import { useRouter } from "expo-router";

export default function NewMemberCartScreen() {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleNext = () => {
    // Navigate to the personal details screen with quantity
    router.push({
      pathname: "/(private)/giftpersonaldetails",
      params: { quantity },
    });
  };

  // Base prices
  const hasDiscount = true; // Toggle this based on backend later

  const discountedPrice = 89.99;
  const originalPrice = 99.99;
  const discountAmount = originalPrice - discountedPrice;

  // The final price depends on whether there is a discount
  const activePrice = hasDiscount ? discountedPrice : originalPrice;

  // Calculate totals
  const currentSubTotal = (activePrice * quantity).toFixed(2);
  const currentOriginal = (originalPrice * quantity).toFixed(2);
  const currentDiscount = (discountAmount * quantity).toFixed(2);

  return (
    <BlackScreenWrapper>
      <View style={styles.container}>

        <View style={styles.cartItemContainer}>
          <View style={styles.appIconBox}>
            <Feather name="moon" size={28} color={Colors.light.gold} />
            <Text style={styles.appIconText}>badr</Text>
          </View>
          
          <View style={styles.itemDetails}>
            <Text style={styles.itemTitle}>12-month{"\n"}Membership</Text>
            <Text style={styles.itemSubtitle}>Annual Billing</Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>${currentSubTotal}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>${currentOriginal}</Text>
            )}
            
            <View style={[styles.quantitySelector, !hasDiscount && { marginTop: 12 }]}>
              <Pressable style={styles.quantityButton} onPress={handleDecrement}>
                <Feather name="minus" size={16} color={Colors.light.white} />
              </Pressable>
              
              <View style={styles.quantityTextContainer}>
                <Text style={styles.quantityText}>{quantity}</Text>
              </View>
              
              <Pressable style={styles.quantityButton} onPress={handleIncrement}>
                <Feather name="plus" size={16} color={Colors.light.white} />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sub Total</Text>
            <Text style={styles.summaryValueWhite}>${currentSubTotal}</Text>
          </View>
          
          {hasDiscount && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={styles.summaryValueGreen}>${currentDiscount}</Text>
            </View>
          )}
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryValueWhite}>--</Text>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <PrimaryButton text="NEXT" onPress={handleNext} />
        </View>
      </View>
    </BlackScreenWrapper>
  );
}
