import React, { useCallback, useMemo, useState } from "react";
import { Pressable, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import moment from "moment-hijri";
import { Colors } from "@/constants/theme";
import { GoalData } from "../../home/components/goalsData";
import { DateStep } from "../components/DateStep";
import { formatProgressLoggingDateLabel } from "../progressLoggingConfig";
import { PrayerQuantityInputStep } from "../components/PrayerQuantityInputStep";
import {
  StartTimeStep,
  DurationStep,
  getCurrentStartTimeParts,
} from "../components/TimePickerSteps";
import { FlowCard } from "../components/FlowCard";
import { OptionSelectStep } from "../components/OptionSelectStep";
import { useGetMe } from "@/src/api/queries/useGetMe";
import {
  styles as commonStyles,
  FLOW_CARD_HEIGHT,
} from "../components/DailyProgressLogging.styles";
import { fonts } from "@/assets/fonts";
import {
  AddLoggingFlowIcon,
  CalendarFlippingIcon,
  WhiteClockIcon,
  WhitePrayerMatIcon,
  WhiteTimerIcon,
} from "@/assets/icons";
import { QiyamAfterIshaIcon } from "@/assets/icons/QiyamAfterIshaIcon";
import { QiyamFemaleUserIcon } from "@/assets/icons/QiyamFemaleUser";
import { QiyamMaleUserIcon } from "@/assets/icons/QiyamMaleUser";
import { QiyamWhenDidYouPrayIcon } from "@/assets/icons/QiyamWhenDidYouPrayIcon";
import type { ProgressLogEntry } from "../types";

type QiyamLoggedTime = "after-isha" | "before-fajr";

type QiyamTimingOption = {
  value: QiyamLoggedTime;
  label: string;
  description: string;
  renderIcon: () => React.ReactNode;
};

const getQiyamTimingOptions = (isFemale: boolean): QiyamTimingOption[] => [
  {
    value: "after-isha",
    label: "After Isha",
    description:
      "(Concluding your day with Qiyam after the\nIsha prayer and before going to sleep.)",
    renderIcon: () => <QiyamAfterIshaIcon size={16} outline />,
  },
  {
    value: "before-fajr",
    label: "Before Fajr (Tahajjud)",
    description:
      "(Rising from sleep in the final third of the night to pray before the Fajr Adhan.)",
    renderIcon: () =>
      isFemale ? (
        <QiyamFemaleUserIcon size={16} outline />
      ) : (
        <QiyamMaleUserIcon size={16} outline />
      ),
  },
];

const QiyamTimingStep = ({
  loggedTime,
  setLoggedTime,
  isOpen,
  setIsOpen,
  timingOptions,
  styles: commonStyles,
}: {
  loggedTime: QiyamLoggedTime;
  setLoggedTime: (val: QiyamLoggedTime) => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  timingOptions: QiyamTimingOption[];
  styles: typeof import("../components/DailyProgressLogging.styles").styles;
}) => {
  const selectedOption =
    timingOptions.find((option) => option.value === loggedTime) ??
    timingOptions[0];
  const alternateOptions = timingOptions.filter(
    (option) => option.value !== loggedTime,
  );

  return (
    <View style={timingStepStyles.container}>
      <View
        style={[
          commonStyles.flowDropdownWrapper,
          isOpen && { zIndex: 30 },
        ]}
      >
        <TouchableOpacity
          style={[
            commonStyles.flowDropdownSelector,
            timingStepStyles.selector,
          ]}
          onPress={() => setIsOpen(!isOpen)}
          activeOpacity={0.8}
        >
          <View style={timingStepStyles.selectorLeading}>
            {selectedOption.renderIcon()}
            <Text style={timingStepStyles.selectorLabel} numberOfLines={1}>
              {selectedOption.label}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={12} color={Colors.light.white} />
        </TouchableOpacity>

        {isOpen ? (
          <View style={[commonStyles.flowDropdownMenu, timingStepStyles.dropdownMenu]}>
            {alternateOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  commonStyles.flowDropdownOption,
                  timingStepStyles.dropdownOption,
                ]}
                onPress={() => {
                  setLoggedTime(option.value);
                  setIsOpen(false);
                }}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    commonStyles.dropdownRadioOuter,
                    { borderColor: Colors.light.grey },
                  ]}
                >
                  <View
                    style={[
                      commonStyles.dropdownRadioInner,
                      { backgroundColor: Colors.light.green },
                    ]}
                  />
                </View>
                {option.renderIcon()}
                <Text style={timingStepStyles.dropdownLabel} numberOfLines={2}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </View>

      {!isOpen ? (
        <Text style={timingStepStyles.description} numberOfLines={2}>
          {selectedOption.description}
        </Text>
      ) : null}
    </View>
  );
};

