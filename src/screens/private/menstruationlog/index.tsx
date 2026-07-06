import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { useSharedValue } from "react-native-reanimated";
import moment from "moment-hijri";
moment.locale("en");
import { MenstruationCalendar } from "@/components/molecules/MenstruationCalendar";
import InlineDateWheelPicker from "@/components/molecules/InlineDateWheelPicker";
import { SwitchButton } from "@/components/atoms/SwitchButton";
import { Colors } from "@/constants/theme";
import styles from "./style";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { useTypedTranslation } from "@/i18next/useTypedTranslation";

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Length of the goal-tracking cycle. Menstruation can only be logged for days
// that fall inside the cycle the user is currently tracking her ibadah against.
const CYCLE_LENGTH_DAYS = 28;

type MenstruationLogProps = {
  // Start of the active 28-day tracking cycle (YYYY-MM-DD). Defaults to the
  // window that ends today when not provided by the navigation/store.
  cycleStartDate?: string;
};

export default function MenstruationLog({
  cycleStartDate,
}: MenstruationLogProps) {
  const router = useRouter();
  const { t } = useTypedTranslation();
  const { i18n } = useTypedTranslation();
  const locale = i18n.language === "ar" ? "ar" : "en";
  const isMenstruating = useSharedValue(false);
  const isStillMenstruating = useSharedValue(false);
  const [menstruating, setMenstruating] = useState(false);
  const [stillMenstruating, setStillMenstruating] = useState(false);
  const [selectedStartTime, setSelectedStartTime] =
    useState<string>("Before Fajr");
  const [selectedEndTime, setSelectedEndTime] = useState<string>("Before Fajr");

  const today = new Date();
  const todayString = toDateString(today);

  // Resolve the active 28-day cycle window. Selection is limited to this range
  // (and never past today, since a period that hasn't happened can't be logged).
  // The cycle begins at its start date and runs forward 28 days, so nothing
  // before the cycle start is selectable. Defaults to a cycle starting today.
  const cycleStart = cycleStartDate
    ? moment(cycleStartDate, "YYYY-MM-DD").startOf("day")
    : moment(today).startOf("day");
  const cycleEnd = cycleStart.clone().add(CYCLE_LENGTH_DAYS - 1, "days");

  const cycleStartDateObj = cycleStart.toDate();
  // Can't log future menstruation, so cap the upper bound at today.
  const selectableMax = moment.min(cycleEnd, moment(today)).toDate();
  const selectableMaxString = toDateString(selectableMax);

  const [selectedDate, setSelectedDate] = useState(selectableMaxString);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [selectedEndDate, setSelectedEndDate] = useState(selectableMaxString);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const dateExplicitlyPicked = selectedDate !== selectableMaxString;
  const endDateExplicitlyPicked = selectedEndDate !== selectableMaxString;

  const todayButtonLabel =
    selectedDate === todayString
      ? t("homeScreen.menstruationLog_today")
      : moment(selectedDate, "YYYY-MM-DD").locale(locale).format("MMM DD");

  const endDateButtonLabel =
    selectedEndDate === todayString
      ? t("homeScreen.menstruationLog_today")
      : moment(selectedEndDate, "YYYY-MM-DD").locale(locale).format("MMM DD");

  const startMoment = moment(selectedDate, "YYYY-MM-DD").locale(locale);
  const endMoment = startMoment.clone().add(27, "days").locale(locale);
  const gregorianRange = `${startMoment.format("MMM DD").toUpperCase()} - ${endMoment.format("MMM DD, YYYY").toUpperCase()}`;
  const islamicMonthNames = [
    t("homeScreen.islamicMonth_muharram"),
    t("homeScreen.islamicMonth_safar"),
    t("homeScreen.islamicMonth_rabiI"),
    t("homeScreen.islamicMonth_rabiII"),
    t("homeScreen.islamicMonth_jumadaI"),
    t("homeScreen.islamicMonth_jumadaII"),
    t("homeScreen.islamicMonth_rajab"),
    t("homeScreen.islamicMonth_shaban"),
    t("homeScreen.islamicMonth_ramadan"),
    t("homeScreen.islamicMonth_shawwal"),
    t("homeScreen.islamicMonth_dhuAlQa"),
    t("homeScreen.islamicMonth_dhuAlHi"),
  ];
  const islamicRange = `${islamicMonthNames[startMoment.iMonth()]} - ${islamicMonthNames[endMoment.iMonth()]} ${startMoment.iYear()}`;

  const handleTodayPress = () => {
    if (!menstruating) return;
    setShowDatePicker((prev) => !prev);
  };

  const handleEndDatePress = () => {
    if (!menstruating || stillMenstruating) return;
    setShowEndDatePicker((prev) => !prev);
  };

  const handleStartDateWheelChange = (dateString: string) => {
    setSelectedDate(dateString);
    if (selectedEndDate < dateString) {
      setSelectedEndDate(dateString);
    }
  };

  const handleEndDateWheelChange = (dateString: string) => {
    setSelectedEndDate(dateString);
  };

  const isEndDateActive = menstruating && !stillMenstruating;

  // Start date is bounded by the cycle window; end date can't precede the start.
  const startDateMinimum = cycleStartDateObj;
  const endDateMinimum = moment(selectedDate, "YYYY-MM-DD").toDate();

  const startQuestionText = dateExplicitlyPicked
    ? t("homeScreen.menstruationLog_whenDidItStart", {
        date: moment(selectedDate, "YYYY-MM-DD").locale(locale).format("MMM D"),
      })
    : t("homeScreen.menstruationLog_whenDidItStartToday");

  const endQuestionText = endDateExplicitlyPicked
    ? t("homeScreen.menstruationLog_whenDidItEnd", {
        date: moment(selectedEndDate, "YYYY-MM-DD")
          .locale(locale)
          .format("MMM D"),
      })
    : t("homeScreen.menstruationLog_whenDidItEndToday");

  return (
    <BlackScreenWrapper>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            {t("homeScreen.menstruationLog_infoText")}
          </Text>
        </View>

        <View style={styles.periodHeaderContainer}>
          <Text style={styles.periodHeaderText}>
            {t("homeScreen.menstruationLog_headerText")}
          </Text>
          <View style={styles.periodHeaderLine} />
        </View>

        <View style={styles.menstruatingContainer}>
          <Text
            style={[
              styles.menstruatingText,
              {
                color: menstruating ? Colors.light.white : Colors.light.subtext,
              },
            ]}
          >
            {t("homeScreen.menstruationLog_imMenstruating")}
          </Text>
          <SwitchButton
            value={isMenstruating}
            onPress={() => {
              const newValue = !isMenstruating.value;
              isMenstruating.value = newValue;
              setMenstruating(newValue);
              if (!newValue) {
                setShowDatePicker(false);
                setSelectedDate(selectableMaxString);

                setShowEndDatePicker(false);
                setSelectedEndDate(selectableMaxString);

                isStillMenstruating.value = false;
                setStillMenstruating(false);
              }
            }}
            style={styles.switchButton}
          />
        </View>

        <View style={styles.startDateContainer}>
          <Text
            style={[
              styles.startDateText,
              {
                color: menstruating ? Colors.light.white : Colors.light.subtext,
              },
            ]}
          >
            {t("homeScreen.menstruationLog_startDate")}
          </Text>
          <TouchableOpacity
            onPress={handleTodayPress}
            activeOpacity={menstruating ? 0.7 : 1}
            disabled={!menstruating}
          >
            <View
              style={[
                dateExplicitlyPicked && menstruating
                  ? styles.todayContainerActive
                  : styles.todayContainer,
                !menstruating && { opacity: 0.4 },
              ]}
            >
              <Text
                style={[
                  styles.todayText,
                  dateExplicitlyPicked &&
                    menstruating && { color: Colors.light.white },
                ]}
              >
                {todayButtonLabel}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {showDatePicker && menstruating && (
          <InlineDateWheelPicker
            value={selectedDate}
            onChange={handleStartDateWheelChange}
            maximumDate={selectableMax}
            minimumDate={startDateMinimum}
          />
        )}

        {menstruating && (
          <View style={styles.startTimesContainer}>
            <Text style={styles.startTimeQuestionText}>
              {startQuestionText}
            </Text>
            <View style={styles.radioOptionsList}>
              {[
                {
                  label: "Before Fajr",
                  transKey: "homeScreen.menstruationLog_beforeFajr",
                },
                {
                  label: "Before Duhr",
                  transKey: "homeScreen.menstruationLog_beforeDuhr",
                },
                {
                  label: "Before Asr",
                  transKey: "homeScreen.menstruationLog_beforeAsr",
                },
                {
                  label: "Before Maghrib",
                  transKey: "homeScreen.menstruationLog_beforeMaghrib",
                },
                {
                  label: "Before Isha",
                  transKey: "homeScreen.menstruationLog_beforeIsha",
                },
              ].map((timeOption) => {
                const isSelected = selectedStartTime === timeOption.label;
                return (
                  <TouchableOpacity
                    key={timeOption.label}
                    style={styles.radioOption}
                    onPress={() => setSelectedStartTime(timeOption.label)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.radioOuter}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.radioText}>
                      {t(timeOption.transKey as any)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.calendarSection}>
          <View style={styles.calendarContainer}>
            <View style={styles.dateLabelsContainer}>
              <Text
                style={[
                  styles.gregorianDateText,
                  {
                    color: menstruating
                      ? Colors.light.white
                      : Colors.light.subtext,
                  },
                ]}
              >
                {gregorianRange}
              </Text>
              <Text
                style={[
                  styles.islamicDateText,
                  {
                    color: menstruating
                      ? Colors.light.white
                      : Colors.light.subtext,
                  },
                ]}
              >
                {islamicRange}
              </Text>
            </View>
            <MenstruationCalendar
              currentDate={selectedDate}
              selectedDate={selectedDate}
              onDayPress={(dateString) => {
                setSelectedDate(dateString);
                if (dateString > selectedEndDate) {
                  setSelectedEndDate(dateString);
                }
              }}
              isMenstruating={menstruating}
            />
          </View>
        </View>

        <View style={styles.menstruatingContainer}>
          <Text
            style={[
              styles.menstruatingText,
              {
                color: menstruating ? Colors.light.white : Colors.light.subtext,
              },
            ]}
          >
            {t("homeScreen.menstruationLog_imStillMenstruating")}
          </Text>
          <SwitchButton
            value={isStillMenstruating}
            onPress={() => {
              if (!menstruating) return;
              const newValue = !isStillMenstruating.value;
              isStillMenstruating.value = newValue;
              setStillMenstruating(newValue);
              if (newValue) {
                setShowEndDatePicker(false);
                setSelectedEndDate(selectableMaxString);
              }
            }}
            style={[styles.switchButton, !menstruating && { opacity: 0.4 }]}
          />
        </View>

        <View style={styles.startDateContainer}>
          <Text
            style={[
              styles.startDateText,
              {
                color: isEndDateActive
                  ? Colors.light.white
                  : Colors.light.subtext,
              },
            ]}
          >
            {t("homeScreen.menstruationLog_endDate")}
          </Text>
          <TouchableOpacity
            onPress={handleEndDatePress}
            activeOpacity={isEndDateActive ? 0.7 : 1}
            disabled={!isEndDateActive}
          >
            <View
              style={[
                endDateExplicitlyPicked && isEndDateActive
                  ? styles.todayContainerActive
                  : styles.todayContainer,
                !isEndDateActive && { opacity: 0.4 },
              ]}
            >
              <Text
                style={[
                  styles.todayText,
                  endDateExplicitlyPicked &&
                    isEndDateActive && { color: Colors.light.white },
                ]}
              >
                {endDateButtonLabel}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {showEndDatePicker && isEndDateActive && (
          <InlineDateWheelPicker
            value={selectedEndDate}
            onChange={handleEndDateWheelChange}
            maximumDate={selectableMax}
            minimumDate={endDateMinimum}
          />
        )}

        {isEndDateActive && (
          <View style={styles.startTimesContainer}>
            <Text style={styles.startTimeQuestionText}>{endQuestionText}</Text>
            <View style={styles.radioOptionsList}>
              {[
                {
                  label: "Before Fajr",
                  transKey: "homeScreen.menstruationLog_beforeFajr",
                },
                {
                  label: "Before Duhr",
                  transKey: "homeScreen.menstruationLog_beforeDuhr",
                },
                {
                  label: "Before Asr",
                  transKey: "homeScreen.menstruationLog_beforeAsr",
                },
                {
                  label: "Before Maghrib",
                  transKey: "homeScreen.menstruationLog_beforeMaghrib",
                },
                {
                  label: "Before Isha",
                  transKey: "homeScreen.menstruationLog_beforeIsha",
                },
              ].map((timeOption) => {
                const isSelected = selectedEndTime === timeOption.label;
                return (
                  <TouchableOpacity
                    key={timeOption.label}
                    style={styles.radioOption}
                    onPress={() => setSelectedEndTime(timeOption.label)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.radioOuter}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.radioText}>
                      {t(timeOption.transKey as any)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.8}
          onPress={() => {
            router.back();
          }}
        >
          <Text style={styles.saveButtonText}>
            {t("homeScreen.menstruationLog_save")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </BlackScreenWrapper>
  );
}
