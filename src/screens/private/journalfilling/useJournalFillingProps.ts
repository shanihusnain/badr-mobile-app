import { useCallback, useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import {
  getJournalDay,
  journalDayQueryKey,
  type JournalDayData,
} from "@/src/api/queries/useGetJournalDay";
import { useUpdateJournalDay } from "@/src/api/mutations/useUpdateJournalDay";
import { useGetMe } from "@/src/api/queries/useGetMe";
import { useGetGoalCycleById } from "@/src/api/queries/useGetGoalCycleById";
import {
  addDays,
  buildDateKeysBetween,
  clampDateKeyToRange,
  getMonthStartDateKey,
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

export function useJournalFillingProps({
  initialDateKey,
  userName = "Mariam",
}: UseJournalFillingPropsOptions = {}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { mutateAsync: updateJournalDay } = useUpdateJournalDay();
  const today = useMemo(() => startOfDay(new Date()), []);
  const todayKey = toDateKey(today);

  const { data: meUser } = useGetMe();
  const goalCycleId = meUser?.goalCycleId ?? null;
  const { data: goalCycle } = useGetGoalCycleById(goalCycleId);
  const cycleStartDateKey = goalCycle?.startDate ?? null;
  const cycleEndDateKey = goalCycle?.endDate ?? null;

  const [sections, setSections] = useState<JournalFillingSection[]>([]);
  const [selectedDateKey, setSelectedDateKey] = useState(
    initialDateKey ?? todayKey,
  );
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarMonthDateKey, setCalendarMonthDateKey] = useState(() =>
    getMonthStartDateKey(initialDateKey ?? toDateKey(today)),
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

  const applyDayData = useCallback((dateKey: string, data: JournalDayData) => {
    const nextDraft = mapJournalDayToDraft(data);
    setSections(mapJournalDayToSections(data));
    setDraft(nextDraft);
    setSavedDraft(nextDraft);
    setHasSavedEntry(Boolean(data.lastSavedAt) || data.answeredCount > 0);
    setCompletionMap((previous) => ({
      ...previous,
      [dateKey]: data.isComplete,
    }));
    setCalendarCompletionMap((previous) => ({
      ...previous,
      [dateKey]: data.isComplete,
    }));
  }, []);

  useEffect(() => {
    if (!cycleStartDateKey || !cycleEndDateKey) return;
    setSelectedDateKey((current) =>
      clampDateKeyToRange(current, cycleStartDateKey, cycleEndDateKey),
    );
  }, [cycleStartDateKey, cycleEndDateKey]);

  const dateCapsules = useMemo<JournalDateCapsule[]>(() => {
    const dateKeys =
      cycleStartDateKey && cycleEndDateKey
        ? buildDateKeysBetween(cycleStartDateKey, cycleEndDateKey)
        : [selectedDateKey];

    return dateKeys.map((dateKey) => {
      const date = parseDateKey(dateKey);
      return {
        date: dateKey,
        weekdayLabel: getWeekdayShort(date),
        dayOfMonth: date.getDate(),
        isSelected: dateKey === selectedDateKey,
        isToday: dateKey === todayKey,
        isCompleted: Boolean(completionMap[dateKey]),
      };
    });
  }, [
    completionMap,
    cycleEndDateKey,
    cycleStartDateKey,
    selectedDateKey,
    todayKey,
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

  const loadCalendarCompletion = useCallback((_monthAnyDateKey: string) => {
    // No range completion API yet — dots come from days already loaded/saved.
    setIsLoadingCalendar(false);
  }, []);

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
    const monthStartKey = getMonthStartDateKey(selectedDateKey);
    setCalendarMonthDateKey(monthStartKey);
    setCalendarVisible(true);
    loadCalendarCompletion(monthStartKey);
  }, [loadCalendarCompletion, selectedDateKey]);

  const closeCalendar = useCallback(() => {
    setCalendarVisible(false);
  }, []);

  const shiftCalendarMonth = useCallback(
    (deltaMonths: number) => {
      const d = parseDateKey(calendarMonthDateKey);
      const next = new Date(d.getFullYear(), d.getMonth() + deltaMonths, 1);
      const nextMonthKey = toDateKey(next);
      setCalendarMonthDateKey(nextMonthKey);
      loadCalendarCompletion(nextMonthKey);
    },
    [calendarMonthDateKey, loadCalendarCompletion],
  );

  const handleSelectDate = useCallback(
    (dateKey: string) => {
      const nextDateKey =
        cycleStartDateKey && cycleEndDateKey
          ? clampDateKeyToRange(dateKey, cycleStartDateKey, cycleEndDateKey)
          : dateKey;

      if (nextDateKey === selectedDateKey) return;

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
      cycleEndDateKey,
      cycleStartDateKey,
      hasChanges,
      hideDiscardDialogPreference,
      selectedDateKey,
    ],
  );

  const handlePreviousDay = useCallback(() => {
    handleSelectDate(toDateKey(addDays(parseDateKey(selectedDateKey), -1)));
  }, [handleSelectDate, selectedDateKey]);

  const handleNextDay = useCallback(() => {
    handleSelectDate(toDateKey(addDays(parseDateKey(selectedDateKey), 1)));
  }, [handleSelectDate, selectedDateKey]);

  const handleCalendarDayPress = useCallback(
    (dateKey: string) => {
      closeCalendar();
      handleSelectDate(dateKey);
    },
    [closeCalendar, handleSelectDate],
  );

  const handleAnswerChange = useCallback(
    (questionId: string, answer: JournalAnswerValue) => {
      setDraft((current) => ({
        ...current,
        answers: {
          ...current.answers,
          [questionId]: answer,
        },
      }));
    },
    [],
  );

  const handleNotesChange = useCallback((notes: string) => {
    setDraft((current) => ({ ...current, notes }));
  }, []);

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
      router.back();
      return;
    }

    if (nextDate) {
      applyDateChange(nextDate);
    }
  }, [
    applyDateChange,
    dontShowDiscardAgain,
    pendingDateKey,
    pendingNavigationAction,
  ]);

  const handleSave = useCallback(async () => {
    if (!hasChanges || isSaving) return;

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

      setShowSuccessToast(true);

      setTimeout(() => {
        router.back();
      }, 900);
    } catch (error) {
      console.error("Error saving journal day:", error);
    } finally {
      setIsSaving(false);
    }
  }, [
    applyDayData,
    draft,
    hasChanges,
    isSaving,
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

    router.back();
  }, [hasChanges, hideDiscardDialogPreference]);

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
    isLoadingEntry,
    isSaving,
    calendarVisible,
    calendarMonthDateKey,
    calendarCompletionMap,
    isLoadingCalendar,
    openCalendar,
    closeCalendar,
    shiftCalendarMonth,
    handleCalendarDayPress,
    showEdit: hasSavedEntry,
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