const timingStepStyles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 2,
    paddingTop: 12,
  },
  selector: {
    minHeight: 26,
    height: 26,
    paddingHorizontal: 8,
    paddingVertical: 0,
    borderColor: Colors.light.dullWhite + "66",
  },
  selectorLeading: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minWidth: 0,
    marginRight: 6,
  },
  selectorLabel: {
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 18,
    letterSpacing: -0.3,
  },
  dropdownMenu: {
    marginTop: 2,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  dropdownOption: {
    gap: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    minHeight: 26,
  },
  dropdownLabel: {
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
    letterSpacing: -0.3,
  },
  description: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 10,
    lineHeight: 14,
    opacity: 0.8,
    textAlign: "left",
    alignSelf: "stretch",
    width: "100%",
    marginTop: -2,
  },
});

type QiyamStepId =
  | "date"
  | "prayers-quantity"
  | "when-pray"
  | "start-time"
  | "time-spent"
  | "witr";
const STEPS: QiyamStepId[] = [
  "date",
  "prayers-quantity",
  "when-pray",
  "start-time",
  "time-spent",
  "witr",
];

type Props = { goalData: GoalData; onLogComplete?: (entry: ProgressLogEntry) => void; };
type FlowMode = "collapsed" | "active";
const toDateString = (date: Date) => moment(date).format("YYYY-MM-DD");

