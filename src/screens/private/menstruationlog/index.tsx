import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { useFocusEffect } from "expo-router";
import { useSharedValue } from "react-native-reanimated";
import moment from "moment-hijri";
moment.locale("en");
import InlineDateWheelPicker, {
  ONGOING_DATE_VALUE,
} from "@/components/molecules/InlineDateWheelPicker";
import { SwitchButton } from "@/components/atoms/SwitchButton";
import PrimaryButton from "@/components/atoms/Primary-button";
import { Colors } from "@/constants/theme";
import styles from "./style";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { useTypedTranslation } from "@/i18next/useTypedTranslation";
import { useGetMenstruationPeriod } from "@/src/api/queries/useGetMenstruationPeriod";
import { useGetGoalCycle } from "@/src/api/queries/useGetGoalCycle";
import { useSaveMenstruationPeriod } from "@/src/api/mutations/useSaveMenstruationPeriod";
import { useGetMe } from "@/src/api/queries/useGetMe";
import { useAuth } from "@/provider/useAuth";

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Users can log menstruation for today and up to this many past days — never future.
const PAST_LOG_DAYS = 10;

type MenstruationLogProps = {
  // Start of the active 28-day tracking cycle (YYYY-MM-DD). Defaults to the
  // window that ends today when not provided by the navigation/store.
  cycleStartDate?: string;
};

