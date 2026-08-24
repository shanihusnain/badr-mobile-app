import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { PrayerName, PRAYER_OPTIONS } from "../progressLoggingConfig";
import { fonts } from "@/assets/fonts";
import {
  useGetMissedPastPrayersSlot,
  type MissedPastPrayerSlotKey,
} from "@/src/api/queries/useGetMissedPastPrayersSlot";
import {
  FlowCardFajrIcon,
  FlowCardDuhrIcon,
  FlowCardAsrIcon,
  FlowCardMaghrebIcon,
  FlowCardIshaIcon,
} from "@/assets/icons";

const PRAYER_ICONS: Record<
  PrayerName,
  React.ComponentType<{ color?: string; size?: number }>
> = {
  fajr: FlowCardFajrIcon,
  dhuhr: FlowCardDuhrIcon,
  asr: FlowCardAsrIcon,
  maghrib: FlowCardMaghrebIcon,
  isha: FlowCardIshaIcon,
};

const PRAYER_TO_SLOT_KEY: Record<PrayerName, MissedPastPrayerSlotKey> = {
  fajr: "FAJR",
  dhuhr: "DHUHR",
  asr: "ASR",
  maghrib: "MAGHRIB",
  isha: "ISHA",
};

interface MissedPrayersQuantityStepProps {
  quantities: Record<PrayerName, number>;
  onIncrement: (prayer: PrayerName) => void;
  categoryColor: string;
}

const PrayerItem = React.memo(
  ({
    prayer,
    quantity,
    target,
    loading,
    canIncrement,
    onIncrement,
    categoryColor,
  }: {
    prayer: PrayerName;
    quantity: number;
    target: number;
    loading: boolean;
    canIncrement: boolean;
    onIncrement: (prayer: PrayerName) => void;
    categoryColor: string;
  }) => {
    const handlePress = React.useCallback(() => {
      if (!canIncrement) return;
      onIncrement(prayer);
    }, [canIncrement, onIncrement, prayer]);

    const hasQuantity = quantity > 0;
    const Icon = PRAYER_ICONS[prayer];

    return (
      <TouchableOpacity
        style={localStyles.prayerColumn}
        onPress={handlePress}
        activeOpacity={0.8}
        disabled={!canIncrement}
      >
        <Text
          style={[
            localStyles.prayerLabel,
            hasQuantity
              ? localStyles.prayerLabelSelected
              : localStyles.prayerLabelIdle,
          ]}
          numberOfLines={1}
        >
          {prayer.toUpperCase()}
        </Text>
        <View
          style={[
            localStyles.prayerIconBox,
            hasQuantity
              ? localStyles.prayerIconBoxSelected
              : localStyles.prayerIconBoxIdle,
            {
              borderTopLeftRadius: prayer === "fajr" ? 10 : 0,
              borderBottomLeftRadius: prayer === "fajr" ? 10 : 0,
              borderTopRightRadius: prayer === "isha" ? 10 : 0,
              borderBottomRightRadius: prayer === "isha" ? 10 : 0,
            },
            !canIncrement && !loading && localStyles.prayerIconBoxDisabled,
          ]}
        >
          <Icon
            size={14}
            color={hasQuantity ? categoryColor : Colors.light.white}
          />
        </View>
        <Text
          style={[
            localStyles.qtyLabel,
            hasQuantity
              ? localStyles.qtyLabelSelected
              : localStyles.qtyLabelIdle,
            loading && localStyles.qtyLabelPlaceholder,
          ]}
        >
          {loading ? "--/--" : `${quantity}/${target}`}
        </Text>
      </TouchableOpacity>
    );
  },
);

export const MissedPrayersQuantityStep: React.FC<
  MissedPrayersQuantityStepProps
> = ({ quantities, onIncrement, categoryColor }) => {
  const { data, isLoading, isError } = useGetMissedPastPrayersSlot();
  const slotLoading = isLoading || (!data && !isError);
  const slotProgress = data?.slotProgress;

  const handleIncrement = React.useCallback(
    (prayer: PrayerName) => {
      const slot = slotProgress?.[PRAYER_TO_SLOT_KEY[prayer]];
      if (!slot) return;
      const remaining = Math.max(0, slot.target - slot.completed);
      if ((quantities[prayer] || 0) >= remaining) return;
      onIncrement(prayer);
    },
    [onIncrement, quantities, slotProgress],
  );

  return (
    <View style={localStyles.prayerGrid}>
      {PRAYER_OPTIONS.map((prayer) => {
        const slot = slotProgress?.[PRAYER_TO_SLOT_KEY[prayer]];
        const completed = slot?.completed ?? 0;
        const target = slot?.target ?? 0;
        const sessionQty = quantities[prayer] || 0;
        const displayedQty = completed + sessionQty;
        const remaining = Math.max(0, target - completed);

        return (
          <PrayerItem
            key={prayer}
            prayer={prayer}
            quantity={displayedQty}
            target={target}
            loading={slotLoading}
            canIncrement={!slotLoading && sessionQty < remaining}
            onIncrement={handleIncrement}
            categoryColor={categoryColor}
          />
        );
      })}
    </View>
  );
};

const localStyles = StyleSheet.create({
  prayerGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
  },
  prayerColumn: {
    flex: 1,
    alignItems: "center",
    minWidth: 0,
  },
  prayerLabel: {
    width: "100%",
    height: 10,
    lineHeight: 12,
    textAlign: "center",
    fontFamily: fonts.primary.semiBold,
    fontSize: 8,
    fontWeight: "600",
    includeFontPadding: false,
    textAlignVertical: "center",
    marginBottom: 6,
  },
  prayerLabelIdle: {
    color: "rgba(255, 255, 255, 0.55)",
  },
  prayerLabelSelected: {
    color: Colors.light.white,
  },
  prayerIconBox: {
    width: "90%",
    paddingVertical: 3,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  prayerIconBoxSelected: {
    backgroundColor: Colors.light.white,
  },
  prayerIconBoxIdle: {
    backgroundColor: Colors.light.idlePrayerBox,
  },
  prayerIconBoxDisabled: {
    opacity: 0.45,
  },
  qtyLabel: {
    height: 12,
    lineHeight: 12,
    fontFamily: fonts.primary.semiBold,
    fontSize: 9,
    fontWeight: "600",
    includeFontPadding: false,
    marginTop: 3,
  },
  qtyLabelIdle: {
    color: "rgba(255, 255, 255, 0.55)",
  },
  qtyLabelSelected: {
    color: Colors.light.white,
  },
  qtyLabelPlaceholder: {
    opacity: 0.35,
  },
});
