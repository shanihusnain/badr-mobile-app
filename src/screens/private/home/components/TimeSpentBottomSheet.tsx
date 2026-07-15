import React, { forwardRef, useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTypedTranslation } from "@/i18next/useTypedTranslation";
import BottomSheet, {
  BottomSheetFooter,
  type BottomSheetFooterProps,
} from "@gorhom/bottom-sheet";
import { Pressable } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomSheetWrapper } from "@/components/molecules/BottomSheetWrapper";
import PrimaryButton from "@/components/atoms/Primary-button";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { TopSpace } from "@/components/atoms/TopSpace";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TimeSpentDetailOverview } from "./TimeSpentDetailOverview";
import SecondaryButton from "@/components/atoms/Secondary-button";

type Props = {
  onClose: () => void;
  onChange?: (index: number) => void;
};

export const TimeSpentBottomSheet = forwardRef<BottomSheet, Props>(
  function TimeSpentBottomSheet({ onClose, onChange }, ref) {
    const safeAreaInsets = useSafeAreaInsets();
    const { t } = useTypedTranslation();

    // const renderFooter = useCallback(
    //   (props: BottomSheetFooterProps) => (
    //     <BottomSheetFooter {...props} bottomInset={safeAreaInsets.bottom}>

    //     </BottomSheetFooter>
    //   ),
    //   [onClose, safeAreaInsets.bottom],
    // );

    return (
      <BottomSheetWrapper
        ref={ref}
        snapPoints={["92%"]}
        onClose={onClose}
        onChange={onChange}
        // footerComponent={renderFooter}
      >
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={24} color={Colors.light.white} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {t("homeScreen.timeSpentTitle")}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <TopSpace top={8} />
        <TimeSpentDetailOverview />
        <View style={styles.footer}>
          <SecondaryButton
            text={t("homeScreen.closeBtn")}
            onPress={onClose}
            variant="green"
          />
        </View>
      </BottomSheetWrapper>
    );
  },
);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 40,
  },
  closeButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  footer: {
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: Colors.light.greybuttonBackground,
  },
});
