import React from "react";
import { View, Text, Pressable } from "react-native";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { BottomSheetWrapper } from "@/components/molecules/BottomSheetWrapper";
import PrimaryButton from "@/components/atoms/Primary-button";
import BottomSheet from "@gorhom/bottom-sheet";
import { paymentStyles as styles } from "../style";

type CardMode = "saved" | "new";

type PaymentMethodBottomSheetProps = {
  changeSheetRef: React.RefObject<BottomSheet | null>;
  selectedOption: CardMode;
  setSelectedOption: (option: CardMode) => void;
  handleContinue: () => void;
};

export default function PaymentMethodBottomSheet({
  changeSheetRef,
  selectedOption,
  setSelectedOption,
  handleContinue,
}: PaymentMethodBottomSheetProps) {
  return (
    <BottomSheetWrapper
      ref={changeSheetRef}
      snapPoints={["55%"]}
      bgColor={Colors.light.blackBackground}
    >
      <Text style={styles.sheetTitle}>Select Payment Method</Text>

      <Text style={styles.sheetSectionLabel}>Saved</Text>
      <Pressable
        style={[
          styles.sheetCardRow,
          selectedOption === "saved" && styles.sheetCardRowSelected,
        ]}
        onPress={() => setSelectedOption("saved")}
      >
        <View style={styles.savedCardIconBox}>
          <Text style={styles.savedCardIconText}>VISA</Text>
        </View>
        <Text style={styles.sheetCardText}>**** 0022</Text>
      </Pressable>

      <Text style={styles.sheetSectionLabel}>New Payment Method</Text>
      <Pressable
        style={[
          styles.sheetCardRow,
          selectedOption === "new" && styles.sheetCardRowSelected,
        ]}
        onPress={() => setSelectedOption("new")}
      >
        <View style={styles.newCardIconBox}>
          <Feather name="credit-card" size={18} color={Colors.light.green} />
        </View>
        <Text style={styles.sheetCardText}>New Card</Text>
      </Pressable>

      <View style={styles.sheetButtonContainer}>
        <PrimaryButton text="CONTINUE" onPress={handleContinue} />
      </View>
    </BottomSheetWrapper>
  );
}
