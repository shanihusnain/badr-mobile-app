import { fonts } from "@/assets/fonts";
import { Icon } from "@/assets/images";
import { SwitchButton } from "@/components/atoms/SwitchButton";
import { TopSpace } from "@/components/atoms/TopSpace";
import { Colors } from "@/constants/theme";
import { ImageBackground } from "expo-image";
import { useState, useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { useTranslation } from "react-i18next";

export const GoalCardWithDescriptionAndOptionToSelectGoal = ({
  initialValue = false,
  title,
  description,
  handleSeeMorePRess,
  onToggle,
  onSwicthPress,
}: {
  initialValue?: boolean;
  title: string;
  description: string;
  handleSeeMorePRess: () => void;
  onToggle?: (value: boolean) => void;
  onSwicthPress?: () => void;
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const isOn = useSharedValue(initialValue);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const DESCRIPTION_MAX_LINES = 3;

  useEffect(() => {
    if (isOn.value !== initialValue) {
      isOn.value = initialValue;
    }
  }, [initialValue]);

  const handleSwitchPress = () => {
    const newValue = !isOn.value;
    isOn.value = newValue;
    
    // Defer the heavy parent state updates slightly to allow the switch's local
    // animation to start and run with absolute fluidity on the UI thread first.
    setTimeout(() => {
      onToggle?.(newValue);
      onSwicthPress?.();
    }, 50);
  };

  return (
    <View style={styles.conatiner}>
      <ImageBackground style={styles.backgroundImage} source={Icon}>
        <SwitchButton
          value={isOn}
          onPress={handleSwitchPress}
          style={[styles.switch, isRtl && { alignSelf: "flex-start" }]}
        />
      </ImageBackground>
      <TopSpace top={12} />
      <Text style={[styles.title, isRtl && { textAlign: "right" }]}>{title}</Text>
      <TopSpace top={12} />
      <Text
        numberOfLines={isDescExpanded ? undefined : DESCRIPTION_MAX_LINES}
        style={[styles.description, isRtl && { textAlign: "right" }]}
      >
        {description}
      </Text>
      <TopSpace top={2} />
      <Pressable onPress={handleSeeMorePRess}>
        <Text style={[styles.seeMoreText, isRtl && { textAlign: "right" }]}>
          <Text style={{ color: Colors.light.white }}>... {}</Text>
          {t("monthlyGoalPlanner.readMore")}
        </Text>
      </Pressable>
    </View>
  );
};
const styles = StyleSheet.create({
  seeMoreText: {
    color: Colors.light.green,
    fontSize: 13,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  description: {
    color: Colors.light.white,
    fontWeight: "400",
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  title: {
    color: Colors.light.white,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    fontSize: 16,
  },
  backgroundImage: {
    width: "100%",
    height: 150,
    padding: 16,
    borderRadius: 4,
    overflow: "hidden",
  },
  conatiner: {
    borderRadius: 8,
    backgroundColor: Colors.light.calendarBg,
    // alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  switch: {
    // width: 40,
    // height: 20,
    // padding: 10,
    alignSelf: "flex-end",
  },
});
