import React, { useCallback, useState } from "react";
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

const MOCK_TOTAL_PRAYERS = 248;
const MOCK_PERCENTAGE = 67;

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

  const [hasLogged, setHasLogged] = useState(false);

  // ─── Mock Backend Data ─────────────────────────────────────────────────────

  // MOCK: This represents data coming from the backend indicating if the user 
  // selected 2 prayers (4 rak'ahs total) after Dhuhr in their goal setting.
  const userConfiguredTwoPrayersAfterDhuhr = true;

  // MOCK: This represents data coming from the backend indicating if the user 
  // selected 2 prayers (4 rak'ahs total) before Asr in their goal setting.
  const userConfiguredTwoPrayersBeforeAsr = true;

  // MOCK: This represents data coming from the backend indicating if the user 
  // even HAS "Before Asr" as a Sunnah goal.
  const userHasBeforeAsrGoal = false;

  // ─── Filtered Options ──────────────────────────────────────────────────────

  const availableSunnahOptions = SUNNAH_OPTIONS.filter((option) => {
    if (option.id === "before_asr" && !userHasBeforeAsrGoal) return false;
    return true;
  });

  // ─── Dynamic steps ─────────────────────────────────────────────────────────

  const requiresRakahSelection =
    (selectedPrayer === "after_dhuhr" && userConfiguredTwoPrayersAfterDhuhr) ||
    (selectedPrayer === "before_asr" && userConfiguredTwoPrayersBeforeAsr);

  const STEPS: SunnahPrayerStepId[] = requiresRakahSelection
    ? ["date", "select-prayer", "rakahs-quantity", "start-time", "time-spent"]
    : ["date", "select-prayer", "start-time", "time-spent"];

  const currentStep = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  // ─── Badge ─────────────────────────────────────────────────────────────────

  const badgeText = hasLogged
    ? MOCK_PERCENTAGE >= 100
      ? "100% Achieved"
      : `${MOCK_PERCENTAGE}% Achieved`
    : "In Progress";

  const badgeType = hasLogged ? "completed" : "in-progress";
  const badgeContainerStyle =
    badgeType === "completed"
      ? localStyles.badgeCompleted
      : localStyles.badgeInProgress;
  const badgeTextStyle =
    badgeType === "completed"
      ? localStyles.badgeTextCompleted
      : localStyles.badgeTextInProgress;

  // ─── Date helpers ──────────────────────────────────────────────────────────

  const todayString = toDateString(new Date());

  const dateLabel =
    selectedDate === todayString
      ? t("progressLogging.today")
      : moment(selectedDate, "YYYY-MM-DD").format("MMM DD");

  const shiftDate = (direction: -1 | 1) => {
    const next = moment(selectedDate, "YYYY-MM-DD")
      .add(direction, "days")
      .format("YYYY-MM-DD");
    if (direction === 1 && next > todayString) return;
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
    setHasLogged(true);
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
            {/* Icon + text block (badge + title + subtitle) */}
            <View style={localStyles.summaryBody}>
              <View style={localStyles.summaryIconCircle}>
                <MaterialCommunityIcons
                  name="moon-waxing-crescent"
                  size={20}
                  color={Colors.light.white}
                />
              </View>
              <View style={localStyles.summaryTextBlock}>
                <View style={[localStyles.badge, badgeContainerStyle, { alignSelf: "flex-start", marginBottom: 2 }]}>
                  <Text style={[localStyles.badgeText, badgeTextStyle]}>
                    {badgeText}
                  </Text>
                </View>
                <Text style={localStyles.summaryTitle}>
                  Sunnah Rawatib{"\n"}Prayers
                </Text>
                <Text style={localStyles.summarySubtitle}>
                  {"(total "}
                  <Text style={localStyles.summarySubtitleBold}>
                    {MOCK_TOTAL_PRAYERS}
                  </Text>
                  {"  prayers)"}
                </Text>
              </View>
            </View>

            {/* Footer */}
            <View style={localStyles.footerRow}>
              {hasLogged ? (
                <TouchableOpacity style={localStyles.insightsBtn}>
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
                style={localStyles.addButton}
                onPress={handleOpenFlow}
                activeOpacity={0.8}
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
  },
  badgeInProgress: {
    backgroundColor: Colors.light.lightpurple,
  },
  badgeCompleted: {
    backgroundColor: Colors.light.lightgreenbadgecolor,
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
