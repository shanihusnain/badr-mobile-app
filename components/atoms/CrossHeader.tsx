import { CrossIcon } from "@/assets/icons";
import { Colors } from "@/constants/theme";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const CrossHeader = () => {
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      style={{
        alignItems: "flex-start",
        paddingTop: insets.top + 10,
        // paddingBottom: hp(1),
        backgroundColor: Colors.light.blackBackground,
        paddingHorizontal: 16,
      }}
      onPress={() => router.back()}
    >
      <CrossIcon color={Colors.light.white} width={20} height={20} />
    </Pressable>
  );
};
