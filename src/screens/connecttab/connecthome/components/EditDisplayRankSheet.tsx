import { fonts } from "@/assets/fonts";
import PrimaryButton from "@/components/atoms/Primary-button";
import { BottomSheetWrapper } from "@/components/molecules/BottomSheetWrapper";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetFooter,
  type BottomSheetFooterProps,
} from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  buildDisplayRankLabel,
  DISPLAY_RANK_METRICS,
  DISPLAY_RANK_PERIODS,
  type DisplayRankPeriod,
  type MyTeam,
} from "../myTeamsMockData";

type EditDisplayRankSheetProps = {
  team: MyTeam | null;
  onClose: () => void;
  onApply: (payload: {
    teamId: string;
    metricId: string;
    period: DisplayRankPeriod;
    displayRankLabel: string;
  }) => void;
  onChange?: (index: number) => void;
};

export const EditDisplayRankSheet = forwardRef<
  BottomSheet,
  EditDisplayRankSheetProps
>(function EditDisplayRankSheet(
  { team, onClose, onApply, onChange },
  ref,
) {
  const insets = useSafeAreaInsets();
  const [isMetricPickerOpen, setIsMetricPickerOpen] = useState(false);
  const [selectedMetricId, setSelectedMetricId] = useState(
    team?.selectedMetricId ?? DISPLAY_RANK_METRICS[0].id,
  );
  const [selectedPeriod, setSelectedPeriod] = useState<DisplayRankPeriod>(
    team?.selectedPeriod ?? "today",
  );

  useEffect(() => {
    if (!team) return;
    setSelectedMetricId(team.selectedMetricId);
    setSelectedPeriod(team.selectedPeriod);
    setIsMetricPickerOpen(false);
  }, [team]);

  const handleApply = useCallback(() => {
    if (!team) return;
    onApply({
      teamId: team.id,
      metricId: selectedMetricId,
      period: selectedPeriod,
      displayRankLabel: buildDisplayRankLabel(selectedMetricId, selectedPeriod),
    });
  }, [onApply, selectedMetricId, selectedPeriod, team]);

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={insets.bottom}>
        <View style={styles.footer}>
          <PrimaryButton text="APPLY" onPress={handleApply} />
        </View>
      </BottomSheetFooter>
    ),
    [handleApply, insets.bottom],
  );

  return (
    <BottomSheetWrapper
      ref={ref}
      snapPoints={["72%", "92%"]}
      bgColor={Colors.light.blackBackground}
      onClose={onClose}
      onChange={onChange}
      footerComponent={renderFooter}
    >
      <View style={styles.header}>
        <Text style={styles.title}>EDIT DISPLAY RANK</Text>
        <Pressable onPress={handleApply} hitSlop={10} style={styles.checkButton}>
          <Ionicons name="checkmark" size={22} color={Colors.light.white} />
        </Pressable>
      </View>

      <Pressable
        style={styles.dropdown}
        onPress={() => setIsMetricPickerOpen((open) => !open)}
      >
        <Text style={styles.dropdownText} numberOfLines={1}>
          {isMetricPickerOpen
            ? "DISPLAY RANK FOR ..."
            : "DISPLAY RANK AS ..."}
        </Text>
        <Ionicons
          name={isMetricPickerOpen ? "chevron-up" : "chevron-down"}
          size={18}
          color={Colors.light.white}
        />
      </Pressable>

      {isMetricPickerOpen ? (
        <View style={styles.list}>
          {DISPLAY_RANK_METRICS.map((metric, index) => {
            const isSelected = metric.id === selectedMetricId;
            return (
              <Pressable
                key={metric.id}
                style={[
                  styles.listRow,
                  index < DISPLAY_RANK_METRICS.length - 1 && styles.listRowBorder,
                ]}
                onPress={() => {
                  setSelectedMetricId(metric.id);
                  setIsMetricPickerOpen(false);
                }}
              >
                <View
                  style={[
                    styles.radioOuter,
                    isSelected && styles.radioOuterSelected,
                  ]}
                >
                  {isSelected ? <View style={styles.radioInner} /> : null}
                </View>
                <Text style={styles.listLabel}>{metric.label}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={styles.periodSection}>
          <Text style={styles.periodHeading}>OVER THE COURSE OF...</Text>
          {DISPLAY_RANK_PERIODS.map((period) => {
            const isSelected = period.id === selectedPeriod;
            return (
              <Pressable
                key={period.id}
                style={styles.periodRow}
                onPress={() => setSelectedPeriod(period.id)}
              >
                <View
                  style={[
                    styles.radioOuter,
                    isSelected && styles.radioOuterSelected,
                  ]}
                >
                  {isSelected ? <View style={styles.radioInner} /> : null}
                </View>
                <Text style={styles.listLabel}>{period.label}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </BottomSheetWrapper>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    position: "relative",
  },
  title: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 14,
    textTransform: "uppercase",
  },
  checkButton: {
    position: "absolute",
    right: 0,
    top: -2,
    padding: 4,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 8,
    minHeight: 48,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  dropdownText: {
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 13,
    textTransform: "uppercase",
  },
  list: {
    paddingBottom: 72,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  listRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.darkgrey,
  },
  periodSection: {
    gap: 4,
    paddingBottom: 72,
  },
  periodHeading: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 13,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  periodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.light.subtext,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: Colors.light.green,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.green,
  },
  listLabel: {
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 13,
    textTransform: "uppercase",
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: Colors.light.blackBackground,
  },
});
