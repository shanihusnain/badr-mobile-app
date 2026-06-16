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
import { OptionSelectStep } from "../components/OptionSelectStep";
import { StartTimeStep, DurationStep } from "../components/TimePickerSteps";
import { FlowCard } from "../components/FlowCard";
import { styles as commonStyles } from "../components/DailyProgressLogging.styles";
import { fonts } from "@/assets/fonts";
import type { ProgressLogEntry } from "../types";

type TahiyatAlMasjidStepId = "date" | "prayer-right-after" | "start-time" | "time-spent";
const STEPS: TahiyatAlMasjidStepId[] = ["date", "prayer-right-after", "start-time", "time-spent"];

type Props = {
  goalData: GoalData;
  onLogComplete?: (entry: ProgressLogEntry) => void;
};

type FlowMode = "collapsed" | "active";

const toDateString = (date: Date) => moment(date).format("YYYY-MM-DD");

const getLabelIdentity = (o: string) => o;

export default function TahiyatAlMasjidLoggingFlow({
  goalData,
  onLogComplete,
}: Props) {
  const { t } = useTranslation();

  const [flowMode, setFlowMode] = useState<FlowMode>("collapsed");
  const [stepIndex, setStepIndex] = useState(0);

  // Step 1: Date
  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  // Step 2: Did you pray right after entering the mosque?
  const [prayedRightAfter, setPrayedRightAfter] = useState<"Yes" | "No">("Yes");
  // Step 3: Start Time
  const [startHour, setStartHour] = useState("06");
  const [startMinute, setStartMinute] = useState("15");
  const [startPeriod, setStartPeriod] = useState<"am" | "pm">("am");
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  // Step 4: Time Spent
  const [durationHours, setDurationHours] = useState("0");
  const [durationMinutes, setDurationMinutes] = useState("10");

  // MOCK DATA — fixed until backend is connected
  const MOCK_PERCENTAGE = 58;
  const totalPrayersRequired = 100;
  const mockTitle = `${totalPrayersRequired} 2-Rak'ah Tahiyyat Al-Masjid Prayers`;

  // hasLogged: false = show "In Progress", true = show fixed percentage
  const [hasLogged, setHasLogged] = useState(true);

  let badgeText = "In Progress";
  let badgeType = "in-progress";
  if (hasLogged) {
    badgeText = MOCK_PERCENTAGE >= 100 ? "100% Achieved!" : `${MOCK_PERCENTAGE}% Achieved`;
    badgeType = "completed";
  }
  const badgeStatus = { text: badgeText, type: badgeType };
  const showInsights = hasLogged;
  const badgeContainerStyle = badgeType === "completed" ? localStyles.badgeCompleted : localStyles.badgeInProgress;
  const badgeTextStyle = badgeType === "completed" ? localStyles.badgeTextCompleted : localStyles.badgeTextInProgress;

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
    setPrayedRightAfter("Yes");
    setStartHour("06");
    setStartMinute("15");
    setStartPeriod("am");
    setDurationHours("0");
    setDurationMinutes("10");
    setIsPeriodDropdownOpen(false);
  }, []);

  const handleConfirm = () => {
    setHasLogged(true);
    onLogComplete?.({
      type: "tahiyat-al-masjid",
      goalId: goalData.id,
      date: selectedDate,
      prayedRightAfter,
      startTime: `${startHour}:${startMinute} ${startPeriod}`,
      durationHours,
      durationMinutes,
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

  const getStepHeader = (step: TahiyatAlMasjidStepId) => {
    switch (step) {
      case "date":
        return {
          icon: <Ionicons name="calendar-outline" size={15} color={Colors.light.white} />,
          label: "Which day are you logging for?",
        };
      case "prayer-right-after":
        return {
          icon: <MaterialCommunityIcons name="rug" size={15} color={Colors.light.white} />, // Prayer rug icon
          label: "Did you pray right after entering the mosque?",
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

  const renderStepContent = (step: TahiyatAlMasjidStepId) => {
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
      case "prayer-right-after":
        return (
          <OptionSelectStep<"Yes" | "No">
            options={["Yes", "No"]}
            selectedValue={prayedRightAfter}
            onSelectValue={setPrayedRightAfter}
            getLabel={getLabelIdentity}
            radioInnerColor={Colors.light.white}
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
            <View style={localStyles.badgeRow}>
              <View style={[localStyles.badge, badgeContainerStyle]}>
                <Text style={[localStyles.badgeText, badgeTextStyle]}>
                  {badgeStatus.text}
                </Text>
              </View>
            </View>

            <View style={localStyles.summaryBody}>
              <View style={localStyles.summaryIconCircle}>
                <MaterialCommunityIcons name="mosque" size={26} color={Colors.light.white} />
              </View>
              <Text style={localStyles.summaryTitle}>
                {mockTitle}
              </Text>
            </View>

            <View style={localStyles.footerRow}>
              {showInsights ? (
                <TouchableOpacity style={localStyles.insightsBtn}>
                  <Text style={localStyles.insightsText}>VIEW INSIGHTS</Text>
                  <Ionicons name="chevron-forward" size={20} color={Colors.light.white} />
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
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.light.blackBackground, // Dark grey background
    alignItems: "center",
    justifyContent: "center",
  },
  summaryTitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
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
  },
  insightsText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.bold,
    fontSize: 14,
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
  },
  badgeRow: {
    flexDirection: "row",
  },
  spacer: {
    flex: 1,
  },
});
