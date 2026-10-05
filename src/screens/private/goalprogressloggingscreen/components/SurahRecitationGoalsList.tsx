import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  useWindowDimensions,
  View,
  type ViewToken,
} from "react-native";
import { GoalData } from "../../home/components/goalsData";
import {
  getSurahRecitationCycleMode,
  isSurahRecitationGoalId,
} from "../quranRecitationTarget";
import {
  getSurahRecitationGoals,
  type SurahRecitationGoal,
} from "../quranRecitationSurahGoals";
import type { QuranRecitationLogEntry } from "../types";
import { FLOW_CARD_HEIGHT } from "./DailyProgressLogging.styles";
import {
  CARD_ANCHOR_PADDING_LEFT,
  CARD_GAP,
  FLOW_CARD_WIDTH_RATIO,
} from "./SurahRecitationGoals.styles";
import { SurahRecitationGoalCard } from "./SurahRecitationGoalCard";
import { FlowCardCarouselDots } from "./FlowCardCarouselDots";
import { useOptionalRecitationSurahContext } from "../recitationSurahContext";

type Props = {
  goalData: GoalData;
  activeFlowGoalId: string | null;
  refreshKey?: number;
  onStartFlow: (goalId: string) => void;
  onFlowClose: () => void;
  onLogComplete?: (entry: QuranRecitationLogEntry) => void;
};

export function SurahRecitationGoalsList({
  goalData,
  activeFlowGoalId,
  refreshKey = 0,
  onStartFlow,
  onFlowClose,
  onLogComplete,
}: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const recitationContext = useOptionalRecitationSurahContext();
  const goals = useMemo(() => {
    if (recitationContext?.goals?.length) {
      return recitationContext.goals;
    }
    const allGoals = getSurahRecitationGoals();
    if (!isSurahRecitationGoalId(goalData.id)) {
      return allGoals;
    }
    const frequency = getSurahRecitationCycleMode(goalData.id);
    return allGoals.filter((goal) => goal.frequency === frequency);
  }, [
    goalData.id,
    recitationContext?.goals,
    refreshKey,
    recitationContext?.refreshKey,
  ]);

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
    () => recitationContext?.activeSurahId ?? goals[0]?.id ?? "",
  );

  const setActiveSurahIdRef = useRef(recitationContext?.setActiveSurahId);
  setActiveSurahIdRef.current = recitationContext?.setActiveSurahId;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const firstVisible = viewableItems.find((item) => item.isViewable);
      if (firstVisible?.item && typeof firstVisible.item === "object") {
        const goal = firstVisible.item as SurahRecitationGoal;
        setActiveGoalId(goal.id);
        setActiveSurahIdRef.current?.(goal.id);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const renderItem = useCallback(
    ({ item }: { item: SurahRecitationGoal }) => {
      if (activeFlowGoalId && item.id !== activeFlowGoalId) {
        return (
          <View
            style={{ width: cardWidth, height: FLOW_CARD_HEIGHT }}
            pointerEvents="none"
          />
        );
      }

      return (
        <SurahRecitationGoalCard
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

  const keyExtractor = useCallback((item: SurahRecitationGoal) => item.id, []);

  const itemSeparator = useCallback(
    () => <View style={{ width: CARD_GAP }} />,
    [],
  );

  const activeIndex = Math.max(
    0,
    goals.findIndex((goal) => goal.id === activeGoalId),
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<SurahRecitationGoal> | null | undefined, index: number) => ({
      length: cardWidth,
      offset: index * snapInterval,
      index,
    }),
    [cardWidth, snapInterval],
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
