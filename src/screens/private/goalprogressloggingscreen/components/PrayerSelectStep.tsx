import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/theme";
import { PrayerName, PRAYER_OPTIONS } from "../progressLoggingConfig";
import {
  AsrIcon,
  GreenTickIcon,
  IshaIcon,
  JummaIcon,
  MaghribIcon,
  SunIcon,
  SunriseIcon,
} from "@/assets/icons";

const PRAYER_ICON_COMPONENTS: Record<
  PrayerName,
  React.ComponentType<{ color: string; size: number }>
> = {
  fajr: SunriseIcon,
  dhuhr: SunIcon,
  asr: AsrIcon,
  maghrib: MaghribIcon,
  isha: IshaIcon,
};

interface PrayerSelectStepProps {
  selectedPrayer: PrayerName | null;
  onSelectPrayer: (prayer: PrayerName) => void;
  categoryColor: string;
  t: (key: string) => string;
  styles: any;
  /**
   * When provided, already-logged prayers show a tick + green icon and cannot be
   * selected. The current selection shows a green icon without a tick.
   * When omitted, legacy behavior: tick appears on the selected prayer.
   */
  loggedPrayers?: readonly PrayerName[];
  /** Not loggable for this date (e.g. today's window not open / already passed). Dimmed, no tick. */
  lockedPrayers?: readonly PrayerName[];
  /** Friday + congregational tracking: show Jumu'ah label/icon in place of Dhuhr. */
  showJumuahForDhuhr?: boolean;
}

interface PrayerItemProps {
  prayer: PrayerName;
  isSelected: boolean;
  isLogged: boolean;
  isLocked: boolean;
  onSelectPrayer: (prayer: PrayerName) => void;
  categoryColor: string;
  t: (key: string) => string;
  styles: any;
  tickOnlyWhenLogged: boolean;
  showJumuahForDhuhr: boolean;
}

const PrayerItem = React.memo(
  ({
    prayer,
    isSelected,
    isLogged,
    isLocked,
    onSelectPrayer,
    categoryColor,
    t,
    styles,
    tickOnlyWhenLogged,
    showJumuahForDhuhr,
  }: PrayerItemProps) => {
    const handlePress = React.useCallback(() => {
      if (isLogged || isLocked) return;
      onSelectPrayer(prayer);
    }, [isLocked, isLogged, onSelectPrayer, prayer]);

    const isDisabled = isLogged || isLocked;
    const showHighlight = isSelected || isLogged;
    const iconColor = showHighlight ? categoryColor : Colors.light.white;
    const showTick = tickOnlyWhenLogged ? isLogged : isSelected;
    const isJumuahSlot = showJumuahForDhuhr && prayer === "dhuhr";
    const Icon = isJumuahSlot ? JummaIcon : PRAYER_ICON_COMPONENTS[prayer];
    const label = isJumuahSlot
      ? t("prayerGoals.jumuahShort")
      : t(`prayerGoals.${prayer}`);

    return (
      <TouchableOpacity
        style={styles.prayerColumn}
        onPress={handlePress}
        activeOpacity={isDisabled ? 1 : 0.8}
        disabled={isDisabled}
      >
        <Text
          style={[
            styles.prayerLabel,
            {
              opacity: showHighlight ? 1 : isLocked ? 0.35 : 0.8,
            },
          ]}
        >
          {label.toUpperCase()}
        </Text>
        <View
          style={[
            styles.prayerIconBox,
            showHighlight
              ? styles.prayerIconBoxSelected
              : styles.prayerIconBoxIdle,
            isLocked && !isLogged && { opacity: 0.35 },
            {
              borderTopLeftRadius: prayer === "fajr" ? 4 : 0,
              borderBottomLeftRadius: prayer === "fajr" ? 4 : 0,
              borderTopRightRadius: prayer === "isha" ? 4 : 0,
              borderBottomRightRadius: prayer === "isha" ? 4 : 0,
            },
          ]}
        >
          <Icon color={iconColor} size={14} />
        </View>
        {showTick && (
          <View style={styles.prayerCheckBadge}>
            <GreenTickIcon color={Colors.light.green} size={8} />
          </View>
        )}
      </TouchableOpacity>
    );
  },
);

export const PrayerSelectStep: React.FC<PrayerSelectStepProps> = ({
  selectedPrayer,
  onSelectPrayer,
  categoryColor,
  t,
  styles,
  loggedPrayers,
  lockedPrayers,
  showJumuahForDhuhr = false,
}) => {
  const tickOnlyWhenLogged = loggedPrayers !== undefined;
  const loggedSet = React.useMemo(
    () => new Set<PrayerName>(loggedPrayers ?? []),
    [loggedPrayers],
  );
  const lockedSet = React.useMemo(
    () => new Set<PrayerName>(lockedPrayers ?? []),
    [lockedPrayers],
  );

  return (
    <View style={styles.prayerGrid}>
      {PRAYER_OPTIONS.map((prayer) => (
        <PrayerItem
          key={prayer}
          prayer={prayer}
          isSelected={selectedPrayer === prayer}
          isLogged={loggedSet.has(prayer)}
          isLocked={lockedSet.has(prayer)}
          onSelectPrayer={onSelectPrayer}
          categoryColor={categoryColor}
          t={t}
          styles={styles}
          tickOnlyWhenLogged={tickOnlyWhenLogged}
          showJumuahForDhuhr={showJumuahForDhuhr}
        />
      ))}
    </View>
  );
};
