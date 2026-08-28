import React, { useCallback, useMemo, useState } from "react";
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
import { GoalData } from "../../home/components/goalsData";
import { DateStep } from "../components/DateStep";
import { formatProgressLoggingDateLabel } from "../progressLoggingConfig";
import { OptionSelectStep } from "../components/OptionSelectStep";
import { StartTimeStep, DurationStep, getCurrentStartTimeParts, isDurationEntered } from "../components/TimePickerSteps";
import { FlowCard } from "../components/FlowCard";
import {
  styles as commonStyles,
  FLOW_CARD_HEIGHT,
} from "../components/DailyProgressLogging.styles";
import { fonts } from "@/assets/fonts";
import type { ProgressLogEntry } from "../types";
import { useOptionalPrayerGoalFrameContext } from "../prayerGoalFrameContext";
import {
  getPrayerFrameAchievementLabel,
  prayerFrameShowsInsights,
} from "@/src/utils/prayerGoalFrameMap";
import { useLogTahiyatAlWudhuGoal } from "@/src/api/mutations/useLogTahiyatAlWudhuGoal";
import {
  AddLoggingFlowIcon,
  CalendarFlippingIcon,
  PlusAddIcon,
  WhiteClockIcon,
  WhitePrayerMatIcon,
  WhiteTimerIcon,
} from "@/assets/icons";

type TahiyatUlWudhuStepId =
  | "date"
  | "prayer-right-after"
  | "start-time"
  | "time-spent";
const STEPS: TahiyatUlWudhuStepId[] = [
  "date",
  "prayer-right-after",
  "start-time",
  "time-spent",
];

type Props = {
  goalData: GoalData;
  onLogComplete?: (entry: ProgressLogEntry) => void;
};

type FlowMode = "collapsed" | "active";

const toDateString = (date: Date) => moment(date).format("YYYY-MM-DD");

