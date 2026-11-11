import { useCallback, useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import {
  getJournalDay,
  journalDayQueryKey,
  type JournalDayData,
  type JournalDayDayItem,
} from "@/src/api/queries/useGetJournalDay";
import {
  getJournalCalendar,
  JOURNAL_CALENDAR_QUERY_KEY,
  journalCalendarQueryKey,
} from "@/src/api/queries/useGetJournalCalendar";
import { useUpdateJournalDay } from "@/src/api/mutations/useUpdateJournalDay";
import {
  addDays,
  getMonthName,
  getWeekdayShort,
  isYesterday,
  parseDateKey,
  startOfDay,
  toDateKey,
} from "./journalFillingDateUtils";
import {
  getDismissDialogHidden,
  setDismissDialogHidden,
} from "./journalFillingRepository";
import type { JournalFillingSection } from "./journalFillingQuestions";
import {
  draftToJournalDayEntries,
  mapJournalDayToDraft,
  mapJournalDayToSections,
} from "./journalDayMappers";
import type {
  JournalAnswerValue,
  JournalDateCapsule,
  JournalDraftState,
} from "./types";

type UseJournalFillingPropsOptions = {
  initialDateKey?: string;
  userName?: string;
  /** When set (e.g. home bottom sheet), used instead of `router.back()`. */
  onRequestClose?: () => void;
};

function areDraftsEqual(
  left: JournalDraftState,
  right: JournalDraftState,
): boolean {
  if (left.notes.trim() !== right.notes.trim()) return false;

  const keys = new Set([
    ...Object.keys(left.answers),
    ...Object.keys(right.answers),
  ]);

  for (const key of keys) {
    if ((left.answers[key] ?? null) !== (right.answers[key] ?? null)) {
      return false;
    }
  }

  return true;
}

function emptyDraft(): JournalDraftState {
  return { answers: {}, notes: "" };
}

function normalizeDayItems(
  days: JournalDayDayItem[] | null | undefined,
): JournalDayDayItem[] {
  if (!Array.isArray(days)) return [];
  return days
    .filter((day) => typeof day?.date === "string" && day.date.trim())
    .map((day) => ({
      date: day.date.trim().slice(0, 10),
      isYesterday: Boolean(day.isYesterday),
      answeredCount:
        typeof day.answeredCount === "number" ? day.answeredCount : 0,
      isComplete: Boolean(day.isComplete),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function useJournalFillingProps({
  initialDateKey,
  userName = "Mariam",
  onRequestClose,
}: UseJournalFillingPropsOptions = {}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { mutateAsync: updateJournalDay } = useUpdateJournalDay();
  const today = useMemo(() => startOfDay(new Date()), []);
  const todayKey = toDateKey(today);
  const yesterdayKey = toDateKey(addDays(today, -1));

  const [sections, setSections] = useState<JournalFillingSection[]>([]);
  // Opening "today" from home still logs yesterday — API remaps today → yesterday.
  const [selectedDateKey, setSelectedDateKey] = useState(() => {
    const key = initialDateKey?.trim().slice(0, 10);
    if (!key || key === todayKey) return yesterdayKey;
    return key;
  });
  const [availableDays, setAvailableDays] = useState<JournalDayDayItem[]>([]);
  const [journalStartDateKey, setJournalStartDateKey] = useState<string | null>(
    null,
  );
  const [canLog, setCanLog] = useState(true);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarWindowStartKey, setCalendarWindowStartKey] = useState(
    () => initialDateKey?.trim().slice(0, 10) || yesterdayKey,
  );
  const [calendarCompletionMap, setCalendarCompletionMap] = useState<
    Record<string, boolean>
  >({});
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [draft, setDraft] = useState<JournalDraftState>(emptyDraft);
  const [savedDraft, setSavedDraft] = useState<JournalDraftState>(emptyDraft);
  const [hasSavedEntry, setHasSavedEntry] = useState(false);
  const [completionMap, setCompletionMap] = useState<Record<string, boolean>>(
    {},
  );
  const [isLoadingEntry, setIsLoadingEntry] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [pendingDateKey, setPendingDateKey] = useState<string | null>(null);
  const [pendingNavigationAction, setPendingNavigationAction] = useState<
    "date" | "back" | null
  >(null);
  const [dontShowDiscardAgain, setDontShowDiscardAgain] = useState(false);
  const [hideDiscardDialogPreference, setHideDiscardDialogPreference] =
    useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const availableDateKeys = useMemo(
    () => availableDays.map((day) => day.date),
    [availableDays],
  );

  const availableDateKeySet = useMemo(
    () => new Set(availableDateKeys),
    [availableDateKeys],
  );

  const resolveCycleStartKey = useCallback(
    (data?: JournalDayData | null, dayItems?: JournalDayDayItem[]) => {
      const fromApi = data?.startDate?.trim().slice(0, 10);
      if (fromApi) return fromApi;
      if (dayItems && dayItems.length > 0) return dayItems[0].date;
      if (availableDays.length > 0) return availableDays[0].date;
      if (journalStartDateKey) return journalStartDateKey;
      return selectedDateKey;
    },
    [availableDays, journalStartDateKey, selectedDateKey],
  );

  const calendarWindowEndKey = useMemo(
    () => toDateKey(addDays(parseDateKey(calendarWindowStartKey), 27)),
    [calendarWindowStartKey],
  );

  const applyDayData = useCallback((dateKey: string, data: JournalDayData) => {
    const apiDate = data.date?.trim().slice(0, 10) || dateKey;
    const nextDraft = mapJournalDayToDraft(data);
    const dayItems = normalizeDayItems(data.days);
    setSections(mapJournalDayToSections(data));
    setDraft(nextDraft);
    setSavedDraft(nextDraft);
    setHasSavedEntry(Boolean(data.lastSavedAt) || data.answeredCount > 0);
    setCanLog(data.canLog !== false);

    const cycleStart =
      data.startDate?.trim().slice(0, 10) ||
      (dayItems.length > 0 ? dayItems[0].date : null);
    if (cycleStart) {
      setJournalStartDateKey(cycleStart);
    }

    const isDayFilled = (day: JournalDayDayItem) =>
      day.isComplete || day.answeredCount > 0;
    const currentDayFilled =
      data.isComplete || data.answeredCount > 0;

    if (dayItems.length > 0) {
      setAvailableDays(dayItems);
      setCompletionMap((previous) => {
        const next = { ...previous };
        for (const day of dayItems) {
          next[day.date] = day.isComplete;
        }
        next[apiDate] = data.isComplete;
        return next;
      });
      // Calendar green dots: any journal day that has been filled from API days[].
      setCalendarCompletionMap((previous) => {
        const next = { ...previous };
        for (const day of dayItems) {
          next[day.date] = isDayFilled(day);
        }
        next[apiDate] = currentDayFilled;
        return next;
      });
    } else {
      setCompletionMap((previous) => ({
        ...previous,
        [apiDate]: data.isComplete,
      }));
      setCalendarCompletionMap((previous) => ({
        ...previous,
        [apiDate]: currentDayFilled,
      }));
    }

    // API may remap today → yesterday (data.date). Keep title/selection in sync with payload.
    if (apiDate !== dateKey) {
      setSelectedDateKey(apiDate);
    }
  }, []);

  const dateCapsules = useMemo<JournalDateCapsule[]>(() => {
    const sourceDays: JournalDayDayItem[] =
      availableDays.length > 0
        ? [...availableDays]
        : [
            {
              date: selectedDateKey,
              isYesterday: selectedDateKey === yesterdayKey,
              answeredCount: 0,
              isComplete: Boolean(completionMap[selectedDateKey]),
            },
          ];

    // Keep today's dashed border visible even when API days[] omits today.
    if (!sourceDays.some((day) => day.date === todayKey)) {
      sourceDays.push({
        date: todayKey,
        isYesterday: false,
        answeredCount: 0,
        isComplete: Boolean(completionMap[todayKey]),
      });
    }

    return sourceDays.map((day) => {
      const date = parseDateKey(day.date);
      return {
        date: day.date,
        weekdayLabel: getWeekdayShort(date),
        dayOfMonth: date.getDate(),
        isSelected: day.date === selectedDateKey,
        isToday: day.date === todayKey,
        isCompleted:
          completionMap[day.date] !== undefined
            ? Boolean(completionMap[day.date])
            : day.isComplete,
      };
    });
  }, [
    availableDays,
    completionMap,
    selectedDateKey,
    todayKey,
    yesterdayKey,
  ]);

  const screenTitle = useMemo(() => {
    const selectedDate = parseDateKey(selectedDateKey);

    if (isYesterday(selectedDate, today)) {
      return t("journalFilling.titleYesterday", { name: userName });
    }

    return t("journalFilling.titleOnDate", {
      weekday: getWeekdayShort(selectedDate),
      month: getMonthName(selectedDate),
      day: selectedDate.getDate(),
    });
  }, [selectedDateKey, t, today, userName]);

  const hasChanges = useMemo(
    () => !areDraftsEqual(draft, savedDraft),
    [draft, savedDraft],
  );

  const loadCalendarCompletion = useCallback(
    async (fromKey: string, toKey: string) => {
      setIsLoadingCalendar(true);
      try {
        const data = await queryClient.fetchQuery({
          queryKey: journalCalendarQueryKey(fromKey, toKey),
          queryFn: () => getJournalCalendar(fromKey, toKey),
        });

        setCalendarCompletionMap((previous) => {
          const next = { ...previous };
          for (const day of data?.days ?? []) {
            const date = day.date?.trim().slice(0, 10);
            if (!date) continue;
            next[date] =
              Boolean(day.isComplete) ||
              (typeof day.answeredCount === "number" && day.answeredCount > 0);
          }
          return next;
        });
      } catch (error) {
        console.error("Error loading journal calendar:", error);
      } finally {
        setIsLoadingCalendar(false);
      }
    },
    [queryClient],
  );

  const loadEntryForDate = useCallback(
    async (dateKey: string) => {
      setIsLoadingEntry(true);
      try {
        const data = await queryClient.fetchQuery({
          queryKey: journalDayQueryKey(dateKey),
          queryFn: () => getJournalDay(dateKey),
        });
        applyDayData(dateKey, data);
      } catch (error) {
        console.error("Error loading journal day:", error);
        setSections([]);
        setDraft(emptyDraft());
        setSavedDraft(emptyDraft());
        setHasSavedEntry(false);
        setCanLog(false);
      } finally {
        setIsLoadingEntry(false);
      }
    },
    [applyDayData, queryClient],
  );

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const dismissHidden = await getDismissDialogHidden();
      if (!mounted) return;
      setHideDiscardDialogPreference(dismissHidden);
    };

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    void loadEntryForDate(selectedDateKey);
  }, [loadEntryForDate, selectedDateKey]);

  const applyDateChange = useCallback((dateKey: string) => {
    setSelectedDateKey(dateKey);
  }, []);

  const openCalendar = useCallback(() => {
    const cycleStart = resolveCycleStartKey();
    // Snap the 28-day window so the selected date (or cycle start) is visible.
    const selected = parseDateKey(selectedDateKey);
    const base = parseDateKey(cycleStart);
    const diffDays = Math.floor(
      (selected.getTime() - base.getTime()) / (24 * 60 * 60 * 1000),
    );
    const cycleIndex = diffDays >= 0 ? Math.floor(diffDays / 28) : 0;
    const windowStart = toDateKey(addDays(base, cycleIndex * 28));
    const windowEnd = toDateKey(addDays(parseDateKey(windowStart), 27));
    setCalendarWindowStartKey(windowStart);
    setCalendarVisible(true);
    void loadCalendarCompletion(windowStart, windowEnd);
  }, [loadCalendarCompletion, resolveCycleStartKey, selectedDateKey]);

  const closeCalendar = useCallback(() => {
    setCalendarVisible(false);
  }, []);

  const shiftCalendarWindow = useCallback(
    (deltaCycles: number) => {
      const nextStart = toDateKey(
        addDays(parseDateKey(calendarWindowStartKey), deltaCycles * 28),
      );
      const nextEnd = toDateKey(addDays(parseDateKey(nextStart), 27));
      setCalendarWindowStartKey(nextStart);
      void loadCalendarCompletion(nextStart, nextEnd);
    },
    [calendarWindowStartKey, loadCalendarCompletion],
  );

  const resolveSelectableDateKey = useCallback(
    (dateKey: string): string | null => {
      const normalized = dateKey.trim().slice(0, 10);
      if (!normalized) return null;
      if (availableDateKeySet.size === 0) return normalized;
      if (!availableDateKeySet.has(normalized)) return null;
      return normalized;
    },
    [availableDateKeySet],
  );

  const handleSelectDate = useCallback(
    (dateKey: string) => {
      const nextDateKey = resolveSelectableDateKey(dateKey);
      if (!nextDateKey || nextDateKey === selectedDateKey) return;

      if (hasChanges && !hideDiscardDialogPreference) {
        setPendingDateKey(nextDateKey);
        setPendingNavigationAction("date");
        setShowDiscardDialog(true);
        return;
      }

      void applyDateChange(nextDateKey);
    },
    [
      applyDateChange,
      hasChanges,
      hideDiscardDialogPreference,
      resolveSelectableDateKey,
      selectedDateKey,
    ],
  );

  const handlePreviousDay = useCallback(() => {
    if (availableDateKeys.length === 0) {
      handleSelectDate(toDateKey(addDays(parseDateKey(selectedDateKey), -1)));
      return;
    }
    const index = availableDateKeys.indexOf(selectedDateKey);
    if (index <= 0) return;
    handleSelectDate(availableDateKeys[index - 1]);
  }, [availableDateKeys, handleSelectDate, selectedDateKey]);

  const handleNextDay = useCallback(() => {
    if (availableDateKeys.length === 0) {
      handleSelectDate(toDateKey(addDays(parseDateKey(selectedDateKey), 1)));
      return;
    }
    const index = availableDateKeys.indexOf(selectedDateKey);
    if (index < 0 || index >= availableDateKeys.length - 1) return;
    handleSelectDate(availableDateKeys[index + 1]);
  }, [availableDateKeys, handleSelectDate, selectedDateKey]);

  const handleCalendarDayPress = useCallback(
    (dateKey: string) => {
      if (!resolveSelectableDateKey(dateKey)) return;
      closeCalendar();
      handleSelectDate(dateKey);
    },
    [closeCalendar, handleSelectDate, resolveSelectableDateKey],
  );

  const handleAnswerChange = useCallback(
    (questionId: string, answer: JournalAnswerValue) => {
      if (!canLog) return;
      setDraft((current) => ({
        ...current,
        answers: {
          ...current.answers,
          [questionId]: answer,
        },
      }));
    },
    [canLog],
  );

  const handleNotesChange = useCallback(
    (notes: string) => {
      if (!canLog) return;
      setDraft((current) => ({ ...current, notes }));
    },
    [canLog],
  );

  const handleToggleDontShowAgain = useCallback(() => {
    setDontShowDiscardAgain((current) => !current);
  }, []);

  const handleCompleteJournal = useCallback(() => {
    setShowDiscardDialog(false);
    setPendingDateKey(null);
    setPendingNavigationAction(null);
    setDontShowDiscardAgain(false);
  }, []);

  const handleDismissJournal = useCallback(async () => {
    if (dontShowDiscardAgain) {
      await setDismissDialogHidden(true);
      setHideDiscardDialogPreference(true);
    }

    const nextDate = pendingDateKey;
    const navigationAction = pendingNavigationAction;
    setShowDiscardDialog(false);
    setPendingDateKey(null);
    setPendingNavigationAction(null);
    setDontShowDiscardAgain(false);

    if (navigationAction === "back") {
      if (onRequestClose) onRequestClose();
      else router.back();
      return;
    }

    if (nextDate) {
      applyDateChange(nextDate);
    }
  }, [
    applyDateChange,
    dontShowDiscardAgain,
    onRequestClose,
    pendingDateKey,
    pendingNavigationAction,
  ]);

  const handleSave = useCallback(async () => {
    if (!canLog || !hasChanges || isSaving) return;

    setIsSaving(true);

    try {
      const data = await updateJournalDay({
        date: selectedDateKey,
        entries: draftToJournalDayEntries(draft.answers),
        note: draft.notes.trim(),
      });

      if (data) {
        applyDayData(selectedDateKey, data);
      } else {
        const nextDraft: JournalDraftState = {
          answers: { ...draft.answers },
          notes: draft.notes.trim(),
        };
        setDraft(nextDraft);
        setSavedDraft(nextDraft);
        setHasSavedEntry(true);
      }

      await queryClient.invalidateQueries({
        queryKey: [JOURNAL_CALENDAR_QUERY_KEY],
      });

      setShowSuccessToast(true);

      setTimeout(() => {
        if (onRequestClose) onRequestClose();
        else router.back();
      }, 900);
    } catch (error) {
      console.error("Error saving journal day:", error);
    } finally {
      setIsSaving(false);
    }
  }, [
    applyDayData,
    canLog,
    draft,
    hasChanges,
    isSaving,
    onRequestClose,
    queryClient,
    selectedDateKey,
    updateJournalDay,
  ]);

  const handleBack = useCallback(() => {
    if (hasChanges && !hideDiscardDialogPreference) {
      setPendingDateKey(null);
      setPendingNavigationAction("back");
      setShowDiscardDialog(true);
      return;
    }

    if (onRequestClose) onRequestClose();
    else router.back();
  }, [hasChanges, hideDiscardDialogPreference, onRequestClose]);

  const handleInsightsPress = useCallback(() => {
    router.push("/(tabs)/(plan)");
  }, []);

  return {
    sections,
    dateCapsules,
    selectedDateKey,
    screenTitle,
    draft,
    hasChanges,
    canLog,
    isLoadingEntry,
    isSaving,
    calendarVisible,
    calendarWindowStartKey,
    calendarWindowEndKey,
    calendarCompletionMap,
    availableDateKeys,
    isLoadingCalendar,
    openCalendar,
    closeCalendar,
    shiftCalendarWindow,
    handleCalendarDayPress,
    showEdit: true,
    showDiscardDialog,
    dontShowDiscardAgain,
    showSuccessToast,
    handleSelectDate,
    handlePreviousDay,
    handleNextDay,
    handleAnswerChange,
    handleNotesChange,
    handleSave,
    handleBack,
    handleInsightsPress,
    handleToggleDontShowAgain,
    handleCompleteJournal,
    handleDismissJournal,
    notesPlaceholder: t("journalFilling.notesPlaceholder"),
    saveLabel: t("journalFilling.saveJournal"),
    discardDialogTitle: t("journalFilling.dismissDialogTitle"),
    discardDialogBody: t("journalFilling.dismissDialogBody"),
    discardDialogCheckbox: t("journalFilling.dismissDialogCheckbox"),
    discardDialogComplete: t("journalFilling.dismissDialogComplete"),
    discardDialogDismiss: t("journalFilling.dismissDialogDismiss"),
    successMessage: t("journalFilling.saveSuccess"),
  };
}
