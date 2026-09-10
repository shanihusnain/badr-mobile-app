import React, { useCallback, useRef, useState } from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  type ViewToken,
} from "react-native";
import { QuranRecitationWeeklyDayCircle } from "@/components/molecules/QuranWeeklyRecitationProgressDashboard/QuranRecitationWeeklyDayCircle";
import type { WeeklySurahDashboardItem } from "../quranRecitationWeeklyData";
import {
  getRecitationDashboardAvailableWidth,
  getRecitationDayRingSize,
} from "../quranRecitationWeeklyData";
import {
  CARD_GAP,
  weeklySurahProgressStyles as styles,
} from "./SurahRecitationGoals.styles";

type Props = {
  surahItems: WeeklySurahDashboardItem[];
  activeSurahId?: string;
  onActiveSurahChange?: (surahId: string) => void;
};

export function WeeklySurahProgressList({
  surahItems,
  activeSurahId,
  onActiveSurahChange,
}: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = getRecitationDashboardAvailableWidth(screenWidth);
  const ringSize = getRecitationDayRingSize(screenWidth);
  const [activeId, setActiveId] = useState(
    activeSurahId ?? surahItems[0]?.surahId ?? "",
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const firstVisible = viewableItems.find((item) => item.isViewable);
      if (firstVisible?.item && typeof firstVisible.item === "object") {
        const surah = firstVisible.item as WeeklySurahDashboardItem;
        setActiveId(surah.surahId);
        onActiveSurahChange?.(surah.surahId);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const renderItem = useCallback(
    ({ item }: { item: WeeklySurahDashboardItem }) => {
      const isInView = item.surahId === activeId;

      return (
        <View
          style={[
            styles.card,
            { width: cardWidth },
            isInView ? styles.cardActive : styles.cardInactive,
          ]}
        >
          <View style={styles.daysRow}>
            {item.weekDays.map((day, index) => (
              <TouchableOpacity
                key={`${item.surahId}-${day.day}-${index}`}
                style={styles.dayColumn}
                activeOpacity={0.75}
              >
                <QuranRecitationWeeklyDayCircle
                  status={day.status}
                  size={ringSize}
                />
                <Text style={styles.dayLabel} numberOfLines={1}>
                  {day.day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    },
    [activeId, cardWidth, ringSize],
  );

  const keyExtractor = useCallback(
    (item: WeeklySurahDashboardItem) => item.surahId,
    [],
  );

  const itemSeparator = useCallback(
    () => <View style={{ width: CARD_GAP }} />,
    [],
  );

  return (
    <FlatList
      horizontal
      data={surahItems}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      ItemSeparatorComponent={itemSeparator}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      decelerationRate="fast"
      snapToInterval={cardWidth + CARD_GAP}
      snapToAlignment="start"
      removeClippedSubviews={false}
      style={{ overflow: "visible" }}
      contentContainerStyle={{ paddingRight: 8 }}
    />
  );
}
