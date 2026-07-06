import React, { useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { badarMembershipStyles as styles } from "./style";
import { useRouter } from "expo-router";
import PrimaryButton from "@/components/atoms/Primary-button";
import SecondaryButton from "@/components/atoms/Secondary-button";
import WarningModal from "@/components/atoms/WarningModal";
import { fonts } from "@/assets/fonts";

type ActionItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
};

export default function BadarMembershipScreen() {
  const router = useRouter();
  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleChangeMembership = () => {
    router.push("/(private)/changemembership");
  };

  const handleCancelMembership = () => {
    setCancelModalVisible(true);
  };

  const handleConfirmCancel = () => {
    setCancelModalVisible(false);
    router.push("/(private)/cancelmembershipconfirmation");
  };

  const handleKeepMembership = () => {
    setCancelModalVisible(false);
  };

  const handleAddMoreMonths = () => {
    router.push("/(private)/membershipextension");
  };

  const handleReferFriend = () => {
    router.push("/(private)/friendreferal");
  };

  const handleRedeemGift = () => {
    router.push("/(private)/redeemgiftextension");
  };

  const ACTION_ITEMS: ActionItem[] = [
    {
      id: "add_more_months",
      title: "ADD MORE MONTHS",
      subtitle: "Extend your membership and save",
      icon: "calendar",
      onPress: handleAddMoreMonths,
    },
    {
      id: "refer_friend",
      title: "REFER A FRIEND",
      subtitle: "Get one month free for each friend you refer",
      icon: "user-plus",
      onPress: handleReferFriend,
    },
    {
      id: "redeem_gift",
      title: "REDEEM GIFT EXTENSION",
      subtitle: "Apply your gift to your membership",
      icon: "gift",
      onPress: handleRedeemGift,
    },
  ];

  const renderHeader = () => (
    <>
      <Text style={styles.sectionTitle}>NEXT PAYMENT</Text>
      <Text style={styles.sectionSubtitle}>
        Your next bill is for $99.99 and is due on{"\n"}Nov 24, 2026
      </Text>

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
            onPress={handleChangeMembership}
          />
          <SecondaryButton
            text="CANCEL MEMBERSHIP"
            onPress={handleCancelMembership}
            variant="green"
          />
        </View>
      </View>
    </>
  );

  const renderItem = ({ item }: { item: ActionItem }) => (
    <Pressable style={styles.actionCard} onPress={item.onPress}>
      <View style={styles.actionIconContainer}>
        <Feather name={item.icon} size={20} color={Colors.light.icon} />
      </View>
      <View style={styles.actionTextContainer}>
        <Text style={styles.actionTitle}>{item.title}</Text>
        <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
      </View>
    </Pressable>
  );

  return (
    <BlackScreenWrapper>
      <FlatList
        data={ACTION_ITEMS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />

      <WarningModal
        visible={cancelModalVisible}
        title="ARE YOU SURE YOU WANT TO CANCEL YOUR MEMBERSHIP?"
        message={
          <Text
            style={{
              color: Colors.light.dullWhite,
              fontFamily: fonts.primary.regular,
              fontSize: 14,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            Your membership will remain active until{" "}
            <Text
              style={{
                fontFamily: fonts.primary.bold,
                color: Colors.light.white,
              }}
            >
              Nov 23, 2016.
            </Text>{" "}
            You'll continue to have access to{" "}
            <Text
              style={{
                fontFamily: fonts.primary.bold,
                color: Colors.light.white,
              }}
            >
              Badr
            </Text>{" "}
            until then, and no further charges will occur after your membership
            ends.
          </Text>
        }
        primaryButtonText="Keep Membership"
        secondaryButtonText="Confirm Cancellation"
        onPrimaryPress={handleKeepMembership}
        onSecondaryPress={handleConfirmCancel}
      />
    </BlackScreenWrapper>
  );
}
