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
import { CounterStep } from "../components/CounterStep";
import {
  StartTimeStep,
  DurationStep,
  getCurrentStartTimeParts,
} from "../components/TimePickerSteps";
import { FlowCard } from "../components/FlowCard";
import { styles as commonStyles } from "../components/DailyProgressLogging.styles";
import { fonts } from "@/assets/fonts";
import { FlowCardCallender } from "@/assets/icons/FlowCardCallender";
import { FlowCardHandHeartIcon } from "@/assets/icons/FlowCardHandHeartIcon";
import { FlowCardFoodReliefIcon } from "@/assets/icons/FlowCardFoodReleifIcon";
import { FlowCardShirtIcon } from "@/assets/icons/FlowCardShirtIcon";
import type { ProgressLogEntry } from "../types";
import { FlowCardClockIcon } from "@/assets/icons/FlowCardClockIcon";
import { TimeSpentIcon } from "@/assets/icons/TimeSpentIcon";
import { useOptionalSadaqahGoalFrameContext } from "../sadaqahGoalFrameContext";
import { useLogSadaqahGoal } from "@/src/api/mutations/useLogSadaqahGoal";
import {
  getKaffarahFrameFlowCardTitle,
  getSadaqahFrameAchievementLabel,
  getSadaqahFrameAchievementPct,
  sadaqahFrameShowsInsights,
} from "@/src/utils/sadaqahGoalFrameMap";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type KaffarahReason = "broken-fast" | "broken-oath";
type SadaqahType = "meals" | "clothes";
type KaffarahStepId =
  | "date"
  | "reason"
  | "sadaqah-type"
  | "count"
  | "start-time"
  | "time-spent";

type Props = {
  goalData: GoalData;
  onLogComplete?: (entry: ProgressLogEntry) => void;
};

type FlowMode = "collapsed" | "active";

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

function mapKaffarahReasonToApi(
  reason: KaffarahReason,
): "BROKEN_FAST" | "BROKEN_OATH" {
  return reason === "broken-oath" ? "BROKEN_OATH" : "BROKEN_FAST";
}

function mapKaffarahSubtypeToApi(
  reason: KaffarahReason,
  sadaqahType: SadaqahType,
): "MEALS" | "CLOTHING_ITEMS" {
  if (reason === "broken-oath" && sadaqahType === "clothes") {
    return "CLOTHING_ITEMS";
  }
  return "MEALS";
}

// ─────────────────────────────────────────────────────────────────────────────
// Reason Radio Step
// ─────────────────────────────────────────────────────────────────────────────
function ReasonStep({
  reason,
  setReason,
}: {
  reason: KaffarahReason;
  setReason: (r: KaffarahReason) => void;
}) {
  return (
    <View style={reasonStyles.container}>
      <TouchableOpacity
        style={reasonStyles.option}
        onPress={() => setReason("broken-fast")}
        activeOpacity={0.7}
      >
        <View
          style={[
            reasonStyles.radio,
            reason === "broken-fast" && reasonStyles.radioSelected,
          ]}
        >
          {reason === "broken-fast" && <View style={reasonStyles.radioDot} />}
        </View>
        <Text style={reasonStyles.optionLabel}>Broken fast</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={reasonStyles.option}
        onPress={() => setReason("broken-oath")}
        activeOpacity={0.7}
      >
        <View
          style={[
            reasonStyles.radio,
            reason === "broken-oath" && reasonStyles.radioSelected,
          ]}
        >
          {reason === "broken-oath" && <View style={reasonStyles.radioDot} />}
        </View>
        <Text style={reasonStyles.optionLabel}>Broken oath</Text>
      </TouchableOpacity>
    </View>
  );
}

const reasonStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 20,
    marginTop: 8,
    justifyContent: "center",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: Colors.light.white,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.white,
  },
  optionLabel: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 13,
    fontWeight: "500",
  },
});

