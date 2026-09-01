import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import {
  AsrIcon,
  GreenTickIcon,
  IshaIcon,
  MaghribIcon,
  SunIcon,
  SunriseIcon,
} from "@/assets/icons";

export type SunnahPrayerId =
  | "before_fajr"
  | "before_dhuhr"
  | "after_dhuhr"
  | "before_asr"
  | "after_maghrib"
  | "after_isha";

const SUNNAH_ICON_COMPONENTS: Record<
  SunnahPrayerId,
  React.ComponentType<{ color: string; size: number }>
> = {
  before_fajr: SunriseIcon,
  before_dhuhr: SunIcon,
  after_dhuhr: SunIcon,
  before_asr: AsrIcon,
  after_maghrib: MaghribIcon,
  after_isha: IshaIcon,
};

const SUNNAH_LABEL_KEYS: Record<SunnahPrayerId, string> = {
  before_fajr: "progressLogging.sunnahSlotBeforeFajr",
  before_dhuhr: "progressLogging.sunnahSlotBeforeDhuhr",
  after_dhuhr: "progressLogging.sunnahSlotAfterDhuhr",
  before_asr: "progressLogging.sunnahSlotBeforeAsr",
  after_maghrib: "progressLogging.sunnahSlotAfterMaghrib",
  after_isha: "progressLogging.sunnahSlotAfterIsha",
};

interface SunnahPrayerItemProps {
  prayerId: SunnahPrayerId;
  isSelected: boolean;
  isFullyLogged: boolean;
  isPartiallyLogged: boolean;
  isLocked: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelectPrayer: (id: SunnahPrayerId) => void;
  categoryColor: string;
  t: (key: string) => string;
  styles: any;
}

const SunnahPrayerItem = React.memo(
  ({
    prayerId,
    isSelected,
    isFullyLogged,
    isPartiallyLogged,
    isLocked,
    isFirst,
    isLast,
    onSelectPrayer,
    categoryColor,
    t,
    styles,
  }: SunnahPrayerItemProps) => {
    const handlePress = React.useCallback(() => {
      if (isFullyLogged || isLocked) return;
      onSelectPrayer(prayerId);
    }, [isFullyLogged, isLocked, onSelectPrayer, prayerId]);

    const isDisabled = isFullyLogged || isLocked;
    const showHighlight =
      isSelected || isFullyLogged || isPartiallyLogged;
    const iconColor = showHighlight ? categoryColor : Colors.light.white;
    const Icon = SUNNAH_ICON_COMPONENTS[prayerId];
    const [line1, line2] = t(SUNNAH_LABEL_KEYS[prayerId]).split("\n");
    const labelOpacity = showHighlight ? 1 : isLocked ? 0.35 : 0.8;

    return (
      <TouchableOpacity
        style={styles.prayerColumn}
        onPress={handlePress}
        activeOpacity={isDisabled ? 1 : 0.8}
        disabled={isDisabled}
      >
        <View style={localStyles.labelBlock}>
          <Text
            style={[localStyles.labelLine, { opacity: labelOpacity }]}
            numberOfLines={1}
          >
            {line1.toUpperCase()}
          </Text>
          <Text
            style={[
              localStyles.labelLine,
              localStyles.labelLineSecond,
              { opacity: labelOpacity },
            ]}
            numberOfLines={1}
          >
            {(line2 ?? " ").toUpperCase()}
          </Text>
        </View>
        <View
          style={[
            styles.prayerIconBox,
            showHighlight
              ? styles.prayerIconBoxSelected
              : styles.prayerIconBoxIdle,
            isLocked && !showHighlight && { opacity: 0.35 },
            {
              borderTopLeftRadius: isFirst ? 4 : 0,
              borderBottomLeftRadius: isFirst ? 4 : 0,
              borderTopRightRadius: isLast ? 4 : 0,
              borderBottomRightRadius: isLast ? 4 : 0,
            },
          ]}
        >
          <Icon color={iconColor} size={14} />
        </View>
        {isFullyLogged && (
          <View style={styles.prayerCheckBadge}>
            <GreenTickIcon color={Colors.light.green} size={8} />
          </View>
        )}
      </TouchableOpacity>
    );
  },
);

interface SunnahRawatibPrayerSelectStepProps {
  options: readonly SunnahPrayerId[];
  selectedPrayer: SunnahPrayerId;
  onSelectPrayer: (id: SunnahPrayerId) => void;
  categoryColor: string;
  fullyLoggedPrayers?: readonly SunnahPrayerId[];
  partiallyLoggedPrayers?: readonly SunnahPrayerId[];
  lockedPrayers?: readonly SunnahPrayerId[];
  t: (key: string) => string;
  styles: any;
}

export const SunnahRawatibPrayerSelectStep: React.FC<
  SunnahRawatibPrayerSelectStepProps
> = ({
  options,
  selectedPrayer,
  onSelectPrayer,
  categoryColor,
  fullyLoggedPrayers,
  partiallyLoggedPrayers,
  lockedPrayers,
  t,
  styles,
}) => {
  const fullyLoggedSet = React.useMemo(
    () => new Set(fullyLoggedPrayers ?? []),
    [fullyLoggedPrayers],
  );
  const partiallyLoggedSet = React.useMemo(
    () => new Set(partiallyLoggedPrayers ?? []),
    [partiallyLoggedPrayers],
  );
  const lockedSet = React.useMemo(
    () => new Set(lockedPrayers ?? []),
    [lockedPrayers],
  );

  return (
    <View style={styles.prayerGrid}>
      {options.map((id, index) => (
        <SunnahPrayerItem
          key={id}
          prayerId={id}
          isSelected={selectedPrayer === id}
          isFullyLogged={fullyLoggedSet.has(id)}
          isPartiallyLogged={partiallyLoggedSet.has(id)}
          isLocked={lockedSet.has(id)}
          isFirst={index === 0}
          isLast={index === options.length - 1}
          onSelectPrayer={onSelectPrayer}
          categoryColor={categoryColor}
          t={t}
          styles={styles}
        />
      ))}
    </View>
  );
};

const localStyles = StyleSheet.create({
  labelBlock: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 6,
  },
  labelLine: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 8,
    lineHeight: 9,
    textAlign: "center",
    width: "100%",
    letterSpacing: -0.6,
  },
  labelLineSecond: {
    marginTop: -1,
  },
});
