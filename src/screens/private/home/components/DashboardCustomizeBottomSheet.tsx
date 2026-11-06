import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTypedTranslation } from "@/i18next/useTypedTranslation";
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
import { Entypo } from "@expo/vector-icons";
import PrimaryButton from "@/components/atoms/Primary-button";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TopSpace } from "@/components/atoms/TopSpace";
import {
  DashboardCategoryType,
  useGetDashboardCustomisationData,
  type DashboardApiTab,
  type DashboardCustomizeWidget,
} from "@/src/api/queries/useGetDataForDashboardCustomisation";
import { useAddHomeDashboardWidget } from "@/src/api/mutations/useAddHomeDashboardWidget";
import { useRemoveHomeDashboardWidget } from "@/src/api/mutations/useRemoveHomeDashboardWidget";
import {
  DASHBOARD_CUSTOMIZE_FALLBACK_TABS,
  getDashboardWidgetCatalogEntry,
  isCustomizableDashboardWidgetKey,
} from "../dashboardWidgetCatalog";

export type DashboardCategory =
  | "Prayer"
  | "Quran"
  | "Fasting"
  | "Sadaqah"
  | "Time Spent";

export type DashboardCustomizeSettings = {
  items: Array<{
    key: string;
    category: string | null;
    title: string;
  }>;
};

type Props = {
  onClose: () => void;
  onSave?: (settings: DashboardCustomizeSettings) => void;
  onChange?: (index: number) => void;
};

type ActiveDashboardItem = {
  key: string;
  name: string;
  category: string | null;
};

function normalizeApiTab(tab: string | null | undefined): DashboardApiTab {
  const key = String(tab ?? "ALL")
    .trim()
    .toUpperCase();
  if (
    key === DashboardCategoryType.PRAYER ||
    key === DashboardCategoryType.QURAN ||
    key === DashboardCategoryType.FASTING ||
    key === DashboardCategoryType.SADAQAH ||
    key === DashboardCategoryType.TIME_SPENT
  ) {
    return key;
  }
  return DashboardCategoryType.ALL;
}

/** My Dashboard / Add filter tabs — exclude TIME_SPENT (not interactive customize). */
function isCustomizeFilterTab(tab: DashboardApiTab | string): boolean {
  const key = normalizeApiTab(tab);
  return (
    key === DashboardCategoryType.ALL ||
    key === DashboardCategoryType.PRAYER ||
    key === DashboardCategoryType.QURAN ||
    key === DashboardCategoryType.FASTING ||
    key === DashboardCategoryType.SADAQAH
  );
}

function mapActiveWidget(widget: DashboardCustomizeWidget): ActiveDashboardItem | null {
  const key = String(widget.key ?? "")
    .trim()
    .toUpperCase();
  if (!key || !isCustomizableDashboardWidgetKey(key)) return null;
  const catalog = getDashboardWidgetCatalogEntry(key);
  return {
    key,
    name: String(widget.name ?? "").trim() || catalog?.name || key,
    category: widget.category ?? catalog?.category ?? null,
  };
}

function getFilterTabTranslationKey(tabKey: string): string {
  const keyMap: Record<string, string> = {
    ALL: "homeScreen.filterAll",
    PRAYER: "homeScreen.filterPrayer",
    QURAN: "homeScreen.filterQuran",
    FASTING: "homeScreen.filterFasting",
    SADAQAH: "homeScreen.filterSadaqah",
  };
  return keyMap[tabKey] || tabKey;
}

type CategoryTabsScrollProps = {
  tabs: { key: string; label: string }[];
  selectedTab: DashboardApiTab;
  onSelectTab: (key: DashboardApiTab) => void;
  keyPrefix: string;
};

