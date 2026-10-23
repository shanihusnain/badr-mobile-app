import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import { MissedRamadanGreenCardIcon } from "@/assets/icons/MissedRamadanGreenCardIcon";
import {
  AddLoggingFlowIcon,
  FlowCardCallender,
  TimeSpentIcon,
} from "@/assets/icons";
import { GoalData } from "../../home/components/goalsData";
import { FlowCard } from "../components/FlowCard";
import { WhiteDaysFastDateStep } from "../components/WhiteDaysFastDateStep";
import { StartTimeStep } from "../components/TimePickerSteps";
import {
  FLOW_CARD_HEIGHT,
  styles as commonStyles,
} from "../components/DailyProgressLogging.styles";
import { fonts } from "@/assets/fonts";
import { isValidStartTime } from "../quranRecitationTarget";
import {
  formatMissedRamadanFastDateLabel,
  getTodayDateString,
  isMissedRamadanFastEndTimeAfterStartTime,
  type MissedRamadanFastDateOption,
} from "../missedRamadanFastsData";
import type { MissedRamadanFastsLogEntry } from "../types";
import { useOptionalFastingGoalFrameContext } from "../fastingGoalFrameContext";
import {
  useGetFastingLoggableDates,
  type FastingLoggableDateEntry,
} from "@/src/api/queries/useGetFastingLoggableDates";
import { useLogFastingGoal } from "@/src/api/mutations/useLogFastingGoal";
import { usePrefillFastingTimesFromApi } from "../hooks/usePrefillFastingTimesFromApi";
import {
  fastingFrameShowsInsights,
  getFastingFrameAchievementLabel,
  getFastingFrameAchievementPct,
} from "@/src/utils/fastingGoalFrameMap";

function toDateOptionsFromEntries(
  entries: FastingLoggableDateEntry[],
): MissedRamadanFastDateOption[] {
  return entries.map((entry) => ({
    id: entry.date,
    date: entry.date,
    enabled: entry.enabled,
    isBookedForAnotherGoal: entry.isBookedForAnotherGoal,
    alreadyLoggedFastingGoal: entry.alreadyLoggedFastingGoal,
    description: entry.description,
  }));
}

/** Prefer today, else nearest enabled date — matches weekly dashboard "current" day. */
function pickDefaultDateOption(
  options: MissedRamadanFastDateOption[],
  today: string,
): MissedRamadanFastDateOption | null {
  if (options.length === 0) return null;

  const todayOption = options.find((option) => option.date === today);
  if (todayOption) return todayOption;

  const todayMs = new Date(`${today}T12:00:00`).getTime();
  const distance = (option: MissedRamadanFastDateOption) =>
    Math.abs(new Date(`${option.date}T12:00:00`).getTime() - todayMs);

  const enabled = options.filter((option) => option.enabled !== false);
  const pool = enabled.length > 0 ? enabled : options;
  return (
    [...pool].sort(
      (a, b) => distance(a) - distance(b) || a.date.localeCompare(b.date),
    )[0] ?? null
  );
}

function formatTimeForApi(
  hour: string,
  minute: string,
  period: "am" | "pm",
): string {
  const hourNum = Number.parseInt(hour || "0", 10) || 0;
  const minuteNum = Number.parseInt(minute || "0", 10) || 0;
  let hour24 = hourNum % 12;
  if (period === "pm") hour24 += 12;
  return `${String(Math.max(0, hour24)).padStart(2, "0")}:${String(
    Math.max(0, minuteNum),
  ).padStart(2, "0")}`;
}

type MissedRamadanFastsStepId = "selectDate" | "startTime" | "endTime";

const STEPS: MissedRamadanFastsStepId[] = [
  "selectDate",
  "startTime",
  "endTime",
];

type Props = {
  goalData: GoalData;
  onLogComplete?: (entry: MissedRamadanFastsLogEntry) => void;
  onDropdownOpenChange?: (open: boolean) => void;
};

type FlowMode = "collapsed" | "active";

