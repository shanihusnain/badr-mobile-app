import React, { useLayoutEffect } from "react";
import { View, Text, Share, Alert } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import PrimaryButton from "@/components/atoms/Primary-button";
import { HeaderWithCrossTitleDynamicIcon } from "@/components/atoms/HeaderWithCrossTitleDynamicIcon";
import { friendReferralStyles as styles } from "./style";
import { ReferFriendIcon } from "@/assets/icons";
import { ImageBackground } from "expo-image";
import referafriendbackgroundimage from "@/assets/images/referafriendbackgroungimage.png";
import { useConnectHomeData } from "@/src/api/queries/useConnectHomeData";

export default function FriendReferralScreen() {
  const navigation = useNavigation();
  const params = useLocalSearchParams<{
    code?: string;
    shareText?: string;
  }>();
  const { data: connectHomeData } = useConnectHomeData();

  const referralCode =
    (typeof params.code === "string" && params.code) ||
    connectHomeData?.referral?.code ||
    "";
  const shareText =
    (typeof params.shareText === "string" && params.shareText) ||
    connectHomeData?.referral?.shareText ||
    (referralCode
      ? `Get one month of free membership when you join Badr using my code: ${referralCode}.`
      : "");

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: () => (
        <HeaderWithCrossTitleDynamicIcon
          title="Refer a Friend"
          titleHighlight=""
          navigation={navigation}
          bgcolor="transparent"
          iconName="chevron-left"
          leftButtonBackground="rgba(255,255,255,0.08)"
          onBackPress={() => navigation.goBack()}
        />
      ),
    });
  }, [navigation]);

  const handleShare = async () => {
    if (!shareText) {
      Alert.alert("Referral unavailable", "Please try again in a moment.");
      return;
    }

    try {
      await Share.share({ message: shareText });
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  return (
    <ImageBackground
      source={referafriendbackgroundimage}
      style={styles.fullScreen}
      contentFit="cover"
    >
      <SafeAreaView style={styles.container}>
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
      </SafeAreaView>
    </ImageBackground>
  );
}
