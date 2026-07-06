import React from "react";
import { View, Text, Pressable, Share, Alert } from "react-native";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { Colors } from "@/constants/theme";
import PrimaryButton from "@/components/atoms/Primary-button";
import { friendReferralStyles as styles } from "./style";
import { ReferFriendIcon } from "@/assets/icons";

export default function FriendReferralScreen() {

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: "Get one month of free membership when you join using my code: [CODE]. [App Store Link]",
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  return (
    <BlackScreenWrapper>
      <View style={styles.container}>


        <View style={styles.contentContainer}>
          <View style={styles.iconContainer}>
            <ReferFriendIcon size={34} color={Colors.light.dullWhite} />
          </View>

          <Text style={styles.title}>UNLOCK FREE MONTHS</Text>
          <Text style={styles.description}>
            GET 1 FREE MONTH OF MEMBERSHIP FOR EVERY FRIEND WHO JOINS BADR
          </Text>
          <View style={styles.buttonContainer}>
            <PrimaryButton
              text="SHARE MY REFERRAL CODE"
              onPress={handleShare}
            />
          </View>
        </View>
      </View>
    </BlackScreenWrapper>
  );
}
