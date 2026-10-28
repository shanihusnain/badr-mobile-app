import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { FlowCardCallender } from "@/assets/icons/FlowCardCallender";
import { ThreeHeartIcon } from "@/assets/icons/ThreeHeartIcon";
import moment from "moment-hijri";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { GoalData } from "../../home/components/goalsData";
import { FlowCard } from "../components/FlowCard";
import { DateStep } from "../components/DateStep";
import { formatProgressLoggingDateLabel } from "../progressLoggingConfig";
import { VolunteeringCategoryStep } from "../components/VolunteeringCategoryStep";
import {
  StartTimeStep,
  DurationStep,
  getCurrentStartTimeParts,
} from "../components/TimePickerSteps";
import { styles as commonStyles } from "../components/DailyProgressLogging.styles";
import type { ProgressLogEntry } from "../types";
import { VolunteeringCategoryId } from "../volunteeringCategories";
import { Volunteeringservicesheart } from "@/assets/icons";
import { useOptionalSadaqahGoalFrameContext } from "../sadaqahGoalFrameContext";
import { useLogSadaqahGoal } from "@/src/api/mutations/useLogSadaqahGoal";
import {
  getSadaqahFrameAchievementLabel,
  getSadaqahFrameAchievementPct,
  getVolunteeringFrameFlowCardTitle,
  sadaqahFrameShowsInsights,
  sadaqahUiCategoryToCauseCategory,
} from "@/src/utils/sadaqahGoalFrameMap";

type VolunteeringStepId = "date" | "category" | "start-time" | "time-spent";

const STEPS: VolunteeringStepId[] = [
  "date",
  "category",
  "start-time",
  "time-spent",
];

type FlowMode = "collapsed" | "active";

type Props = {
  goalData: GoalData;
  onLogComplete?: (entry: ProgressLogEntry) => void;
};

const toDateString = (date: Date) => moment(date).format("YYYY-MM-DD");

function formatStartTimeForApi(
  hour: string,
  minute: string,
  period: "am" | "pm",
): string {
  const hourNum = parseInt(hour || "0", 10) || 0;
  const minuteNum = parseInt(minute || "0", 10) || 0;
  let hour24 = hourNum % 12;
  if (period === "pm") hour24 += 12;
  return `${String(Math.max(0, hour24)).padStart(2, "0")}:${String(
    Math.max(0, minuteNum),
  ).padStart(2, "0")}`;
}

