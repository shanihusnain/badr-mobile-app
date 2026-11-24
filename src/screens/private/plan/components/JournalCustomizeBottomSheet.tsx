import { CheckIcon, PlusAddIcon } from "@/assets/icons";
import PrimaryButton from "@/components/atoms/Primary-button";
import { TaperedCircleBorder } from "@/components/atoms/TaperedCircleBorder";
import { TopSpace } from "@/components/atoms/TopSpace";
import WarningModal from "@/components/atoms/WarningModal";
import { BottomSheetWrapper } from "@/components/molecules/BottomSheetWrapper";
import { Colors } from "@/constants/theme";
import {
  toJournalBehaviorCategoryParam,
  useGetJournalBehaviors,
  type JournalBehavior,
} from "@/src/api/queries/useGetJournalBehavior";
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetFooter,
} from "@gorhom/bottom-sheet";
import type { BottomSheetFooterProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetFooter/types";
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { planStyles as styles } from "../styles";
import { PlanTabBar } from "./PlanTabBar";
import { useToggleTheBehvaior } from "@/src/api/mutations/useToggleTheBehvaior";

const CUSTOMIZE_DESCRIPTION =
  'Inspired by the Hadith of the Prophet (PBUH),"The most beloved of you to Allah are the best of you in character," this feature allows you to select behaviors and practices to track daily, fostering growth in your character.';
const CUSTOMIZE_LOADING_DURATION_MS = 3000;

type PlanTab = {
  id: number;
  title: string;
};

type JournalHabitRow = JournalBehavior & {
  isAdded: boolean;
};

type JournalCustomizeBottomSheetProps = {
  journalTabs: PlanTab[];
  selectedJournalTab: number;
  onSelectJournalTab: (tabId: number) => void;
  onCustomizePress?: (selectedBehaviorIds: string[]) => void;
  onClose?: () => void;
  onChange?: (index: number) => void;
};

export const JournalCustomizeBottomSheet = forwardRef<
  BottomSheet,
  JournalCustomizeBottomSheetProps
>(function JournalCustomizeBottomSheet(
  {
    journalTabs,
    selectedJournalTab,
    onSelectJournalTab,
    onCustomizePress,
    onClose,
    onChange,
  },
  ref,
) {
  const safeAreaInsets = useSafeAreaInsets();
  const [selectionOverrides, setSelectionOverrides] = useState<
    Record<string, boolean>
  >({});
  const [customizationProgress, setCustomizationProgress] = useState(0);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isCustomized, setIsCustomized] = useState(false);
  const [isSelectionWarningVisible, setIsSelectionWarningVisible] =
    useState(false);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const completionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedJournalTabTitle =
    journalTabs.find((tab) => tab.id === selectedJournalTab)?.title ?? "All";

  const categoryParam = toJournalBehaviorCategoryParam(selectedJournalTabTitle);
  const { data: journalBehaviors } = useGetJournalBehaviors(categoryParam);

  useEffect(() => {
    setSelectionOverrides({});
  }, [categoryParam]);

  useEffect(
    () => () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    },
    [],
  );

  const journalHabits = useMemo<JournalHabitRow[]>(() => {
    const behaviors = journalBehaviors?.behaviors ?? [];

    return behaviors.map((behavior) => ({
      ...behavior,
      isAdded: selectionOverrides[behavior.behaviorId] ?? behavior.isSelected,
    }));
  }, [journalBehaviors?.behaviors, selectionOverrides]);

  const { mutate: toggleJournalingBehavior } = useToggleTheBehvaior();

  const handleSelectJournalTab = useCallback(
    (tabId: number) => {
      const selectedTabIndex = journalTabs.findIndex(
        (tab) => tab.id === selectedJournalTab,
      );
      const nextTabIndex = journalTabs.findIndex((tab) => tab.id === tabId);
      const hasSelectedBehavior = journalHabits.some((habit) => habit.isAdded);

      if (
        selectedJournalTab !== 1 &&
        nextTabIndex > selectedTabIndex &&
        !hasSelectedBehavior
      ) {
        setIsSelectionWarningVisible(true);
        return;
      }

      onSelectJournalTab(tabId);
    },
    [journalHabits, journalTabs, onSelectJournalTab, selectedJournalTab],
  );

  const handleToggleHabit = useCallback(
    (behaviorId: string, isAdded: boolean) => {
      const isSelected = !isAdded;
      setSelectionOverrides((previous) => ({
        ...previous,
        [behaviorId]: isSelected,
      }));
      toggleJournalingBehavior({ behaviorId, isSelected });
    },
    [toggleJournalingBehavior],
  );

  const handleCustomizePress = useCallback(() => {
    if (isCustomizing || isCustomized) return;

    const selectedBehaviorIds = journalHabits
      .filter((habit) => habit.isAdded)
      .map((habit) => habit.behaviorId);
    const startedAt = Date.now();

    setCustomizationProgress(0);
    setIsCustomizing(true);

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setCustomizationProgress(
        Math.min(100, (elapsed / CUSTOMIZE_LOADING_DURATION_MS) * 100),
      );
    }, 30);

    completionTimeoutRef.current = setTimeout(() => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setCustomizationProgress(100);
      setIsCustomizing(false);
      setIsCustomized(true);

      closeTimeoutRef.current = setTimeout(() => {
        onCustomizePress?.(selectedBehaviorIds);
        setCustomizationProgress(0);
        setIsCustomized(false);
      }, 700);
    }, CUSTOMIZE_LOADING_DURATION_MS);
  }, [isCustomized, isCustomizing, journalHabits, onCustomizePress]);

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={safeAreaInsets.bottom}>
        <View style={styles.journalCustomizeSheetFooter}>
          <PrimaryButton
            text="CUSTOMIZE"
            onPress={handleCustomizePress}
            style={styles.journalCustomizeSheetButton}
          />
        </View>
      </BottomSheetFooter>
    ),
    [handleCustomizePress, safeAreaInsets.bottom],
  );

  const renderHabitItem = useCallback(
    ({ item }: { item: JournalHabitRow }) => (
      <View style={styles.journalCustomizeHabitRow}>
        <View style={styles.journalCustomizeHabitTextBlock}>
          <Text style={styles.journalCustomizeHabitTitle}>{item.title}</Text>
          <Text style={styles.journalCustomizeHabitDescription}>
            {item.description}
          </Text>
        </View>
        <Pressable
          style={styles.journalCustomizeHabitIconWrap}
          onPress={() => handleToggleHabit(item.behaviorId, item.isAdded)}
        >
          {item.isAdded ? (
            <View style={styles.journalCustomizeHabitCheckWrap}>
              <CheckIcon color={Colors.light.white} />
            </View>
          ) : (
            <PlusAddIcon color={Colors.light.white} />
          )}
        </Pressable>
      </View>
    ),
    [handleToggleHabit],
  );

  const listHeader = useMemo(
    () => (
      <>
        <TopSpace top={16} />
        <Text style={styles.journalCustomizeSheetTitle}>
          CUSTOMIZE YOUR JOURNAL
        </Text>
        <TopSpace top={16} />
        <Text style={styles.journalCustomizeSheetDescription}>
          Inspired by the Hadith of the Prophet (PBUH),
          <Text style={styles.journalCustomizeSheetDescriptionItalic}>
            {`"The most beloved of you to Allah are the best of you in character,"`}
          </Text>
          {" this feature allows you to select behaviors and practices to track daily, fostering growth in your character."}
        </Text>
        <TopSpace top={16} />
        <PlanTabBar
          tabs={journalTabs}
          selectedTab={selectedJournalTab}
          onSelectTab={handleSelectJournalTab}
          scrollable
        />
        <TopSpace top={16} />
      </>
    ),
    [
      handleSelectJournalTab,
      journalTabs,
      selectedJournalTab,
    ],
  );

  return (
    <BottomSheetWrapper
      ref={ref}
      snapPoints={["100%"]}
      bgColor={Colors.light.darkgrey}
      onClose={onClose}
      onChange={onChange}
      scrollable={false}
    >
      <Modal
        transparent
        visible={isCustomizing || isCustomized}
        animationType="fade"
      >
        <View style={styles.journalCustomizeProgressOverlay}>
          <View style={styles.journalCustomizeProgressContainer}>
            <Text style={styles.journalCustomizeSheetTitle}>
              CUSTOMIZE YOUR JOURNAL
            </Text>
            <View style={styles.journalCustomizeProgressRing}>
              <TaperedCircleBorder
                percentage={`${customizationProgress}%`}
                borderColor={Colors.light.dullWhiteOpacity}
                size={170}
                variant="illuminated"
                glowColorOverride={Colors.light.golden}
              >
                <Text style={styles.journalCustomizeProgressText}>
                  {isCustomized ? "CUSTOMIZED" : "CUSTOMIZING"}
                </Text>
              </TaperedCircleBorder>
            </View>
          </View>
        </View>
      </Modal>
      {!isCustomizing && !isCustomized ? (
        <>
          <BottomSheetFlatList
            data={journalHabits}
            keyExtractor={(item) => item.behaviorId}
            renderItem={renderHabitItem}
            ListHeaderComponent={listHeader}
            contentContainerStyle={styles.journalCustomizeSheetListContent}
            showsVerticalScrollIndicator={false}
            enableFooterMarginAdjustment
          />
          <View style={styles.journalCustomizeSheetFooter}>
            <PrimaryButton
              text="CUSTOMIZE"
              onPress={handleCustomizePress}
              style={styles.journalCustomizeSheetButton}
            />
          </View>
        </>
      ) : null}
      <WarningModal
        visible={isSelectionWarningVisible}
        title="ACTION REQUIRED"
        message="Please select at least one behavior per category to continue."
        primaryButtonText="OK"
        secondaryButtonText={null}
        onPrimaryPress={() => setIsSelectionWarningVisible(false)}
        onBackdropPress={() => setIsSelectionWarningVisible(false)}
      />
    </BottomSheetWrapper>
  );
});
