import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { rfs } from "@/src/utils/responsive";
import { Text, View } from "react-native";

interface FrameIndicatorProps {
  total: number;
  active: number;
}

export const FrameIndicator = ({ total, active }: FrameIndicatorProps) => {
  return (
    <View
      style={{
        flexDirection: "row",
        marginTop: 16,
        alignItems: "baseline",
        gap: 1,
      }}
    >
      <Text
        style={{
          fontFamily: fonts.primary.bold,
          color: Colors.light.white,
          fontSize: rfs(12),
        }}
      >
        {active}
      </Text>
      <Text
        style={{
          fontFamily: fonts.primary.medium,
          color: Colors.light.icon,
          fontSize: rfs(10),
        }}
      >
        /{total}
      </Text>
    </View>
  );
};
