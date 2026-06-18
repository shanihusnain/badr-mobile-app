import React, { useCallback, useState } from "react";
import {
  Pressable,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import moment from "moment-hijri";
import { Colors } from "@/constants/theme";
import { GoalData } from "../../home/components/goalsData";
import { DateStep } from "../components/DateStep";
import { MissedPrayersQuantityStep } from "../components/MissedPrayersQuantityStep";
import { StartTimeStep, DurationStep } from "../components/TimePickerSteps";
import { FlowCard } from "../components/FlowCard";
import { styles as commonStyles } from "../components/DailyProgressLogging.styles";
import { fonts } from "@/assets/fonts";
import type { ProgressLogEntry } from "../types";
import { PrayerName } from "../progressLoggingConfig";

type MissedPrayersStepId = "date" | "prayers-qty" | "start-time" | "time-spent";
const STEPS: MissedPrayersStepId[] = ["date", "prayers-qty", "start-time", "time-spent"];

type Props = {
  goalData: GoalData;
  onLogComplete?: (entry: ProgressLogEntry) => void;
};

type FlowMode = "collapsed" | "active";

const toDateString = (date: Date) => moment(date).format("YYYY-MM-DD");

export default function MissedPrayersLoggingFlow({
  goalData,
  onLogComplete,
}: Props) {
  const { t } = useTranslation();

  const [flowMode, setFlowMode] = useState<FlowMode>("collapsed");
  const [stepIndex, setStepIndex] = useState(0);
  
  // Step 1: Date
  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  
  // Step 2: Prayers Quantities
  const [quantities, setQuantities] = useState<Record<PrayerName, number>>({
    fajr: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
  });

  const handleIncrementPrayer = useCallback((prayer: PrayerName) => {
    setQuantities((prev) => ({
      ...prev,
      [prayer]: (prev[prayer] || 0) + 1,
    }));
  }, []);

  // Step 3: Start Time
  const [startHour, setStartHour] = useState("06");
  const [startMinute, setStartMinute] = useState("15");
  const [startPeriod, setStartPeriod] = useState<"am" | "pm">("am");
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);

  // Step 4: Time Spent
  const [durationHours, setDurationHours] = useState("0");
  const [durationMinutes, setDurationMinutes] = useState("10");

  // MOCK DATA — fixed until backend is connected
  const MOCK_PERCENTAGE = 12; // based on goalsData.ts mock
  const totalPrayersRequired = 280;
  const mockTitle = `56 Days of Missed Obligatory Prayers`;

  // hasLogged: false = show "In Progress", true = show fixed percentage
  const [hasLogged, setHasLogged] = useState(false);

  const getBadgeStatus = () => {
    if (!hasLogged) return { text: "In Progress", type: "in-progress" };
    if (MOCK_PERCENTAGE >= 100) return { text: "100% Achieved!", type: "completed" };
    return { text: `${MOCK_PERCENTAGE}% Achieved`, type: "completed" }; // using green badge styling
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
    setQuantities({ fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 });
    setStartHour("06");
    setStartMinute("15");
    setStartPeriod("am");
    setDurationHours("0");
    setDurationMinutes("10");
    setIsPeriodDropdownOpen(false);
  }, []);

  const handleConfirm = () => {
    // Mark as logged so badge switches from "In Progress" to the fixed percentage.
    setHasLogged(true);
    
    // Sum all selected prayers
    const totalSelected = Object.values(quantities).reduce((acc, curr) => acc + curr, 0);

    onLogComplete?.({
      type: "missed-prayers",
      goalId: goalData.id,
      date: selectedDate,
      prayersCount: totalSelected,
      startTime: `${startHour}:${startMinute} ${startPeriod}`,
      durationHours,
      durationMinutes,
      prayerQuantities: quantities,
    } as any);
    
    resetFlow();
  };

  const handleBack = () => {
    if (stepIndex === 0) {
      resetFlow();
      return;
    }
    setStepIndex((index) => index - 1);
  };

  const handleForward = () => {
    if (!isLastStep) setStepIndex((index) => index + 1);
  };

  const handleOpenFlow = useCallback(() => {
    setFlowMode("active");
  }, []);

  const getStepHeader = (step: MissedPrayersStepId) => {
    switch (step) {
      case "date":
        return {
          icon: <Ionicons name="calendar-outline" size={15} color={Colors.light.white} />,
          label: "Which day are you logging for?",
        };
      case "prayers-qty":
        return {
          icon: <Ionicons name="apps-outline" size={15} color={Colors.light.white} />,
          label: "Tap prayers multiple times to update qty.",
        };
      case "start-time":
        return {
          icon: <Ionicons name="time-outline" size={15} color={Colors.light.white} />,
          label: "Enter start time.",
        };
      case "time-spent":
        return {
          icon: <Ionicons name="timer-outline" size={15} color={Colors.light.white} />,
          label: "Enter time spent.",
        };
    }
  };

  const renderStepContent = (step: MissedPrayersStepId) => {
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
      case "prayers-qty":
        return (
          <MissedPrayersQuantityStep
            quantities={quantities}
            onIncrement={handleIncrementPrayer}
            categoryColor={Colors.light.green}
            totalRequired={56}
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
                 <MaterialCommunityIcons name="calendar-remove" size={18} color={Colors.light.white} />
              </View>
              <View style={localStyles.titleContainer}>
                <View style={[localStyles.badge, badgeStatus.type === "completed" ? localStyles.badgeCompleted : localStyles.badgeInProgress, { alignSelf: "flex-start", marginBottom: 4 }]}>
                  <Text style={[localStyles.badgeText, badgeStatus.type === "completed" ? localStyles.badgeTextCompleted : localStyles.badgeTextInProgress]}>
                    {badgeStatus.text}
                  </Text>
                </View>
                <Text style={localStyles.summaryTitle}>
                  {mockTitle}
                </Text>
                <Text style={localStyles.summarySubtitle}>
                  (total <Text style={localStyles.subtitleBold}>{totalPrayersRequired}</Text> prayers)
                </Text>
              </View>
            </View>

            <View style={localStyles.footerRow}>
                {isCompleted ? (
                    <TouchableOpacity style={localStyles.insightsBtn}>
                        <Text style={localStyles.insightsText}>VIEW INSIGHTS</Text>
                        <Ionicons name="chevron-forward" size={22} color={Colors.light.white} />
                    </TouchableOpacity>
                ) : <View style={localStyles.spacer} />}

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

const localStyles = StyleSheet.create({
  summaryCard: {
    backgroundColor: Colors.light.green,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    height: 145,
    justifyContent: 'space-between',
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
  summaryBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.blackBackground, // Dark grey background for icon
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
    flexDirection: "column",
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
    fontFamily: fonts.primary.medium,
    fontSize: 12,
    fontWeight: "500",
  },
  subtitleBold: {
    fontFamily: fonts.primary.bold,
    fontWeight: "700",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 4,
  },
  insightsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingBottom: 4,
    transform: [{ translateY: -4 }],
  },
  insightsText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.bold,
    fontSize: 16,
    fontWeight: "700",
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.light.white,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateY: -4 }],
  },
  badgeRow: {
    flexDirection: "row",
    marginLeft: 14,
  },
  spacer: {
    flex: 1,
  },
});
