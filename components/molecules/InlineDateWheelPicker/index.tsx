import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const EDGE_PADDING = ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2);
const DAYS_BACK = 365;

export type InlineDateWheelPickerProps = {
  value: string;
  onChange: (dateString: string) => void;
  maximumDate?: Date;
  minimumDate?: Date;
};

type DateWheelItem = {
  key: string;
  dateString: string;
  label: string;
};

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatWheelLabel(date: Date, todayString: string): string {
  const ds = toDateString(date);
  if (ds === todayString) return "Today";
  return moment(date).format("ddd MMM D");
}

function buildDateItems(
  minimumDate: Date,
  maximumDate: Date,
  todayString: string,
): DateWheelItem[] {
  const items: DateWheelItem[] = [];
  const cursor = new Date(
    minimumDate.getFullYear(),
    minimumDate.getMonth(),
    minimumDate.getDate(),
  );
  const end = new Date(
    maximumDate.getFullYear(),
    maximumDate.getMonth(),
    maximumDate.getDate(),
  );

  while (cursor <= end) {
    const dateString = toDateString(cursor);
    items.push({
      key: dateString,
      dateString,
      label: formatWheelLabel(cursor, todayString),
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return items;
}

export function InlineDateWheelPicker({
  value,
  onChange,
  maximumDate = new Date(),
  minimumDate,
}: InlineDateWheelPickerProps) {
  const scrollRef = useRef<ScrollView>(null);
  const lastEmitted = useRef<string | null>(null);
  const didInitialScroll = useRef(false);

  const todayString = useMemo(() => toDateString(new Date()), []);

  const minDate = useMemo(() => {
    if (minimumDate) {
      return new Date(
        minimumDate.getFullYear(),
        minimumDate.getMonth(),
        minimumDate.getDate(),
      );
    }
    const d = new Date(maximumDate);
    d.setDate(d.getDate() - DAYS_BACK);
    return d;
  }, [minimumDate, maximumDate]);

  const maxDate = useMemo(
    () =>
      new Date(
        maximumDate.getFullYear(),
        maximumDate.getMonth(),
        maximumDate.getDate(),
      ),
    [maximumDate],
  );

  const items = useMemo(
    () => buildDateItems(minDate, maxDate, todayString),
    [minDate, maxDate, todayString],
  );

  const selectedIndex = useMemo(() => {
    const idx = items.findIndex((item) => item.dateString === value);
    return idx >= 0 ? idx : items.length - 1;
  }, [items, value]);

  const scrollToIndex = useCallback(
    (index: number, animated = false) => {
      if (index < 0 || index >= items.length) return;
      scrollRef.current?.scrollTo({
        y: index * ITEM_HEIGHT,
        animated,
      });
    },
    [items.length],
  );

  useEffect(() => {
    // Only auto-scroll for value changes that did NOT originate from the
    // user's own scroll gesture (e.g. external resets). This prevents the
    // list from "scrolling itself" while the user is dragging.
    if (lastEmitted.current === value) return;
    const timer = setTimeout(() => scrollToIndex(selectedIndex, false), 0);
    return () => clearTimeout(timer);
  }, [selectedIndex, scrollToIndex, value]);

  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const index = Math.min(
        items.length - 1,
        Math.max(0, Math.round(offsetY / ITEM_HEIGHT)),
      );
      const item = items[index];
      if (item && item.dateString !== value) {
        lastEmitted.current = item.dateString;
        onChange(item.dateString);
      }
    },
    [items, onChange, value],
  );

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        bounces={false}
        nestedScrollEnabled
        scrollEventThrottle={16}
        onLayout={() => {
          if (didInitialScroll.current) return;
          didInitialScroll.current = true;
          scrollToIndex(selectedIndex, false);
        }}
        onMomentumScrollEnd={handleScrollEnd}
      >
        {items.map((item) => {
          const isSelected = item.dateString === value;
          return (
            <View key={item.key} style={styles.itemRow}>
              <View
                style={[
                  styles.itemInner,
                  isSelected && styles.itemInnerSelected,
                ]}
              >
                <Text
                  style={[
                    styles.itemText,
                    isSelected && styles.itemTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
      {/* <View style={[styles.fade, styles.fadeTop]} pointerEvents="none" /> */}
      {/* <View style={[styles.fade, styles.fadeBottom]} pointerEvents="none" /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: PICKER_HEIGHT,
    alignSelf: "stretch",
    marginTop: 8,
    marginHorizontal: 16,
    overflow: "hidden",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: EDGE_PADDING,
  },
  itemRow: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  itemInner: {
    minWidth: 160,
    height: ITEM_HEIGHT - 8,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "transparent",
    paddingHorizontal: 16,
  },
  itemInnerSelected: {
    // borderColor: Colors.light.tint,
    backgroundColor: Colors.light.dullWhiteOpacity,
    width: "100%",
  },
  itemText: {
    fontFamily: fonts.primary.medium || "SF Pro Text",
    fontWeight: "500",
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: "center",
  },
  itemTextSelected: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold || "SF Pro Text",
    fontWeight: "600",
  },
  fade: {
    position: "absolute",
    left: 0,
    right: 0,
    height: EDGE_PADDING,
    zIndex: 2,
  },
  fadeTop: {
    top: 0,
    backgroundColor: Colors.light.blackBackground,
    opacity: 0.85,
  },
  fadeBottom: {
    bottom: 0,
    backgroundColor: Colors.light.blackBackground,
    opacity: 0.85,
  },
});

export default InlineDateWheelPicker;
