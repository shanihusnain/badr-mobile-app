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
import { useGetActiveMenstruationPeriod } from "@/src/api/queries/useGetActiveMenstruationPeriod";
import {
  getMenstruationApiErrorStatus,
  toMenstruationApiDate,
  useSaveMenstruationPeriod,
  type SaveMenstruationPayload,
} from "@/src/api/mutations/useSaveMenstruationPeriod";
import { showToast } from "@/src/config/toastConfig";

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parse API DATE (`…T00:00:00.000Z`) as a local calendar YYYY-MM-DD. */
function apiDateToLocalYmd(value: string | null | undefined): string | null {
  if (!value) return null;
  const slice = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(slice) ? slice : null;
}

// Users can log menstruation for today and up to this many past days — never future.
const PAST_LOG_DAYS = 10;

const PRAYER_LABEL_TO_API: Record<string, string> = {
  "Before Fajr": "FAJR",
  "Before Dhuhr": "DHUHR",
  "Before Asr": "ASR",
  "Before Maghrib": "MAGHRIB",
  "Before Isha": "ISHA",
};

const API_TO_PRAYER_LABEL: Record<string, string> = {
  FAJR: "Before Fajr",
  DUHR: "Before Dhuhr",
  DHUHR: "Before Dhuhr",
  ASR: "Before Asr",
  MAGHRIB: "Before Maghrib",
  ISHA: "Before Isha",
};

const START_TIME_OPTIONS = [
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
] as const;

type MenstruationLogProps = {
  cycleStartDate?: string;
};

export default function MenstruationLog(_props: MenstruationLogProps) {
  const router = useRouter();
  const { t, i18n } = useTypedTranslation();
  const locale = i18n.language === "ar" ? "ar" : "en";
  const isMenstruating = useSharedValue(false);
  const [menstruating, setMenstruating] = useState(false);
  const [selectedStartTime, setSelectedStartTime] = useState<string>("");
  const [selectedEndTime, setSelectedEndTime] = useState<string>("");

  const { mutateAsync: saveMenstruation, isPending } =
    useSaveMenstruationPeriod();

  const {
    data: activeResponse,
    refetch: refetchActive,
    isFetched: activeFetched,
  } = useGetActiveMenstruationPeriod();
  const activePeriod = activeResponse?.data ?? null;

  const hasInitialized = useRef(false);
  useFocusEffect(
    useCallback(() => {
      hasInitialized.current = false;
      void refetchActive();
    }, [refetchActive]),
  );

  const today = new Date();
  const todayString = toDateString(today);
  const todayMoment = moment(today).startOf("day");

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

  const [selectedDate, setSelectedDate] = useState(defaultSelectedDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedEndDate, setSelectedEndDate] =
    useState<string>(ONGOING_DATE_VALUE);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const isEndOngoing = selectedEndDate === ONGOING_DATE_VALUE;

  const resetBlankForm = useCallback(() => {
    setMenstruating(false);
    isMenstruating.value = false;
    setSelectedDate(defaultSelectedDate);
    setSelectedEndDate(ONGOING_DATE_VALUE);
    setSelectedStartTime("");
    setSelectedEndTime("");
    setShowDatePicker(false);
    setShowEndDatePicker(false);
  }, [defaultSelectedDate, isMenstruating]);

  const applyActivePeriodToForm = useCallback(() => {
    if (!activePeriod) {
      resetBlankForm();
      return;
    }

    setMenstruating(true);
    isMenstruating.value = true;
    setSelectedEndDate(ONGOING_DATE_VALUE);
    setSelectedEndTime("");

    const startYmd = apiDateToLocalYmd(activePeriod.startDate);
    if (startYmd) {
      setSelectedDate(clampDateToSelectable(startYmd));
    }
    if (activePeriod.startPrayer) {
      setSelectedStartTime(
        API_TO_PRAYER_LABEL[String(activePeriod.startPrayer).toUpperCase()] ??
          "",
      );
    }
  }, [activePeriod, clampDateToSelectable, isMenstruating, resetBlankForm]);

  useEffect(() => {
    if (!activeFetched || hasInitialized.current) return;
    hasInitialized.current = true;
    applyActivePeriodToForm();
  }, [activeFetched, applyActivePeriodToForm, activePeriod?.id]);

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
      const clamped = nextEnd < selectedDate ? selectedDate : nextEnd;
      setSelectedEndDate(clamped);
      setSelectedEndTime("");
    }
    clearEndCollapseTimer();
    endCollapseTimerRef.current = setTimeout(() => {
      setShowEndDatePicker(false);
      endCollapseTimerRef.current = null;
    }, 2000);
  };

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
    !isPending;

  const buildPayload = (): SaveMenstruationPayload | null => {
    const startPrayer = PRAYER_LABEL_TO_API[selectedStartTime];
    if (!startPrayer) return null;

    const startDate = toMenstruationApiDate(selectedDate);

    // Ending / correcting an open period.
    if (activePeriod) {
      if (isEndOngoing) {
        // Correct start only while still ongoing.
        return {
          id: activePeriod.id,
          startDate,
          startPrayer,
        };
      }
      const endPrayer = PRAYER_LABEL_TO_API[selectedEndTime];
      if (!endPrayer) return null;
      return {
        endDate: toMenstruationApiDate(selectedEndDate),
        endPrayer,
        // Harmless corrections applied while closing (v2 closes in place).
        startDate,
        startPrayer,
      };
    }

    // Nothing open — start ongoing or backfill a completed past period.
    if (isEndOngoing) {
      return { startDate, startPrayer };
    }
    const endPrayer = PRAYER_LABEL_TO_API[selectedEndTime];
    if (!endPrayer) return null;
    return {
      startDate,
      startPrayer,
      endDate: toMenstruationApiDate(selectedEndDate),
      endPrayer,
    };
  };

  const handleSave = async () => {
    const payload = buildPayload();
    if (!payload) return;

    try {
      await saveMenstruation(payload);
      await refetchActive();
      router.back();
    } catch (error) {
      const status = getMenstruationApiErrorStatus(error);
      const { data: refreshed } = await refetchActive();
      const refreshedActive = refreshed?.data ?? null;

      if (status === 409) {
        // Tried to start while something is open — sync UI to the open period.
        hasInitialized.current = true;
        if (refreshedActive) {
          setMenstruating(true);
          isMenstruating.value = true;
          setSelectedEndDate(ONGOING_DATE_VALUE);
          setSelectedEndTime("");
          const startYmd = apiDateToLocalYmd(refreshedActive.startDate);
          if (startYmd) setSelectedDate(clampDateToSelectable(startYmd));
          if (refreshedActive.startPrayer) {
            setSelectedStartTime(
              API_TO_PRAYER_LABEL[
                String(refreshedActive.startPrayer).toUpperCase()
              ] ?? "",
            );
          }
          showToast(
            "error",
            t("homeScreen.menstruationLog_endCurrentFirst"),
          );
        }
        return;
      }

      if (status === 404) {
        // End with nothing open — clear to a fresh start form.
        hasInitialized.current = true;
        resetBlankForm();
      }
    }
  };

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
              // Can't clear an open period by toggling off — must set an end date.
              if (activePeriod && isMenstruating.value) {
                showToast(
                  "error",
                  t("homeScreen.menstruationLog_endCurrentFirst"),
                );
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
              {START_TIME_OPTIONS.map((timeOption) => {
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
              {START_TIME_OPTIONS.map((timeOption) => {
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
          onPress={handleSave}
          disabled={!canSave}
          isLoading={isPending}
          style={{ marginTop: 56 }}
        />
      </ScrollView>
    </BlackScreenWrapper>
  );
}
