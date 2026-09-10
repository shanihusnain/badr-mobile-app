import { StyleSheet, View } from "react-native";
import BackButton from "./Backbutton";
import { Text } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export const HeaderWithInfoIcon = ({ title }: { title: string }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.headerRow,
        {
          paddingTop: insets.top + 10,
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
    backgroundColor: Colors.light.blackBackground,
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