export default function VolunteeringLoggingFlow({
  goalData,
  onLogComplete,
}: Props) {
  const { t } = useTranslation();
  const sadaqahFrame = useOptionalSadaqahGoalFrameContext();
  const frame = sadaqahFrame?.frame;
  const { mutateAsync: logSadaqah, isPending: isLogging } = useLogSadaqahGoal();

  const [flowMode, setFlowMode] = useState<FlowMode>("collapsed");
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const [selectedCategory, setSelectedCategory] =
    useState<VolunteeringCategoryId>("distributing-food");
  const [startHour, setStartHour] = useState(
    () => getCurrentStartTimeParts().hour,
  );
  const [startMinute, setStartMinute] = useState(
    () => getCurrentStartTimeParts().minute,
  );
  const [startPeriod, setStartPeriod] = useState<"am" | "pm">(
    () => getCurrentStartTimeParts().period,
  );
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [durationHours, setDurationHours] = useState("0");
  const [durationMinutes, setDurationMinutes] = useState("0");

  const badgeStatus = useMemo(() => {
    if (!frame) {
      return {
        text: t("progressLogging.notStarted"),
        type: "not-started" as const,
      };
    }
    return getSadaqahFrameAchievementLabel(frame, t);
  }, [frame, t]);

  const summaryTitle = frame
    ? getVolunteeringFrameFlowCardTitle(frame)
    : `${goalData?.target ?? "4"} Hours of\nVolunteering`;
  const achievementPct = getSadaqahFrameAchievementPct(frame);
  const showInsights = frame ? sadaqahFrameShowsInsights(frame) : false;
  const canLog = frame ? Boolean(frame.items?.[0]?.canLog ?? true) : true;
  const goalCompleted =
    achievementPct >= 100 ||
    String(frame?.goal?.status ?? "").toUpperCase() === "COMPLETED";

  const todayString = toDateString(new Date());
  const currentStep = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  const dateLabel = formatProgressLoggingDateLabel(
    selectedDate,
    todayString,
    t("progressLogging.today"),
  );

  const shiftDate = (direction: -1 | 1) => {
    const next = moment(selectedDate, "YYYY-MM-DD")
      .add(direction, "days")
      .format("YYYY-MM-DD");
    if (direction === 1 && next > todayString) return;
    setSelectedDate(next);
  };

  const resetFlow = useCallback(() => {
    const now = getCurrentStartTimeParts();
    setFlowMode("collapsed");
    setStepIndex(0);
    setSelectedDate(toDateString(new Date()));
    setSelectedCategory("distributing-food");
    setStartHour(now.hour);
    setStartMinute(now.minute);
    setStartPeriod(now.period);
    setDurationHours("0");
    setDurationMinutes("0");
    setIsPeriodDropdownOpen(false);
    setIsCategoryDropdownOpen(false);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedDate || isLogging) return;

    const hours = parseInt(durationHours || "0", 10) || 0;
    const minutes = parseInt(durationMinutes || "0", 10) || 0;
    const durationTotalMinutes = hours * 60 + minutes;
    const amountHours =
      Math.round((durationTotalMinutes / 60) * 100) / 100;
    if (amountHours <= 0) return;

    const startTime = formatStartTimeForApi(
      startHour,
      startMinute,
      startPeriod,
    );
    const causeCategory = sadaqahUiCategoryToCauseCategory(selectedCategory);

    const run = async () => {
      try {
        const result = await logSadaqah({
          sadaqahType: "VOLUNTEERING",
          logDate: selectedDate,
          amount: amountHours,
          startTime,
          durationMinutes: durationTotalMinutes,
          causeCategory,
        });
        await sadaqahFrame?.refetch();
        onLogComplete?.({
          type: "volunteering" as any,
          goalId: goalData.id,
          date: result.logDate ?? result.date ?? selectedDate,
          amount: String(result.amount ?? amountHours),
          startTime: result.startTime ?? startTime,
          durationMinutes: result.durationMinutes ?? durationTotalMinutes,
          volunteeringCategory: selectedCategory,
        } as any);
        resetFlow();
      } catch {
        // Toast handled in mutation onError
      }
    };

    void run();
  }, [
    durationHours,
    durationMinutes,
    goalData.id,
    isLogging,
    logSadaqah,
    onLogComplete,
    resetFlow,
    sadaqahFrame,
    selectedCategory,
    selectedDate,
    startHour,
    startMinute,
    startPeriod,
  ]);

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

  const handleOpenFlow = useCallback(() => {
    if (!canLog || goalCompleted) return;
    setFlowMode("active");
  }, [canLog, goalCompleted]);

  const getStepHeader = (step: VolunteeringStepId) => {
    switch (step) {
      case "date":
        return {
          label: "Which day are you logging for?",
          icon: <FlowCardCallender size={14} color={Colors.light.white} />,
        };
      case "category":
        return {
          label: "Select how you volunteered.",
          icon: (
            <Volunteeringservicesheart
              size={20}
              colors={Colors.light.white}
            />
          ),
        };
      case "start-time":
        return {
          label: "Enter start time.",
          icon: (
            <Ionicons
              name="time-outline"
              size={16}
              color={Colors.light.green}
            />
          ),
        };
      case "time-spent":
        return {
          label: "Enter time spent.",
          icon: (
            <MaterialCommunityIcons
              name="history"
              size={16}
              color={Colors.light.green}
            />
          ),
        };
    }
  };

  const renderStepContent = (step: VolunteeringStepId) => {
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
      case "category":
        return (
          <VolunteeringCategoryStep
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            isOpen={isCategoryDropdownOpen}
            setIsOpen={setIsCategoryDropdownOpen}
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
  const durationTotalMinutes =
    (parseInt(durationHours || "0", 10) || 0) * 60 +
    (parseInt(durationMinutes || "0", 10) || 0);
  const amountHours = Math.round((durationTotalMinutes / 60) * 100) / 100;
  const canConfirm = isLastStep && !isLogging && amountHours > 0;

  return (
    <View style={commonStyles.section}>
      <Text style={commonStyles.sectionTitle}>
        {t("progressLogging.myProgress")}
      </Text>

      <View style={commonStyles.cardAnchor}>
        {flowMode === "active" && <Pressable style={commonStyles.backdrop} />}
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
              <View style={[localStyles.summaryIconCircle]}>
                <ThreeHeartIcon color={Colors.light.white} size={24} />
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
                <Text style={[localStyles.summaryTitle]}>{summaryTitle}</Text>
              </View>
            </View>

            <View style={localStyles.footerRow}>
              {showInsights ? (
                <TouchableOpacity
                  style={localStyles.insightsBtn}
                  onPress={sadaqahFrame?.openInsights}
                >
                  <Text style={localStyles.insightsText}>VIEW INSIGHTS</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={22}
                    color={Colors.light.white}
                  />
                </TouchableOpacity>
              ) : (
                <View style={localStyles.spacer} />
              )}

              {canLog && !goalCompleted ? (
                <TouchableOpacity
                  style={localStyles.addButton}
                  onPress={handleOpenFlow}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={22} color={Colors.light.white} />
                </TouchableOpacity>
              ) : null}
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
              canGoBack={stepIndex > 0}
              canConfirm={canConfirm}
              showConfirmButton={isLastStep}
              styles={commonStyles}
              style={[
                commonStyles.inPlaceFlowCard,
                currentStep === "category" && isCategoryDropdownOpen
                  ? { height: 210 }
                  : {},
              ]}
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
    marginTop: -6,
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
