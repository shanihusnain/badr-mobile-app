import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  useWindowDimensions,
  View,
  type ViewToken,
} from "react-native";
import { GoalData } from "../../home/components/goalsData";
import {
  getSurahMemorisationGoals,
  type SurahMemorisationGoal,
} from "../quranMemorisationSurahGoals";
import type { QuranMemorisationLogEntry } from "../types";
import {
  CARD_ANCHOR_PADDING_LEFT,
  CARD_GAP,
  FLOW_CARD_WIDTH_RATIO,
  surahGoalStyles,
} from "./SurahRecitationGoals.styles";
import { SurahMemorisationGoalCard } from "./SurahMemorisationGoalCard";
import { useOptionalMemorisationSurahContext } from "../memorisationSurahContext";
import { FLOW_CARD_HEIGHT } from "./DailyProgressLogging.styles";

type Props = {
  goalData: GoalData;
  activeFlowGoalId: string | null;
  refreshKey?: number;
  onStartFlow: (goalId: string) => void;
  onFlowClose: () => void;
  onLogComplete?: (entry: QuranMemorisationLogEntry) => void;
};

export function SurahMemorisationGoalsList({
  goalData,
  activeFlowGoalId,
  refreshKey = 0,
  onStartFlow,
  onFlowClose,
  onLogComplete,
}: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const memorisationContext = useOptionalMemorisationSurahContext();
  const goals = useMemo(
    () => memorisationContext?.goals ?? getSurahMemorisationGoals(),
    [memorisationContext?.goals, refreshKey, memorisationContext?.refreshKey],
  );
  const cardWidth =
    screenWidth * FLOW_CARD_WIDTH_RATIO - CARD_ANCHOR_PADDING_LEFT;
  const snapInterval = cardWidth + CARD_GAP;
  const [activeGoalId, setActiveGoalId] = useState(
    () => memorisationContext?.activeSurahId ?? goals[0]?.id ?? "",
  );

  const setActiveSurahIdRef = useRef(memorisationContext?.setActiveSurahId);
  setActiveSurahIdRef.current = memorisationContext?.setActiveSurahId;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const firstVisible = viewableItems.find((item) => item.isViewable);
      if (firstVisible?.item && typeof firstVisible.item === "object") {
        const goal = firstVisible.item as SurahMemorisationGoal;
        setActiveGoalId(goal.id);
        setActiveSurahIdRef.current?.(goal.id);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const renderItem = useCallback(
    ({ item }: { item: SurahMemorisationGoal }) => (
      <SurahMemorisationGoalCard
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
    (item: SurahMemorisationGoal) => item.id,
    [],
  );

  const itemSeparator = useCallback(
    () => <View style={{ width: CARD_GAP }} />,
    [],
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<SurahMemorisationGoal> | null | undefined, index: number) => ({
      length: cardWidth,
      offset: index * snapInterval,
      index,
    }),
    [cardWidth, snapInterval],
  );

  return (
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
      snapToInterval={snapInterval}
      snapToAlignment="start"
      disableIntervalMomentum
      removeClippedSubviews={false}
      scrollEnabled={!activeFlowGoalId}
      style={{ overflow: "visible", height: FLOW_CARD_HEIGHT }}
      contentContainerStyle={surahGoalStyles.listContent}
    />
  );
}
