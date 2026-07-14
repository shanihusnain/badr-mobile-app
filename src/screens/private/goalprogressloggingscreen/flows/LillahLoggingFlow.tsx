import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import moment from "moment";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { AllahNameIcon } from "@/assets/icons/AllahNameIcon";

import { FlowCard } from "../components/FlowCard";
import { DateStep } from "../components/DateStep";
import { LillahCategoryStep } from "../components/LillahCategoryStep";
import { AmountStep } from "../components/AmountStep";
import { StartTimeStep, DurationStep } from "../components/TimePickerSteps";
import { styles as commonStyles } from "../components/DailyProgressLogging.styles";
import type { ProgressLogEntry } from "../types";
type FlowMode = "collapsed" | "active";
import { getResolvedGoalById } from "../../home/components/goalsData";
import { LillahCategoryId } from "../lillahCategories";
import { HeartOnHandIcon } from "@/assets/icons/HeartOnHandIcon";
import {FlowCardCallender} from "@/assets/icons/FlowCardCallender";
import {FlowCardWalletIcon} from "@/assets/icons/FlowCardWalletIcon";
import {FlowCardClockIcon} from "@/assets/icons/FlowCardClockIcon";
import { TimeSpentIcon } from "@/assets/icons/TimeSpentIcon";

type Props = {
  goalData: NonNullable<ReturnType<typeof getResolvedGoalById>>;
  onLogComplete?: (entry: ProgressLogEntry) => void;
};

const STEPS = ["date", "category", "amount", "start-time", "time-spent"] as const;
type StepType = (typeof STEPS)[number];

const getStepHeader = (step: StepType) => {
  switch (step) {
    case "date":
      return {
        label: "Which day are you logging for?",
        icon: <FlowCardCallender size={20} color={Colors.light.white} />,
      };
    case "category":
      return {
        label: "Select Your Lillah Contribution.",
        icon: <HeartOnHandIcon size={20} Color={Colors.light.white} />,
      };
    case "amount":
      return {
        label: "How much did you spend?",
        icon: <FlowCardWalletIcon size={20} color={Colors.light.white} />,
      };
    case "start-time":
      return {
        label: "Enter start time.",
        icon: <FlowCardClockIcon size={20} color={Colors.light.white} />,
      };
    case "time-spent":
      return {
        label: "Enter time spent.",
        icon: <TimeSpentIcon size={20} color={Colors.light.white} />,
      };
  }
};

const toDateString = (date: Date) => moment(date).format("YYYY-MM-DD");

