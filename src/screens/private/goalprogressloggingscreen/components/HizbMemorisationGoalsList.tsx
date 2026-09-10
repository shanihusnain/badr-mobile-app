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
import { CARD_GAP, CARD_WIDTH_RATIO } from "./SurahRecitationGoals.styles";
import { HizbMemorisationGoalCard } from "./HizbMemorisationGoalCard";
import { useOptionalMemorisationHizbContext } from "../memorisationHizbContext";

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
    () => getHizbMemorisationGoals(),
    [refreshKey],
  );
  const cardWidth = screenWidth * CARD_WIDTH_RATIO;
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
    ({ item }: { item: HizbMemorisationGoal }) => (
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
    (item: HizbMemorisationGoal) => item.id,
    [],
  );

  const itemSeparator = useCallback(
    () => <View style={{ width: CARD_GAP }} />,
    [],
  );

  return (
    <FlatList
      horizontal
      data={goals}
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
      contentContainerStyle={{ paddingRight: 16 }}
    />
  );
}
