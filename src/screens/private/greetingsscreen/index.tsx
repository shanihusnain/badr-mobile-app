import { fonts } from "@/assets/fonts";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { GreenDash } from "@/components/atoms/GreenDash";
import { TopSpace } from "@/components/atoms/TopSpace";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/provider/useAuth";
import { globalStyles } from "@/src/globalstyles/globalstyles";
import { router } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

export const GreetingsScreen = () => {
  useEffect(() => {
    setTimeout(() => {
      router.replace("/(private)/setpersonalizedgoals");
    }, 5000);
  }, []);

  const { user } = useAuth();
  console.log(user);
  return (
    <BlackScreenWrapper>
      <TopSpace top={30} />
      <Text
        style={{
          fontWeight: "500",
          fontFamily: fonts.primary.medium,
          fontSize: 18,
          color: Colors.light.white,
          marginBottom: 16,
          lineHeight: 22,
          textTransform: "uppercase",
        }}
      >
        Assalamu alaykum, {user?.username}!
      </Text>
      <View style={globalStyles.rowCenter}>
        <GreenDash />
        <Text
          style={{
            color: Colors.light.white,
            fontSize: 14,
            fontFamily: fonts.primary.medium,
            fontWeight: "500",
            marginLeft: 8,
            lineHeight: 18,
          }}
        >
          {"Let's Begin".toUpperCase()}
        </Text>
      </View>
    </BlackScreenWrapper>
  );
};
