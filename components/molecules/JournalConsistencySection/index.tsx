import { ExclamationIconWithCircel } from "@/assets/icons/ExclamationIconWithCircel";
import { Colors } from "@/constants/theme";
import type {
  PlanJournalConsistencySnapshot,
  PlanJournalPeriod,
} from "@/src/screens/private/plan/planJournalConsistencyMockData";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { journalConsistencySectionStyles as styles } from "./styles";

export type JournalConsistencySectionProps = {
  activeSnapshot: PlanJournalConsistencySnapshot;
  periods: PlanJournalPeriod[];
  period: PlanJournalPeriod;
  deltaIsPositive: boolean;
  canGoToPreviousPeriod: boolean;
  canGoToNextPeriod: boolean;
  onSelectPeriod: (period: PlanJournalPeriod) => void;
  onPreviousPeriodRange: () => void;
  onNextPeriodRange: () => void;
  periodLabelFormatter?: (period: PlanJournalPeriod) => string;
  deltaLabelFormatter?: (period: PlanJournalPeriod) => string;
  useAbsoluteDelta?: boolean;
  isLoading?: boolean;
};

export function JournalConsistencySection({
  activeSnapshot,
  periods,
  period,
  deltaIsPositive,
  canGoToPreviousPeriod,
  canGoToNextPeriod,
  onSelectPeriod,
  onPreviousPeriodRange,
  onNextPeriodRange,
  periodLabelFormatter,
  deltaLabelFormatter,
  useAbsoluteDelta = false,
  isLoading = false,
}: JournalConsistencySectionProps) {
  const showPlaceholders =
    isLoading || activeSnapshot.consistencyPercent == null;

  const badgeText =
    typeof activeSnapshot.consistencyBadge === "string"
      ? activeSnapshot.consistencyBadge.trim()
      : "";
  const showBadge = !showPlaceholders && badgeText.length > 0;

  return (
    <View style={styles.topRow}>
      <View style={styles.achievementBlock}>
        <View style={styles.consistencyCaptionRow}>
          <Text style={styles.achievementCaption}>CONSISTENCY</Text>
          <Pressable
            style={styles.consistencyInfoBadge}
            onPress={() => router.push("/helpconsistency")}
          >
            <ExclamationIconWithCircel color={Colors.light.white} size={8} />
          </Pressable>
        </View>
        <Text style={styles.achievementPercent}>
          {showPlaceholders ? (
            "---"
          ) : (
            <>
              {activeSnapshot.consistencyPercent}
              <Text style={styles.achievementPercentSymbol}>%</Text>
            </>
          )}
        </Text>
        {showBadge ? (
          <View style={styles.deltaBadge}>
            <Text style={styles.deltaText} numberOfLines={1}>
              {badgeText}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.periodNavRow}>
        <View style={styles.periodToggle}>
          {periods.map((item) => {
            const isActive = period.id === item.id;

            return (
              <Pressable
                key={item.id}
                onPress={() => onSelectPeriod(item)}
                style={[
                  styles.periodButton,
                  isActive
                    ? styles.periodButtonActive
                    : styles.periodButtonInactive,
                ]}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    isActive && styles.periodButtonTextActive,
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.85}
                >
                  {periodLabelFormatter?.(item) ?? item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.dateNavRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.navBtn}
            onPress={onPreviousPeriodRange}
            disabled={!canGoToPreviousPeriod}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={
                canGoToPreviousPeriod
                  ? Colors.light.dullWhite
                  : Colors.light.grey
              }
            />
          </TouchableOpacity>
          <Text
            style={styles.dateRange}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {isLoading ? "---" : activeSnapshot.dateRangeLabel}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.navBtn}
            onPress={onNextPeriodRange}
            disabled={!canGoToNextPeriod}
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={
                canGoToNextPeriod ? Colors.light.dullWhite : Colors.light.grey
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
