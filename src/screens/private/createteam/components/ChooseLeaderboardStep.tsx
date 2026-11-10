import { fonts } from "@/assets/fonts";
import { createTeamThreeAndFourImage } from "@/assets/images";
import PrimaryButton from "@/components/atoms/Primary-button";
import { Colors } from "@/constants/theme";
import type { ConnectTeamMetricCategory } from "@/src/api/queries/useGetConnectTeamOptions";
import { Ionicons } from "@expo/vector-icons";
import { ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createTeamStyles as sharedStyles } from "../styles";
import { LeaderboardToggleRow } from "./LeaderboardToggleRow";

const HEADER_HEIGHT = 100;

type ChooseLeaderboardStepProps = {
  categories: ConnectTeamMetricCategory[];
  maxMetricsPerCategory: number;
  isSubmitting?: boolean;
  onNext: (selectedByCategory: Record<string, string[]>) => void;
};

export function ChooseLeaderboardStep({
  categories,
  maxMetricsPerCategory,
  isSubmitting = false,
  onNext,
}: ChooseLeaderboardStepProps) {
  const insets = useSafeAreaInsets();
  const firstCategoryId = categories[0]?.category ?? "";

  const [activeCategory, setActiveCategory] = useState(firstCategoryId);
  const [selectedByCategory, setSelectedByCategory] = useState<
    Record<string, string[]>
  >({});

  useEffect(() => {
    if (!categories.length) return;

    setActiveCategory((current) =>
      categories.some((category) => category.category === current)
        ? current
        : categories[0].category,
    );

    setSelectedByCategory((current) => {
      const next: Record<string, string[]> = {};
      for (const category of categories) {
        next[category.category] = current[category.category] ?? [];
      }
      return next;
    });
  }, [categories]);

  const activeCategoryData = useMemo(
    () =>
      categories.find((category) => category.category === activeCategory),
    [activeCategory, categories],
  );

  const selectedIds = selectedByCategory[activeCategory] ?? [];

  const handleToggle = useCallback(
    (metricId: string) => {
      setSelectedByCategory((current) => {
        const existing = current[activeCategory] ?? [];
        const isSelected = existing.includes(metricId);

        if (isSelected) {
          return {
            ...current,
            [activeCategory]: existing.filter((id) => id !== metricId),
          };
        }

        if (existing.length >= maxMetricsPerCategory) {
          return current;
        }

        return {
          ...current,
          [activeCategory]: [...existing, metricId],
        };
      });
    },
    [activeCategory, maxMetricsPerCategory],
  );

  return (
    <View style={sharedStyles.screen}>
      <ImageBackground
        source={createTeamThreeAndFourImage}
        style={styles.heroImage}
        contentFit="cover"
        pointerEvents="none"
      >
        <LinearGradient
          colors={[
            "rgba(8, 26, 47, 0.35)",
            "rgba(8, 26, 47, 0.75)",
            Colors.light.blackBackground,
          ]}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      </ImageBackground>

      <View
        style={[
          styles.content,
          {
            paddingTop: HEADER_HEIGHT + 200,
            paddingBottom: Math.max(insets.bottom, 16) + 8,
          },
        ]}
      >
        <View style={styles.intro}>
          <Text style={styles.introTitle}>
            SWIPE TO SELECT YOUR LEADERBOARDS
          </Text>
          <View style={styles.introSubRow}>
            <Text style={styles.introSubtitle}>
              Choose up to {maxMetricsPerCategory} per category. These settings
              cannot be changed later.
            </Text>
            <Pressable
              onPress={() => console.log("Leaderboard help")}
              hitSlop={8}
            >
              <Ionicons
                name="help-circle-outline"
                size={16}
                color={Colors.light.white}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.categoryRow}>
          {categories.map((category) => {
            const isActive = category.category === activeCategory;

            return (
              <Pressable
                key={category.category}
                onPress={() => setActiveCategory(category.category)}
                style={[
                  styles.categoryChip,
                  isActive
                    ? styles.categoryChipActive
                    : styles.categoryChipInactive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isActive && styles.categoryChipTextActive,
                  ]}
                >
                  {category.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.optionsList}>
          {activeCategoryData?.metrics.map((metric) => (
            <LeaderboardToggleRow
              key={metric.metric}
              label={metric.label}
              enabled={selectedIds.includes(metric.metric)}
              canEnable={selectedIds.length < maxMetricsPerCategory}
              onToggle={() => handleToggle(metric.metric)}
            />
          ))}
        </View>

        <PrimaryButton
          text="CREATE TEAM"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          onPress={() => onNext(selectedByCategory)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "38%",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  intro: {
    marginBottom: 14,
  },
  introTitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 14,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  introSubRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  introSubtitle: {
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 12,
    lineHeight: 17,
    opacity: 0.85,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryChipActive: {
    backgroundColor: Colors.light.green,
  },
  categoryChipInactive: {
    backgroundColor: Colors.light.greybuttonBackground,
  },
  categoryChipText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 13,
    fontWeight: "500",
  },
  categoryChipTextActive: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  optionsList: {
    flex: 1,
  },
});