export default function TahiyatUlWudhuLoggingFlow({
  goalData,
  onLogComplete,
}: Props) {
  const { t } = useTranslation();

  const [flowMode, setFlowMode] = useState<FlowMode>("collapsed");
  const [stepIndex, setStepIndex] = useState(0);

  // Step 1: Date
  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  // Step 2: Did you pray right after performing wudhu?
  const [prayedRightAfter, setPrayedRightAfter] = useState<"Yes" | "No">("Yes");
  // Step 3: Start Time
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
  // Step 4: Time Spent
  const [durationHours, setDurationHours] = useState("0");
  const [durationMinutes, setDurationMinutes] = useState("0");

  const prayerFrame = useOptionalPrayerGoalFrameContext();
  const frame = prayerFrame?.frame;

  const cycleStartHijri = frame?.cycle?.cycleStart
    ? toDateString(new Date(frame.cycle.cycleStart))
    : undefined;
  const cycleEndHijri = frame?.cycle?.cycleEnd
    ? toDateString(new Date(frame.cycle.cycleEnd))
    : undefined;

  const goalLabel = frame?.goal.label ?? "";

  const badgeStatus = useMemo(() => {
    if (!frame) {
      return {
        text: t("progressLogging.inProgress"),
        type: "in-progress" as const,
      };
    }
    console.log(
      "get prayer frame achievement label",
      getPrayerFrameAchievementLabel(frame, t),
    );
    return getPrayerFrameAchievementLabel(frame, t);
  }, [frame, t]);

  const showInsights = frame ? prayerFrameShowsInsights(frame) : false;
  const isFullyAchieved = (frame?.goal.achievementPct ?? 0) >= 100;

  const { mutateAsync: logTahiyat, isPending: isLogging } =
    useLogTahiyatAlWudhuGoal();

  const formatStartTimeForApi = () => {
    const hourNum = parseInt(startHour || "0", 10) || 0; // 1-12
    const minuteNum = parseInt(startMinute || "0", 10) || 0; // 0-59

    let hour24 = hourNum % 12;
    if (startPeriod === "pm") hour24 += 12;

    const hh = String(Math.max(0, hour24)).padStart(2, "0");
    const mm = String(Math.max(0, minuteNum)).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const buildDurationMinutesForApi = () => {
    const h = parseInt(durationHours || "0", 10) || 0;
    const m = parseInt(durationMinutes || "0", 10) || 0;
    return h * 60 + m;
  };

  const todayString = toDateString(new Date());
  const maxSelectableDate = cycleEndHijri
    ? cycleEndHijri < todayString
      ? cycleEndHijri
      : todayString
    : todayString;

  // Clamp initial/changed selected date to the cycle window
  React.useEffect(() => {
    if (!cycleStartHijri || !cycleEndHijri) return;
    if (selectedDate < cycleStartHijri) setSelectedDate(cycleStartHijri);
    else if (selectedDate > maxSelectableDate) {
      setSelectedDate(maxSelectableDate);
    }
  }, [cycleStartHijri, cycleEndHijri, maxSelectableDate]);
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

    // Restrict date selection within backend cycle window.
    if (cycleStartHijri && direction === -1 && next < cycleStartHijri) return;
    if (direction === 1 && next > maxSelectableDate) return;

    setSelectedDate(next);
  };

  const resetFlow = useCallback(() => {
    const now = getCurrentStartTimeParts();
    setFlowMode("collapsed");
    setStepIndex(0);
    setSelectedDate(toDateString(new Date()));
    setPrayedRightAfter("Yes");
    setStartHour(now.hour);
    setStartMinute(now.minute);
    setStartPeriod(now.period);
    setDurationHours("0");
    setDurationMinutes("0");
    setIsPeriodDropdownOpen(false);
  }, []);

  const handleConfirm = () => {
    if (isLogging) return;

    const run = async () => {
      const payload = {
        date: selectedDate,
        count: 1,
        prayedAfterWudhu: prayedRightAfter === "Yes",
        startTime: formatStartTimeForApi(),
        durationMinutes: buildDurationMinutesForApi(),
        notes: prayedRightAfter === "Yes" ? "After Wudhu" : "Not after Wudhu",
      };

      try {
        await logTahiyat(payload);

        // Make the green card/week update immediately after logging.
        // (The provider refetch can also be triggered by onLogComplete refreshKey,
        // but we do it here for faster perceived UI response.)
        await prayerFrame?.refetch();

        onLogComplete?.({
          type: "tahiyat-ul-wudhu",
          goalId: goalData.id,
          date: selectedDate,
          prayedRightAfter,
          startTime: payload.startTime,
          durationMinutes: payload.durationMinutes,
        } as any);
        resetFlow();
      } catch {
        // onError handler already shows toast.
      }
    };

    void run();
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
    if (isFullyAchieved) return;
    const now = getCurrentStartTimeParts();
    setStartHour(now.hour);
    setStartMinute(now.minute);
    setStartPeriod(now.period);
    setFlowMode("active");
  }, [isFullyAchieved]);

  const getStepHeader = (step: TahiyatUlWudhuStepId) => {
    switch (step) {
      case "date":
        return {
          icon: <CalendarFlippingIcon size={24} />,
          label: "Which day are you logging for?",
        };
      case "prayer-right-after":
        return {
          icon: <WhitePrayerMatIcon size={26} />,
          label: "Did you pray right after performing wudhu?",
        };
      case "start-time":
        return {
          icon: <WhiteClockIcon size={26} />,
          label: "Enter start time.",
        };
      case "time-spent":
        return {
          icon: <WhiteTimerIcon size={26} />,
          label: "Enter time spent.",
        };
    }
  };

  const renderStepContent = (step: TahiyatUlWudhuStepId) => {
    switch (step) {
      case "date":
        return (
          <DateStep
            dateLabel={dateLabel}
            selectedDate={selectedDate}
            todayString={todayString}
            minSelectableDate={cycleStartHijri}
            maxSelectableDate={maxSelectableDate}
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
            getLabel={(o) => o}
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
    <>
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

      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>
          {t("progressLogging.myProgress")}
        </Text>

        <View style={commonStyles.cardAnchor}>
          {flowMode === "collapsed" ? (
            <View style={localStyles.summaryCard}>
              <View style={localStyles.summaryBody}>
                <View style={localStyles.summaryIconCircle}>
                  <Ionicons name="water" size={25} color={Colors.light.white} />
                </View>
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
                  <Text style={[localStyles.summaryTitle, { flex: undefined }]}>
                    {goalLabel}
                  </Text>
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
                onPress={handleOpenFlow}
                activeOpacity={0.8}
                disabled={isFullyAchieved}
              >
                <AddLoggingFlowIcon />
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
                canGoForward={!isLastStep}
                canGoBack={stepIndex > 0}
                canConfirm={
                  isLastStep &&
                  !isLogging &&
                  isDurationEntered(durationHours, durationMinutes)
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
    marginTop: -6,
  },
  // "In Progress" chip — light purple bg, dark blue text
  badgeInProgress: {
    backgroundColor: Colors.light.lightpurple,
  },
  // "X% Achieved" / "100% Achieved!" chip — light green bg, green text
  badgeCompleted: {
    backgroundColor: Colors.light.lightgreenbadgecolor,
  },
  badgeNotStarted: {
    backgroundColor: Colors.light.paginationInactiveDot,
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
    marginTop: 26,
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
    bottom: 11,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonDisabled: {
    opacity: 0.35,
  },
  badgeRow: {
    flexDirection: "row",
    marginLeft: 14,
  },
  spacer: {
    flex: 1,
  },
});
