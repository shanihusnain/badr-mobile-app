import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import moment from "moment-hijri";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { GoalData } from "../../home/components/goalsData";
import { DateStep } from "../components/DateStep";
import { StartTimeStep, DurationStep } from "../components/TimePickerSteps";
import { OptionSelectStep } from "../components/OptionSelectStep";
import { FlowCard } from "../components/FlowCard";
import { styles as commonStyles } from "../components/DailyProgressLogging.styles";
import type { ProgressLogEntry } from "../types";
import { useOptionalPrayerGoalFrameContext } from "../prayerGoalFrameContext";
import {
  getPrayerFrameAchievementLabel,
  prayerFrameShowsInsights,
} from "@/src/utils/prayerGoalFrameMap";

// ─── Types ────────────────────────────────────────────────────────────────────

type SunnahPrayerId =
  | "before_fajr"
  | "before_dhuhr"
  | "after_dhuhr"
  | "before_asr"
  | "after_maghrib"
  | "after_isha";

type SunnahPrayerStepId =
  | "date"
  | "select-prayer"
  | "rakahs-quantity"
  | "start-time"
  | "time-spent";

type FlowMode = "collapsed" | "active";

type Props = {
  goalData: GoalData;
  onLogComplete?: (entry: ProgressLogEntry) => void;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const toDateString = (date: Date) => moment(date).format("YYYY-MM-DD");

const SUNNAH_OPTIONS: {
  id: SunnahPrayerId;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}[] = [
  { id: "before_fajr", label: "BEFORE\nFAJR", icon: "weather-sunset-up" },
  { id: "before_dhuhr", label: "BEFORE\nDUHR", icon: "white-balance-sunny" },
  { id: "after_dhuhr", label: "AFTER\nDUHR", icon: "white-balance-sunny" },
  { id: "before_asr", label: "BEFORE\nASR", icon: "weather-partly-cloudy" },
  { id: "after_maghrib", label: "AFTER\nMAGHRIB", icon: "weather-sunset" },
  { id: "after_isha", label: "AFTER\nISHA", icon: "weather-night" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SunnahRawatibLoggingFlow({
  goalData,
  onLogComplete,
}: Props) {
  const { t } = useTranslation();

  const [flowMode, setFlowMode] = useState<FlowMode>("collapsed");
  const [stepIndex, setStepIndex] = useState(0);

  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const [selectedPrayer, setSelectedPrayer] =
    useState<SunnahPrayerId>("before_fajr");
  const [rakahsQuantity, setRakahsQuantity] = useState<"One" | "Two">("One");

  const [startHour, setStartHour] = useState("06");
  const [startMinute, setStartMinute] = useState("15");
  const [startPeriod, setStartPeriod] = useState<"am" | "pm">("am");
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);

  const [durationHours, setDurationHours] = useState("0");
  const [durationMinutes, setDurationMinutes] = useState("10");

  const prayerFrame = useOptionalPrayerGoalFrameContext();
  const frame = prayerFrame?.frame;
  const slotConfig = frame?.slotConfig;

  const beforeAsrEnabled = Boolean(slotConfig?.beforeAsrEnabled);
  const afterDhuhrTwoUnits = (slotConfig?.afterDhuhrRakahOption ?? 2) === 2;
  const beforeAsrTwoUnits = (slotConfig?.beforeAsrRakahOption ?? 2) === 2;

  const availableSunnahOptions = useMemo(
    () =>
      SUNNAH_OPTIONS.filter((option) => {
        if (option.id === "before_asr" && !beforeAsrEnabled) return false;
        return true;
      }),
    [beforeAsrEnabled],
  );

  const requiresRakahSelection =
    (selectedPrayer === "after_dhuhr" && afterDhuhrTwoUnits) ||
    (selectedPrayer === "before_asr" && beforeAsrTwoUnits);

  const STEPS: SunnahPrayerStepId[] = requiresRakahSelection
    ? ["date", "select-prayer", "rakahs-quantity", "start-time", "time-spent"]
    : ["date", "select-prayer", "start-time", "time-spent"];

  const currentStep = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  const goalLabel = frame?.goal.label ?? "---";
  const goalLabelParts = useMemo(() => {
    const match = goalLabel.match(/^(.*?)\s*(\(total\s+\d+\s+prayers?\))\s*$/i);
    if (!match) {
      return { title: goalLabel, totalSuffix: null as string | null };
    }
    return {
      title: match[1].trim(),
      totalSuffix: match[2],
    };
  }, [goalLabel]);

  const badgeStatus = useMemo(() => {
    if (!frame) {
      return {
        text: "---",
        type: "in-progress" as const,
      };
    }
    return getPrayerFrameAchievementLabel(frame, t);
  }, [frame, t]);

  const showInsights = frame ? prayerFrameShowsInsights(frame) : false;
  const isFullyAchieved = (frame?.goal.achievementPct ?? 0) >= 100;

  const cycleStart = frame?.cycle?.cycleStart
    ? moment(frame.cycle.cycleStart).format("YYYY-MM-DD")
    : undefined;
  const cycleEnd = frame?.cycle?.cycleEnd
    ? moment(frame.cycle.cycleEnd).format("YYYY-MM-DD")
    : undefined;

  const todayString = toDateString(new Date());
  const maxSelectableDate = cycleEnd
    ? cycleEnd < todayString
      ? cycleEnd
      : todayString
    : todayString;

  useEffect(() => {
    setSelectedDate((current) => {
      if (cycleStart && current < cycleStart) return cycleStart;
      if (maxSelectableDate && current > maxSelectableDate)
        return maxSelectableDate;
      return current;
    });
  }, [cycleStart, maxSelectableDate]);

  const dateLabel =
    selectedDate === todayString
      ? t("progressLogging.today")
      : moment(selectedDate, "YYYY-MM-DD").format("MMM DD");

  const shiftDate = (direction: -1 | 1) => {
    const next = moment(selectedDate, "YYYY-MM-DD")
      .add(direction, "days")
      .format("YYYY-MM-DD");
    if (cycleStart && direction === -1 && next < cycleStart) return;
    if (direction === 1 && next > maxSelectableDate) return;
    setSelectedDate(next);
  };

  // ─── Flow handlers ─────────────────────────────────────────────────────────

  const resetFlow = useCallback(() => {
    setFlowMode("collapsed");
    setStepIndex(0);
    setSelectedDate(toDateString(new Date()));
    setSelectedPrayer("before_fajr");
    setRakahsQuantity("One");
    setStartHour("06");
    setStartMinute("15");
    setStartPeriod("am");
    setDurationHours("0");
    setDurationMinutes("10");
    setIsPeriodDropdownOpen(false);
  }, []);

  const handleOpenFlow = useCallback(() => {
    setFlowMode("active");
  }, []);

  const handleBack = () => {
    if (stepIndex === 0) {
      resetFlow();
      return;
    }
    setStepIndex((i) => i - 1);
  };

  const handleForward = () => {
    if (!isLastStep) setStepIndex((i) => i + 1);
  };

  const handleConfirm = () => {
    onLogComplete?.({
      type: "sunnah-rawatib",
      goalId: goalData.id,
      date: selectedDate,
      prayer: selectedPrayer,
      rakahsQuantity: requiresRakahSelection ? rakahsQuantity : "One",
      startTime: `${startHour}:${startMinute} ${startPeriod}`,
      durationHours,
      durationMinutes,
    } as any);
    void prayerFrame?.refetch();
    resetFlow();
  };

  // ─── Step header ───────────────────────────────────────────────────────────

  const getStepHeader = (step: SunnahPrayerStepId) => {
    switch (step) {
      case "date":
        return {
          icon: (
            <Ionicons
              name="calendar-outline"
              size={15}
              color={Colors.light.white}
            />
          ),
          label: "Which day are you logging for?",
        };
      case "select-prayer":
        return {
          icon: (
            <MaterialCommunityIcons
              name="door"
              size={15}
              color={Colors.light.white}
            />
          ),
          label: "Select prayer.",
        };
      case "rakahs-quantity":
        return {
          icon: (
            <MaterialCommunityIcons
              name="rug"
              size={15}
              color={Colors.light.white}
            />
          ),
          label: "Prayed one or two 2-rak'ah prayers?",
        };
      case "start-time":
        return {
          icon: (
            <Ionicons
              name="time-outline"
              size={15}
              color={Colors.light.white}
            />
          ),
          label: "Enter start time.",
        };
      case "time-spent":
        return {
          icon: (
            <Ionicons
              name="timer-outline"
              size={15}
              color={Colors.light.white}
            />
          ),
          label: "Enter time spent.",
        };
    }
  };

  // ─── Prayer select step ────────────────────────────────────────────────────

  const renderPrayerSelectStep = () => (
    <View style={localStyles.prayerSelectContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={localStyles.prayerScrollContainer}
      >
        {availableSunnahOptions.map((option) => {
          const isSelected = selectedPrayer === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              style={localStyles.prayerOptionBtn}
              onPress={() => setSelectedPrayer(option.id)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  localStyles.prayerOptionLabel,
                  isSelected && localStyles.prayerOptionLabelSelected,
                ]}
              >
                {option.label}
              </Text>
              <View
                style={[
                  localStyles.prayerIconBox,
                  isSelected
                    ? localStyles.prayerIconBoxSelected
                    : localStyles.prayerIconBoxIdle,
                ]}
              >
                <MaterialCommunityIcons
                  name={option.icon}
                  size={16}
                  color={
                    isSelected ? Colors.light.green : Colors.light.white
                  }
                />
              </View>
              {isSelected && (
                <View style={localStyles.prayerCheckBadge}>
                  <Ionicons
                    name="checkmark"
                    size={10}
                    color={Colors.light.green}
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  // ─── Step content ──────────────────────────────────────────────────────────

  const renderStepContent = (step: SunnahPrayerStepId) => {
    switch (step) {
      case "date":
        return (
          <DateStep
            dateLabel={dateLabel}
            selectedDate={selectedDate}
            todayString={todayString}
            onShiftDate={shiftDate}
            styles={commonStyles}
          />
        );
      case "select-prayer":
        return renderPrayerSelectStep();
      case "rakahs-quantity":
        return (
          <OptionSelectStep
            options={["One", "Two"]}
            selectedValue={rakahsQuantity}
            onSelectValue={(val) => setRakahsQuantity(val as "One" | "Two")}
            getLabel={(val) => val}
            radioInnerColor={Colors.light.green}
            styles={commonStyles}
          />
        );
      case "start-time":
        return (
          <StartTimeStep
            startHour={startHour}
            setStartHour={setStartHour}
            startMinute={startMinute}
            setStartMinute={setStartMinute}
            startPeriod={startPeriod}
            setStartPeriod={setStartPeriod}
            isPeriodDropdownOpen={isPeriodDropdownOpen}
            setIsPeriodDropdownOpen={setIsPeriodDropdownOpen}
            styles={commonStyles}
          />
        );
      case "time-spent":
        return (
          <DurationStep
            durationHours={durationHours}
            setDurationHours={setDurationHours}
            durationMinutes={durationMinutes}
            setDurationMinutes={setDurationMinutes}
            styles={commonStyles}
          />
        );
    }
  };

  const stepHeader = getStepHeader(currentStep);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={commonStyles.section}>
      <Text style={commonStyles.sectionTitle}>
        {t("progressLogging.myProgress")}
      </Text>

      <View style={commonStyles.cardAnchor}>
        {flowMode === "active" && (
          <Pressable style={commonStyles.backdrop} onPress={resetFlow} />
        )}
        {flowMode === "active" && (
          <TouchableOpacity
            style={commonStyles.cancelButton}
            onPress={resetFlow}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={20} color={Colors.light.white} />
          </TouchableOpacity>
        )}

        {flowMode === "collapsed" ? (
          <View style={localStyles.summaryCard}>
            <View style={localStyles.summaryBody}>
              <View style={localStyles.summaryIconCircle}>
                <MaterialCommunityIcons
                  name="moon-waxing-crescent"
                  size={20}
                  color={Colors.light.white}
                />
              </View>
              <View style={localStyles.summaryTextBlock}>
                <View
                  style={[
                    localStyles.badge,
                    badgeStatus.type === "completed"
                      ? localStyles.badgeCompleted
                      : badgeStatus.type === "not-started"
                        ? localStyles.badgeNotStarted
                        : localStyles.badgeInProgress,
                    { alignSelf: "flex-start", marginBottom: 2 },
                  ]}
                >
                  <Text
                    style={[
                      localStyles.badgeText,
                      badgeStatus.type === "completed"
                        ? localStyles.badgeTextCompleted
                        : badgeStatus.type === "not-started"
                          ? localStyles.badgeTextNotStarted
                          : localStyles.badgeTextInProgress,
                    ]}
                  >
                    {badgeStatus.text}
                  </Text>
                </View>
                <Text style={localStyles.summaryTitle}>
                  {goalLabelParts.title}
                </Text>
                {goalLabelParts.totalSuffix ? (
                  <Text style={localStyles.summarySubtitle} numberOfLines={1}>
                    {goalLabelParts.totalSuffix
                      .split(/(\d+)/)
                      .map((part, index) =>
                        /^\d+$/.test(part) ? (
                          <Text
                            key={`${part}-${index}`}
                            style={localStyles.summarySubtitleBold}
                          >
                            {part}
                          </Text>
                        ) : (
                          part
                        ),
                      )}
                  </Text>
                ) : null}
              </View>
            </View>

            <View style={localStyles.footerRow}>
              {showInsights ? (
                <TouchableOpacity
                  style={localStyles.insightsBtn}
                  onPress={prayerFrame?.openInsights}
                  activeOpacity={0.8}
                >
                  <Text style={localStyles.insightsText}>VIEW INSIGHTS</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={Colors.light.white}
                  />
                </TouchableOpacity>
              ) : (
                <View style={localStyles.spacer} />
              )}

              <TouchableOpacity
                style={[
                  localStyles.addButton,
                  isFullyAchieved && localStyles.addButtonDisabled,
                ]}
                onPress={handleOpenFlow}
                activeOpacity={0.8}
                disabled={isFullyAchieved}
              >
                <Ionicons name="add" size={22} color={Colors.light.white} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={commonStyles.flowCardLayer}>
            <FlowCard
              headerIcon={stepHeader.icon}
              headerLabel={stepHeader.label}
              onBack={handleBack}
              onForward={handleForward}
              onConfirm={handleConfirm}
              canGoForward={!isLastStep}
              styles={commonStyles}
              style={commonStyles.inPlaceFlowCard}
            >
              {renderStepContent(currentStep)}
            </FlowCard>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const localStyles = StyleSheet.create({
  summaryCard: {
    backgroundColor: Colors.light.green,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    height: 145,
    justifyContent: 'space-between',
  },
  badgeRow: {
    alignItems: "flex-start",
    marginLeft: 14,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: -6,
  },
  badgeInProgress: {
    backgroundColor: Colors.light.lightpurple,
  },
  badgeCompleted: {
    backgroundColor: Colors.light.lightgreenbadgecolor,
  },
  badgeNotStarted: {
    backgroundColor: Colors.light.paginationInactiveDot,
  },
  badgeText: {
    fontFamily: fonts.primary.semiBold,
    fontSize: 10,
  },
  badgeTextInProgress: {
    color: Colors.light.darkblue,
  },
  badgeTextCompleted: {
    color: Colors.light.green,
  },
  badgeTextNotStarted: {
    color: Colors.light.notStartedTextColor,
  },
  summaryBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.light.blackBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryTextBlock: {
    flex: 1,
    gap: 2,
  },
  summaryTitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
    letterSpacing: 0,
  },
  summarySubtitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 13,
  },
  summarySubtitleBold: {
    fontFamily: fonts.primary.bold,
    fontWeight: "700",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  insightsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    transform: [{ translateY: -8 }],
  },
  insightsText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.bold,
    fontSize: 14,
  },
  spacer: {
    flex: 1,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.white,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateY: -8 }],
  },
  addButtonDisabled: {
    opacity: 0.4,
  },
  prayerSelectContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  prayerScrollContainer: {
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
  },
  prayerOptionBtn: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minWidth: 44,
  },
  prayerOptionLabel: {
    color: Colors.light.subtext,
    fontSize: 7,
    fontFamily: fonts.primary.bold,
    textAlign: "center",
  },
  prayerOptionLabelSelected: {
    color: Colors.light.white,
  },
  prayerIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  prayerIconBoxIdle: {
    backgroundColor: Colors.light.greybuttonBackground,
  },
  prayerIconBoxSelected: {
    backgroundColor: Colors.light.white,
  },
  prayerCheckBadge: {
    position: "absolute",
    bottom: -6,
    backgroundColor: Colors.light.white,
    borderRadius: 10,
    padding: 1,
  },
});
