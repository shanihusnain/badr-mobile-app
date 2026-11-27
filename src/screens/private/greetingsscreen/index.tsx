import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { GreenDash } from "@/components/atoms/GreenDash";
import { TopSpace } from "@/components/atoms/TopSpace";
import { useAuth } from "@/provider/useAuth";
import { globalStyles } from "@/src/globalstyles/globalstyles";
import { setPendingOnboardingRoute } from "@/src/storage/onboardingRouteStorage";
import { ms } from "@/src/utils/responsive";
import { router } from "expo-router";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { styles } from "./styles";

export const GreetingsScreen = () => {
  useEffect(() => {
    void setPendingOnboardingRoute("/(private)/greetingsscreen");
  }, []);

  const { user } = useAuth();

  return (
    <BlackScreenWrapper>
      <Pressable
        onPress={() => router.push("/(private)/setpersonalizedgoals")}
        style={styles.pressable}
      >
        <TopSpace top={ms(30)} />
        <Text style={styles.greeting}>
          Assalamu alaykum, {user?.username}!
        </Text>
        <View style={globalStyles.rowCenter}>
          <GreenDash />
          <Text style={styles.beginLabel}>{"Let's Begin".toUpperCase()}</Text>
        </View>
      </Pressable>
    </BlackScreenWrapper>
  );
};
