import React, { memo, useCallback, useEffect, useRef } from "react";
import {
  Animated,
  LayoutAnimation,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import type { JournalDateCapsule } from "../types";
import { CheckIcon } from "@/assets/icons";

const CAPSULE_WIDTH = 52;
const CAPSULE_GAP = 8;

type JournalDateSelectorProps = {
  dates: JournalDateCapsule[];
  onSelectDate: (date: string) => void;
};

function JournalDateSelectorComponent({
  dates,
  onSelectDate,
}: JournalDateSelectorProps) {
  const scrollRef = useRef<ScrollView>(null);
  const selectedIndex = dates.findIndex((item) => item.isSelected);

  useEffect(() => {
    if (selectedIndex < 0 || !scrollRef.current) return;

    const offset = Math.max(
      0,
      selectedIndex * (CAPSULE_WIDTH + CAPSULE_GAP) - CAPSULE_WIDTH * 2,
    );

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ x: offset, animated: true });
    });
  }, [selectedIndex]);

  const handlePress = useCallback(
    (date: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      onSelectDate(date);
    },
    [onSelectDate],
  );

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {dates.map((item) => (
          <DateCapsule
            key={item.date}
            item={item}
            onPress={() => handlePress(item.date)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

type DateCapsuleProps = {
  item: JournalDateCapsule;
  onPress: () => void;
};

function DateCapsule({ item, onPress }: DateCapsuleProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const isDimmed = !item.isSelected && !item.isCompleted;

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };
  return (
    <Pressable
      onPress={animatePress}
      accessibilityRole="button"
      accessibilityState={{ selected: item.isSelected }}
      accessibilityLabel={`${item.weekdayLabel} ${item.dayOfMonth}`}
    >
      <Animated.View
        style={[
          styles.capsule,
          { transform: [{ scale }] },
          {
            borderWidth: item.isSelected || item.isToday ? 1.5 : 0,
            borderStyle: item.isToday && !item.isSelected ? "dashed" : "solid",
            borderColor: Colors.light.white,
          },
        ]}
      >
        <Text
          style={[
            styles.weekday,
            item.isSelected && styles.selectedDateText,
            isDimmed && styles.pastDateText,
          ]}
        >
          {item.weekdayLabel}
        </Text>
        <Text
          style={[
            styles.day,
            item.isSelected && styles.selectedDateText,
            isDimmed && styles.pastDateText,
          ]}
        >
          {item.dayOfMonth}
        </Text>
        <View
          style={[styles.indicatorSlot, isDimmed && styles.pastDateIndicator]}
        >
          {item.isCompleted ? (
            <View style={styles.indicatorCompleted}>
              <CheckIcon size={20} color={Colors.light.white} />
            </View>
          ) : (
            <View style={styles.indicatorIncomplete} />
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: CAPSULE_GAP,
    paddingVertical: 8,
  },
  capsule: {
    width: CAPSULE_WIDTH,
    minHeight: 76,
    borderRadius: 36,
    backgroundColor: Colors.light.insightpill,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
    gap: 4,
  },
  weekday: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 11,
  },
  day: {
    color: Colors.light.white,
    fontFamily: fonts.primary.bold,
    fontSize: 14,
    lineHeight: 20,
  },
  pastDateText: {
    color: "rgba(255, 255, 255, 0.5)",
  },
  selectedDateText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.bold,
  },
  pastDateIndicator: {
    opacity: 0.2,
  },
  indicatorSlot: {
    minHeight: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  indicatorCompleted: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.light.green,
    alignItems: "center",
    justifyContent: "center",
  },
  indicatorIncomplete: {
    width: 20,
    height: 20,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: Colors.light.white,
  },
});

export const JournalDateSelector = memo(JournalDateSelectorComponent);
