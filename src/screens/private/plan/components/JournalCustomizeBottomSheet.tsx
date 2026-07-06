import { CheckIcon, PlusAddIcon } from "@/assets/icons";
import PrimaryButton from "@/components/atoms/Primary-button";
import { TopSpace } from "@/components/atoms/TopSpace";
import { BottomSheetWrapper } from "@/components/molecules/BottomSheetWrapper";
import { Colors } from "@/constants/theme";
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetFooter,
} from "@gorhom/bottom-sheet";
import type { BottomSheetFooterProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetFooter/types";
import { forwardRef, useCallback, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getJournalHabitsForCategory,
  type JournalHabitOptionWithStatus,
} from "../planJournalCustomizeMockData";
import { planStyles as styles } from "../styles";
import { PlanTabBar } from "./PlanTabBar";

const CUSTOMIZE_DESCRIPTION =
  'Inspired by the Hadith of the Prophet (PBUH),"The most beloved of you to Allah are the best of you in character," this feature allows you to select behaviors and practices to track daily, fostering growth in your character.';

type PlanTab = {
  id: number;
  title: string;
};

type JournalCustomizeBottomSheetProps = {
  journalTabs: PlanTab[];
  selectedJournalTab: number;
  onSelectJournalTab: (tabId: number) => void;
  onCustomizePress?: (addedHabitIds: number[]) => void;
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
  const [addedHabitIds, setAddedHabitIds] = useState<number[]>([]);

  const selectedJournalTabTitle =
    journalTabs.find((tab) => tab.id === selectedJournalTab)?.title ?? "All";

  const journalHabits = useMemo(
    () => getJournalHabitsForCategory(selectedJournalTabTitle, addedHabitIds),
    [selectedJournalTabTitle, addedHabitIds],
  );

  const handleToggleHabit = useCallback((habitId: number, isAdded: boolean) => {
    setAddedHabitIds((previousIds) =>
      isAdded
        ? previousIds.filter((id) => id !== habitId)
        : [...previousIds, habitId],
    );
  }, []);

  const handleCustomizePress = useCallback(() => {
    onCustomizePress?.(addedHabitIds);
  }, [addedHabitIds, onCustomizePress]);

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={safeAreaInsets.bottom}>
        <View style={styles.journalCustomizeSheetFooter}>
          <PrimaryButton text="CUSTOMIZE" onPress={handleCustomizePress} />
        </View>
      </BottomSheetFooter>
    ),
    [handleCustomizePress, safeAreaInsets.bottom],
  );

  const renderHabitItem = useCallback(
    ({ item }: { item: JournalHabitOptionWithStatus }) => (
      <View style={styles.journalCustomizeHabitRow}>
        <View style={styles.journalCustomizeHabitTextBlock}>
          <Text style={styles.journalCustomizeHabitTitle}>{item.title}</Text>
          <Text style={styles.journalCustomizeHabitDescription}>
            {item.description}
          </Text>
        </View>
        <Pressable
          style={styles.journalCustomizeHabitIconWrap}
          onPress={() => handleToggleHabit(item.id, item.isAdded)}
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
          {CUSTOMIZE_DESCRIPTION}
        </Text>
        <PlanTabBar
          tabs={journalTabs}
          selectedTab={selectedJournalTab}
          onSelectTab={onSelectJournalTab}
          scrollable
        />
        <TopSpace top={16} />
      </>
    ),
    [journalTabs, onSelectJournalTab, selectedJournalTab],
  );

  return (
    <BottomSheetWrapper
      ref={ref}
      snapPoints={["50%", "92%"]}
      bgColor={Colors.light.darkgrey}
      onClose={onClose}
      onChange={onChange}
      scrollable={false}
      footerComponent={renderFooter}
    >
      <BottomSheetFlatList
        data={journalHabits}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderHabitItem}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.journalCustomizeSheetListContent}
        showsVerticalScrollIndicator={false}
        enableFooterMarginAdjustment
      />
    </BottomSheetWrapper>
  );
});
