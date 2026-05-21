import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { useNavigation } from "expo-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { FlatList, Text, View } from "react-native";
import { HeaderWithImageAndDescription } from "@/components/atoms/HeaderWithImageAndDescription";
import { fonts } from "@/assets/fonts";
import { Icon } from "@/assets/images";

export const GoalDescriptionDetails = ({ goal }: { goal: string }) => {
  console.log("Received goal:", goal); // Debugging log to check the received goal
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const navigation = useNavigation();

  const goalInfo = (t(`goalsData.${goal}`, { returnObjects: true }) || {}) as {
    title?: string;
    description?: string;
    heroTitle?: string;
    navTitle?: string;
    steps?: string[];
  };

  const steps = goalInfo.steps || [];
  const heroTitle = goalInfo.heroTitle || "";
  const navTitle = goalInfo.navTitle || "";
  const description = goalInfo.description || "";

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: () => (
        <HeaderWithImageAndDescription
          heroTitle={heroTitle}
          navTitle={navTitle}
          description={description}
          imageSource={Icon}
        />
      ),
    });
  }, [navigation, heroTitle, navTitle, description]);

  return (
    <BlackScreenWrapper>
      <FlatList
        data={steps}
        keyExtractor={(item, index) => String(index)}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => {
          return (
            <View
              style={{
                padding: 16,
                backgroundColor: Colors.light.greybuttonBackground,
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  color: Colors.light.white,
                  fontSize: 14,
                  fontWeight: "400",
                  fontFamily: fonts.primary.regular,
                  textAlign: isRtl ? "right" : "left",
                }}
              >
                {item}
              </Text>
            </View>
          );
        }}
      />
    </BlackScreenWrapper>
  );
};
