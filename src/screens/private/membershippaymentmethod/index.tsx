import React, { useRef, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
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
import { paymentStyles as styles } from "./style";
import { useLocalSearchParams, useRouter } from "expo-router";
import BottomSheet from "@gorhom/bottom-sheet";
import PaymentMethodBottomSheet from "./components/PaymentMethodBottomSheet";
import AddNewCardBottomSheet from "./components/AddNewCardBottomSheet";

type CardMode = "saved" | "new";

export default function MembershipPaymentMethodScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isSavedMode = params.mode === "saved";

  const quantityParam = parseInt(params.quantity as string, 10);
  const quantity =
    isNaN(quantityParam) || quantityParam < 1 ? 1 : quantityParam;

  const [cardMode, setCardMode] = useState<CardMode>(
    isSavedMode ? "saved" : "new",
  );
  const [selectedOption, setSelectedOption] = useState<CardMode>(
    isSavedMode ? "saved" : "new",
  );
  const [isCardSelected, setIsCardSelected] = useState(!isSavedMode); // Require selection if saved

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [savePayment, setSavePayment] = useState(false);

  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);

  const changeSheetRef = useRef<BottomSheet>(null);
  const newCardSheetRef = useRef<BottomSheet>(null);

  // Use price passed directly from the calling screen if available
  const priceParam = params.price ? parseFloat(params.price as string) : null;

  let basePrice = 29.99;
  if (params.plan === "3_months") basePrice = 33.15;
  if (params.plan === "6_months") basePrice = 58.5;
  if (params.plan === "12_months") basePrice = 99.99;
  if (params.plan === "24_months") basePrice = 187.2;
  if (params.plan === "1_month") basePrice = 9.99;

  let subtotal =
    priceParam !== null ? priceParam * quantity : basePrice * quantity;
  let discountAmount = discountApplied ? 10.0 : 0;
  let totalDue = subtotal - discountAmount;
  if (totalDue < 0) totalDue = 0;

  const isFormValid = () => {
    if (cardMode === "saved") return isCardSelected;
    return (
      cardNumber.length > 14 &&
      expiry.length >= 4 &&
      cvc.length >= 3 &&
      cardholderName.length > 0
    );
  };

  // Reactive boolean — recomputed on every render when inputs change
  const newCardValid =
    cardNumber.length > 14 &&
    expiry.length >= 4 &&
    cvc.length >= 3 &&
    cardholderName.length > 0;

  const handleCompletePurchase = () => {
    console.log("Processing payment...");
    router.push("/(private)/paymentsuccessscreen");
  };

  const handleOpenChangeSheet = () => {
    changeSheetRef.current?.expand();
  };

  const handleContinue = () => {
    changeSheetRef.current?.close();
    if (selectedOption === "new") {
      newCardSheetRef.current?.expand();
    } else {
      setCardMode("saved");
    }
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
          <View style={styles.container}>
            {/* Header provided by layout (HeaderWithCrossTitleDynamicIcon) */}

            <Text style={styles.orderDetailsTitle}>
              Order details ({quantity})
            </Text>

            {/* Add Promo Code */}
            {showPromoInput ? (
              <View style={styles.promoCodeInputContainer}>
                <TextInput
                  style={styles.promoCodeInput}
                  placeholder="Promo Code"
                  placeholderTextColor={Colors.light.icon}
                  value={promoCode}
                  onChangeText={setPromoCode}
                  autoCapitalize="none"
                />
                <Pressable
                  style={[
                    styles.promoApplyBtn,
                    promoCode.length > 0 && styles.promoApplyBtnActive,
                  ]}
                  onPress={() => {
                    if (promoCode.length > 0) setDiscountApplied(true);
                  }}
                >
                  <Text style={styles.promoApplyBtnText}>APPLY</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={styles.promoCodeRow}
                onPress={() => setShowPromoInput(true)}
              >
                <Text style={styles.promoCodeText}>Add Promo Code</Text>
              </Pressable>
            )}

            <View style={styles.rowItem}>
              <Text style={styles.rowTextLight}>Subtotal</Text>
              <Text style={styles.rowTextBold}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.rowTextLight}>Total Due</Text>
              <Text style={styles.rowTextBold}>${totalDue.toFixed(2)}</Text>
            </View>
            {discountApplied && (
              <View style={styles.rowItem}>
                <Text style={styles.rowTextBold}>Discount</Text>
                <Text
                  style={[styles.rowTextBold, { color: Colors.light.green }]}
                >
                  -${discountAmount.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            {cardMode === "saved" ? (
              <>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Card Information</Text>
                  <Pressable
                    style={styles.scanCardContainer}
                    onPress={handleOpenChangeSheet}
                  >
                    <Text style={styles.changeText}>CHANGE</Text>
                    <Feather
                      name="chevron-right"
                      size={14}
                      color={Colors.light.white}
                    />
                  </Pressable>
                </View>

                <Pressable
                  style={[
                    styles.savedCardBox,
                    isCardSelected && styles.savedCardBoxSelected,
                  ]}
                  onPress={() => setIsCardSelected(true)}
                >
                  <View style={styles.savedCardIconBox}>
                    <Text style={styles.savedCardIconText}>VISA</Text>
                  </View>
                  <Text style={styles.savedCardNumber}>**** 0022</Text>
                </Pressable>

                <View style={styles.cardBrandsRow}>
                  <View style={[styles.brandIconBox, styles.brandVisa]}>
                    <Text style={styles.brandIconText}>VISA</Text>
                  </View>
                  <View style={[styles.brandIconBox, styles.brandMC]}>
                    <Text style={styles.brandIconText}>MC</Text>
                  </View>
                  <View style={[styles.brandIconBox, styles.brandDiners]}>
                    <Text style={styles.brandIconText}>D</Text>
                  </View>
                  <View style={[styles.brandIconBox, styles.brandDiscover]}>
                    <Text style={styles.brandIconText}>DIS</Text>
                  </View>
                  <View style={[styles.brandIconBox, styles.brandAmex]}>
                    <Text style={styles.brandIconText}>AMX</Text>
                  </View>
                </View>
              </>
            ) : (
              <>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Card Information</Text>
                  <Pressable style={styles.scanCardContainer}>
                    <Feather
                      name="camera"
                      size={14}
                      color={Colors.light.green}
                    />
                    <Text style={styles.scanCardText}>Scan Card</Text>
                  </Pressable>
                </View>

                <View style={styles.cardInputContainer}>
                  <View style={styles.cardInputTop}>
                    <TextInput
                      style={styles.cardInput}
                      placeholder="Card Number"
                      placeholderTextColor={Colors.light.icon}
                      value={cardNumber}
                      onChangeText={setCardNumber}
                      keyboardType="numeric"
                      maxLength={19}
                    />
                    <View style={styles.cardIconsRow}>
                      <View style={styles.cardIconBox}>
                        <Text style={styles.cardIconText}>VISA</Text>
                      </View>
                      <View style={styles.cardIconBox}>
                        <Text style={styles.cardIconText}>MC</Text>
                      </View>
                      <View style={styles.cardIconBox}>
                        <Text style={styles.cardIconText}>DIS</Text>
                      </View>
                      <View style={styles.cardIconBox}>
                        <Text style={styles.cardIconText}>AMX</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.cardInputBottom}>
                    <View style={styles.halfInputBox}>
                      <TextInput
                        style={styles.cardInput}
                        placeholder="MM/YY"
                        placeholderTextColor={Colors.light.icon}
                        value={expiry}
                        onChangeText={setExpiry}
                        maxLength={5}
                      />
                      <Feather
                        name="calendar"
                        size={16}
                        color={Colors.light.icon}
                      />
                    </View>
                    <View
                      style={[styles.halfInputBox, styles.halfInputBoxRight]}
                    >
                      <TextInput
                        style={styles.cardInput}
                        placeholder="xxx"
                        placeholderTextColor={Colors.light.icon}
                        value={cvc}
                        onChangeText={setCvc}
                        keyboardType="numeric"
                        maxLength={4}
                        secureTextEntry
                      />
                    </View>
                  </View>
                </View>

                <Text style={styles.inputLabel}>Cardholder Name</Text>
                <TextInput
                  style={styles.inputBox}
                  placeholder="Cardholder Name"
                  placeholderTextColor={Colors.light.icon}
                  value={cardholderName}
                  onChangeText={setCardholderName}
                />

                <Text style={styles.inputLabel}>Country</Text>
                <Pressable style={styles.dropdownBox}>
                  <View style={styles.dropdownLeft}>
                    <Text style={{ fontSize: 16 }}>🇶🇦</Text>
                    <Text style={styles.dropdownText}>Qatar</Text>
                  </View>
                  <Feather
                    name="chevron-down"
                    size={20}
                    color={Colors.light.white}
                  />
                </Pressable>

                <Pressable
                  style={styles.checkboxRow}
                  onPress={() => setSavePayment(!savePayment)}
                >
                  <View
                    style={[
                      styles.checkboxBox,
                      savePayment && styles.checkboxBoxSelected,
                    ]}
                  >
                    {savePayment && (
                      <Feather
                        name="check"
                        size={14}
                        color={Colors.light.white}
                      />
                    )}
                  </View>
                  <Text style={styles.checkboxText}>
                    Save payment details to Badr for future purchases
                  </Text>
                </Pressable>
              </>
            )}

            <View style={styles.bottomSection}>
              <Text style={styles.termsText}>
                By placing an order, you agree to the Badr{" "}
                <Text style={styles.termsTextUnderline}>Terms of Use</Text> and{" "}
                <Text style={styles.termsTextUnderline}>Privacy Policy</Text>.
                The pre-paid period begins once the giftee downloads the Badr
                app and starts their first monthly goal cycle.
              </Text>
              <PrimaryButton
                text="COMPLETE PURCHASE"
                onPress={handleCompletePurchase}
                style={
                  isFormValid()
                    ? styles.completeButtonActive
                    : styles.completeButton
                }
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <PaymentMethodBottomSheet
        changeSheetRef={changeSheetRef}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
        handleContinue={handleContinue}
      />

      <AddNewCardBottomSheet
        newCardSheetRef={newCardSheetRef}
        cardNumber={cardNumber}
        setCardNumber={setCardNumber}
        expiry={expiry}
        setExpiry={setExpiry}
        cvc={cvc}
        setCvc={setCvc}
        cardholderName={cardholderName}
        setCardholderName={setCardholderName}
        savePayment={savePayment}
        setSavePayment={setSavePayment}
        newCardValid={newCardValid}
        handleContinue={() => {
          if (newCardValid) {
            setCardMode("new");
            newCardSheetRef.current?.close();
          }
        }}
      />
    </BlackScreenWrapper>
  );
}
