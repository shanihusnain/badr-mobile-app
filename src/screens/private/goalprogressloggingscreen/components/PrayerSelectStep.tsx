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
   * Selection is only blocked for unlogged `lockedPrayers`
   * (`canLog === false`, excluding menstruation / auto-qadha slots).
   */
  loggedPrayers?: readonly PrayerName[];
  /** Unlogged and not open for logging yet. Dimmed; cannot be selected. */
  lockedPrayers?: readonly PrayerName[];
  /**
   * Logged but excluded from goal totals (menstruation window).
   * Still tappable / deletable; shows a "Not counted" caption.
   */
  notCountedPrayers?: readonly PrayerName[];
  /** Friday + congregational tracking: show Jumu'ah label/icon in place of Dhuhr. */
  showJumuahForDhuhr?: boolean;
}

interface PrayerItemProps {
  prayer: PrayerName;
  isSelected: boolean;
  isLogged: boolean;
  isLocked: boolean;
  isNotCounted: boolean;
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
    isNotCounted,
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
    // Only an explicit selection (or logged tick) should stand out. Locked and
    // unlocked idle slots share the same look so Fajr is never “pre-selected”.
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
              opacity: isSelected || isLogged ? 1 : 0.75,
            },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {label.toUpperCase()}
        </Text>
        <View
          style={[
            styles.prayerIconBox,
            showSelectedBox
              ? styles.prayerIconBoxSelected
              : styles.prayerIconBoxIdle,
            {
              borderTopLeftRadius: prayer === "fajr" ? 4 : 0,
              borderBottomLeftRadius: prayer === "fajr" ? 4 : 0,
              borderTopRightRadius: prayer === "isha" ? 4 : 0,
              borderBottomRightRadius: prayer === "isha" ? 4 : 0,
              opacity: isNotCounted ? 0.55 : 1,
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
        {isNotCounted ? (
          <Text
            style={{
              color: Colors.light.subtext,
              fontSize: 8,
              marginTop: 2,
              textAlign: "center",
            }}
            numberOfLines={1}
          >
            {t("homeScreen.menstruationLog_notCounted")}
          </Text>
        ) : null}
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
  notCountedPrayers,
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
  const notCountedSet = React.useMemo(
    () => new Set<PrayerName>(notCountedPrayers ?? []),
    [notCountedPrayers],
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
          isNotCounted={notCountedSet.has(prayer)}
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
