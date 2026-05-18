import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { Text, View } from "react-native";

interface FrameIndicatorProps {
  total: number;
  active: number;
}

export const FrameIndicator = ({ total, active }: FrameIndicatorProps) => {
  return (
    <View style={{ flexDirection: "row", marginTop: 16 }}>
      {Array.from({ length: total }, (_, i) => {
        const frame = i + 1;
        const isActive = frame === active;
        const isLast = frame === total;
        return (
          <View key={frame} style={{ flexDirection: "row" }}>
            <Text
              style={{
                fontFamily: fonts.primary.medium,
                color: isActive ? Colors.light.white : Colors.light.icon,
              }}
            >
              {frame}
            </Text>
            {!isLast && (
              <Text
                style={{
                  fontFamily: fonts.primary.medium,
                  color: Colors.light.icon,
                }}
              >
                /
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
};
