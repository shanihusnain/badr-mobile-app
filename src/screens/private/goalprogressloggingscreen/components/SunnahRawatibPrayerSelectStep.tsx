import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
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
    // Paginated pages: After Dhuhr / Before Asr sit at page edges but use sharp
    // middle-style boxes like Before Dhuhr and After Maghrib (Figma).
    const suppressEdgeRounding =
      prayerId === "after_dhuhr" || prayerId === "before_asr";

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
              borderTopLeftRadius: isFirst && !suppressEdgeRounding ? 4 : 0,
              borderBottomLeftRadius: isFirst && !suppressEdgeRounding ? 4 : 0,
              borderTopRightRadius: isLast && !suppressEdgeRounding ? 4 : 0,
              borderBottomRightRadius: isLast && !suppressEdgeRounding ? 4 : 0,
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

/** When all 6 Sunnah slots are in the goal, show 3 per page with side arrows. */
const PRAYER_PAGE_SIZE = 3;
const PAGINATE_MIN_OPTIONS = 6;
const PAGE_CHEVRON_SIZE = 14;
const PAGE_CHEVRON_ICON_ROW_TOP = 23;
const PAGE_CHEVRON_ICON_ROW_HEIGHT = 18;

const pageChevronColor = (enabled: boolean) =>
  enabled ? Colors.light.white : Colors.light.graylightshade;

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

  const paginate = options.length >= PAGINATE_MIN_OPTIONS;
  const pageCount = paginate
    ? Math.ceil(options.length / PRAYER_PAGE_SIZE)
    : 1;
  const [page, setPage] = React.useState(0);

  React.useEffect(() => {
    if (!paginate) {
      setPage(0);
      return;
    }
    const selectedIndex = options.indexOf(selectedPrayer);
    if (selectedIndex >= 0) {
      setPage(Math.floor(selectedIndex / PRAYER_PAGE_SIZE));
    }
  }, [options, paginate, selectedPrayer]);

  React.useEffect(() => {
    if (page > pageCount - 1) {
      setPage(Math.max(0, pageCount - 1));
    }
  }, [page, pageCount]);

  const pageOptions = paginate
    ? options.slice(
        page * PRAYER_PAGE_SIZE,
        page * PRAYER_PAGE_SIZE + PRAYER_PAGE_SIZE,
      )
    : options;

  const canGoPrevPage = paginate && page > 0;
  const canGoNextPage = paginate && page < pageCount - 1;

  const renderItems = (ids: readonly SunnahPrayerId[]) =>
    ids.map((id, index) => (
      <SunnahPrayerItem
        key={id}
        prayerId={id}
        isSelected={selectedPrayer === id}
        isFullyLogged={fullyLoggedSet.has(id)}
        isPartiallyLogged={partiallyLoggedSet.has(id)}
        isLocked={lockedSet.has(id)}
        isFirst={index === 0}
        isLast={index === ids.length - 1}
        onSelectPrayer={onSelectPrayer}
        categoryColor={categoryColor}
        t={t}
        styles={styles}
      />
    ));

  if (!paginate) {
    return <View style={styles.prayerGrid}>{renderItems(options)}</View>;
  }

  return (
    <View style={localStyles.prayerSelectRow}>
      <TouchableOpacity
        style={localStyles.prayerPageArrow}
        onPress={() => {
          if (!canGoPrevPage) return;
          setPage((p) => p - 1);
        }}
        activeOpacity={canGoPrevPage ? 0.7 : 1}
        disabled={!canGoPrevPage}
        hitSlop={10}
      >
        <Ionicons
          name="chevron-back"
          size={PAGE_CHEVRON_SIZE}
          color={pageChevronColor(canGoPrevPage)}
        />
      </TouchableOpacity>

      <View style={[styles.prayerGrid, localStyles.prayerPageGrid]}>
        {renderItems(pageOptions)}
      </View>

      <TouchableOpacity
        style={localStyles.prayerPageArrow}
        onPress={() => {
          if (!canGoNextPage) return;
          setPage((p) => p + 1);
        }}
        activeOpacity={canGoNextPage ? 0.7 : 1}
        disabled={!canGoNextPage}
        hitSlop={10}
      >
        <Ionicons
          name="chevron-forward"
          size={PAGE_CHEVRON_SIZE}
          color={pageChevronColor(canGoNextPage)}
        />
      </TouchableOpacity>
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
  prayerSelectRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    alignSelf: "stretch",
    width: "95%",
    marginLeft: 4,
    marginRight: -10,
    justifyContent: "space-between",
  },
  prayerPageArrow: {
    width: 16,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    marginTop: PAGE_CHEVRON_ICON_ROW_TOP,
    height: PAGE_CHEVRON_ICON_ROW_HEIGHT,
  },
  prayerPageGrid: {
    flex: 1,
    width: undefined,
    paddingHorizontal: 18,
  },
});