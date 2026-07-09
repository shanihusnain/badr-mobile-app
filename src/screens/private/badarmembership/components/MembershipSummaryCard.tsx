import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { badarMembershipStyles as styles } from "../style";
import PrimaryButton from "@/components/atoms/Primary-button";
import SecondaryButton from "@/components/atoms/Secondary-button";

type MembershipSummaryCardProps = {
  onChangeMembership: () => void;
  onCancelMembership: () => void;
};

export default function MembershipSummaryCard({
  onChangeMembership,
  onCancelMembership,
}: MembershipSummaryCardProps) {
  return (
    <View style={styles.membershipCard}>
      <Text style={styles.cardTitle}>MEMBERSHIP</Text>
      <Text style={styles.cardSubtitle}>
        You are saving 36% with annual billing.
      </Text>

      <View style={styles.planRow}>
        <View style={styles.planLeft}>
          <Feather
            name="check"
            size={16}
            color={Colors.light.white}
            style={styles.checkIcon}
          />
          <Text style={styles.planName}>ANNUAL</Text>
        </View>
        <Text style={styles.planPrice}>($99.99/YEAR) $8.33/MO</Text>
      </View>

      <View style={styles.planRow}>
        <View style={styles.planLeft}>
          <Text style={styles.planNameInactive}>MONTHLY</Text>
        </View>
        <Text style={styles.planPriceInactive}>$13.00/MO</Text>
      </View>

      <View style={styles.buttonContainer}>
        <PrimaryButton
          text="CHANGE MEMBERSHIP"
          onPress={onChangeMembership}
        />
        <SecondaryButton
          text="CANCEL MEMBERSHIP"
          onPress={onCancelMembership}
          variant="green"
        />
      </View>
    </View>
  );
}
