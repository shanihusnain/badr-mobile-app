import React from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { BottomSheetWrapper } from "@/components/molecules/BottomSheetWrapper";
import PrimaryButton from "@/components/atoms/Primary-button";
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
            <Feather name="calendar" size={16} color={Colors.light.icon} />
          </View>
          <View style={[styles.halfInputBox, styles.halfInputBoxRight]}>
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
