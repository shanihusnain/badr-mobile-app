import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Colors } from "@/constants/theme";
import { PrayerName, PRAYER_OPTIONS } from "../progressLoggingConfig";
import { fonts } from "@/assets/fonts";
import {
  useGetMissedPastPrayersSlot,
  type MissedPastPrayerSlotKey,
} from "@/src/api/queries/useGetMissedPastPrayersSlot";

const PRAYER_ICONS: Record<
  PrayerName,
  keyof typeof MaterialCommunityIcons.glyphMap
> = {
  fajr: "weather-sunset-up",
  dhuhr: "white-balance-sunny",
  asr: "weather-partly-cloudy",
  maghrib: "weather-sunset",
  isha: "weather-night",
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

    return (
      <TouchableOpacity
        style={localStyles.prayerColumn}
        onPress={handlePress}
        activeOpacity={0.8}
        disabled={!canIncrement}
      >
        <Text style={localStyles.prayerLabel}>{prayer.toUpperCase()}</Text>
        <View
          style={[
            localStyles.prayerIconBox,
            hasQuantity
              ? localStyles.prayerIconBoxSelected
              : localStyles.prayerIconBoxIdle,
            !canIncrement && !loading && localStyles.prayerIconBoxDisabled,
          ]}
        >
          <MaterialCommunityIcons
            name={PRAYER_ICONS[prayer]}
            size={15}
            color={hasQuantity ? categoryColor : Colors.light.white}
          />
        </View>
        <Text
          style={[
            localStyles.qtyLabel,
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
    justifyContent: "center",
    gap: 4,
    width: "100%",
  },
  prayerColumn: {
    alignItems: "center",
    gap: 3,
  },
  prayerLabel: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 10,
    fontWeight: "600",
  },
  prayerIconBox: {
    width: 36,
    height: 24,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  prayerIconBoxSelected: {
    backgroundColor: Colors.light.white,
  },
  prayerIconBoxIdle: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  prayerIconBoxDisabled: {
    opacity: 0.45,
  },
  qtyLabel: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 10,
    fontWeight: "600",
  },
  qtyLabelPlaceholder: {
    opacity: 0.35,
  },
});
