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
  /** Pass `null` when the user taps the already-selected prayer to deselect. */
  onSelectPrayer: (prayer: PrayerName | null) => void;
  categoryColor: string;
  t: (key: string) => string;
  styles: any;
  /**
   * When provided, already-logged prayers show a tick + green icon.
   * Logged prayers stay tappable so details can be edited.
   * Selection is only blocked for unlogged `lockedPrayers` (canLog === false).
   */
  loggedPrayers?: readonly PrayerName[];
  /** Unlogged and not open for logging yet. Dimmed; cannot be selected. */
  lockedPrayers?: readonly PrayerName[];
  /** Friday + congregational tracking: show Jumu'ah label/icon in place of Dhuhr. */
  showJumuahForDhuhr?: boolean;
}

interface PrayerItemProps {
  prayer: PrayerName;
  isSelected: boolean;
  isLogged: boolean;
  isLocked: boolean;
  onSelectPrayer: (prayer: PrayerName | null) => void;
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
      if (isLocked) return;
      // Tap again on the current selection to clear it.
      onSelectPrayer(isSelected ? null : prayer);
    }, [isLocked, isSelected, onSelectPrayer, prayer]);

    const isDisabled = isLocked;
    // White "selected" box only when actively chosen — logged tick alone must
    // not look selected, or Next stays disabled with no visual feedback.
    const showSelectedBox = isSelected;
    const iconColor =
      isSelected || isLogged ? categoryColor : Colors.light.white;
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
              opacity: isSelected || isLogged ? 1 : isLocked ? 0.35 : 0.8,
            },
          ]}
        >
          {label.toUpperCase()}
        </Text>
        <View
          style={[
            styles.prayerIconBox,
            showSelectedBox
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
        {showTick ? (
          <View style={styles.prayerCheckBadge}>
            <GreenTickIcon color={Colors.light.green} size={8} />
          </View>
        ) : (
          <View style={[styles.prayerCheckBadge, { opacity: 0 }]} />
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
