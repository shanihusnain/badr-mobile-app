import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { RenderItem } from "./components/RenderItem";
import { styles } from "./styles";
import { useFreeTrialProps } from "./useFreeTrialProps";
import { useTranslation } from "react-i18next";
import { GreenTextButton } from "@/components/atoms/GreenTextButton";

export default function FreeTrialScreen() {
  const router = useRouter();
  const { texts } = useFreeTrialProps();
  const { t } = useTranslation();

  const handleStartFreeTrial = () => {
    router.push("/(auth)/createaccount");
  };

  const renderItem = ({
    item,
  }: {
    item: {
      title: string;
    };
  }) => <RenderItem item={item} />;

  const renderHeader = () => {
    return (
      <>
        <Text style={styles.titleText}>{t("freeTrialScreen.title")}</Text>

        <View style={styles.secondaryTextWrapper}>
          <View style={styles.greenLine} />
          <Text style={styles.secondarytext}>
            {t("freeTrialScreen.whatsIncluded")}
          </Text>
        </View>

        <Text style={styles.subtitletext}>{t("freeTrialScreen.subtitle")}</Text>
      </>
    );
  };

  return (
    <SafeAreaView
      style={styles.safeAreaContainer}
      edges={["top", "bottom", "left", "right"]}
    >
      <FlatList
        data={texts}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
      />

      <View style={styles.buttonContainer}>
        <GreenTextButton
          title={t("freeTrialScreen.startTrialBtn")}
          onPress={handleStartFreeTrial}
        />
      </View>
    </SafeAreaView>
  );
}
