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
  canToggle,
  imageSource,
  isLoading = false,
}: {
  initialValue?: boolean;
  title: string;
  description: string;
  handleSeeMorePRess: () => void;
  onToggle?: (value: boolean) => void;
  onSwicthPress?: () => void;
  /** Return false to block the switch flip (e.g. another goal is unfinished). */
  canToggle?: (nextValue: boolean) => boolean;
  imageSource?: any;
  isLoading?: boolean;
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
    if (isLoading) return;
    const newValue = !isOn.value;
    if (canToggle && canToggle(newValue) === false) return;
    isOn.value = newValue;

    // Defer the heavy parent state updates slightly to allow the switch's local
    // animation to start and run with absolute fluidity on the UI thread first.
    setTimeout(() => {
      onToggle?.(newValue);
      onSwicthPress?.();
    }, 50);
  };

  const displayTitle = isLoading ? "-" : title;
  const displayDescription = isLoading ? "----" : description;

  return (
    <View style={styles.conatiner}>
      {isLoading ? (
        <View style={[styles.backgroundImage, styles.loadingImage]}>
          <SwitchButton
            value={isOn}
            onPress={handleSwitchPress}
            style={[styles.switch, isRtl && { alignSelf: "flex-start" }]}
            size="small"
          />
        </View>
      ) : (
        <ImageBackground
          style={styles.backgroundImage}
          source={imageSource || Icon}
        >
          <SwitchButton
            value={isOn}
            onPress={handleSwitchPress}
            style={[styles.switch, isRtl && { alignSelf: "flex-start" }]}
            size="small"
          />
        </ImageBackground>
      )}
      <TopSpace top={16} />
      <Text style={[styles.title, isRtl && { textAlign: "right" }]}>
        {displayTitle}
      </Text>
      <TopSpace top={8} />
      <Text
        numberOfLines={isDescExpanded ? undefined : DESCRIPTION_MAX_LINES}
        style={[styles.description, isRtl && { textAlign: "right" }]}
      >
        {displayDescription}
      </Text>
      <TopSpace top={2} />
      {!isLoading && (
        <Pressable onPress={handleSeeMorePRess}>
          <Text style={[styles.seeMoreText, isRtl && { textAlign: "right" }]}>
            <Text style={{ color: Colors.light.white }}>... {}</Text>
            {t("monthlyGoalPlanner.readMore")}
          </Text>
        </Pressable>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  seeMoreText: {
    color: Colors.light.green,
    fontSize: 14,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
  },
  description: {
    color: Colors.light.white,
    fontWeight: "400",
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0.02,
  },
  title: {
    color: Colors.light.white,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    fontSize: 16,
    lineHeight: 20,
    textTransform: "capitalize",
  },
  backgroundImage: {
    width: "100%",
    height: 120,
    padding: 16,
    borderRadius: 4,
    overflow: "hidden",
  },
  loadingImage: {
    backgroundColor: Colors.light.blackBackground,
  },
  conatiner: {
    borderRadius: 8,
    backgroundColor: Colors.light.greybuttonBackground,
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
