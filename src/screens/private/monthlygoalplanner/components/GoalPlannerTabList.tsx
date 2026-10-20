import {
  memo,
  useCallback,
  useMemo,
  type MutableRefObject,
  type ReactElement,
  type RefObject,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  type FlatList as FlatListType,
  Pressable,
  Text,
  View,
} from "react-native";
import { Colors } from "@/constants/theme";
import PrimaryButton from "@/components/atoms/Primary-button";
import { KeyboardAwareListBottomPad } from "./KeyboardAwareListBottomPad";

export type Tab =
  | "cycle"
  | "prayer"
  | "quran"
  | "fasting"
  | "sadaqah"
  | "review";

export type GoalPlannerListCtx = Record<string, any>;

type ListRenderArgs = {
  item: any;
  activeTab: Tab;
  selectedGoals: Record<string, boolean>;
  expandedGoalSelectionId: {
    prayer: string | null;
    quran: string | null;
    fasting: string | null;
    sadaqah: string | null;
  };
  isSavingPrayer: boolean;
  savingPrayerType: string | null;
  isSavingQuran: boolean;
  savingQuranGoalId: string | null;
  isSavingSadaqah: boolean;
  postSaveCollapseSignal: number;
};

type Props = {
  listRef: RefObject<FlatListType<any> | null>;
  activeTab: Tab;
  tabData: any[];
  selectedGoals: Record<string, boolean>;
  expandedGoalSelectionId: ListRenderArgs["expandedGoalSelectionId"];
  locallyConfiguredGoalIds: Record<string, boolean>;
  isSavingPrayer: boolean;
  savingPrayerType: string | null;
  isSavingQuran: boolean;
  savingQuranGoalId: string | null;
  isSavingSadaqah: boolean;
  postSaveCollapseSignal: number;
  /** Review category accordion open state — must invalidate list memo/extraData. */
  reviewExpandedNames: Record<string, boolean>;
  sheetScrollEnabled: boolean;
  isReviewWaitingForCycleDetail: boolean;
  loadingQuranGoals: boolean;
  errorLoadingQuranGoals: boolean;
  canPressFooterPrimary: boolean;
  footerBottomPad: number;
  finishLabel: string;
  ctxRef: MutableRefObject<GoalPlannerListCtx>;
  onFooterPress: () => void;
  onRefetchQuranGoals: () => void;
  onListScrollOffset: (y: number) => void;
  onScrollBeginDrag: () => void;
  onScrollToIndexFailed: (info: {
    index: number;
    averageItemLength: number;
  }) => void;
  GOAL_ITEM_ESTIMATED_HEIGHT: number;
  GOAL_LIST_ITEM_GAP: number;
  listStyles: Record<string, any>;
};

function propsEqual(prev: Props, next: Props) {
  return (
    prev.activeTab === next.activeTab &&
    prev.tabData === next.tabData &&
    prev.selectedGoals === next.selectedGoals &&
    prev.expandedGoalSelectionId === next.expandedGoalSelectionId &&
    prev.locallyConfiguredGoalIds === next.locallyConfiguredGoalIds &&
    prev.isSavingPrayer === next.isSavingPrayer &&
    prev.savingPrayerType === next.savingPrayerType &&
    prev.isSavingQuran === next.isSavingQuran &&
    prev.savingQuranGoalId === next.savingQuranGoalId &&
    prev.isSavingSadaqah === next.isSavingSadaqah &&
    prev.postSaveCollapseSignal === next.postSaveCollapseSignal &&
    prev.reviewExpandedNames === next.reviewExpandedNames &&
    prev.sheetScrollEnabled === next.sheetScrollEnabled &&
    prev.isReviewWaitingForCycleDetail === next.isReviewWaitingForCycleDetail &&
    prev.loadingQuranGoals === next.loadingQuranGoals &&
    prev.errorLoadingQuranGoals === next.errorLoadingQuranGoals &&
    prev.canPressFooterPrimary === next.canPressFooterPrimary &&
    prev.footerBottomPad === next.footerBottomPad &&
    prev.finishLabel === next.finishLabel
  );
}

/**
 * Memoized FlatList shell so modal/chrome updates on GoalPlannerSheet do not
 * reconcile the goal list when list-relevant props are unchanged.
 * Row JSX lives in the sheet via ctxRef.renderGoalListItem.
 */
