import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import Header from "@/components/Header";
import { useNavigation } from "expo-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/theme";
import { FlatList, Text, View } from "react-native";
import { HeaderWithImageAndDescription } from "@/components/atoms/HeaderWithImageAndDescription";
import { SafeAreaView } from "react-native-safe-area-context";
import { fonts } from "@/assets/fonts";
import { Icon } from "@/assets/images";

export const GoalDescriptionDetails = ({ goal }: { goal: string }) => {
  console.log("Received goal:", goal); // Debugging log to check the received goal
  const { t } = useTranslation();
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: () => (
        <HeaderWithImageAndDescription
          heroTitle="A Small Deed that Earns a Massive Reward"
          navTitle="Tahiyyat Al-Wudhu"
          description="Tahiyyat Al-Wudhu (Ablution Prayer) is a two-rak'ah Sunnah prayer performed right after completing Wudhu. It serves to purify us from sins and prepare us for further prayer."
          imageSource={Icon}
        />
      ),
    });
  }, [navigation, t]);
  const data = [
    {
      id: 1,
      text: "Step 1: Perform Wudhu (Ablution) - Ensure you have completed your Wudhu before starting the prayer.",
    },
    {
      id: 2,
      text: "Step 2: Find a Clean and Quiet Place - Choose a clean and quiet place to perform the prayer, preferably facing the Qibla.",
    },
    {
      id: 3,
      text: "Step 3: Make the Intention (Niyyah) - Formulate the intention in your heart to perform",
    },
    {
      id: 4,
      text: "Step 3: Make the Intention (Niyyah) - Formulate the intention in your heart to perform",
    },
    {
      id: 5,
      text: "Step 3: Make the Intention (Niyyah) - Formulate the intention in your heart to perform",
    },
    {
      id: 6,
      text: "Step 3: Make the Intention (Niyyah) - Formulate the intention in your heart to perform",
    },
    {
      id: 7,
      text: "Step 3: Make the Intention (Niyyah) - Formulate the intention in your heart to perform",
    },
    {
      id: 8,
      text: "Step 3: Make the Intention (Niyyah) - Formulate the intention in your heart to perform",
    },
    {
      id: 9,
      text: "Step 3: Make the Intention (Niyyah) - Formulate the intention in your heart to perform",
    },
    {
      id: 10,
      text: "Step 3: Make the Intention (Niyyah) - Formulate the intention in your heart to perform",
    },
    {
      id: 11,
      text: "Step 3: Make the Intention (Niyyah) - Formulate the intention in your heart to perform",
    },
    {
      id: 12,
      text: "Step 3: Make the Intention (Niyyah) - Formulate the intention in your heart to perform",
    },
    {
      id: 13,
      text: "Step 3: Make the Intention (Niyyah) - Formulate the intention in your heart to perform",
    },
    {
      id: 14,
      text: "Step 3: Make the Intention (Niyyah) - Formulate the intention in your heart to perform",
    },
    {
      id: 15,
      text: "Step 3: Make the Intention (Niyyah) - Formulate the intention in your heart to perform",
    },
  ];
  return (
    <BlackScreenWrapper>
      <FlatList
        data={data}
        renderItem={({ item }) => {
          return (
            <View
              key={item.id}
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
                }}
              >
                {item?.text}
              </Text>
            </View>
          );
        }}
      />
    </BlackScreenWrapper>
  );
};
