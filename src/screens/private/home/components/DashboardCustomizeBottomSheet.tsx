import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet, Text, View } from "react-native";
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetFooter,
  type BottomSheetFlatListMethods,
} from "@gorhom/bottom-sheet";
import type { BottomSheetFooterProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetFooter/types";
import { Pressable, ScrollView } from "react-native-gesture-handler";
import { BottomSheetWrapper } from "@/components/molecules/BottomSheetWrapper";
import { Colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "@/components/atoms/Tabs";
import { SwipeToDeleteRow } from "./SwipeToDeleteRow";
import { fonts } from "@/assets/fonts";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import PrimaryButton from "@/components/atoms/Primary-button";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TopSpace } from "@/components/atoms/TopSpace";

export type { DashboardCategory };

export type DashboardCustomizeSettings = {
  items: Array<{
    category: DashboardCategory;
    id: number;
    title: string;
  }>;
};

type Props = {
  onClose: () => void;
  onSave?: (settings: DashboardCustomizeSettings) => void;
  onChange?: (index: number) => void;
};

type DashboardCategory =
  | "Prayer"
  | "Quran"
  | "Fasting"
  | "Sadaqah"
  | "Time Spent";

type DashboardItemSource = {
  id: number;
  title: string;
  description: string;
};

type DashboardItem = DashboardItemSource & {
  category: DashboardCategory;
};

const CATEGORY_TABS = [
  "All",
  "Prayer",
  "Quran",
  "Fasting",
  "Sadaqah",
  "Time Spent",
] as const;

const prayersData: DashboardItemSource[] = [
  {
    id: 1,
    title: "Tahiyyat Al Wudhu",
    description: "Tahiyyat Al Wudhu description",
  },
  {
    id: 2,
    title: "The 5 Daily Prayers",
    description: "The 5 Daily Prayers description",
  },
  { id: 3, title: "Sunnah Rawatib", description: "Sunnah Rawatib description" },
  {
    id: 4,
    title: "Thayyat Ul Masjid",
    description: "Thayyat Ul Masjid description",
  },
  {
    id: 5,
    title: "Missed Past Prayers",
    description: "Missed Past Prayers description",
  },
  { id: 6, title: "Duha Prayer", description: "Duha Prayer description" },
  { id: 7, title: "Tawbah Prayer", description: "Tawbah Prayer description" },
  {
    id: 8,
    title: "Istikharah Prayer",
    description: "Istikharah Prayer description",
  },
  { id: 9, title: "Shukr Prayer", description: "Shukr Prayer description" },
  { id: 10, title: "Qiyam al Lail", description: "Qiyam al Lail description" },
];

const quranData: DashboardItemSource[] = [
  {
    id: 1,
    title: "Quran Listening",
    description: "Quran Listening description",
  },
  {
    id: 2,
    title: "Quran Recitation",
    description: "Quran Recitation description",
  },
  {
    id: 3,
    title: "Quran Memorization",
    description: "Quran Memorization description",
  },
  { id: 4, title: "Quran Tajweed", description: "Quran Tajweed description" },
];

const fastingData: DashboardItemSource[] = [
  {
    id: 1,
    title: "Missed Ramadan Fasts",
    description: "Missed Ramadan Fasts description",
  },
  {
    id: 2,
    title: "Prophet Dawood Fast (every other day)",
    description: "Prophet Dawood Fast (every other day) description",
  },
  {
    id: 3,
    title: "Monday & Thursday Fasts",
    description: "Monday & Thursday Fasts description",
  },
  {
    id: 4,
    title: "White Days Fasts",
    description: "White Days Fasts description",
  },
];

const sadaqahData: DashboardItemSource[] = [
  { id: 1, title: "Missed Zakat", description: "Missed Zakat description" },
  {
    id: 2,
    title: "Kafarah for Breaking Fasts",
    description: "Kafarah for Breaking Fasts description",
  },
  { id: 3, title: "Fidya", description: "Fidya description" },
  {
    id: 4,
    title: "Lilah Donations",
    description: "Lilah Donations description",
  },
  {
    id: 5,
    title: "Sadaqah for Parents",
    description: "Sadaqah for Parents description",
  },
  {
    id: 6,
    title: "Volunteering Services",
    description: "Volunteering Services description",
  },
];

const timeSpentData: DashboardItemSource[] = [];

const CATEGORY_DATA: Record<DashboardCategory, DashboardItemSource[]> = {
  Prayer: prayersData,
  Quran: quranData,
  Fasting: fastingData,
  Sadaqah: sadaqahData,
  "Time Spent": timeSpentData,
};
function buildCategoryItems(
  category: DashboardCategory,
  data: DashboardItemSource[],
): DashboardItem[] {
  return data.map((item) => ({ ...item, category }));
}

/** Pool built only from category source arrays — no extra items allowed */
const ADD_TO_DASHBOARD_DATA: DashboardItem[] = (
  Object.entries(CATEGORY_DATA) as [DashboardCategory, DashboardItemSource[]][]
).flatMap(([category, data]) => buildCategoryItems(category, data));

const INITIAL_DASHBOARD_ITEMS: DashboardItem[] = [
  buildCategoryItems("Prayer", prayersData.slice(0, 5)),
  buildCategoryItems("Quran", quranData.slice(0, 1)),
  buildCategoryItems("Sadaqah", sadaqahData.slice(5, 6)),
].flat();

function filterByCategory(
  items: DashboardItem[],
  selectedCategory: string,
): DashboardItem[] {
  if (selectedCategory === "All") {
    return items;
  }
  return items.filter((item) => item.category === selectedCategory);
}

/** Per-category ids repeat (e.g. id 1 in Prayer and Quran) — key by category + title */
function getDashboardItemKey(
  item: Pick<DashboardItem, "category" | "title">,
): string {
  return `${item.category}::${item.title}`;
}

function isSameDashboardItem(a: DashboardItem, b: DashboardItem): boolean {
  return getDashboardItemKey(a) === getDashboardItemKey(b);
}

type CategoryTabsScrollProps = {
  selectedTab: string;
  onSelectTab: (label: string) => void;
  keyPrefix: string;
};

function CategoryTabsScroll({
  selectedTab,
  onSelectTab,
  keyPrefix,
}: CategoryTabsScrollProps) {
  return (
    <ScrollView
      horizontal
      style={styles.categoryFilterScroll}
      contentContainerStyle={styles.categoryFilterContent}
      showsHorizontalScrollIndicator={false}
      nestedScrollEnabled
      scrollEventThrottle={16}
      directionalLockEnabled
      keyboardShouldPersistTaps="handled"
    >
      {CATEGORY_TABS.map((label) => (
        <Tabs
          key={`${keyPrefix}-${label}`}
          label={label}
          onPress={() => onSelectTab(label)}
          selectedTab={selectedTab}
        />
      ))}
    </ScrollView>
  );
}

export const DashboardCustomizeBottomSheet = forwardRef<BottomSheet, Props>(
  function DashboardCustomizeBottomSheet({ onClose, onSave, onChange }, ref) {
    const safeAreaInsets = useSafeAreaInsets();
    const [selectedDashboardCategory, setSelectedDashboardCategory] =
      useState<string>("All");
    const [selectedAddCategory, setSelectedAddCategory] =
      useState<string>("All");
    const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>(
      INITIAL_DASHBOARD_ITEMS,
    );
    const [openRowId, setOpenRowId] = useState<string | null>(null);
    const [selectedAddItemKey, setSelectedAddItemKey] = useState<string | null>(
      null,
    );
    const listRef = useRef<BottomSheetFlatListMethods>(null);

    const filteredDashboardItems = useMemo(
      () => filterByCategory(dashboardItems, selectedDashboardCategory),
      [dashboardItems, selectedDashboardCategory],
    );

    const addToDashboardItems = useMemo(() => {
      const available = ADD_TO_DASHBOARD_DATA.filter(
        (poolItem) =>
          !dashboardItems.some((activeItem) =>
            isSameDashboardItem(activeItem, poolItem),
          ),
      );
      return filterByCategory(available, selectedAddCategory);
    }, [dashboardItems, selectedAddCategory]);

    useEffect(() => {
      const frame = requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
      return () => cancelAnimationFrame(frame);
    }, [selectedAddCategory, addToDashboardItems.length]);

    const handleDelete = useCallback((rowId: string) => {
      setDashboardItems((prev) =>
        prev.filter((item) => getDashboardItemKey(item) !== rowId),
      );
      setOpenRowId(null);
    }, []);

    const handleToggleAddItem = useCallback((item: DashboardItem) => {
      const key = getDashboardItemKey(item);
      setSelectedAddItemKey((current) => (current === key ? null : key));
    }, []);

    const handleSwipeOpen = useCallback((rowId: string | null) => {
      setOpenRowId(rowId);
    }, []);

    const handleSave = useCallback(() => {
      const settings: DashboardCustomizeSettings = {
        items: dashboardItems.map((item) => ({
          category: item.category,
          id: item.id,
          title: item.title,
        })),
      };
      console.log(settings);
      onSave?.(settings);
      onClose();
    }, [dashboardItems, onClose, onSave]);

    const renderFooter = useCallback(
      (props: BottomSheetFooterProps) => (
        <BottomSheetFooter {...props} bottomInset={safeAreaInsets.bottom}>
          <View style={styles.saveFooter}>
            <PrimaryButton
              text="Save"
              onPress={handleSave}
              disabled={dashboardItems.length === 0}
            />
          </View>
        </BottomSheetFooter>
      ),
      [dashboardItems.length, handleSave, safeAreaInsets.bottom],
    );

    const renderDashboardItem = useCallback(
      ({ item }: { item: DashboardItem }) => {
        const rowId = getDashboardItemKey(item);
        return (
          <View style={styles.rowWrapper}>
            <SwipeToDeleteRow
              rowId={rowId}
              onDelete={handleDelete}
              onSwipeOpen={handleSwipeOpen}
              openRowId={openRowId}
            >
              <View style={styles.swipeListItemContent}>
                <Text style={styles.listItemTitle}>{item.title}</Text>
              </View>
            </SwipeToDeleteRow>
          </View>
        );
      },
      [handleDelete, handleSwipeOpen, openRowId],
    );

    const ListHeaderComponent = useCallback(
      () => (
        <>
          <View style={styles.header}>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.light.white} />
            </Pressable>
            <Text style={styles.headerTitle}>CUSTOMIZE DASHBOARD</Text>
            <View style={styles.headerSpacer} />
          </View>
          <TopSpace top={16} />
          <CategoryTabsScroll
            keyPrefix="dashboard"
            selectedTab={selectedDashboardCategory}
            onSelectTab={setSelectedDashboardCategory}
          />
          <TopSpace top={16} />
        </>
      ),
      [onClose, selectedDashboardCategory],
    );

    const ListFooterComponent = useCallback(
      () => (
        <View style={styles.addSection}>
          <View style={styles.addSectionDividerRow}>
            <Text style={styles.addSectionLabel}>ADD TO DASHBOARD</Text>
            <View style={styles.addSectionDividerLine} />
          </View>
          <TopSpace top={16} />
          <CategoryTabsScroll
            keyPrefix="add"
            selectedTab={selectedAddCategory}
            onSelectTab={setSelectedAddCategory}
          />
          <TopSpace top={16} />
          {addToDashboardItems.map((item) => {
            const itemKey = getDashboardItemKey(item);
            const isSelected = selectedAddItemKey === itemKey;
            return (
              <View key={itemKey} style={styles.rowWrapper}>
                <Pressable
                  style={[
                    styles.listItem,
                    styles.addListItem,
                    isSelected && styles.addListItemSelected,
                  ]}
                  onPress={() => handleToggleAddItem(item)}
                >
                  <Text style={styles.listItemTitle}>{item.title}</Text>
                  <View
                    style={
                      isSelected
                        ? styles.addedInDashboard
                        : styles.addActionCircle
                    }
                  >
                    {isSelected ? (
                      <MaterialIcons
                        name="done"
                        size={24}
                        color={Colors.light.white}
                      />
                    ) : (
                      <Entypo
                        name="plus"
                        size={24}
                        color={Colors.light.white}
                      />
                    )}
                  </View>
                </Pressable>
              </View>
            );
          })}
        </View>
      ),
      [
        addToDashboardItems,
        selectedAddCategory,
        selectedAddItemKey,
        handleToggleAddItem,
      ],
    );

    return (
      <BottomSheetWrapper
        ref={ref}
        snapPoints={["50%", "92%"]}
        onClose={onClose}
        onChange={onChange}
        scrollable={false}
        footerComponent={renderFooter}
        bgColor={Colors.light.blackBackground}
      >
        <BottomSheetFlatList
          ref={listRef}
          data={filteredDashboardItems}
          keyExtractor={(item) => getDashboardItemKey(item)}
          renderItem={renderDashboardItem}
          ListHeaderComponent={ListHeaderComponent}
          ListFooterComponent={ListFooterComponent}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          enableFooterMarginAdjustment
        />
      </BottomSheetWrapper>
    );
  },
);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: "600",
  },
  headerSpacer: {},
  closeButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  categoryFilterScroll: {
    marginTop: 8,
    marginBottom: 8,
    flexGrow: 0,
    width: "100%",
  },
  categoryFilterContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 20,
    paddingRight: 16,
    flexGrow: 0,
  },
  listContent: {
    paddingBottom: 40,
  },
  saveFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,

    backgroundColor: Colors.light.blackBackground,
  },
  rowWrapper: {
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  listItem: {
    backgroundColor: Colors.light.greybuttonBackground,
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  swipeListItemContent: {
    paddingHorizontal: 12,
  },
  addListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.greybuttonBackground,
    paddingVertical: 20,
  },
  addListItemSelected: {},
  addActionCircle: {
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    borderColor: Colors.light.white,
    borderWidth: 3,
    borderRadius: 30,
  },
  listItemTitle: {
    color: Colors.light.white,
    fontSize: 14,
    fontWeight: "600",
  },
  listItemDescription: {
    color: Colors.light.white,
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  addSection: {
    marginTop: 16,
    paddingBottom: 8,
  },
  addSectionDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
  },
  addSectionLabel: {
    color: Colors.light.graylightshade,
    fontSize: 12,
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
  },
  addSectionDividerLine: {
    backgroundColor: Colors.light.graylightshade,
    height: 1,
    flex: 1,
  },
  addedInDashboard: {
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    backgroundColor: Colors.light.green,
    borderRadius: 30,
  },
});
