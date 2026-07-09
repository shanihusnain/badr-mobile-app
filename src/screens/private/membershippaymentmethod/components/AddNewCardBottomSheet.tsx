import React from "react";
import { View, Text, Pressable } from "react-native";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { BottomSheetWrapper } from "@/components/molecules/BottomSheetWrapper";
import PrimaryButton from "@/components/atoms/Primary-button";
import CustomTextInput from "@/components/atoms/CustomTextInput";
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

      <Text style={styles.inputLabel}>Cardholder Name</Text>
      <CustomTextInput
        placeholder="Cardholder Name"
        value={cardholderName}
        onChangeText={setCardholderName}
        inputStyle={styles.inputBox}
      />

      <Text style={styles.inputLabel}>Country</Text>
      <Pressable style={styles.dropdownBox}>
        <View style={styles.dropdownLeft}>
          <Text style={{ fontSize: 16 }}>🇶🇦</Text>
          <Text style={styles.dropdownText}>Qatar</Text>
        </View>
        <Feather name="chevron-down" size={20} color={Colors.light.white} />
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
