import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackButton from "./Backbutton";
import { router } from "expo-router";
import { BellIcon } from "@/assets/icons";

export const HeaderWithImageTitleAndBell = ({
  title,
  showBack,
}: {
  title?: string;
  showBack?: boolean;
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: Colors.light.blackBackground,
        paddingTop: insets.top + 10,
        paddingBottom: 10,
        paddingHorizontal: 16,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {showBack ? (
          <View style={styles.headerLeft}>
            <BackButton onPress={() => router.back()} />
          </View>
        ) : (
          <Pressable onPress={() => console.log("Image has been pressed")}>
            <Image
              source={require("@/assets/images/favicon.png")}
              style={{
                width: 30,
                height: 30,
                borderRadius: 30,
              }}
            />
          </Pressable>
        )}
        <Text
          style={{
            color: Colors.light.white,
            fontFamily: fonts.primary.semiBold,
            fontSize: 14,
            textTransform: "uppercase",
            fontWeight: "400",
          }}
        >
          {title ? title.toUpperCase() : "Plan"}
        </Text>
        <Pressable
          onPress={() => router.push("/notifications")}
          style={styles.bellWrap}
        >
          <BellIcon width={23} height={26} color={Colors.light.white} />
          <View style={styles.bellBadge} />
        </Pressable>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  headerLeft: {
    width: 40,
    alignItems: "flex-start",
  },
  bellWrap: {
    position: "relative",
    width: 23,
    height: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  bellBadge: {
    position: "absolute",
    top: 1,
    right: 1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.red,
  },
});
