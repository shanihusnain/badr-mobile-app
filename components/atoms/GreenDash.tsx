import { Colors } from "@/constants/theme";
import { View } from "react-native";

export const GreenDash = () => {
  return (
    <View
      style={{
        height: 2,
        width: 40,
        backgroundColor: Colors.light.green,
        marginTop: 2,
      }}
    />
  );
};
