import { fonts } from "@/assets/fonts";
import { Icon } from "@/assets/images";
import { SwitchButton } from "@/components/atoms/SwitchButton";
import { TopSpace } from "@/components/atoms/TopSpace";
import { Colors } from "@/constants/theme";
import { ImageBackground } from "expo-image";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";

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
  const isOn = useSharedValue(initialValue);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const DESCRIPTION_MAX_LINES = 3;

  const handleSwitchPress = () => {
    isOn.value = !isOn.value;
    onToggle?.(!isOn.value);
    onSwicthPress?.();
  };

  return (
    <View style={styles.conatiner}>
      <ImageBackground style={styles.backgroundImage} source={Icon}>
        <SwitchButton
          value={isOn}
          onPress={handleSwitchPress}
          style={styles.switch}
        />
      </ImageBackground>
      <TopSpace top={12} />
      <Text style={styles.title}>{title}</Text>
      <TopSpace top={12} />
      <Text
        numberOfLines={isDescExpanded ? undefined : DESCRIPTION_MAX_LINES}
        style={styles.description}
      >
        {description}
      </Text>
      <TopSpace top={2} />
      <Pressable onPress={handleSeeMorePRess}>
        <Text style={styles.seeMoreText}>
          <Text style={{ color: Colors.light.white }}>... {}</Text>
          {"read more"}
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