// ─────────────────────────────────────────────────────────────────────────────
export default function LillahLoggingFlow({ goalData, onLogComplete }: Props) {
  const { t } = useTranslation();

  const [flowMode, setFlowMode] = useState<FlowMode>("collapsed");
  const [stepIndex, setStepIndex] = useState(0);

  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const [selectedCategory, setSelectedCategory] = useState<LillahCategoryId>("food-relief");
  const [amount, setAmount] = useState("60");

  const [startHour, setStartHour] = useState("06");
  const [startMinute, setStartMinute] = useState("15");
  const [startPeriod, setStartPeriod] = useState<"am" | "pm">("am");
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);

  const [durationHours, setDurationHours] = useState("0");
  const [durationMinutes, setDurationMinutes] = useState("10");

  const [hasLogged, setHasLogged] = useState(false);

  const MOCK_PERCENTAGE = 50;
  const mockTitle = "$1000 Toward Lillah Donations";

  const getBadgeStatus = () => {
    if (!hasLogged) return { text: "In Progress", type: "in-progress" };
    if (MOCK_PERCENTAGE >= 100) return { text: "100% Achieved!", type: "completed" };
    return { text: `${MOCK_PERCENTAGE}% Achieved`, type: "completed" };
  };

  const badgeStatus = getBadgeStatus();
  const isCompleted = hasLogged;

  const todayString = toDateString(new Date());
  const currentStep = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

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

  const resetFlow = useCallback(() => {
    setFlowMode("collapsed");
    setStepIndex(0);
    setSelectedDate(toDateString(new Date()));
    setSelectedCategory("food-relief");
    setAmount("60");
    setStartHour("06");
    setStartMinute("15");
    setStartPeriod("am");
    setDurationHours("0");
    setDurationMinutes("10");
    setIsPeriodDropdownOpen(false);
  }, []);

  const handleOpenFlow = () => {
    setFlowMode("active");
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const handleForward = () => {
    if (!isLastStep) setStepIndex(stepIndex + 1);
  };

  const handleConfirm = () => {
    setHasLogged(true);
    setFlowMode("collapsed");
    setStepIndex(0);

    const numericAmount = parseInt(amount, 10) || 0;
    const durationMins = parseInt(durationHours || "0", 10) * 60 + parseInt(durationMinutes || "0", 10);

    onLogComplete?.({
      date: selectedDate,
      count: numericAmount,
      durationMinutes: durationMins,
      timeOfDay: `${startHour}:${startMinute} ${startPeriod}`,
      lillahCategory: selectedCategory,
    });
  };

  const renderStepContent = (step: StepType) => {
    switch (step) {
      case "date":
        return (
          <DateStep
            selectedDate={selectedDate}
            todayString={todayString}
            onShiftDate={shiftDate}
            styles={commonStyles}
            dateLabel={dateLabel}
          />
        );
      case "category":
        return (
          <LillahCategoryStep
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        );
      case "amount":
        return (
          <AmountStep
            amount={amount}
            setAmount={setAmount}
            currencySymbol="$"
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

  return (
    <View style={commonStyles.section}>
      <Text style={commonStyles.sectionTitle}>{t("progressLogging.myProgress")}</Text>

      <View style={commonStyles.cardAnchor}>
        {flowMode === "active" && (
          <Pressable style={commonStyles.backdrop} onPress={resetFlow} />
        )}
        {flowMode === "active" && (
          <TouchableOpacity style={commonStyles.cancelButton} onPress={resetFlow} activeOpacity={0.8}>
            <Ionicons name="close" size={20} color={Colors.light.white} />
          </TouchableOpacity>
        )}

        {flowMode === "collapsed" ? (
          <View style={localStyles.summaryCard}>
            <View style={localStyles.summaryBody}>
              <View style={[localStyles.summaryIconCircle]}>
                <AllahNameIcon size={22} color={Colors.light.white} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <View
                  style={[
                    localStyles.badge,
                    badgeStatus.type === "completed"
                      ? localStyles.badgeCompleted
                      : localStyles.badgeInProgress,
                    { alignSelf: "flex-start" },
                  ]}
                >
                  <Text
                    style={[
                      localStyles.badgeText,
                      badgeStatus.type === "completed"
                        ? localStyles.badgeTextCompleted
                        : localStyles.badgeTextInProgress,
                    ]}
                  >
                    {badgeStatus.text}
                  </Text>
                </View>
                <Text style={[localStyles.summaryTitle]}>
                  {mockTitle}
                </Text>
              </View>
            </View>

            <View style={localStyles.footerRow}>
              {isCompleted ? (
                <TouchableOpacity style={localStyles.insightsBtn}>
                  <Text style={localStyles.insightsText}>VIEW INSIGHTS</Text>
                  <Ionicons name="chevron-forward" size={22} color={Colors.light.white} />
                </TouchableOpacity>
              ) : (
                <View style={localStyles.spacer} />
              )}

              <TouchableOpacity style={localStyles.addButton} onPress={handleOpenFlow} activeOpacity={0.8}>
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

const localStyles = StyleSheet.create({
  summaryCard: {
    backgroundColor: Colors.light.green,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    position: "relative",
    overflow: "hidden",
    height: 145,
  },
  summaryBody: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  summaryIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.darkgrey,
    alignItems: "center",
    justifyContent: "center",
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
    fontWeight: "600",
  },
  badgeTextInProgress: {
    color: Colors.light.darkblue,
  },
  badgeTextCompleted: {
    color: Colors.light.green,
  },
  summaryTitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto" as any,
    paddingTop: 8,
  },
  insightsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  insightsText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  spacer: { flex: 1 },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.light.white,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto" as any,
  },
});
