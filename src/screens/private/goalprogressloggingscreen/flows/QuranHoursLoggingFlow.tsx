import React, { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import moment from "moment-hijri";
import { Colors } from "@/constants/theme";
import { GoalData } from "../../home/components/goalsData";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { DateStep } from "../components/DateStep";
import { DurationStep, StartTimeStep } from "../components/TimePickerSteps";
import { FlowCard } from "../components/FlowCard";
import { styles } from "../components/DailyProgressLogging.styles";
import { getQuranHoursFlowDefinition } from "../loggingFlowRegistry";
import type { QuranHoursLogEntry } from "../types";

type QuranHoursStepId = "date" | "startTime" | "duration";

const STEPS: QuranHoursStepId[] = ["date", "startTime", "duration"];

type Props = {
  goalData: GoalData;
  onLogComplete?: (entry: QuranHoursLogEntry) => void;
};

type FlowMode = "collapsed" | "active";

const toDateString = (date: Date) => moment(date).format("YYYY-MM-DD");

export default function QuranHoursLoggingFlow({
  goalData,
  onLogComplete,
}: Props) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const flowDefinition = useMemo(
    () => getQuranHoursFlowDefinition(goalData.id),
    [goalData.id],
  );

  const [flowMode, setFlowMode] = useState<FlowMode>("collapsed");
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const [startHour, setStartHour] = useState("06");
  const [startMinute, setStartMinute] = useState("15");
  const [startPeriod, setStartPeriod] = useState<"am" | "pm">("am");
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [durationHours, setDurationHours] = useState("0");
  const [durationMinutes, setDurationMinutes] = useState("10");

  const todayString = toDateString(new Date());
  const currentStep = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  if (!flowDefinition) return null;

  const { config } = flowDefinition;

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
    setStartHour("06");
    setStartMinute("15");
    setStartPeriod("am");
    setIsPeriodDropdownOpen(false);
    setDurationHours("0");
    setDurationMinutes("10");
  }, []);

  const handleConfirm = () => {
    const hours = Number.parseInt(durationHours || "0", 10) || 0;
    const minutes = Number.parseInt(durationMinutes || "0", 10) || 0;
    const startTime = `${startHour}:${startMinute} ${startPeriod}`;

    onLogComplete?.({
      type: "quran-hours",
      goalId: flowDefinition.goalId,
      date: selectedDate,
      startTime,
      hours,
      minutes,
      durationLabel: `${hours}h ${minutes}m`,
    });
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

  const summaryIcon =
    config.icon === "headphones" ? (
      <MaterialCommunityIcons
        name="headphones"
        size={20}
        color={Colors.light.white}
      />
    ) : (
      <MaterialCommunityIcons
        name="book-open-page-variant"
        size={20}
        color={Colors.light.white}
      />
    );

  const getStepHeader = (step: QuranHoursStepId) => {
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
          label: t("progressLogging.whichDay"),
        };
      case "startTime":
        return {
          icon: (
            <Ionicons
              name="time-outline"
              size={15}
              color={Colors.light.white}
            />
          ),
          label: t("progressLogging.enterStartTime"),
        };
      case "duration":
        return {
          icon: (
            <MaterialCommunityIcons
              name="history"
              size={16}
              color={Colors.light.white}
            />
          ),
          label: t("progressLogging.enterTimeSpent"),
        };
    }
  };

  const renderStepContent = (step: QuranHoursStepId) => {
    switch (step) {
      case "date":
        return (
          <DateStep
            dateLabel={dateLabel}
            selectedDate={selectedDate}
            todayString={todayString}
            onShiftDate={shiftDate}
            styles={styles}
          />
        );
      case "startTime":
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
            styles={styles}
          />
        );
      case "duration":
        return (
          <DurationStep
            durationHours={durationHours}
            setDurationHours={setDurationHours}
            durationMinutes={durationMinutes}
            setDurationMinutes={setDurationMinutes}
            styles={styles}
          />
        );
    }
  };

  const stepHeader = getStepHeader(currentStep);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.section,
        flowMode === "active" && styles.activeSection,
      ]}
    >
      <Text style={styles.sectionTitle}>{t("progressLogging.myProgress")}</Text>
      <View style={styles.cardAnchor}>
        {flowMode === "active" && (
          <Pressable style={styles.backdrop} onPress={resetFlow} />
        )}
        {flowMode === "active" && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={resetFlow}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={20} color={Colors.light.white} />
          </TouchableOpacity>
        )}

        {flowMode === "collapsed" ? (
          <View style={styles.summaryCard}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {t("progressLogging.inProgress")}
              </Text>
            </View>

            <View style={styles.summaryBody}>
              <View style={styles.summaryIconCircle}>{summaryIcon}</View>
              <View style={styles.summaryTextBlock}>
                <Text style={styles.summaryTitle}>
                  {t(config.summaryTitleKey, {
                    count: formatNumber(config.totalHours),
                    defaultValue: goalData.title,
                  })}
                </Text>
                <Text style={styles.summarySubtext}>
                  <Text style={styles.summarySubtextRegular}>
                    ({t("progressLogging.total")}{" "}
                  </Text>
                  <Text style={styles.summarySubtextBold}>
                    {formatNumber(config.totalHours)}{" "}
                  </Text>
                  <Text style={styles.summarySubtextRegular}>
                    {t("progressLogging.unitHours")})
                  </Text>
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setFlowMode("active")}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={22} color={Colors.light.white} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.flowCardLayer}>
            <FlowCard
              headerIcon={stepHeader.icon}
              headerLabel={stepHeader.label}
              onBack={handleBack}
              onForward={handleForward}
              onConfirm={handleConfirm}
              canGoForward={!isLastStep}
              styles={styles}
              style={styles.inPlaceFlowCard}
            >
              {renderStepContent(currentStep)}
            </FlowCard>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