function CategoryTabsScroll({
  tabs,
  selectedTab,
  onSelectTab,
  keyPrefix,
}: CategoryTabsScrollProps) {
  const { t } = useTypedTranslation();

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
      {tabs.map((tab) => {
        const tabKey = normalizeApiTab(tab.key);
        const labelKey = getFilterTabTranslationKey(tabKey);
        const translated = t(labelKey as any);
        const label =
          translated === labelKey ? tab.label?.trim() || tabKey : translated;
        const selectedLabelKey = getFilterTabTranslationKey(selectedTab);
        const selectedTranslated = t(selectedLabelKey as any);
        const selectedLabel =
          selectedTranslated === selectedLabelKey
            ? selectedTab
            : selectedTranslated;
        return (
          <Tabs
            key={`${keyPrefix}-${tabKey}`}
            label={label}
            onPress={() => onSelectTab(tabKey)}
            selectedTab={selectedLabel}
          />
        );
      })}
    </ScrollView>
  );
}

export const DashboardCustomizeBottomSheet = forwardRef<BottomSheet, Props>(
  function DashboardCustomizeBottomSheet({ onClose, onSave, onChange }, ref) {
    const safeAreaInsets = useSafeAreaInsets();
    const { t } = useTypedTranslation();
    const [selectedDashboardTab, setSelectedDashboardTab] =
      useState<DashboardApiTab>(DashboardCategoryType.ALL);
    const [selectedAddTab, setSelectedAddTab] = useState<DashboardApiTab>(
      DashboardCategoryType.ALL,
    );
    const [openRowId, setOpenRowId] = useState<string | null>(null);
    const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());
    const listRef = useRef<BottomSheetFlatListMethods>(null);

    const { data: customizeData, isFetching } =
      useGetDashboardCustomisationData(selectedDashboardTab);
    // Full add pool (tab-filtered GET would under-count other categories).
    const { data: allCustomizeData } = useGetDashboardCustomisationData(
      DashboardCategoryType.ALL,
    );

    const { mutate: addWidget, isPending: isAdding } =
      useAddHomeDashboardWidget();
    const { mutate: removeWidget, isPending: isRemoving } =
      useRemoveHomeDashboardWidget();

    const tabs = useMemo(() => {
      const sourceTabs =
        customizeData?.tabs ??
        allCustomizeData?.tabs ??
        DASHBOARD_CUSTOMIZE_FALLBACK_TABS;
      if (Array.isArray(sourceTabs) && sourceTabs.length > 0) {
        return sourceTabs
          .map((tab) => ({
            key: normalizeApiTab(tab.key),
            label:
              String(tab.label ?? tab.key ?? "").trim() || String(tab.key),
          }))
          .filter((tab) => isCustomizeFilterTab(tab.key));
      }
      return DASHBOARD_CUSTOMIZE_FALLBACK_TABS;
    }, [allCustomizeData?.tabs, customizeData?.tabs]);

    const activeItems = useMemo(() => {
      const widgets = customizeData?.myDashboard ?? [];
      return widgets
        .map(mapActiveWidget)
        .filter((item): item is ActiveDashboardItem => item != null);
    }, [customizeData?.myDashboard]);

    /** Backend-provided add pool across all categories (before Add-tab filter). */
    const remainingAddableItems = useMemo(() => {
      const widgets = allCustomizeData?.addToMyDashboard ?? [];
      return widgets
        .map(mapActiveWidget)
        .filter((item): item is ActiveDashboardItem => item != null);
    }, [allCustomizeData?.addToMyDashboard]);

    const addTabs = useMemo(() => {
      if (remainingAddableItems.length === 0) return [];

      const categoriesWithItems = new Set(
        remainingAddableItems
          .map((entry) =>
            String(entry.category ?? "")
              .trim()
              .toUpperCase(),
          )
          .filter(Boolean),
      );
      const labelByKey = new Map(
        tabs.map((tab) => [normalizeApiTab(tab.key), tab.label] as const),
      );

      const categoryTabs = (
        [
          DashboardCategoryType.PRAYER,
          DashboardCategoryType.QURAN,
          DashboardCategoryType.FASTING,
          DashboardCategoryType.SADAQAH,
        ] as const
      )
        .filter((key) => categoriesWithItems.has(key))
        .map((key) => ({
          key,
          label:
            labelByKey.get(key) ??
            DASHBOARD_CUSTOMIZE_FALLBACK_TABS.find((tab) => tab.key === key)
              ?.label ??
            key,
        }));

      return [
        {
          key: DashboardCategoryType.ALL,
          label:
            labelByKey.get(DashboardCategoryType.ALL) ??
            DASHBOARD_CUSTOMIZE_FALLBACK_TABS[0]?.label ??
            "All",
        },
        ...categoryTabs,
      ];
    }, [remainingAddableItems, tabs]);

    const addPoolItems = useMemo(() => {
      const tab = String(selectedAddTab ?? "ALL")
        .trim()
        .toUpperCase();
      return remainingAddableItems.filter((entry) => {
        if (tab === DashboardCategoryType.ALL) return true;
        return (
          String(entry.category ?? "")
            .trim()
            .toUpperCase() === tab
        );
      });
    }, [remainingAddableItems, selectedAddTab]);

    useEffect(() => {
      if (addTabs.length === 0) {
        if (selectedAddTab !== DashboardCategoryType.ALL) {
          setSelectedAddTab(DashboardCategoryType.ALL);
        }
        return;
      }
      const stillValid = addTabs.some(
        (tab) => normalizeApiTab(tab.key) === selectedAddTab,
      );
      if (!stillValid) {
        setSelectedAddTab(normalizeApiTab(addTabs[0]?.key));
      }
    }, [addTabs, selectedAddTab]);

    useEffect(() => {
      const frame = requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
      return () => cancelAnimationFrame(frame);
    }, [selectedAddTab, addPoolItems.length]);

    const markPending = useCallback((key: string, pending: boolean) => {
      setPendingKeys((prev) => {
        const next = new Set(prev);
        if (pending) next.add(key);
        else next.delete(key);
        return next;
      });
    }, []);

    const handleDelete = useCallback(
      (rowId: string) => {
        if (pendingKeys.has(rowId) || isRemoving) return;
        markPending(rowId, true);
        removeWidget(
          { key: rowId, tab: selectedDashboardTab },
          {
            onSettled: () => {
              markPending(rowId, false);
              setOpenRowId(null);
            },
          },
        );
      },
      [
        isRemoving,
        markPending,
        pendingKeys,
        removeWidget,
        selectedDashboardTab,
      ],
    );

    const handleAddItem = useCallback(
      (entry: ActiveDashboardItem) => {
        if (pendingKeys.has(entry.key) || isAdding) return;
        markPending(entry.key, true);
        addWidget(
          { key: entry.key, tab: selectedAddTab },
          {
            onSettled: () => {
              markPending(entry.key, false);
            },
          },
        );
      },
      [addWidget, isAdding, markPending, pendingKeys, selectedAddTab],
    );

    const sheetTitle =
      customizeData?.title?.trim() ||
      allCustomizeData?.title?.trim() ||
      t("homeScreen.customizeDashboard");
    const addSectionTitle =
      customizeData?.addSectionTitle?.trim() ||
      allCustomizeData?.addSectionTitle?.trim() ||
      t("homeScreen.addToDashboard");
    const saveLabel =
      customizeData?.saveLabel?.trim() ||
      allCustomizeData?.saveLabel?.trim() ||
      "Save";

    const handleSwipeOpen = useCallback((rowId: string | null) => {
      setOpenRowId(rowId);
    }, []);

    const handleSave = useCallback(() => {
      onSave?.({
        items: activeItems.map((item) => ({
          key: item.key,
          category: item.category,
          title: item.name,
        })),
      });
      onClose();
    }, [activeItems, onClose, onSave]);

    const renderFooter = useCallback(
      (props: BottomSheetFooterProps) => (
        <BottomSheetFooter {...props} bottomInset={safeAreaInsets.bottom}>
          <View style={styles.saveFooter}>
            <PrimaryButton
              text={saveLabel}
              onPress={handleSave}
              disabled={activeItems.length === 0 && !isFetching}
            />
          </View>
        </BottomSheetFooter>
      ),
      [
        activeItems.length,
        handleSave,
        isFetching,
        safeAreaInsets.bottom,
        saveLabel,
      ],
    );

    const renderDashboardItem = useCallback(
      ({ item }: { item: ActiveDashboardItem }) => {
        const keyBase = item.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
        const titleKey = `homeScreen.dashboardItem_${keyBase}_title` as any;
        const translatedTitle =
          t(titleKey) === titleKey ? item.name : t(titleKey);
        const isPending = pendingKeys.has(item.key);

        return (
          <View style={styles.rowWrapper}>
            <SwipeToDeleteRow
              rowId={item.key}
              onDelete={handleDelete}
              onSwipeOpen={handleSwipeOpen}
              openRowId={openRowId}
            >
              <View
                style={[
                  styles.swipeListItemContent,
                  isPending && styles.rowPending,
                ]}
              >
                <Text style={styles.listItemTitle}>{translatedTitle}</Text>
              </View>
            </SwipeToDeleteRow>
          </View>
        );
      },
      [handleDelete, handleSwipeOpen, openRowId, pendingKeys, t],
    );

    const ListHeaderComponent = useCallback(
      () => (
        <>
          <View style={styles.header}>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.light.white} />
            </Pressable>
            <Text style={styles.headerTitle}>{sheetTitle}</Text>
            <View style={styles.headerSpacer} />
          </View>
          <TopSpace top={16} />
          <CategoryTabsScroll
            keyPrefix="dashboard"
            tabs={tabs}
            selectedTab={selectedDashboardTab}
            onSelectTab={setSelectedDashboardTab}
          />
          <TopSpace top={16} />
        </>
      ),
      [onClose, selectedDashboardTab, sheetTitle, tabs],
    );

    const ListFooterComponent = useCallback(
      () => (
        <View style={styles.addSection}>
          <View style={styles.addSectionDividerRow}>
            <Text style={styles.addSectionLabel}>{addSectionTitle}</Text>
            <View style={styles.addSectionDividerLine} />
          </View>
          <TopSpace top={16} />
          {addTabs.length > 0 ? (
            <>
              <CategoryTabsScroll
                keyPrefix="add"
                tabs={addTabs}
                selectedTab={selectedAddTab}
                onSelectTab={setSelectedAddTab}
              />
              <TopSpace top={16} />
            </>
          ) : null}
          {addPoolItems.length === 0 ? (
            <Text style={styles.addEmptyText}>
              {t("homeScreen.addToDashboardEmpty" as any)}
            </Text>
          ) : (
            addPoolItems.map((item) => {
              const isPending = pendingKeys.has(item.key);
              const keyBase = item.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/-+/g, "-")
                .replace(/^-|-$/g, "");
              const titleKey =
                `homeScreen.dashboardItem_${keyBase}_title` as any;
              const translatedTitle =
                t(titleKey) === titleKey ? item.name : t(titleKey);

              return (
                <View key={item.key} style={styles.rowWrapper}>
                  <Pressable
                    style={[
                      styles.listItem,
                      styles.addListItem,
                      isPending && styles.rowPending,
                    ]}
                    disabled={isPending}
                    onPress={() => handleAddItem(item)}
                  >
                    <Text style={styles.listItemTitle}>{translatedTitle}</Text>
                    <View style={styles.addActionCircle}>
                      <Entypo
                        name="plus"
                        size={24}
                        color={Colors.light.white}
                      />
                    </View>
                  </Pressable>
                </View>
              );
            })
          )}
        </View>
      ),
      [
        addPoolItems,
        addSectionTitle,
        addTabs,
        handleAddItem,
        pendingKeys,
        selectedAddTab,
        t,
      ],
    );

    return (
      <BottomSheetWrapper
        ref={ref}
        snapPoints={["80%", "92%"]}
        onClose={onClose}
        onChange={onChange}
        scrollable={false}
        footerComponent={renderFooter}
        bgColor={Colors.light.blackBackground}
      >
        <BottomSheetFlatList
          ref={listRef}
          data={activeItems}
          keyExtractor={(item) => item.key}
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
  rowPending: {
    opacity: 0.55,
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
  addEmptyText: {
    color: Colors.light.graylightshade,
    fontSize: 13,
    fontFamily: fonts.primary.regular,
    textAlign: "center",
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
});
