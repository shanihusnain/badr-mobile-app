import { StyleSheet, View, Text } from "react-native";
import BackButton from "./Backbutton";
import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export const HeaderWithInfoIcon = ({
  title,
  backgroundColor = "transparent",
}: {
  title: string;
  backgroundColor?: string;
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.headerRow,
        {
          paddingTop: insets.top + 10,
          backgroundColor,
        },
      ]}
    >
      <View style={styles.headerLeft}>
        <BackButton onPress={() => router.back()} />
      </View>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerRight}>
        <View style={styles.infoIconContainer}>
          <AntDesign name="info-circle" size={24} color="white" />
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 16,
  },
  headerLeft: {
    width: 40,
    alignItems: "flex-start",
  },
  headerTitle: {
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 16,
    color: Colors.light.white,
    textAlign: "center",
  },
  headerRight: {
    width: 40,
    alignItems: "flex-end",
  },

  infoIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.light.calendarBg,
    justifyContent: "center",
    alignItems: "center",
  },
});
