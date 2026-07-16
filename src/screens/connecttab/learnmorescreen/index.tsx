import { fonts } from "@/assets/fonts";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { HeaderWithCrossTitleDynamicIcon } from "@/components/atoms/HeaderWithCrossTitleDynamicIcon";
import { Colors } from "@/constants/theme";
import { useNavigation } from "expo-router";
import { useCallback, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from "react-native";
import { DiscoverContentCard } from "./components/DiscoverContentCard";
import { DiscoverSearchHeader } from "./components/DiscoverSearchHeader";
import {
  DISCOVER_CATEGORIES,
  type DiscoverCategoryFilter,
  type DiscoverContentItem,
} from "./mockData";
import { useDiscoverFeed } from "./useDiscoverFeed";

export const LearnMoreScreen = () => {
  const navigation = useNavigation();
  const [isSearchMode, setIsSearchMode] = useState(false);
  const {
    items,
    category,
    setCategory,
    searchQuery,
    setSearchQuery,
    isInitialLoading,
    isLoadingMore,
    loadMore,
  } = useDiscoverFeed();

  const handleOpenSearch = useCallback(() => {
    setIsSearchMode(true);
  }, []);

  const handleCancelSearch = useCallback(() => {
    setIsSearchMode(false);
    setSearchQuery("");
  }, [setSearchQuery]);

  useLayoutEffect(() => {
    if (isSearchMode) {
      navigation.setOptions({
        header: () => (
          <DiscoverSearchHeader
            onChangeText={setSearchQuery}
            onCancel={handleCancelSearch}
          />
        ),
      });
      return;
    }

    navigation.setOptions({
      header: ({ navigation: nav }: { navigation: typeof navigation }) => (
        <HeaderWithCrossTitleDynamicIcon
          title="DISCOVER"
          navigation={nav}
          iconName="chevron-left"
          rightIconName="search"
          onRightPress={handleOpenSearch}
        />
      ),
    });
  }, [
    handleCancelSearch,
    handleOpenSearch,
    isSearchMode,
    navigation,
    setSearchQuery,
  ]);

  const renderItem = useCallback<ListRenderItem<DiscoverContentItem>>(
    ({ item }) => (
      <View style={styles.cardCell}>
        <DiscoverContentCard
          item={item}
          onPress={(selected) => console.log("Open discover item", selected.id)}
        />
      </View>
    ),
    [],
  );

  const ListHeader = (
    <View style={styles.filtersRow}>
      {DISCOVER_CATEGORIES.map((filter) => {
        const isActive = filter.id === category;

        return (
          <Pressable
            key={filter.id}
            onPress={() => setCategory(filter.id as DiscoverCategoryFilter)}
            style={[
              styles.filterChip,
              isActive ? styles.filterChipActive : styles.filterChipInactive,
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                isActive && styles.filterChipTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const ListFooter = (
    <View style={styles.footer}>
      {isLoadingMore ? <ActivityIndicator color={Colors.light.green} /> : null}
    </View>
  );

  return (
    <BlackScreenWrapper edges={["left", "right"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          ListEmptyComponent={
            isInitialLoading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator color={Colors.light.green} />
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {searchQuery.trim() ? "No results found" : "No content found"}
                </Text>
              </View>
            )
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
        />
      </KeyboardAvoidingView>
    </BlackScreenWrapper>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  filtersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
    paddingTop: 4,
  },
  filterChip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.light.green,
  },
  filterChipInactive: {
    backgroundColor: Colors.light.greybuttonBackground,
  },
  filterChipText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  filterChipTextActive: {
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  columnWrapper: {
    gap: 10,
    marginBottom: 10,
  },
  cardCell: {
    flex: 1,
  },
  footer: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
  },
  emptyState: {
    paddingTop: 48,
    alignItems: "center",
  },
  emptyText: {
    color: Colors.light.subtext,
    fontFamily: fonts.primary.regular,
    fontSize: 13,
  },
});
