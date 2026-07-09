import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { BottomSheetWrapper } from "@/components/molecules/BottomSheetWrapper";
import PrimaryButton from "@/components/atoms/Primary-button";
import CustomTextInput from "@/components/atoms/CustomTextInput";
import CustomDropdown from "@/components/atoms/CustomDropdown";
import BottomSheet from "@gorhom/bottom-sheet";
import { paymentStyles as styles } from "../style";

type AddNewCardBottomSheetProps = {
  newCardSheetRef: React.RefObject<BottomSheet | null>;
  cardNumber: string;
  setCardNumber: (value: string) => void;
  expiry: string;
  setExpiry: (value: string) => void;
  cvc: string;
  setCvc: (value: string) => void;
  cardholderName: string;
  setCardholderName: (value: string) => void;
  savePayment: boolean;
  setSavePayment: (value: boolean) => void;
  newCardValid: boolean;
  handleContinue: () => void;
};

const cardBrandLabels = ["VISA", "MC", "DIS", "AMX"];
const countryOptions = [
  { label: "Qatar", value: "Qatar", icon: "🇶🇦" },
  { label: "United Arab Emirates", value: "United Arab Emirates", icon: "🇦🇪" },
  { label: "Saudi Arabia", value: "Saudi Arabia", icon: "🇸🇦" },
];

export default function AddNewCardBottomSheet({
  newCardSheetRef,
  cardNumber,
  setCardNumber,
  expiry,
  setExpiry,
  cvc,
  setCvc,
  cardholderName,
  setCardholderName,
  savePayment,
  setSavePayment,
  newCardValid,
  handleContinue,
}: AddNewCardBottomSheetProps) {
  const [selectedCountry, setSelectedCountry] = useState("Qatar");

  return (
    <BottomSheetWrapper
      ref={newCardSheetRef}
      snapPoints={["80%"]}
      bgColor={Colors.light.blackBackground}
    >
      <View style={styles.newCardSheetHeader}>
        <Pressable onPress={() => newCardSheetRef.current?.close()}>
          <View style={styles.backCircle}>
            <Feather name="chevron-left" size={20} color={Colors.light.white} />
          </View>
        </Pressable>
        <Text style={styles.newCardSheetTitle}>Add New Card</Text>
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Card Information</Text>
        <Pressable style={styles.scanCardContainer}>
          <Feather name="camera" size={14} color={Colors.light.green} />
          <Text style={styles.scanCardText}>Scan Card</Text>
        </Pressable>
      </View>

      <View style={styles.cardInputContainer}>
        <View style={styles.cardInputTop}>
          <CustomTextInput
            placeholder="Card Number"
            value={cardNumber}
            onChangeText={setCardNumber}
            keyboardType="numeric"
            maxLength={19}
            inputStyle={styles.cardInput}
          />
          <View style={styles.cardIconsRow}>
            {cardBrandLabels.map((brand) => (
              <View key={brand} style={styles.cardIconBox}>
                <Text style={styles.cardIconText}>{brand}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.cardInputBottom}>
          <View style={styles.halfInputBox}>
            <CustomTextInput
              placeholder="MM/YY"
              value={expiry}
              onChangeText={setExpiry}
              maxLength={5}
              inputStyle={styles.cardInput}
            />
            <Feather name="calendar" size={16} color={Colors.light.icon} />
          </View>
          <View style={[styles.halfInputBox, styles.halfInputBoxRight]}>
            <CustomTextInput
              placeholder="xxx"
              value={cvc}
              onChangeText={setCvc}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              inputStyle={styles.cardInput}
            />
          </View>
        </View>
      </View>

      <CustomTextInput
        label="Cardholder Name"
        placeholder="Cardholder Name"
        value={cardholderName}
        onChangeText={setCardholderName}
        inputStyle={styles.inputBox}
        labelStyle={styles.inputLabel}
      />

      <CustomDropdown
        label="Country"
        labelStyle={styles.inputLabel}
        placeholder="Select country"
        options={countryOptions}
        value={selectedCountry}
        onSelect={setSelectedCountry}
        containerStyle={styles.dropdownBox}
        selectedTextStyle={styles.dropdownText}
      />

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
            <Feather name="check" size={14} color={Colors.light.white} />
          )}
        </View>
        <Text style={styles.checkboxText}>
          Save payment details to Badr for future purchases
        </Text>
      </Pressable>

      <View style={styles.sheetButtonContainer}>
        <PrimaryButton
          text="CONTINUE"
          onPress={handleContinue}
          style={newCardValid ? undefined : styles.completeButton}
        />
      </View>
    </BottomSheetWrapper>
  );
}
