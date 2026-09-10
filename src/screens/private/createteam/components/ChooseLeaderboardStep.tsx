import { fonts } from "@/assets/fonts";
import { createTeamThreeAndFourImage } from "@/assets/images";
import PrimaryButton from "@/components/atoms/Primary-button";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  DEFAULT_SELECTED_LEADERBOARDS,
  LEADERBOARD_CATEGORIES,
  MAX_LEADERBOARDS_PER_CATEGORY,
  type LeaderboardCategoryId,
} from "../leaderboardMockData";
import { createTeamStyles as sharedStyles } from "../styles";
import { LeaderboardToggleRow } from "./LeaderboardToggleRow";

const HEADER_HEIGHT = 100;

type ChooseLeaderboardStepProps = {
  onNext: (selectedByCategory: Record<LeaderboardCategoryId, string[]>) => void;
};

export function ChooseLeaderboardStep({ onNext }: ChooseLeaderboardStepProps) {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] =
    useState<LeaderboardCategoryId>("prayer");
  const [selectedByCategory, setSelectedByCategory] = useState<
    Record<LeaderboardCategoryId, string[]>
  >(() => ({
    prayer: [...DEFAULT_SELECTED_LEADERBOARDS.prayer],
    quran: [...DEFAULT_SELECTED_LEADERBOARDS.quran],
    fasting: [...DEFAULT_SELECTED_LEADERBOARDS.fasting],
    sadaqah: [...DEFAULT_SELECTED_LEADERBOARDS.sadaqah],
  }));

  const activeCategoryData = useMemo(
    () =>
      LEADERBOARD_CATEGORIES.find((category) => category.id === activeCategory),
    [activeCategory],
  );

  const selectedIds = selectedByCategory[activeCategory] ?? [];

  const handleToggle = useCallback(
    (optionId: string) => {
      setSelectedByCategory((current) => {
        const existing = current[activeCategory] ?? [];
        const isSelected = existing.includes(optionId);

        if (isSelected) {
          return {
            ...current,
            [activeCategory]: existing.filter((id) => id !== optionId),
          };
        }

        if (existing.length >= MAX_LEADERBOARDS_PER_CATEGORY) {
          return current;
        }

        return {
          ...current,
          [activeCategory]: [...existing, optionId],
        };
      });
    },
    [activeCategory],
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
          style={StyleSheet.absoluteFillObject}
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
              Choose up to {MAX_LEADERBOARDS_PER_CATEGORY} per category. These
              settings cannot be changed later.
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
          {LEADERBOARD_CATEGORIES.map((category) => {
            const isActive = category.id === activeCategory;

            return (
              <Pressable
                key={category.id}
                onPress={() => setActiveCategory(category.id)}
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
          {activeCategoryData?.options.map((option) => (
            <LeaderboardToggleRow
              key={option.id}
              label={option.label}
              enabled={selectedIds.includes(option.id)}
              canEnable={selectedIds.length < MAX_LEADERBOARDS_PER_CATEGORY}
              onToggle={() => handleToggle(option.id)}
            />
          ))}
        </View>

        <PrimaryButton
          text="CREATE TEAM"
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
