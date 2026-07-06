import React from "react";
import { View, ScrollView, Text } from "react-native";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { useRouter } from "expo-router";
import MoreCarousel from "./components/MoreCarousel";
import MoreSectionHeader from "./components/MoreSectionHeader";
import MoreListItem from "./components/MoreListItem";
import SecondaryButton from "@/components/atoms/Secondary-button";
import { moreScreenStyles as styles } from "./style";

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

  return (
    <BlackScreenWrapper>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <MoreCarousel />

        <MoreSectionHeader title="REFER & EARN" />
        <MoreListItem
          title="REFER A FRIEND"
          description="Get one month free for each friend you refer"
          icon="user-plus"
          isHighlighted={true}
          onPress={handleReferFriend}
        />

        <MoreSectionHeader title="GIFT & INSPIRE" />
        <MoreListItem
          title="GIFT A NEW MEMBER"
          description="Gift a new member and get 1-month free"
          icon="gift"
          onPress={handleGiftNewMember}
        />
        <MoreListItem
          title="GIFT A CURRENT MEMBER"
          description="Gift a current member an extension"
          icon="gift"
          onPress={handleGiftCurrentMember}
        />

        <MoreSectionHeader title="ACCOUNT & SETTINGS" />
        <MoreListItem
          title="MY ACCOUNT"
          icon="user"
          onPress={handleMyAccount}
        />
        <MoreListItem
          title="APP SETTINGS"
          icon="sliders"
          onPress={handleAppSettings}
        />
        <MoreListItem
          title="PRIVACY SETTINGS"
          icon="shield"
          onPress={handlePrivacySettings}
        />

        <MoreSectionHeader title="SUPPORT" />
        <MoreListItem
          title="MEMBERSHIP SERVICES"
          description="Get help or ask a question"
          icon="headphones"
          onPress={handleMembershipServices}
        />
        <MoreListItem title="TUTORIAL" icon="play-circle" />
        <MoreListItem title="ABOUT" icon="info" onPress={handleAbout} />

        <View style={styles.logoutContainer}>
          <SecondaryButton
            text="LOGOUT"
            onPress={handleLogout}
            variant="green"
          />
          <Text style={styles.versionText}>
            APP VERSION: 1.2.197 (BUILD 1938)
          </Text>
        </View>
      </ScrollView>
    </BlackScreenWrapper>
  );
}
