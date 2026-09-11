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
import moment from "moment-hijri";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import {
  AddLoggingFlowIcon,
  CalendarFlippingIcon,
  HeadPhoneQuranListeningIcon,
  ManQuranTajweedIcon,
  WhiteClockIcon,
  WhiteTimerIcon,
} from "@/assets/icons";
import { GoalData } from "../../home/components/goalsData";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { useLogQuranHoursGoal } from "@/src/api/mutations/useLogQuranHoursGoal";
import { resolveQuranTypeFromGoalId } from "@/src/utils/quranGoalMap";
import { DateStep } from "../components/DateStep";
import { formatProgressLoggingDateLabel } from "../progressLoggingConfig";
import {
  DurationStep,
  StartTimeStep,
  getCurrentStartTimeParts,
} from "../components/TimePickerSteps";
import { FlowCard } from "../components/FlowCard";
import {
  styles as commonStyles,
  FLOW_CARD_HEIGHT,
} from "../components/DailyProgressLogging.styles";
import { getQuranHoursFlowDefinition } from "../loggingFlowRegistry";
import type { QuranHoursLogEntry } from "../types";
import { useOptionalQuranGoalFrameContext } from "../quranGoalFrameContext";
import {
  getQuranFrameAchievementLabel,
  getQuranFrameCycleEnd,
  getQuranFrameCycleStart,
  getQuranFrameGoalTitle,
  getQuranFrameTargetHours,
  quranFrameShowsInsights,
} from "@/src/utils/quranGoalFrameMap";

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
  const quranFrame = useOptionalQuranGoalFrameContext();
  const frame = quranFrame?.frame;
  const { mutateAsync: logQuranHours, isPending: isLogging } =
    useLogQuranHoursGoal();
  const quranGoalType = resolveQuranTypeFromGoalId(goalData.id);

  const [flowMode, setFlowMode] = useState<FlowMode>("collapsed");
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
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
  const [durationHours, setDurationHours] = useState("0");
  const [durationMinutes, setDurationMinutes] = useState("0");

  const durationTotalMinutes = useMemo(() => {
    const hours = Number.parseInt(durationHours || "0", 10) || 0;
    const minutes = Number.parseInt(durationMinutes || "0", 10) || 0;
    return Math.max(0, hours * 60 + minutes);
  }, [durationHours, durationMinutes]);

  const cycleStart = frame
    ? getQuranFrameCycleStart(frame) || undefined
    : undefined;
  const cycleEnd = frame
    ? getQuranFrameCycleEnd(frame) || undefined
    : undefined;
  const todayString = toDateString(new Date());
  const maxSelectableDate =
    cycleEnd && cycleEnd < todayString ? cycleEnd : todayString;
  // Only clamp to cycle start once it is on/before the latest selectable day.
  // A future cycleStart must not freeze the picker on "today" with a dead back button.
  const minSelectableDate =
    cycleStart && cycleStart <= maxSelectableDate ? cycleStart : undefined;

  useEffect(() => {
    setSelectedDate((prev) => {
      if (minSelectableDate && prev < minSelectableDate)
        return minSelectableDate;
      if (prev > maxSelectableDate) return maxSelectableDate;
      return prev;
    });
  }, [minSelectableDate, maxSelectableDate]);

  const badgeStatus = useMemo(() => {
    if (!frame) {
      return {
        text: t("progressLogging.inProgress"),
        type: "in-progress" as const,
      };
    }
    return getQuranFrameAchievementLabel(frame, t);
  }, [frame, t]);

  const showInsights = frame ? quranFrameShowsInsights(frame) : false;
  const isFullyAchieved = (frame?.goal.achievementPct ?? 0) >= 100;
  const frameTargetHours = frame ? getQuranFrameTargetHours(frame) : null;
  const frameGoalTitle = frame ? getQuranFrameGoalTitle(frame) : null;

  const currentStep = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  if (!flowDefinition) return null;

  const { config } = flowDefinition;

  const dateLabel = formatProgressLoggingDateLabel(
    selectedDate,
    todayString,
    t("progressLogging.today"),
  );

  const shiftDate = (direction: -1 | 1) => {
    const next = moment(selectedDate, "YYYY-MM-DD")
      .add(direction, "days")
      .format("YYYY-MM-DD");
    if (minSelectableDate && direction === -1 && next < minSelectableDate)
      return;
    if (direction === 1 && next > maxSelectableDate) return;
    setSelectedDate(next);
  };

  const resetFlow = useCallback(() => {
    const now = getCurrentStartTimeParts();
    setFlowMode("collapsed");
    setStepIndex(0);
    setSelectedDate(toDateString(new Date()));
    setStartHour(now.hour);
    setStartMinute(now.minute);
    setStartPeriod(now.period);
    setIsPeriodDropdownOpen(false);
    setDurationHours("0");
    setDurationMinutes("0");
  }, []);

  const handleCancel = () => {
    if (isLogging) return;
    resetFlow();
  };

  const formatSessionStartTimeForApi = () => {
    const hourNum = Number.parseInt(startHour || "0", 10) || 0;
    const minuteNum = Number.parseInt(startMinute || "0", 10) || 0;

    let hour24 = hourNum % 12;
    if (startPeriod === "pm") hour24 += 12;

    const hh = String(Math.max(0, hour24)).padStart(2, "0");
    const mm = String(Math.max(0, minuteNum)).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const handleConfirm = () => {
    if (isLogging || !quranGoalType || durationTotalMinutes < 1) return;

    const run = async () => {
      const hours = Number.parseInt(durationHours || "0", 10) || 0;
      const minutes = Number.parseInt(durationMinutes || "0", 10) || 0;
      const sessionStartTime = formatSessionStartTimeForApi();

      try {
        await logQuranHours({
          quranGoalType,
          date: selectedDate,
          sessionStartTime,
          durationMinutes: durationTotalMinutes,
        });
        await quranFrame?.refetch();

        onLogComplete?.({
          type: "quran-hours",
          goalId: flowDefinition.goalId,
          date: selectedDate,
          startTime: `${startHour}:${startMinute} ${startPeriod}`,
          hours,
          minutes,
          durationLabel: `${hours}h ${minutes}m`,
        });
        resetFlow();
      } catch {
        // Mutation onError already shows toast.
      }
    };

    void run();
  };

  const handleBack = () => {
    if (isLogging) return;
    if (stepIndex === 0) {
      resetFlow();
      return;
    }
    setStepIndex((index) => index - 1);
  };

  const handleForward = () => {
    if (isLogging || isLastStep) return;
    setStepIndex((index) => index + 1);
  };

  const summaryIcon =
    config.icon === "headphones" ? (
      <HeadPhoneQuranListeningIcon color={Colors.light.white} size={25} />
    ) : (
      <ManQuranTajweedIcon color={Colors.light.white} size={25} />
    );

  const goalLabel =
    frameGoalTitle ||
    t(config.summaryTitleKey, {
      count: formatNumber(frameTargetHours ?? config.totalHours),
      defaultValue: goalData.title,
    });

  const getStepHeader = (step: QuranHoursStepId) => {
    switch (step) {
      case "date":
        return {
          icon: <CalendarFlippingIcon size={24} />,
          label: t("progressLogging.whichDay"),
        };
      case "startTime":
        return {
          icon: <WhiteClockIcon size={26} />,
          label: t("progressLogging.enterStartTime"),
        };
      case "duration":
        return {
          icon: <WhiteTimerIcon size={26} />,
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
            minSelectableDate={minSelectableDate}
            maxSelectableDate={maxSelectableDate}
            onShiftDate={shiftDate}
            styles={commonStyles}
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
            styles={commonStyles}
          />
        );
      case "duration":
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
    <>
      {flowMode === "active" && (
        <Pressable
          style={commonStyles.backdrop}
          onPress={handleCancel}
          disabled={isLogging}
        />
      )}
      {flowMode === "active" && (
        <TouchableOpacity
          style={commonStyles.cancelButton}
          onPress={handleCancel}
          activeOpacity={0.8}
          disabled={isLogging}
        >
          <Ionicons name="close" size={20} color={Colors.light.white} />
        </TouchableOpacity>
      )}

      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>
          {t("progressLogging.myProgress")}
        </Text>

        <View style={commonStyles.cardAnchor}>
          {flowMode === "collapsed" ? (
            <View style={localStyles.summaryCard}>
              <View style={localStyles.summaryBody}>
                <View style={localStyles.summaryIconCircle}>{summaryIcon}</View>
                <View style={{ flex: 1, gap: 9 }}>
                  <View
                    style={[
                      localStyles.badge,
                      badgeStatus.type === "completed"
                        ? localStyles.badgeCompleted
                        : badgeStatus.type === "not-started"
                          ? localStyles.badgeNotStarted
                          : localStyles.badgeInProgress,
                      { alignSelf: "flex-start" },
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
                  <Text
                    style={[localStyles.summaryTitle, { flex: undefined }]}
                    numberOfLines={2}
                  >
                    {goalLabel}
                  </Text>
                </View>
              </View>

              <View style={localStyles.footerRow}>
                {showInsights ? (
                  <TouchableOpacity
                    style={localStyles.insightsBtn}
                    onPress={() => quranFrame?.openInsights?.()}
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

              <TouchableOpacity
                style={[
                  localStyles.addButton,
                  isFullyAchieved && localStyles.addButtonDisabled,
                ]}
                onPress={() => setFlowMode("active")}
                activeOpacity={0.8}
                disabled={isLogging || isFullyAchieved}
              >
                <AddLoggingFlowIcon size={32} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={commonStyles.flowCardLayer}>
              <FlowCard
                headerIcon={stepHeader.icon}
                headerLabel={stepHeader.label}
                onBack={handleBack}
                onForward={handleForward}
                onConfirm={handleConfirm}
                canGoForward={!isLastStep && !isLogging}
                canGoBack={stepIndex > 0 && !isLogging}
                canConfirm={
                  isLastStep &&
                  !isLogging &&
                  !!quranGoalType &&
                  durationTotalMinutes >= 1
                }
                styles={commonStyles}
                style={commonStyles.inPlaceFlowCard}
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
  },
  badgeInProgress: {
    backgroundColor: Colors.light.lightpurple,
  },
  badgeCompleted: {
    backgroundColor: Colors.light.white,
  },
  badgeNotStarted: {
    backgroundColor: Colors.light.paginationInactiveDot,
  },
  badgeText: {
    fontFamily: fonts.primary.medium,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 12.5,
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
  summaryTitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
    letterSpacing: 0,
    flex: 1,
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
  addButtonDisabled: {
    opacity: 0.35,
  },
});
