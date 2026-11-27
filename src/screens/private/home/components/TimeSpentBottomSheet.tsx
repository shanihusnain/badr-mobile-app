import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  StatusBar,
  ScrollView,
} from "react-native";
import { Pressable } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTypedTranslation } from "@/i18next/useTypedTranslation";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import SecondaryButton from "@/components/atoms/Secondary-button";
import { TimeSpentDetailOverview } from "./TimeSpentDetailOverview";

type Props = {
  visible: boolean;
  onClose: () => void;
  selectedDate?: string;
};

export function TimeSpentBottomSheet({
  visible,
  onClose,
  selectedDate = "",
}: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useTypedTranslation();

  useEffect(() => {
    if (!visible) return;
    StatusBar.setBarStyle("light-content");
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.screen,
          {
            paddingTop: insets.top + 8,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onClose} hitSlop={8}>
            <Ionicons
              name="chevron-back"
              size={24}
              color={Colors.light.white}
            />
          </Pressable>
          <Text style={styles.headerTitle}>
            {t("homeScreen.timeSpentTitle")}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.card}>
            <TimeSpentDetailOverview selectedDate={selectedDate} />
            <View style={styles.footer}>
              <SecondaryButton
                text={t("homeScreen.closeBtn")}
                onPress={onClose}
                variant="green"
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerTitle: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  headerSpacer: {
    width: 40,
  },
  backButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#213144",
    borderRadius: 10,
    padding: 12,
  },
  footer: {
    paddingTop: 8,
    paddingBottom: 4,
  },
});
