import { useCallback, useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  buildDateRange,
  getMonthDateKeys,
  getMonthStartDateKey,
  getMonthName,
  getWeekdayShort,
  isYesterday,
  parseDateKey,
  startOfDay,
  toDateKey,
} from "./journalFillingDateUtils";
import {
  createJournal,
  getDismissDialogHidden,
  getJournalByDate,
  getJournalCompletionByDates,
  setDismissDialogHidden,
  updateJournal,
} from "./journalFillingRepository";
import {
  fetchJournalFillingSections,
  getAllJournalQuestionIds,
  type JournalFillingSection,
} from "./journalFillingQuestions";
import type {
  JournalAnswerValue,
  JournalDateCapsule,
  JournalDraftState,
  JournalEntry,
} from "./types";

type UseJournalFillingPropsOptions = {
  initialDateKey?: string;
  userName?: string;
};

function buildEmptyAnswers(): Record<string, JournalAnswerValue> {
  const answers: Record<string, JournalAnswerValue> = {};
  getAllJournalQuestionIds().forEach((id) => {
    answers[id] = null;
  });
  return answers;
}

function entryToDraft(entry: JournalEntry | null): JournalDraftState {
  const answers = buildEmptyAnswers();

  entry?.answers.forEach((item) => {
    answers[item.questionId] = item.answer;
  });

  return {
    answers,
    notes: entry?.notes ?? "",
  };
}

function draftToAnswersArray(
  answers: Record<string, JournalAnswerValue>,
): { questionId: string; answer: JournalAnswerValue }[] {
  return Object.entries(answers)
    .filter(([, answer]) => answer !== null)
    .map(([questionId, answer]) => ({
      questionId,
      answer,
    }));
}

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

export function useJournalFillingProps({
  initialDateKey,
  userName = "Mariam",
}: UseJournalFillingPropsOptions = {}) {
  const { t } = useTranslation();
  const today = useMemo(() => startOfDay(new Date()), []);

  const [sections, setSections] = useState<JournalFillingSection[]>([]);
  const [selectedDateKey, setSelectedDateKey] = useState(
    initialDateKey ?? toDateKey(today),
  );
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarMonthDateKey, setCalendarMonthDateKey] = useState(() =>
    getMonthStartDateKey(initialDateKey ?? toDateKey(today)),
  );
  const [calendarCompletionMap, setCalendarCompletionMap] = useState<
    Record<string, boolean>
  >({});
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [draft, setDraft] = useState<JournalDraftState>({
    answers: buildEmptyAnswers(),
    notes: "",
  });
  const [savedDraft, setSavedDraft] = useState<JournalDraftState>({
    answers: buildEmptyAnswers(),
    notes: "",
  });
  const [existingEntry, setExistingEntry] = useState<JournalEntry | null>(null);
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

  const dateCapsules = useMemo<JournalDateCapsule[]>(() => {
    const centerDate = parseDateKey(selectedDateKey);
    const range = buildDateRange(centerDate, 14, 14);

    return range.map((date) => {
      const dateKey = toDateKey(date);
      return {
        date: dateKey,
        weekdayLabel: getWeekdayShort(date),
        dayOfMonth: date.getDate(),
        isSelected: dateKey === selectedDateKey,
        isToday: dateKey === toDateKey(today),
        isCompleted: Boolean(completionMap[dateKey]),
      };
    });
  }, [completionMap, selectedDateKey, today]);

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

  const refreshCompletion = useCallback(async (centerDateKey: string) => {
    const centerDate = parseDateKey(centerDateKey);
    const range = buildDateRange(centerDate, 14, 14);
    const dateKeys = range.map(toDateKey);
    const completion = await getJournalCompletionByDates(dateKeys);
    setCompletionMap(completion);
  }, []);

  const loadCalendarCompletion = useCallback(
    async (monthAnyDateKey: string) => {
      const monthKeys = getMonthDateKeys(monthAnyDateKey);
      setIsLoadingCalendar(true);
      const completion = await getJournalCompletionByDates(monthKeys);
      setCalendarCompletionMap(completion);
      setIsLoadingCalendar(false);
    },
    [],
  );

  const loadEntryForDate = useCallback(
    async (dateKey: string) => {
      setIsLoadingEntry(true);
      const entry = await getJournalByDate(dateKey);
      const nextDraft = entryToDraft(entry);
      setExistingEntry(entry);
      setDraft(nextDraft);
      setSavedDraft(nextDraft);
      await refreshCompletion(dateKey);
      setIsLoadingEntry(false);
    },
    [refreshCompletion],
  );

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const [nextSections, dismissHidden] = await Promise.all([
        fetchJournalFillingSections(),
        getDismissDialogHidden(),
      ]);

      if (!mounted) return;

      setSections(nextSections);
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
    void loadCalendarCompletion(monthStartKey);
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
      void loadCalendarCompletion(nextMonthKey);
    },
    [calendarMonthDateKey, loadCalendarCompletion],
  );

  const handleSelectDate = useCallback(
    (dateKey: string) => {
      if (dateKey === selectedDateKey) return;

      if (hasChanges && !hideDiscardDialogPreference) {
        setPendingDateKey(dateKey);
        setPendingNavigationAction("date");
        setShowDiscardDialog(true);
        return;
      }

      void applyDateChange(dateKey);
    },
    [applyDateChange, hasChanges, hideDiscardDialogPreference, selectedDateKey],
  );

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

    const payload = {
      date: selectedDateKey,
      notes: draft.notes.trim(),
      answers: draftToAnswersArray(draft.answers),
    };

    try {
      const savedEntry = existingEntry
        ? await updateJournal({
            ...payload,
            updatedAt: existingEntry.updatedAt,
          })
        : await createJournal(payload);

      const nextDraft = entryToDraft(savedEntry);
      setExistingEntry(savedEntry);
      setDraft(nextDraft);
      setSavedDraft(nextDraft);
      await refreshCompletion(selectedDateKey);
      setShowSuccessToast(true);

      setTimeout(() => {
        router.back();
      }, 900);
    } finally {
      setIsSaving(false);
    }
  }, [
    draft,
    existingEntry,
    hasChanges,
    isSaving,
    refreshCompletion,
    selectedDateKey,
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
    showEdit: Boolean(existingEntry),
    showDiscardDialog,
    dontShowDiscardAgain,
    showSuccessToast,
    handleSelectDate,
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