export default function MenstruationLog({
  cycleStartDate: _cycleStartDate,
}: MenstruationLogProps) {
  const router = useRouter();
  const { t } = useTypedTranslation();
  const { i18n } = useTypedTranslation();
  const locale = i18n.language === "ar" ? "ar" : "en";
  const isMenstruating = useSharedValue(false);
  const [menstruating, setMenstruating] = useState(false);
  const [selectedStartTime, setSelectedStartTime] = useState<string>("");
  const [selectedEndTime, setSelectedEndTime] = useState<string>("");

  const { mutateAsync: saveMenstruation, isPending } =
    useSaveMenstruationPeriod();

  // useAuth has the user from login stored in AsyncStorage
  const { user } = useAuth();
  // useGetMe provides the latest user data directly from the backend
  const { data: meData } = useGetMe();

  // The backend is fixed and is the source of truth. Always prioritize `meData`.
  const menstruationPeriodId =
    meData?.menstruationPeriodId ?? user?.menstruationPeriodId ?? null;

  const goalCycleId = meData?.goalCycleId ?? user?.goalCycleId ?? null;
  console.log("meData", meData);
  console.log("goalCycleId", goalCycleId);
  // Fetch the existing menstruation period using the ID
  const { data: periodData } = useGetMenstruationPeriod(menstruationPeriodId);
  // Fetch the active Goal Cycle (keeps cycle data warm for related screens)
  useGetGoalCycle(goalCycleId);

  const reversePrayerMap: Record<string, string> = {
    FAJR: "Before Fajr",
    DUHR: "Before Dhuhr",
    DHUHR: "Before Dhuhr",
    ASR: "Before Asr",
    MAGHRIB: "Before Maghrib",
    ISHA: "Before Isha",
  };

  // Guard: only populate from backend ONCE per screen visit.
  // Reset every time the screen comes into focus so returning users get fresh data.
  const hasInitialized = useRef(false);
  useFocusEffect(
    useCallback(() => {
      hasInitialized.current = false;
    }, []),
  );

  useEffect(() => {
    // Skip if already initialized or no data yet
    if (hasInitialized.current || !periodData?.data) return;
    hasInitialized.current = true;

    const period = periodData.data;

    // If the last period is closed, leave the UI blank so the user can log a new cycle.
    if (!period.isOngoing) {
      return;
    }

    // Turn on the first toggle since an ONGOING period record exists
    setMenstruating(true);
    isMenstruating.value = true;

    // Ongoing period → End Date chip stays "Ongoing"
    setSelectedEndDate(ONGOING_DATE_VALUE);

    // Prepopulate start date (clamp into today … today-10 window)
    if (period.startDate) {
      const dateObj = new Date(period.startDate);
      const clamped = clampDateToSelectable(toDateString(dateObj));
      setSelectedDate(clamped);
    }

    // Prepopulate start prayer
    if (period.startPrayer) {
      setSelectedStartTime(reversePrayerMap[period.startPrayer] ?? "");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodData, menstruationPeriodId]);

  const today = new Date();
  const todayString = toDateString(today);
  const todayMoment = moment(today).startOf("day");

  // Date wheel: today (labeled "Today") down to 10 days ago — no future dates.
  const earliestLogMoment = todayMoment.clone().subtract(PAST_LOG_DAYS, "days");
  const earliestStartString = earliestLogMoment.format("YYYY-MM-DD");
  const startDateMinimum = earliestLogMoment.toDate();
  const selectableMax = todayMoment.toDate();
  const selectableMaxString = todayString;

  const clampDateToSelectable = useCallback(
    (dateString: string) => {
      if (dateString < earliestStartString) return earliestStartString;
      if (dateString > selectableMaxString) return selectableMaxString;
      return dateString;
    },
    [earliestStartString, selectableMaxString],
  );

  const defaultSelectedDate = clampDateToSelectable(todayString);

  // Default to today (clamped into the selectable window).
  const [selectedDate, setSelectedDate] = useState(defaultSelectedDate);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // End date defaults to "Ongoing" (period not yet finished).
  const [selectedEndDate, setSelectedEndDate] =
    useState<string>(ONGOING_DATE_VALUE);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const isEndOngoing = selectedEndDate === ONGOING_DATE_VALUE;

  const startCollapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const endCollapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const clearStartCollapseTimer = useCallback(() => {
    if (startCollapseTimerRef.current) {
      clearTimeout(startCollapseTimerRef.current);
      startCollapseTimerRef.current = null;
    }
  }, []);

  const clearEndCollapseTimer = useCallback(() => {
    if (endCollapseTimerRef.current) {
      clearTimeout(endCollapseTimerRef.current);
      endCollapseTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearStartCollapseTimer();
      clearEndCollapseTimer();
    };
  }, [clearEndCollapseTimer, clearStartCollapseTimer]);

  // Keep start pick inside today … today-10 when bounds refresh.
  useEffect(() => {
    if (hasInitialized.current) return;
    const fallback = clampDateToSelectable(todayString);
    setSelectedDate((prev) => {
      if (prev < earliestStartString || prev > selectableMaxString) {
        return fallback;
      }
      return prev;
    });
    setSelectedEndDate((prev) => {
      if (prev === ONGOING_DATE_VALUE) return prev;
      if (prev < earliestStartString || prev > selectableMaxString) {
        return ONGOING_DATE_VALUE;
      }
      return prev;
    });
  }, [
    clampDateToSelectable,
    earliestStartString,
    selectableMaxString,
    todayString,
  ]);

  const todayButtonLabel =
    selectedDate === todayString
      ? t("homeScreen.menstruationLog_today")
      : moment(selectedDate, "YYYY-MM-DD").locale(locale).format("MMM D");

  const endDateButtonLabel = isEndOngoing
    ? t("homeScreen.menstruationLog_ongoing")
    : selectedEndDate === todayString
      ? t("homeScreen.menstruationLog_today")
      : moment(selectedEndDate, "YYYY-MM-DD").locale(locale).format("MMM D");

  const handleTodayPress = () => {
    if (!menstruating) return;
    if (showDatePicker) {
      clearStartCollapseTimer();
      setShowDatePicker(false);
      return;
    }
    // Opening: keep the current selection (today by default; a prior pick otherwise).
    clearStartCollapseTimer();
    setShowDatePicker(true);
  };

  const handleEndDatePress = () => {
    if (!menstruating) return;
    if (showEndDatePicker) {
      clearEndCollapseTimer();
      setShowEndDatePicker(false);
      return;
    }
    clearEndCollapseTimer();
    setShowEndDatePicker(true);
  };

  const handleStartDateWheelChange = (dateString: string) => {
    const nextStart = clampDateToSelectable(dateString);
    setSelectedDate(nextStart);
    setSelectedEndDate((prev) => {
      if (prev === ONGOING_DATE_VALUE) return prev;
      if (prev < nextStart) return nextStart;
      if (prev > todayString) return todayString;
      return prev;
    });
    clearStartCollapseTimer();
    startCollapseTimerRef.current = setTimeout(() => {
      setShowDatePicker(false);
      startCollapseTimerRef.current = null;
    }, 2000);
  };

  const handleEndDateWheelChange = (dateString: string) => {
    if (dateString === ONGOING_DATE_VALUE) {
      setSelectedEndDate(ONGOING_DATE_VALUE);
      setSelectedEndTime("");
    } else {
      const nextEnd = clampDateToSelectable(dateString);
      const clamped =
        nextEnd < selectedDate ? selectedDate : nextEnd;
      setSelectedEndDate(clamped);
      // Leaving Ongoing requires a fresh end time-of-day pick before Save.
      setSelectedEndTime("");
    }
    clearEndCollapseTimer();
    endCollapseTimerRef.current = setTimeout(() => {
      setShowEndDatePicker(false);
      endCollapseTimerRef.current = null;
    }, 2000);
  };

  // End date: from the chosen start date through today (no future).
  const endDateMinimum = moment
    .max(moment(selectedDate, "YYYY-MM-DD"), earliestLogMoment)
    .toDate();
  const endDateMaximum = selectableMax;

  const startQuestionText =
    selectedDate === todayString
      ? t("homeScreen.menstruationLog_whenDidItStartToday")
      : t("homeScreen.menstruationLog_whenDidItStart", {
          date: moment(selectedDate, "YYYY-MM-DD")
            .locale(locale)
            .format("MMM D"),
        });

  const endQuestionText =
    selectedEndDate === todayString
      ? t("homeScreen.menstruationLog_whenDidItEndToday")
      : t("homeScreen.menstruationLog_whenDidItEnd", {
          date: moment(selectedEndDate, "YYYY-MM-DD")
            .locale(locale)
            .format("MMM D"),
        });

  const canSave =
    menstruating &&
    selectedStartTime !== "" &&
    (isEndOngoing || selectedEndTime !== "") &&
    !isPending &&
    !!goalCycleId;

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
          <Text style={styles.menstruatingText}>
            {t("homeScreen.menstruationLog_imMenstruating")}
          </Text>
          <SwitchButton
            value={isMenstruating}
            onPress={() => {
              if (!goalCycleId) {
                alert("You must select a Goal Cycle before logging a period.");
                return;
              }
              const newValue = !isMenstruating.value;
              isMenstruating.value = newValue;
              setMenstruating(newValue);
              if (!newValue) {
                clearStartCollapseTimer();
                clearEndCollapseTimer();
                setShowDatePicker(false);
                setSelectedDate(defaultSelectedDate);

                setShowEndDatePicker(false);
                setSelectedEndDate(ONGOING_DATE_VALUE);

                setSelectedStartTime("");
                setSelectedEndTime("");
              }
            }}
            trackColors={{
              off: Colors.light.subtext,
              on: Colors.light.dullWhiteOpacity,
            }}
            thumbColors={{ off: Colors.light.white, on: Colors.light.green }}
            size="small"
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
                menstruating && showDatePicker
                  ? styles.todayContainerActive
                  : styles.todayContainer,
                !menstruating && { opacity: 0.4 },
              ]}
            >
              <Text
                style={[
                  styles.todayText,
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
                  label: "Before Dhuhr",
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

        <View style={styles.startDateContainer}>
          <Text
            style={[
              styles.startDateText,
              {
                color: menstruating
                  ? Colors.light.white
                  : Colors.light.subtext,
              },
            ]}
          >
            {t("homeScreen.menstruationLog_endDate")}
          </Text>
          <TouchableOpacity
            onPress={handleEndDatePress}
            activeOpacity={menstruating ? 0.7 : 1}
            disabled={!menstruating}
          >
            <View
              style={[
                menstruating && showEndDatePicker
                  ? styles.todayContainerActive
                  : styles.todayContainer,
                !menstruating && { opacity: 0.4 },
              ]}
            >
              <Text
                style={[
                  styles.todayText,
                  menstruating && { color: Colors.light.white },
                ]}
              >
                {endDateButtonLabel}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {showEndDatePicker && menstruating && (
          <InlineDateWheelPicker
            value={selectedEndDate}
            onChange={handleEndDateWheelChange}
            maximumDate={endDateMaximum}
            minimumDate={endDateMinimum}
            includeOngoing
          />
        )}

        {menstruating && !isEndOngoing && (
          <View style={styles.startTimesContainer}>
            <Text style={styles.startTimeQuestionText}>{endQuestionText}</Text>
            <View style={styles.radioOptionsList}>
              {[
                {
                  label: "Before Fajr",
                  transKey: "homeScreen.menstruationLog_beforeFajr",
                },
                {
                  label: "Before Dhuhr",
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

        <PrimaryButton
          text={t("homeScreen.menstruationLog_save")}
          onPress={async () => {
            if (!goalCycleId) {
              alert("You must select a Goal Cycle before logging a period.");
              return;
            }

            const prayerMap: Record<string, string> = {
              "Before Fajr": "FAJR",
              "Before Dhuhr": "DHUHR",
              "Before Asr": "ASR",
              "Before Maghrib": "MAGHRIB",
              "Before Isha": "ISHA",
            };
            const startPrayer = prayerMap[selectedStartTime] || "FAJR";

            // Note: selectedDate is "YYYY-MM-DD"
            const isoStartDate = new Date(selectedDate).toISOString();

            const payload: any = {
              startDate: isoStartDate,
              startPrayer: startPrayer,
              isOngoing: isEndOngoing,
            };

            if (!isEndOngoing) {
              payload.endDate = new Date(selectedEndDate).toISOString();
              payload.endPrayer = prayerMap[selectedEndTime] || "FAJR";
            }

            console.log("=== SAVE DEBUG ===");
            console.log("Saving payload:", JSON.stringify(payload));

            try {
              // Backend uses the same POST endpoint for both create and update.
              await saveMenstruation(payload);
              router.back();
            } catch (error) {
              // error handled in mutation
            }
          }}
          disabled={!canSave}
          isLoading={isPending}
          style={{ marginTop: 56 }}
        />
      </ScrollView>
    </BlackScreenWrapper>
  );
}
