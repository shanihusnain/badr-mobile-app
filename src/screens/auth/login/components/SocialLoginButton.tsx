import { Colors } from "@/constants/theme";
import { Pressable } from "react-native";

export const SocialLoginButton = ({
  icon,
  onPress,
  disabled = false,
}: {
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
}) => {
  return (
    <Pressable
      style={{
        height: 40,
        width: 40,
        backgroundColor: Colors.light.calendarBg,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.5 : 1,
      }}
      onPress={onPress}
      disabled={disabled}
    >
      {icon}
    </Pressable>
  );
};
