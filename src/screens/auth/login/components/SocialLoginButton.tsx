import { Colors } from "@/constants/theme";
import { Pressable } from "react-native";
import { ms, s } from "@/src/utils/responsive";

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
        height: s(40),
        width: s(40),
        backgroundColor: Colors.light.calendarBg,
        borderRadius: ms(20),
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
