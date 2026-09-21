import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  useWindowDimensions,
  View,
  type ViewToken,
} from "react-native";
import { GoalData } from "../../home/components/goalsData";
import {
  getJuzMemorisationGoals,
  type JuzMemorisationGoal,
} from "../quranMemorisationJuzGoals";
import type { QuranMemorisationJuzLogEntry } from "../types";
import {
  CARD_ANCHOR_PADDING_LEFT,
  CARD_GAP,
  FLOW_CARD_WIDTH_RATIO,
} from "./SurahRecitationGoals.styles";
import { JuzMemorisationGoalCard } from "./JuzMemorisationGoalCard";
import { useOptionalMemorisationJuzContext } from "../memorisationJuzContext";
import { FLOW_CARD_HEIGHT } from "./DailyProgressLogging.styles";

type Props = {
  goalData: GoalData;
  activeFlowGoalId: string | null;
  refreshKey?: number;
  onStartFlow: (goalId: string) => void;
  onFlowClose: () => void;
  onLogComplete?: (entry: QuranMemorisationJuzLogEntry) => void;
};

export function JuzMemorisationGoalsList({
  goalData,
  activeFlowGoalId,
  refreshKey = 0,
  onStartFlow,
  onFlowClose,
  onLogComplete,
}: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const memorisationContext = useOptionalMemorisationJuzContext();
  const goals = useMemo(
    () => memorisationContext?.goals ?? getJuzMemorisationGoals(),
    [memorisationContext?.goals, refreshKey, memorisationContext?.refreshKey],
  );
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
    () => memorisationContext?.activeJuzId ?? goals[0]?.id ?? "",
  );

  const setActiveJuzIdRef = useRef(memorisationContext?.setActiveJuzId);
  setActiveJuzIdRef.current = memorisationContext?.setActiveJuzId;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const firstVisible = viewableItems.find((item) => item.isViewable);
      if (firstVisible?.item && typeof firstVisible.item === "object") {
        const goal = firstVisible.item as JuzMemorisationGoal;
        setActiveGoalId(goal.id);
        setActiveJuzIdRef.current?.(goal.id);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const renderItem = useCallback(
    ({ item }: { item: JuzMemorisationGoal }) => (
      <JuzMemorisationGoalCard
        goal={item}
        goalData={goalData}
        cardWidth={cardWidth}
        isInView={item.id === activeGoalId}
        isFlowActive={item.id === activeFlowGoalId}
        onStartFlow={onStartFlow}
        onFlowClose={onFlowClose}
        onLogComplete={onLogComplete}
      />
    ),
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
    (item: JuzMemorisationGoal) => item.id,
    [],
  );

  const itemSeparator = useCallback(
    () => <View style={{ width: CARD_GAP }} />,
    [],
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<JuzMemorisationGoal> | null | undefined, index: number) => ({
      length: cardWidth,
      offset: index * snapInterval,
      index,
    }),
    [cardWidth, snapInterval],
  );

  return (
    <View
      style={{
        paddingLeft: CARD_ANCHOR_PADDING_LEFT,
        overflow: "hidden",
      }}
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
  );
}