export const GoalPlannerTabList = memo(function GoalPlannerTabList({
  listRef,
  activeTab,
  tabData,
  selectedGoals,
  expandedGoalSelectionId,
  locallyConfiguredGoalIds,
  isSavingPrayer,
  savingPrayerType,
  isSavingQuran,
  savingQuranGoalId,
  isSavingSadaqah,
  postSaveCollapseSignal,
  reviewExpandedNames,
  sheetScrollEnabled,
  isReviewWaitingForCycleDetail,
  loadingQuranGoals,
  errorLoadingQuranGoals,
  canPressFooterPrimary,
  footerBottomPad,
  finishLabel,
  ctxRef,
  onFooterPress,
  onRefetchQuranGoals,
  onListScrollOffset,
  onScrollBeginDrag,
  onScrollToIndexFailed,
  listStyles: styles,
}: Props) {
  const goalListExtraData = useMemo(
    () => ({
      activeTab,
      expandedGoalSelectionId,
      selectedGoals,
      locallyConfiguredGoalIds,
      isSavingPrayer,
      savingPrayerType,
      isSavingQuran,
      savingQuranGoalId,
      isSavingSadaqah,
      postSaveCollapseSignal,
      reviewExpandedNames,
    }),
    [
      activeTab,
      expandedGoalSelectionId,
      selectedGoals,
      locallyConfiguredGoalIds,
      isSavingPrayer,
      savingPrayerType,
      isSavingQuran,
      savingQuranGoalId,
      isSavingSadaqah,
      postSaveCollapseSignal,
      reviewExpandedNames,
    ],
  );

  const goalListKeyExtractor = useCallback(
    (item: { id?: string | number }) => String(item.id),
    [],
  );

  const goalListFooter = useMemo(
    () => (
      <>
        <KeyboardAwareListBottomPad />
        <View
          style={[
            styles.footerContainer,
            { paddingBottom: footerBottomPad },
          ]}
        >
          <PrimaryButton
            text={finishLabel}
            disabled={!canPressFooterPrimary}
            onPress={onFooterPress}
          />
        </View>
      </>
    ),
    [
      canPressFooterPrimary,
      finishLabel,
      footerBottomPad,
      onFooterPress,
      styles.footerContainer,
    ],
  );

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const render = ctxRef.current.renderGoalListItem as
        | ((args: ListRenderArgs) => ReactElement | null)
        | undefined;
      if (!render) return null;
      return render({
        item,
        activeTab,
        selectedGoals,
        expandedGoalSelectionId,
        isSavingPrayer,
        savingPrayerType,
        isSavingQuran,
        savingQuranGoalId,
        isSavingSadaqah,
        postSaveCollapseSignal,
      });
    },
    [
      activeTab,
      selectedGoals,
      expandedGoalSelectionId,
      isSavingPrayer,
      savingPrayerType,
      isSavingQuran,
      savingQuranGoalId,
      isSavingSadaqah,
      postSaveCollapseSignal,
      ctxRef,
    ],
  );

  return (
    <FlatList
      key={activeTab}
      ref={listRef}
      data={tabData}
      style={styles.list}
      extraData={goalListExtraData}
      keyExtractor={goalListKeyExtractor}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      scrollEnabled={sheetScrollEnabled}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      onScroll={(event) => {
        onListScrollOffset(event.nativeEvent.contentOffset.y);
      }}
      scrollEventThrottle={16}
      onScrollBeginDrag={onScrollBeginDrag}
      onScrollToIndexFailed={onScrollToIndexFailed}
      ListEmptyComponent={
        isReviewWaitingForCycleDetail ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color={Colors.light.white} />
          </View>
        ) : activeTab === "quran" && !loadingQuranGoals ? (
          <View style={{ paddingVertical: 24, alignItems: "center" }}>
            <Text style={styles.tabText}>
              {errorLoadingQuranGoals
                ? "Failed to load Quran goals"
                : "No Quran goals available"}
            </Text>
            {errorLoadingQuranGoals ? (
              <Pressable onPress={onRefetchQuranGoals} style={{ marginTop: 12 }}>
                <Text style={[styles.tabText, styles.tabTextActive]}>
                  Tap to retry
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null
      }
      ListFooterComponent={goalListFooter}
      renderItem={renderItem}
    />
  );
}, propsEqual);