function SadaqahTypeStep({
  type,
  setType,
}: {
  type: SadaqahType;
  setType: (t: SadaqahType) => void;
}) {
  return (
    <View style={reasonStyles.container}>
      <TouchableOpacity
        style={reasonStyles.option}
        onPress={() => setType("meals")}
        activeOpacity={0.7}
      >
        <View
          style={[
            reasonStyles.radio,
            type === "meals" && reasonStyles.radioSelected,
          ]}
        >
          {type === "meals" && <View style={reasonStyles.radioDot} />}
        </View>
        <Text style={reasonStyles.optionLabel}>Meals</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={reasonStyles.option}
        onPress={() => setType("clothes")}
        activeOpacity={0.7}
      >
        <View
          style={[
            reasonStyles.radio,
            type === "clothes" && reasonStyles.radioSelected,
          ]}
        >
          {type === "clothes" && <View style={reasonStyles.radioDot} />}
        </View>
        <Text style={reasonStyles.optionLabel}>Clothing items</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Flow
// ─────────────────────────────────────────────────────────────────────────────
export default function KaffarahLoggingFlow({
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
  const [reason, setReason] = useState<KaffarahReason>("broken-fast");
  const [sadaqahType, setSadaqahType] = useState<SadaqahType>("meals");
  const [count, setCount] = useState("0");

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
  const [durationMinutes, setDurationMinutes] = useState("10");

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
    ? getKaffarahFrameFlowCardTitle(frame)
    : "Kaffarah for Breaking Fasts or Oaths";
  const achievementPct = getSadaqahFrameAchievementPct(frame);
  const showInsights = frame ? sadaqahFrameShowsInsights(frame) : false;
  const canLog = frame ? Boolean(frame.items?.[0]?.canLog ?? true) : true;
  const goalCompleted =
    achievementPct >= 100 ||
    String(frame?.goal?.status ?? "").toUpperCase() === "COMPLETED";

  const currentSteps: KaffarahStepId[] = [
    "date",
    "reason",
    ...(reason === "broken-oath" ? ["sadaqah-type" as KaffarahStepId] : []),
    "count",
    "start-time",
    "time-spent",
  ];

  const todayString = toDateString(new Date());
  const currentStep = currentSteps[stepIndex];
  const isLastStep = stepIndex === currentSteps.length - 1;

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
    setReason("broken-fast");
    setSadaqahType("meals");
    setCount("0");
    setStartHour(now.hour);
    setStartMinute(now.minute);
    setStartPeriod(now.period);
    setDurationHours("0");
    setDurationMinutes("10");
    setIsPeriodDropdownOpen(false);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedDate || isLogging) return;
    const numericCount = Number.parseInt(count || "0", 10) || 0;
    if (numericCount <= 0) return;

    const hours = parseInt(durationHours || "0", 10) || 0;
    const minutes = parseInt(durationMinutes || "0", 10) || 0;
    const durationTotalMinutes = hours * 60 + minutes;
    if (durationTotalMinutes < 1) return;

    const startTime = formatStartTimeForApi(
      startHour,
      startMinute,
      startPeriod,
    );

    const run = async () => {
      try {
        const result = await logSadaqah({
          sadaqahType: "KAFFARAH",
          logDate: selectedDate,
          amount: numericCount,
          startTime,
          durationMinutes: durationTotalMinutes,
          kaffarahReason: mapKaffarahReasonToApi(reason),
          kaffarahSubtype: mapKaffarahSubtypeToApi(reason, sadaqahType),
        });
        await sadaqahFrame?.refetch();
        onLogComplete?.({
          type: "kaffarah-fasts-oaths" as any,
          goalId: goalData.id,
          date: result.logDate ?? result.date ?? selectedDate,
          reason,
          count: String(result.amount ?? numericCount),
          startTime: result.startTime ?? startTime,
          durationMinutes: result.durationMinutes ?? durationTotalMinutes,
        } as any);
        resetFlow();
      } catch {
        // Toast handled in mutation onError
      }
    };

    void run();
  }, [
    count,
    durationHours,
    durationMinutes,
    goalData.id,
    isLogging,
    logSadaqah,
    onLogComplete,
    reason,
    resetFlow,
    sadaqahFrame,
    sadaqahType,
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

  const getStepHeader = (step: KaffarahStepId) => {
    switch (step) {
      case "date":
        return {
          icon: <FlowCardCallender size={16} color={Colors.light.white} />,
          label: "Which day are you logging for?",
        };
      case "reason":
        return {
          icon: <FlowCardHandHeartIcon size={19} color={Colors.light.white} />,
          label: "Select the reason for kaffarah.",
        };
      case "sadaqah-type":
        return {
          icon: <FlowCardFoodReliefIcon size={18} color={Colors.light.white} />,
          label: "Select the type of sadaqah.",
        };
      case "count":
        const isClothesHeader =
          reason === "broken-oath" && sadaqahType === "clothes";
        return {
          icon: isClothesHeader ? (
            <FlowCardShirtIcon size={20} color={Colors.light.white} />
          ) : (
            <FlowCardFoodReliefIcon size={20} color={Colors.light.white} />
          ),
          label: isClothesHeader
            ? "How many pieces of clothing were given?"
            : "How many meals were given?",
        };
      case "start-time":
        return {
          icon: <FlowCardClockIcon size={20} color={Colors.light.white} />,
          label: "Enter start time.",
        };
      case "time-spent":
        return {
          icon: <TimeSpentIcon size={20} color={Colors.light.white} />,
          label: "Enter time spent.",
        };
    }
  };

  const renderStepContent = (step: KaffarahStepId) => {
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
      case "reason":
        return <ReasonStep reason={reason} setReason={setReason} />;
      case "sadaqah-type":
        return <SadaqahTypeStep type={sadaqahType} setType={setSadaqahType} />;
      case "count":
        const isClothesContent =
          reason === "broken-oath" && sadaqahType === "clothes";
        return (
          <CounterStep
            label={isClothesContent ? "Pieces of clothing" : "Meals given"}
            unit={isClothesContent ? "piece(s)" : "meal(s)"}
            value={count}
            onChangeText={setCount}
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
  const canConfirm =
    isLastStep &&
    !isLogging &&
    (Number.parseInt(count || "0", 10) || 0) > 0 &&
    durationTotalMinutes >= 1;

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
              <View style={localStyles.summaryIconCircle}>
                <FlowCardHandHeartIcon size={22} color={Colors.light.white} />
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
                <Text style={[localStyles.summaryTitle, { flex: undefined }]}>
                  {summaryTitle}
                </Text>
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
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    fontSize: 15,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
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
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.light.white,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
  },
});
