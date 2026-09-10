import React, { useState } from "react";
import { View, Text, FlatList } from "react-native";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { Colors } from "@/constants/theme";
import { badarMembershipStyles as styles } from "./style";
import { useRouter } from "expo-router";
import WarningModal from "@/components/atoms/WarningModal";
import { fonts } from "@/assets/fonts";
import MembershipActionItem from "./components/MembershipActionItem";
import MembershipSummaryCard from "./components/MembershipSummaryCard";
import {
  CalendarIcon,
  ReferFriendTabIcon,
  RedeemGiftIcon,
} from "@/assets/icons";

type ActionItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
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
      icon: <CalendarIcon color={Colors.light.subtext} size={24} />,
      onPress: handleAddMoreMonths,
    },
    {
      id: "refer_friend",
      title: "REFER A FRIEND",
      subtitle: "Get one month free for each friend you refer",
      icon: <ReferFriendTabIcon color={Colors.light.subtext} size={24} />,
      onPress: handleReferFriend,
    },
    {
      id: "redeem_gift",
      title: "REDEEM GIFT EXTENSION",
      subtitle: "Apply your gift to your membership",
      icon: <RedeemGiftIcon color={Colors.light.subtext} size={24} />,
      onPress: handleRedeemGift,
    },
  ];

  const renderHeader = () => (
    <>
      <Text style={styles.sectionTitle}>NEXT PAYMENT</Text>
      <Text style={styles.sectionSubtitle}>
        Your next bill is for $99.99 and is due on Nov 24, 2026
      </Text>

      <MembershipSummaryCard
        onChangeMembership={handleChangeMembership}
        onCancelMembership={handleCancelMembership}
      />
    </>
  );

  const renderItem = ({ item }: { item: ActionItem }) => (
    <MembershipActionItem
      title={item.title}
      subtitle={item.subtitle}
      icon={item.icon}
      onPress={item.onPress}
    />
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
