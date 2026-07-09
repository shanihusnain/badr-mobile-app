import React from "react";
import { View, FlatList, Text } from "react-native";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { useRouter } from "expo-router";
import MoreCarousel from "./components/MoreCarousel";
import MoreSectionHeader from "./components/MoreSectionHeader";
import MoreListItem from "./components/MoreListItem";
import SecondaryButton from "@/components/atoms/Secondary-button";
import { Colors } from "@/constants/theme";
import { moreScreenStyles as styles } from "./style";
import {
  ReferFriendTabIcon,
  RedeemGiftIcon,
  ProfileInformationIcon,
  FilterIcon,
  HelpingIcon,
  MoreTabIcon,
  GiftIcon,
  SettingIcon,
  PrivacyIcon,
  ServiceIcon,
  TutorialIcon,
} from "@/assets/icons";

export default function MoreScreen() {
  const router = useRouter();

  const handleLogout = () => {
    // Handle logout logic here
  };

  const handleReferFriend = () => {
    router.push("/(private)/friendreferal");
  };

  const handleGiftNewMember = () => {
    router.push("/(private)/giftnewmember");
  };

  const handleGiftCurrentMember = () => {
    router.push("/(private)/giftcurrentmember");
  };

  const handleMyAccount = () => {
    router.push("/(private)/myaccount");
  };

  const handleAppSettings = () => {
    router.push("/(private)/appsetting");
  };

  const handlePrivacySettings = () => {
    router.push("/(private)/privacysetting");
  };

  const handleMembershipServices = () => {
    router.push("/(private)/helpcentre");
  };

  const handleAbout = () => {
    router.push("/(private)/about");
  };

  const DATA = [
    { type: "section", key: "s_refer", title: "REFER & EARN" },
    {
      type: "item",
      key: "refer_friend",
      title: "REFER A FRIEND",
      description: "Get one month free for each friend you refer",
      icon: <ReferFriendTabIcon size={24} color={Colors.light.blackBackground} />,
      isHighlighted: true,
      onPress: handleReferFriend,
    },
    { type: "section", key: "s_gift", title: "GIFT & INSPIRE" },
    {
      type: "item",
      key: "gift_new",
      title: "GIFT A NEW MEMBER",
      description: "Gift a new member and get 1-month free",
      icon: <GiftIcon size={24} Color={Colors.light.subtext} />,
      onPress: handleGiftNewMember,
    },
    {
      type: "item",
      key: "gift_current",
      title: "GIFT A CURRENT MEMBER",
      description: "Gift a current member an extension",
      icon: <RedeemGiftIcon size={24} color={Colors.light.subtext} />,
      onPress: handleGiftCurrentMember,
    },
    { type: "section", key: "s_account", title: "ACCOUNT & SETTINGS" },
    { type: "item", key: "my_account", title: "MY ACCOUNT", icon: <ProfileInformationIcon size={24} Color={Colors.light.subtext} />, onPress: handleMyAccount },
    { type: "item", key: "app_settings", title: "APP SETTINGS", icon: <SettingIcon size={24} Color={Colors.light.subtext} />, onPress: handleAppSettings },
    { type: "item", key: "privacy_settings", title: "PRIVACY SETTINGS", icon: <PrivacyIcon size={24} Color={Colors.light.subtext} />, onPress: handlePrivacySettings },
    { type: "section", key: "s_support", title: "SUPPORT" },
    {
      type: "item",
      key: "membership_services",
      title: "MEMBERSHIP SERVICES",
      description: "Get help or ask a question",
      icon: <ServiceIcon size={24} />,
      onPress: handleMembershipServices,
    },
    { type: "item", key: "tutorial", title: "TUTORIAL", icon: <TutorialIcon size={24} color={Colors.light.subtext} /> },
    { type: "item", key: "about", title: "ABOUT", icon: <MoreTabIcon size={20} color={Colors.light.subtext} />, onPress: handleAbout },
  ];

  const renderItem = ({ item }: { item: any }) => {
    if (item.type === "section") return <MoreSectionHeader title={item.title} />;
    return (
      <MoreListItem
        title={item.title}
        description={item.description}
        icon={item.icon}
        isHighlighted={item.isHighlighted}
        onPress={item.onPress}
      />
    );
  };

  const ListFooter = () => (
    <View style={styles.logoutContainer}>
      <SecondaryButton text="LOGOUT" onPress={handleLogout} variant="green" />
      <Text style={styles.versionText}>APP VERSION: 1.2.197 (BUILD 1938)</Text>
    </View>
  );

  return (
    <BlackScreenWrapper>
      <FlatList
        data={DATA}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        ListHeaderComponent={<MoreCarousel />}
        ListFooterComponent={<ListFooter />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        style={styles.container}
      />
    </BlackScreenWrapper>
  );
}
