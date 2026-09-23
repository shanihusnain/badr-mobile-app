import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  useWindowDimensions,
  View,
  type ViewToken,
} from "react-native";
import { GoalData } from "../../home/components/goalsData";
import {
  getHizbMemorisationGoals,
  type HizbMemorisationGoal,
} from "../quranMemorisationHizbGoals";
import type { QuranMemorisationHizbLogEntry } from "../types";
import {
  CARD_ANCHOR_PADDING_LEFT,
  CARD_GAP,
  FLOW_CARD_WIDTH_RATIO,
} from "./SurahRecitationGoals.styles";
import { HizbMemorisationGoalCard } from "./HizbMemorisationGoalCard";
import { FlowCardCarouselDots } from "./FlowCardCarouselDots";
import { useOptionalMemorisationHizbContext } from "../memorisationHizbContext";
import { FLOW_CARD_HEIGHT } from "./DailyProgressLogging.styles";

type Props = {
  goalData: GoalData;
  activeFlowGoalId: string | null;
  refreshKey?: number;
  onStartFlow: (goalId: string) => void;
  onFlowClose: () => void;
  onLogComplete?: (entry: QuranMemorisationHizbLogEntry) => void;
};

export function HizbMemorisationGoalsList({
  goalData,
  activeFlowGoalId,
  refreshKey = 0,
  onStartFlow,
  onFlowClose,
  onLogComplete,
}: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const memorisationContext = useOptionalMemorisationHizbContext();
  const goals = useMemo(
    () => memorisationContext?.goals ?? getHizbMemorisationGoals(),
    [memorisationContext?.goals, refreshKey, memorisationContext?.refreshKey],
  );
  /** Viewport is inset by left padding; clip peeks of the previous card. */
  const listWidth = screenWidth - CARD_ANCHOR_PADDING_LEFT;
  const cardWidth = Math.min(
    listWidth * FLOW_CARD_WIDTH_RATIO,
    screenWidth * FLOW_CARD_WIDTH_RATIO - CARD_ANCHOR_PADDING_LEFT,
  );
  const snapInterval = cardWidth + CARD_GAP;
  const trailingInset = Math.max(CARD_ANCHOR_PADDING_LEFT, listWidth - cardWidth);
  const snapToOffsets = useMemo(
    () => goals.map((_, index) => index * snapInterval),
    [goals, snapInterval],
  );
  const [activeGoalId, setActiveGoalId] = useState(
    () => memorisationContext?.activeHizbId ?? goals[0]?.id ?? "",
  );

  const setActiveHizbIdRef = useRef(memorisationContext?.setActiveHizbId);
  setActiveHizbIdRef.current = memorisationContext?.setActiveHizbId;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const firstVisible = viewableItems.find((item) => item.isViewable);
      if (firstVisible?.item && typeof firstVisible.item === "object") {
        const goal = firstVisible.item as HizbMemorisationGoal;
        setActiveGoalId(goal.id);
        setActiveHizbIdRef.current?.(goal.id);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const renderItem = useCallback(
    ({ item }: { item: HizbMemorisationGoal }) => {
      if (activeFlowGoalId && item.id !== activeFlowGoalId) {
        return (
          <View
            style={{ width: cardWidth, height: FLOW_CARD_HEIGHT }}
            pointerEvents="none"
          />
        );
      }

      return (
        <HizbMemorisationGoalCard
          goal={item}
          goalData={goalData}
          cardWidth={cardWidth}
          isInView={item.id === activeGoalId}
          isFlowActive={item.id === activeFlowGoalId}
          onStartFlow={onStartFlow}
          onFlowClose={onFlowClose}
          onLogComplete={onLogComplete}
        />
      );
    },
    [
      activeFlowGoalId,
      activeGoalId,
      cardWidth,
      goalData,
      onFlowClose,
      onStartFlow,
      onLogComplete,
    ],
  );

  const keyExtractor = useCallback(
    (item: HizbMemorisationGoal) => item.id,
    [],
  );

  const itemSeparator = useCallback(
    () => <View style={{ width: CARD_GAP }} />,
    [],
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<HizbMemorisationGoal> | null | undefined, index: number) => ({
      length: cardWidth,
      offset: index * snapInterval,
      index,
    }),
    [cardWidth, snapInterval],
  );

  const activeIndex = Math.max(
    0,
    goals.findIndex((goal) => goal.id === activeGoalId),
  );

  return (
    <View>
      <View
        style={[
          {
            paddingLeft: CARD_ANCHOR_PADDING_LEFT,
            overflow: "hidden",
          },
          activeFlowGoalId
            ? { zIndex: 101, elevation: 12, position: "relative" as const }
            : undefined,
        ]}
      >
        <FlatList
          horizontal
          data={goals}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={itemSeparator}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          decelerationRate="fast"
          snapToOffsets={snapToOffsets}
          snapToAlignment="start"
          disableIntervalMomentum
          removeClippedSubviews={false}
          scrollEnabled={!activeFlowGoalId}
          style={{ overflow: "visible", height: FLOW_CARD_HEIGHT }}
          contentContainerStyle={{ paddingRight: trailingInset }}
        />
      </View>
      <FlowCardCarouselDots count={goals.length} activeIndex={activeIndex} />
    </View>
  );
}