export default function MissedRamadanFastsLoggingFlow({
  goalData,
  onLogComplete,
  onDropdownOpenChange,
}: Props) {
  const { t, i18n } = useTranslation();
  const fastingFrame = useOptionalFastingGoalFrameContext();
  const frame = fastingFrame?.frame;
  const frameItem = frame?.items?.[0];
  const { mutateAsync: logFast, isPending: isLogging } = useLogFastingGoal();

  const { data: loggableDatesData, refetch: refetchLoggableDates } =
    useGetFastingLoggableDates("MISSED_RAMADAN");

  const [flowMode, setFlowMode] = useState<FlowMode>("collapsed");
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedDateId, setSelectedDateId] = useState<string | null>(null);
  const [startHour, setStartHour] = useState("5");
  const [startMinute, setStartMinute] = useState("00");
  const [startPeriod, setStartPeriod] = useState<"am" | "pm">("am");
  const [isStartPeriodDropdownOpen, setIsStartPeriodDropdownOpen] =
    useState(false);
  const [endHour, setEndHour] = useState("5");
  const [endMinute, setEndMinute] = useState("30");
  const [endPeriod, setEndPeriod] = useState<"am" | "pm">("pm");
  const [isEndPeriodDropdownOpen, setIsEndPeriodDropdownOpen] = useState(false);

  const currentStep = STEPS[stepIndex] ?? "selectDate";
  const isLastStep = stepIndex === STEPS.length - 1;
  const today = getTodayDateString();

  const dateOptions = useMemo(
    () => toDateOptionsFromEntries(loggableDatesData?.dates ?? []),
    [loggableDatesData?.dates],
  );

  const selectedDateOption = useMemo(
    () => dateOptions.find((option) => option.id === selectedDateId) ?? null,
    [dateOptions, selectedDateId],
  );

  usePrefillFastingTimesFromApi(
    "MISSED_RAMADAN",
    selectedDateOption?.date ?? null,
    {
      setStartHour,
      setStartMinute,
      setStartPeriod,
      setEndHour,
      setEndMinute,
      setEndPeriod,
    },
    {
      enabled: flowMode === "active" && Boolean(selectedDateOption?.date),
    },
  );

  const goalTarget = frame?.goal?.target ?? goalData.target ?? 0;
  const goalCompleted =
    getFastingFrameAchievementPct(frame) >= 100 ||
    String(frame?.goal?.status ?? "").toUpperCase() === "COMPLETED";

  const showInsights = frame ? fastingFrameShowsInsights(frame) : false;
  const canLog = Boolean(frameItem?.canLog) && dateOptions.length > 0;

  const summaryTitle =
    frameItem?.title?.trim() ||
    t("progressLogging.missedRamadanCardSubtitle", {
      count: goalTarget,
    });

  const badgeStatus = useMemo(() => {
    if (!frame) {
      return {
        text: t("progressLogging.notStarted"),
        type: "not-started" as const,
      };
    }
    return getFastingFrameAchievementLabel(frame, t);
  }, [frame, t]);

  useEffect(() => {
    onDropdownOpenChange?.(
      isStartPeriodDropdownOpen || isEndPeriodDropdownOpen,
    );
  }, [
    isEndPeriodDropdownOpen,
    isStartPeriodDropdownOpen,
    onDropdownOpenChange,
  ]);

  useEffect(
    () => () => {
      onDropdownOpenChange?.(false);
    },
    [onDropdownOpenChange],
  );

  useEffect(() => {
    if (flowMode !== "active") return;
    const selectionValid =
      Boolean(selectedDateId) &&
      dateOptions.some((option) => option.id === selectedDateId);
    if (selectionValid) return;
    setSelectedDateId(pickDefaultDateOption(dateOptions, today)?.id ?? null);
  }, [dateOptions, flowMode, selectedDateId, today]);

  const isStartTimeValid = isValidStartTime(
    startHour,
    startMinute,
    startPeriod,
  );
  const isEndTimeValid = isValidStartTime(endHour, endMinute, endPeriod);
  const isEndAfterStart = isMissedRamadanFastEndTimeAfterStartTime(
    startHour,
    startMinute,
    startPeriod,
    endHour,
    endMinute,
    endPeriod,
  );

  const applyFastTimeDefaults = useCallback(() => {
    setStartHour("5");
    setStartMinute("00");
    setStartPeriod("am");
    setEndHour("5");
    setEndMinute("30");
    setEndPeriod("pm");
  }, []);

  /** Keep end strictly after start so the end-time confirm can enable. */
  const ensureEndAfterStart = useCallback(() => {
    if (
      isMissedRamadanFastEndTimeAfterStartTime(
        startHour,
        startMinute,
        startPeriod,
        endHour,
        endMinute,
        endPeriod,
      )
    ) {
      return;
    }
    if (
      isMissedRamadanFastEndTimeAfterStartTime(
        startHour,
        startMinute,
        startPeriod,
        "5",
        "30",
        "pm",
      )
    ) {
      setEndHour("5");
      setEndMinute("30");
      setEndPeriod("pm");
      return;
    }
    if (
      startPeriod === "am" &&
      isMissedRamadanFastEndTimeAfterStartTime(
        startHour,
        startMinute,
        startPeriod,
        startHour,
        startMinute,
        "pm",
      )
    ) {
      setEndHour(startHour);
      setEndMinute(startMinute);
      setEndPeriod("pm");
      return;
    }
    setEndHour("11");
    setEndMinute("59");
    setEndPeriod("pm");
  }, [endHour, endMinute, endPeriod, startHour, startMinute, startPeriod]);

  const resetFlow = useCallback(() => {
    setFlowMode("collapsed");
    setStepIndex(0);
    setSelectedDateId(null);
    applyFastTimeDefaults();
    setIsStartPeriodDropdownOpen(false);
    setIsEndPeriodDropdownOpen(false);
    onDropdownOpenChange?.(false);
  }, [applyFastTimeDefaults, onDropdownOpenChange]);

  const handleConfirm = useCallback(() => {
    if (
      !selectedDateOption ||
      selectedDateOption.enabled === false ||
      !isStartTimeValid ||
      !isEndTimeValid ||
      !isEndAfterStart ||
      isLogging
    ) {
      return;
    }

    const startTime = formatTimeForApi(startHour, startMinute, startPeriod);
    const endTime = formatTimeForApi(endHour, endMinute, endPeriod);

    const run = async () => {
      try {
        const result = await logFast({
          fastingType: "MISSED_RAMADAN",
          date: selectedDateOption.date,
          startTime,
          endTime,
        });

        await Promise.all([fastingFrame?.refetch(), refetchLoggableDates()]);

        const loggedDate = result.date ?? selectedDateOption.date;
        const completedCount = Number(result.goal?.completed ?? 0);
        const target = Number(result.goal?.target ?? goalTarget ?? 0);
        const remainingCount =
          result.goal?.remaining != null
            ? Number(result.goal.remaining)
            : Math.max(0, target - completedCount);

        onLogComplete?.({
          type: "missed-ramadan-fasts",
          goalId: "fasting-ramadan",
          logType: "completed_planned",
          date: loggedDate,
          completed: true,
          startTime: result.startTime ?? startTime,
          endTime: result.endTime ?? endTime,
          plannedFastDate: loggedDate,
          plannedDate: result.plannedDate,
          reconciledFromPlannedDate: result.plannedDate,
          goalTarget: target,
          completedCount,
          remainingCount,
          goalCompleted: Number(result.goal?.achievementPct ?? 0) >= 100,
          wasPlanned: true,
        });

        resetFlow();
      } catch {
        // Toast handled in mutation onError.
      }
    };

    void run();
  }, [
    endHour,
    endMinute,
    endPeriod,
    fastingFrame,
    goalTarget,
    isEndAfterStart,
    isEndTimeValid,
    isLogging,
    isStartTimeValid,
    logFast,
    onLogComplete,
    refetchLoggableDates,
    resetFlow,
    selectedDateOption,
    startHour,
    startMinute,
    startPeriod,
  ]);

  const handleBack = useCallback(() => {
    if (stepIndex === 0) {
      resetFlow();
      return;
    }
    setIsStartPeriodDropdownOpen(false);
    setIsEndPeriodDropdownOpen(false);
    setStepIndex((index) => index - 1);
  }, [resetFlow, stepIndex]);

  const handleForward = useCallback(() => {
    if (isLastStep) return;
    setIsStartPeriodDropdownOpen(false);
    setIsEndPeriodDropdownOpen(false);
    if (currentStep === "startTime") {
      ensureEndAfterStart();
    }
    setStepIndex((index) => index + 1);
  }, [currentStep, ensureEndAfterStart, isLastStep]);

  const handleOpenFlow = useCallback(() => {
    if (!canLog || goalCompleted) return;
    applyFastTimeDefaults();
    setSelectedDateId(pickDefaultDateOption(dateOptions, today)?.id ?? null);
    setStepIndex(0);
    setFlowMode("active");
  }, [applyFastTimeDefaults, canLog, dateOptions, goalCompleted, today]);

  const getStepHeader = (step: MissedRamadanFastsStepId) => {
    const calendarIcon = (
      <FlowCardCallender size={18} color={Colors.light.white} />
    );
    const timeIcon = <TimeSpentIcon size={19} color={Colors.light.white} />;

    switch (step) {
      case "selectDate":
        return {
          icon: calendarIcon,
          label: t("progressLogging.missedRamadanSelectPlannedFastCompleted"),
        };
      case "startTime":
        return {
          icon: timeIcon,
          label: t("progressLogging.missedRamadanEnterStartTime"),
        };
      case "endTime":
        return {
          icon: timeIcon,
          label: t("progressLogging.missedRamadanEnterEndTime"),
        };
    }
  };

  const shiftDateOptionId = useCallback(
    (direction: -1 | 1) => {
      if (dateOptions.length === 0) return;
      const currentIndex = Math.max(
        0,
        dateOptions.findIndex((option) => option.id === selectedDateId),
      );
      const nextIndex = currentIndex + direction;
      if (nextIndex < 0 || nextIndex >= dateOptions.length) return;
      setSelectedDateId(dateOptions[nextIndex].id);
    },
    [dateOptions, selectedDateId],
  );

  const toDateLabel = useCallback(
    (option: MissedRamadanFastDateOption | null | undefined) => {
      if (!option) return "";
      const date = String(option.date ?? "").slice(0, 10);
      if (date === today) return t("progressLogging.today");
      const raw = formatMissedRamadanFastDateLabel(date, today);
      if (raw === "Today") return t("progressLogging.today");
      return raw;
    },
    [t, today],
  );

  const renderTimeStep = (
    sectionLabel: string,
    picker: React.ReactNode,
    nav: { canGoPrev: boolean; canGoNext: boolean },
  ) => (
    <View style={localStyles.timeStepWrap}>
      <Text style={localStyles.timeSectionLabel}>{sectionLabel}</Text>
      <View style={commonStyles.dateRow}>
        <TouchableOpacity
          onPress={handleBack}
          disabled={!nav.canGoPrev}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons
            name={i18n.language === "ar" ? "chevron-forward" : "chevron-back"}
            size={32}
            color={Colors.light.white}
            style={!nav.canGoPrev ? localStyles.chevronDisabled : undefined}
          />
        </TouchableOpacity>

        <View style={localStyles.timePickerCenter}>{picker}</View>

        <TouchableOpacity
          onPress={handleForward}
          disabled={!nav.canGoNext}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons
            name={i18n.language === "ar" ? "chevron-back" : "chevron-forward"}
            size={32}
            color={Colors.light.white}
            style={!nav.canGoNext ? localStyles.chevronDisabled : undefined}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStepContent = (step: MissedRamadanFastsStepId) => {
    switch (step) {
      case "selectDate": {
        if (dateOptions.length === 0) {
          return (
            <View style={commonStyles.flowContent}>
              <Text style={commonStyles.flowHeaderText}>
                {t("progressLogging.missedRamadanNoFastOptions")}
              </Text>
            </View>
          );
        }

        const selectedIndex = dateOptions.findIndex(
          (option) => option.id === selectedDateId,
        );
        const selectedOption =
          (selectedIndex >= 0 ? dateOptions[selectedIndex] : dateOptions[0]) ??
          null;

        return (
          <WhiteDaysFastDateStep
            dateLabel={toDateLabel(selectedOption)}
            canGoPrev={selectedIndex > 0}
            canGoNext={
              selectedIndex >= 0 && selectedIndex < dateOptions.length - 1
            }
            onShiftDate={shiftDateOptionId}
            styles={commonStyles}
            enabled={selectedOption?.enabled !== false}
            description={selectedOption?.description ?? null}
          />
        );
      }
      case "startTime":
        return renderTimeStep(
          t("progressLogging.missedRamadanStartTimeLabel"),
          <StartTimeStep
            startHour={startHour}
            setStartHour={setStartHour}
            startMinute={startMinute}
            setStartMinute={setStartMinute}
            startPeriod={startPeriod}
            setStartPeriod={setStartPeriod}
            isPeriodDropdownOpen={isStartPeriodDropdownOpen}
            setIsPeriodDropdownOpen={setIsStartPeriodDropdownOpen}
            styles={commonStyles}
          />,
          {
            canGoPrev: stepIndex > 0,
            canGoNext: isStartTimeValid,
          },
        );
      case "endTime":
        return renderTimeStep(
          t("progressLogging.missedRamadanEndTimeLabel"),
          <StartTimeStep
            startHour={endHour}
            setStartHour={setEndHour}
            startMinute={endMinute}
            setStartMinute={setEndMinute}
            startPeriod={endPeriod}
            setStartPeriod={setEndPeriod}
            isPeriodDropdownOpen={isEndPeriodDropdownOpen}
            setIsPeriodDropdownOpen={setIsEndPeriodDropdownOpen}
            styles={commonStyles}
          />,
          {
            canGoPrev: true,
            canGoNext: false,
          },
        );
    }
  };

  const isSelectedDateEnabled = selectedDateOption?.enabled !== false;

  const canProceed = (() => {
    switch (currentStep) {
      case "selectDate":
        return Boolean(selectedDateOption) && isSelectedDateEnabled;
      case "startTime":
        return isStartTimeValid;
      case "endTime":
        return isEndTimeValid && isEndAfterStart;
      default:
        return false;
    }
  })();

  const canConfirm =
    isLastStep &&
    !isLogging &&
    Boolean(selectedDateOption) &&
    isSelectedDateEnabled &&
    isStartTimeValid &&
    isEndTimeValid &&
    isEndAfterStart;

  const stepHeader = getStepHeader(currentStep);
  const isPeriodDropdownOpen =
    isStartPeriodDropdownOpen || isEndPeriodDropdownOpen;

  return (
    <>
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

      <View
        style={[
          commonStyles.section,
          flowMode === "active" && commonStyles.activeSection,
        ]}
      >
        <Text style={commonStyles.sectionTitle}>
          {t("progressLogging.myProgress")}
        </Text>

        <View
          style={[
            commonStyles.cardAnchor,
            isPeriodDropdownOpen && {
              zIndex: 220,
              elevation: 24,
              overflow: "visible" as const,
            },
          ]}
        >
          {flowMode === "collapsed" ? (
            <View style={localStyles.summaryCard}>
              <View style={localStyles.summaryBody}>
                <View style={localStyles.summaryIconCircle}>
                  <MissedRamadanGreenCardIcon
                    size={21}
                    color={Colors.light.white}
                  />
                </View>
                <View style={localStyles.titleContainer}>
                  <View
                    style={[
                      localStyles.badge,
                      badgeStatus.type === "completed"
                        ? localStyles.badgeCompleted
                        : badgeStatus.type === "not-started"
                          ? localStyles.badgeNotStarted
                          : localStyles.badgeInProgress,
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
                  <Text style={localStyles.summaryTitle} numberOfLines={2}>
                    {summaryTitle}
                  </Text>
                </View>
              </View>

              <View style={localStyles.footerRow}>
                {showInsights ? (
                  <TouchableOpacity
                    style={localStyles.insightsBtn}
                    onPress={() => fastingFrame?.openInsights?.()}
                    activeOpacity={0.8}
                  >
                    <Text style={localStyles.insightsText}>
                      {t("progressLogging.viewInsights")}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={22}
                      color={Colors.light.white}
                    />
                  </TouchableOpacity>
                ) : null}
              </View>

              {canLog && !goalCompleted ? (
                <TouchableOpacity
                  style={localStyles.addButton}
                  onPress={handleOpenFlow}
                  activeOpacity={0.8}
                >
                  <AddLoggingFlowIcon size={32} />
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <View
              style={[
                commonStyles.flowCardLayer,
                isPeriodDropdownOpen && {
                  zIndex: 200,
                  elevation: 20,
                  overflow: "visible" as const,
                },
              ]}
            >
              <FlowCard
                headerIcon={stepHeader.icon}
                headerLabel={stepHeader.label}
                onBack={handleBack}
                onForward={handleForward}
                onConfirm={handleConfirm}
                canGoForward={
                  !isLastStep && canProceed && currentStep !== "startTime"
                }
                canGoBack={stepIndex > 0}
                canConfirm={canConfirm}
                showConfirmButton
                headerSingleLine={
                  currentStep === "startTime" || currentStep === "endTime"
                }
                styles={commonStyles}
                style={[
                  commonStyles.inPlaceFlowCard,
                  isPeriodDropdownOpen && commonStyles.flowCardDropdownOpen,
                ]}
                contentStyle={
                  isPeriodDropdownOpen
                    ? commonStyles.flowContentDropdownOpen
                    : undefined
                }
              >
                {renderStepContent(currentStep)}
              </FlowCard>
            </View>
          )}
        </View>
      </View>
    </>
  );
}

const localStyles = StyleSheet.create({
  summaryCard: {
    backgroundColor: Colors.light.green,
    borderRadius: 8,
    padding: 16,
    gap: 12,
    height: FLOW_CARD_HEIGHT,
    width: "100%",
    justifyContent: "space-between",
    position: "relative",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 3,
    alignSelf: "flex-start",
  },
  badgeNotStarted: {
    backgroundColor: Colors.light.paginationInactiveDot,
  },
  badgeInProgress: {
    backgroundColor: Colors.light.lightpurple,
  },
  badgeCompleted: {
    backgroundColor: Colors.light.lightgreenbadgecolor,
  },
  badgeText: {
    fontFamily: fonts.primary.medium,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 12.5,
  },
  badgeTextNotStarted: {
    color: Colors.light.notStartedTextColor,
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
    gap: 6,
  },
  summaryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.selectcategory,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 33,
  },
  titleContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 9,
  },
  summaryTitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
    letterSpacing: 0,
  },
  footerRow: {
    flexDirection: "row",
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
    fontSize: 16,
    fontWeight: "700",
  },
  addButton: {
    position: "absolute",
    right: 16,
    bottom: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  timeStepWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
  },
  // Absolute so the time row centers like the date step (label doesn't push it down).
  timeSectionLabel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: "100%",
    marginBottom: 2,
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    fontSize: 10,
    lineHeight: 10,
    textAlign: "center",
    opacity: 0.95,
  },
  timePickerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
    transform: [{ translateX: 4 }],
  },
  // Slightly slimmer than active — not as faint as dullWhiteOpacity (10%).
  chevronDisabled: {
    opacity: 0.35,
    transform: [{ scaleX: 0.82 }],
  },
});