export default function QiyamLoggingFlow({ goalData, onLogComplete }: Props) {
  const { t } = useTranslation();
  const { data: me } = useGetMe();
  const isFemale = me?.gender?.toUpperCase() === "FEMALE";
  const timingOptions = useMemo(
    () => getQiyamTimingOptions(isFemale),
    [isFemale],
  );
  const [flowMode, setFlowMode] = useState<FlowMode>("collapsed");
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const [prayersCount, setPrayersCount] = useState("4");
  const [loggedTime, setLoggedTime] = useState<"after-isha" | "before-fajr">("before-fajr");
  const [isTimingDropdownOpen, setIsTimingDropdownOpen] = useState(false);
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
  const MOCK_PERCENTAGE = 40;
  const totalPrayersRequired = 40;
  const mockTitle = `${totalPrayersRequired} 2-Rak'ah Qiyam Al-Layl Prayers`;
  const [hasLogged, setHasLogged] = useState(false);

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
  const dateLabel = formatProgressLoggingDateLabel(selectedDate, todayString, t("progressLogging.today"));

  const shiftDate = (direction: -1 | 1) => {
    const next = moment(selectedDate, "YYYY-MM-DD").add(direction, "days").format("YYYY-MM-DD");
    if (direction === 1 && next > todayString) return;
    setSelectedDate(next);
  };

  const resetFlow = useCallback(() => {
    setFlowMode("collapsed"); setStepIndex(0); setSelectedDate(toDateString(new Date()));
    setPrayersCount("4"); setLoggedTime("before-fajr"); setIsTimingDropdownOpen(false); setStartHour("02"); setStartMinute("00"); setStartPeriod("am");
    setDurationHours("0"); setDurationMinutes("0"); setIsPeriodDropdownOpen(false);
  }, []);

  const handleConfirm = () => {
    setHasLogged(true);
    onLogComplete?.({
      type: "qiyam-al-layl",
      goalId: goalData.id,
      date: selectedDate,
      prayersCount,
      loggedTime,
      startTime: `${startHour}:${startMinute} ${startPeriod}`,
      durationHours,
      durationMinutes,
      concludedWithWitr: concludedWithWitr === "Yes",
    } as ProgressLogEntry);
    resetFlow();
  };

  const handleBack = () => {
    setIsTimingDropdownOpen(false);
    if (stepIndex === 0) {
      resetFlow();
      return;
    }
    setStepIndex((i) => i - 1);
  };
  const handleForward = () => {
    setIsTimingDropdownOpen(false);
    if (!isLastStep) setStepIndex((i) => i + 1);
  };
  const handleOpenFlow = useCallback(() => {
    const now = getCurrentStartTimeParts();
    setStartHour(now.hour);
    setStartMinute(now.minute);
    setStartPeriod(now.period);
    setFlowMode("active");
  }, []);

  const isDropdownOpen =
    flowMode === "active" &&
    currentStep === "when-pray" &&
    isTimingDropdownOpen;

  const getStepHeader = (step: QiyamStepId) => {
    switch (step) {
      case "date":
        return {
          icon: <CalendarFlippingIcon size={24} />,
          label: "Which night are you logging for?",
        };
      case "prayers-quantity":
        return {
          icon: (
            <MaterialCommunityIcons
              name="star-crescent"
              size={26}
              color={Colors.light.white}
            />
          ),
          label: "How many 2-rak'ah prayers did you pray?",
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
      case "when-pray":
        return {
          icon: <QiyamWhenDidYouPrayIcon size={20} />,
          label: "When did you pray?",
        };
      case "witr":
        return {
          icon: <WhitePrayerMatIcon size={26} />,
          label: "Did you conclude with Witr?",
        };
    }
  };

  const renderStepContent = (step: QiyamStepId) => {
    switch (step) {
      case "date": return <DateStep dateLabel={dateLabel} selectedDate={selectedDate} todayString={todayString} onShiftDate={shiftDate} styles={commonStyles} />;
      case "prayers-quantity": return <PrayerQuantityInputStep quantity={prayersCount} setQuantity={setPrayersCount} styles={commonStyles} />;
      case "start-time": return <StartTimeStep startHour={startHour} setStartHour={setStartHour} startMinute={startMinute} setStartMinute={setStartMinute} startPeriod={startPeriod} setStartPeriod={setStartPeriod} isPeriodDropdownOpen={isPeriodDropdownOpen} setIsPeriodDropdownOpen={setIsPeriodDropdownOpen} styles={commonStyles} />;
      case "time-spent": return <DurationStep durationHours={durationHours} setDurationHours={setDurationHours} durationMinutes={durationMinutes} setDurationMinutes={setDurationMinutes} styles={commonStyles} />;
      case "when-pray":
        return (
          <QiyamTimingStep
            loggedTime={loggedTime}
            setLoggedTime={setLoggedTime}
            isOpen={isTimingDropdownOpen}
            setIsOpen={setIsTimingDropdownOpen}
            timingOptions={timingOptions}
            styles={commonStyles}
          />
        );
      case "witr":
        return (
          <OptionSelectStep<"Yes" | "No">
            options={["Yes", "No"]}
            selectedValue={concludedWithWitr}
            onSelectValue={setConcludedWithWitr}
            getLabel={(option) => option}
            radioInnerColor={Colors.light.white}
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

        <View
          style={[
            commonStyles.cardAnchor,
            isDropdownOpen && commonStyles.flowCardLayerDropdownOpen,
          ]}
        >
        {flowMode === "collapsed" ? (
          <View style={localStyles.summaryCard}>
            <View style={localStyles.summaryBody}>
              <View style={localStyles.summaryIconCircle}>
                <MaterialCommunityIcons
                  name="star-crescent"
                  size={25}
                  color={Colors.light.white}
                />
              </View>
              <View style={{ flex: 1, gap: 9 }}>
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
                  {mockTitle}
                </Text>
              </View>
            </View>

            <View style={localStyles.footerRow}>
              {isCompleted ? (
                <TouchableOpacity style={localStyles.insightsBtn}>
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
              style={localStyles.addButton}
              onPress={handleOpenFlow}
              activeOpacity={0.8}
            >
              <AddLoggingFlowIcon size={32} />
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={[
              commonStyles.flowCardLayer,
              isDropdownOpen && commonStyles.flowCardLayerDropdownOpen,
            ]}
          >
            <FlowCard
              headerIcon={stepHeader.icon}
              headerLabel={stepHeader.label}
              onBack={handleBack}
              onForward={handleForward}
              onConfirm={handleConfirm}
              canGoForward={!isLastStep}
              canGoBack={stepIndex > 0}
              canConfirm={isLastStep}
              showConfirmButton={currentStep !== "when-pray"}
              styles={commonStyles}
              style={[
                commonStyles.inPlaceFlowCard,
                isDropdownOpen && commonStyles.flowCardDropdownOpen,
              ]}
              contentStyle={
                currentStep === "when-pray"
                  ? [
                      localStyles.whenPrayFlowContent,
                      isDropdownOpen && commonStyles.flowContentDropdownOpen,
                    ]
                  : isDropdownOpen
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
  badgeRow: {
    flexDirection: "row",
    marginLeft: 14,
  },
  spacer: {
    flex: 1,
  },
  whenPrayFlowContent: {
    justifyContent: "flex-start",
    paddingTop: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
});