import { Text, View, type StyleProp, type ViewStyle } from "react-native";
import { TaperedCircleBorder } from "./TaperedCircleBorder";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { useEffect, useState } from "react";

export const LoadingComponent = ({
  size,
  style,
}: {
  size: "small" | "medium" | "large";
  style?: StyleProp<ViewStyle>;
}) => {
  const [dummyPercentage, setDummyPercentage] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setDummyPercentage((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 20);
    return () => clearInterval(interval);
  }, []);

  const ringSize = size === "small" ? 20 : size === "medium" ? 60 : 100;
  const fontSize = size === "small" ? 10 : size === "medium" ? 14 : 28;

  return (
    <View
      style={[
        {
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
        },
        style,
      ]}
    >
      <TaperedCircleBorder
        percentage={dummyPercentage.toString()}
        borderColor={Colors.light.dullWhiteOpacity}
        size={ringSize}
        variant="illuminated"
        glowColorOverride={Colors.light.golden}
      >
        {/* <Text
          style={{
            color: Colors.light.white,
            fontSize,
            fontFamily: fonts.primary.medium,
            fontWeight: "500",
          }}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          Loading...
        </Text> */}
        <Text></Text>
      </TaperedCircleBorder>
    </View>
  );
};
