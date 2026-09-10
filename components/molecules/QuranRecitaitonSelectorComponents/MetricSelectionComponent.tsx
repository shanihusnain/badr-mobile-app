import { fonts } from "@/assets/fonts";
import { TopSpace } from "@/components/atoms/TopSpace";
import { Colors } from "@/constants/theme";
import { AntDesign } from "@expo/vector-icons";
import { Fragment, useState, useEffect, useRef, useCallback } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
  TextInput,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import type {
  QuranHizbOption,
  QuranJuzOption,
  QuranSurahOption,
} from "@/src/utils/quranGoalMap";
import {
  BinIcon,
  CheckBoxTickIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  TickIconWithGreenBg,
} from "@/assets/icons";
import WarningModal from "@/components/atoms/WarningModal";

const EMPTY_SURAHS: QuranSurahOption[] = [];
const EMPTY_HIZBS: QuranHizbOption[] = [];
const EMPTY_JUZS: QuranJuzOption[] = [];
/** Fixed height viewport so nested FlatList scrolls inside the bottom sheet. */
const METRIC_LIST_HEIGHT = Math.min(
  320,
  Math.round(Dimensions.get("window").height * 0.4),
);

export const MetricSelectionComponent = ({
  item,
  handleMetricPress,
  selectedMetric,
  onMetricChange,
  variant,
  surahOptions,
  hizbOptions,
  juzOptions,
  initialSelectedSurahs,
  initialSurahSettings,
  initialJuzRange,
  initialSelectedJuzs,
  initialSelectedHizbs,
  initialCompletion,
  isLoadingOptions,
  onDeleteSavedItem,
  isDeletingItem,
  onDirtyChange,
  discardNonce = 0,
  markCleanNonce = 0,
  onNestedScrollActiveChange,
  isSaved = false,
}: {
  item: {
    id: number;
    name: "surah" | "juz" | "completion" | "hizb";
    title: string;
  };
  handleMetricPress: () => void;
  selectedMetric: "surah" | "juz" | "completion" | "hizb" | undefined;
  onMetricChange?: (payload: { metric: string; value: any }) => void;
  variant?: "memorization" | "others";
  surahOptions?: QuranSurahOption[];
  hizbOptions?: QuranHizbOption[];
  juzOptions?: QuranJuzOption[];
  initialSelectedSurahs?: number[];
  initialSurahSettings?: Record<
    number,
    { frequency: "daily" | "weekly"; times: number }
  >;
  initialJuzRange?: { start: number; end: number } | null;
  initialSelectedJuzs?: number[];
  initialSelectedHizbs?: number[];
  initialCompletion?: number;
  isLoadingOptions?: boolean;
  /** Persist delete for an item already saved on the server. */
  onDeleteSavedItem?: (args: {
    itemType: "SURAH" | "JUZ" | "HIZB" | "COMPLETION";
    itemNumber: number;
  }) => Promise<void>;
  isDeletingItem?: boolean;
  onDirtyChange?: (dirty: boolean) => void;
  /** Increment to discard local edits and restore last saved/initial values. */
  discardNonce?: number;
  /** Increment after a successful save so current values become the clean baseline. */
  markCleanNonce?: number;
  onNestedScrollActiveChange?: (active: boolean) => void;
  /** True when this metric has been successfully saved (persists after collapsing). */
  isSaved?: boolean;
}) => {
  const { t } = useTranslation();
  const isMemorizationSurah =
    variant === "memorization" && item.name === "surah";
  const isMemorizationJuz = variant === "memorization" && item.name === "juz";
  const isMemorizationHizb = variant === "memorization" && item.name === "hizb";
  const isRecitationSurah = item.name === "surah" && !isMemorizationSurah;
  const isRecitationJuz = item.name === "juz" && !isMemorizationJuz;

  const isActiveMetric = selectedMetric === item.name;
  const [selectedSurahs, setSelectedSurahs] = useState<number[]>([]);
  const [selectedHizbs, setSelectedHizbs] = useState<number[]>([]);
  const [selectedJuzs, setSelectedJuzs] = useState<number[]>([]);
  const surahData = surahOptions ?? EMPTY_SURAHS;
  const hizbData = hizbOptions ?? EMPTY_HIZBS;
  const juzData = juzOptions ?? EMPTY_JUZS;
  const hydratedForTypeRef = useRef<string | null>(null);
  const onMetricChangeRef = useRef(onMetricChange);
  onMetricChangeRef.current = onMetricChange;
  const onDirtyChangeRef = useRef(onDirtyChange);
  onDirtyChangeRef.current = onDirtyChange;
  const cleanBaselineRef = useRef<string>("");
  const lastMetricPayloadRef = useRef<string>("");

  useEffect(() => {
    return () => {
      onNestedScrollActiveChange?.(false);
    };
  }, [onNestedScrollActiveChange]);

  useEffect(() => {
    if (!isActiveMetric) {
      onNestedScrollActiveChange?.(false);
      lastMetricPayloadRef.current = "";
    }
  }, [isActiveMetric, onNestedScrollActiveChange]);

  const buildDirtySnapshot = (
    surahs: number[],
    settings: Record<
      number,
      { frequency: "daily" | "weekly"; times: number | undefined }
    >,
    start: number,
    end: number,
    juzs: number[],
    hizbs: number[],
    completion: number,
  ) => {
    const sortedSurahs = [...surahs].sort((a, b) => a - b);
    const settingsSlice = Object.fromEntries(
      sortedSurahs.map((id) => [
        id,
        {
          frequency: settings[id]?.frequency ?? "daily",
          times: settings[id]?.times ?? 0,
        },
      ]),
    );
    return JSON.stringify({
      surahs: sortedSurahs,
      settings: isMemorizationSurah ? {} : settingsSlice,
      juz: isMemorizationJuz
        ? { selectedJuzs: [...juzs].sort((a, b) => a - b) }
        : { start, end },
      hizbs: [...hizbs].sort((a, b) => a - b),
      completion,
    });
  };

  const isSurahSavedOnBackend = (id: number) =>
    (initialSelectedSurahs ?? []).includes(id) &&
    !deletedSavedSurahIds.includes(id);

  const toggleSurah = (id: number) => {
    setSelectedSurahs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSurahPress = (id: number) => {
    const isChecked = selectedSurahs.includes(id);

    if (isChecked && item.name === "surah" && isSurahSavedOnBackend(id)) {
      openDeleteConfirm({ kind: "SURAH", itemNumber: id });
      return;
    }

    toggleSurah(id);
    if (!isChecked && !isMemorizationSurah) {
      ensureSetting(id);
    }
  };

  const toggleJuz = (id: number) => {
    setSelectedJuzs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const getSavedJuzIdsOnBackend = (): number[] => {
    if (initialSelectedJuzs?.length) return initialSelectedJuzs;
    const start = initialJuzRange?.start ?? 0;
    const end = initialJuzRange?.end ?? start;
    if (start <= 0 || end <= 0) return [];
    return Array.from(
      { length: Math.max(0, end - start + 1) },
      (_, i) => start + i,
    );
  };

  const handleJuzPress = (id: number) => {
    const isChecked = selectedJuzs.includes(id);
    const isSavedOnBackend =
      getSavedJuzIdsOnBackend().includes(id) &&
      !deletedSavedJuzIds.includes(id);

    if (isChecked && isMemorizationJuz && isSavedOnBackend) {
      openDeleteConfirm({ kind: "JUZ", itemNumber: id });
      return;
    }

    toggleJuz(id);
  };

  const [surahSettings, setSurahSettings] = useState<
    Record<number, { frequency: "daily" | "weekly"; times: number | undefined }>
  >({});
  const [juzStart, setJuzStart] = useState<number>(0);
  const [juzEnd, setJuzEnd] = useState<number>(0);
  const [juzEndText, setJuzEndText] = useState<string>("0");

  const resetRecitationJuzInputs = useCallback(() => {
    setJuzStart(0);
    setJuzEnd(0);
    setJuzEndText("0");
  }, []);
  const [focusedInputs, setFocusedInputs] = useState<Record<string, boolean>>(
    {},
  );
  const [quranCompletion, setQuranCompletion] = useState<number>(0);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<
    | { kind: "SURAH"; itemNumber: number }
    | { kind: "HIZB"; itemNumber: number }
    | { kind: "JUZ"; itemNumber?: number }
    | { kind: "COMPLETION" }
    | null
  >(null);
  /** Saved surahs removed via API this session (until detail refetches). */
  const [deletedSavedSurahIds, setDeletedSavedSurahIds] = useState<number[]>(
    [],
  );
  /** Saved hizbs removed via API this session (until detail refetches). */
  const [deletedSavedHizbIds, setDeletedSavedHizbIds] = useState<number[]>([]);
  /** Saved juzs removed via API this session (until detail refetches). */
  const [deletedSavedJuzIds, setDeletedSavedJuzIds] = useState<number[]>([]);
  const setInputFocused = (key: string, value: boolean) => {
    setFocusedInputs((prev) => ({ ...prev, [key]: value }));
  };

  // Hydrate from backend detail once per goal-type load
  useEffect(() => {
    if (!isActiveMetric || isLoadingOptions) return;

    const hydrateKey = [
      item.name,
      (initialSelectedSurahs ?? []).join(","),
      (initialSelectedHizbs ?? []).join(","),
      (initialSelectedJuzs ?? []).join(","),
      initialJuzRange?.start ?? "",
      initialJuzRange?.end ?? "",
      initialCompletion ?? "",
      surahData.length,
      hizbData.length,
      juzData.length,
    ].join("|");

    if (hydratedForTypeRef.current === hydrateKey) return;
    hydratedForTypeRef.current = hydrateKey;
    setDeletedSavedSurahIds([]);
    setDeletedSavedHizbIds([]);
    setDeletedSavedJuzIds([]);

    if (initialSelectedSurahs?.length) {
      setSelectedSurahs(initialSelectedSurahs);
    }
    if (initialSurahSettings && Object.keys(initialSurahSettings).length > 0) {
      setSurahSettings(initialSurahSettings);
    }
    if (initialJuzRange) {
      setJuzStart(initialJuzRange.start);
      setJuzEnd(initialJuzRange.end);
      setJuzEndText(String(initialJuzRange.end));
    } else if (isRecitationJuz) {
      resetRecitationJuzInputs();
    }
    if (initialSelectedJuzs?.length) {
      setSelectedJuzs(initialSelectedJuzs);
    } else if (initialJuzRange) {
      const fromRange: number[] = [];
      for (let n = initialJuzRange.start; n <= initialJuzRange.end; n += 1) {
        fromRange.push(n);
      }
      if (fromRange.length) setSelectedJuzs(fromRange);
    }
    if (initialSelectedHizbs?.length) {
      setSelectedHizbs(initialSelectedHizbs);
    }
    if (initialCompletion != null && initialCompletion > 0) {
      setQuranCompletion(initialCompletion);
    }

    const hydratedJuzs = initialSelectedJuzs?.length
      ? initialSelectedJuzs
      : initialJuzRange
        ? Array.from(
            {
              length: Math.max(
                0,
                initialJuzRange.end - initialJuzRange.start + 1,
              ),
            },
            (_, i) => initialJuzRange.start + i,
          )
        : [];

    cleanBaselineRef.current = buildDirtySnapshot(
      initialSelectedSurahs ?? [],
      initialSurahSettings ?? {},
      initialJuzRange?.start ?? 0,
      initialJuzRange?.end ?? 0,
      hydratedJuzs,
      initialSelectedHizbs ?? [],
      initialCompletion ?? 0,
    );
    onDirtyChangeRef.current?.(false);
  }, [
    isActiveMetric,
    isLoadingOptions,
    item.name,
    initialSelectedSurahs,
    initialSurahSettings,
    initialJuzRange,
    initialSelectedJuzs,
    initialSelectedHizbs,
    initialCompletion,
    surahData.length,
    hizbData.length,
    juzData.length,
  ]);

  // Reset hydrate marker when switching away from this metric
  useEffect(() => {
    if (!isActiveMetric) {
      hydratedForTypeRef.current = null;
      onDirtyChangeRef.current?.(false);
    }
  }, [isActiveMetric]);

  // Discard unsaved local edits → restore last saved/initial values
  useEffect(() => {
    if (discardNonce < 1) return;
    const nextSurahs = initialSelectedSurahs ?? [];
    const nextSettings = initialSurahSettings ?? {};
    const nextStart = initialJuzRange?.start ?? 0;
    const nextEnd = initialJuzRange?.end ?? 0;
    const nextJuzs = initialSelectedJuzs?.length
      ? initialSelectedJuzs
      : nextStart > 0 && nextEnd > 0
        ? Array.from(
            { length: Math.max(0, nextEnd - nextStart + 1) },
            (_, i) => nextStart + i,
          )
        : [];
    const nextHizbs = initialSelectedHizbs ?? [];
    const nextCompletion = initialCompletion ?? 0;

    setSelectedSurahs(nextSurahs);
    setSurahSettings(nextSettings);
    setJuzStart(nextStart);
    setJuzEnd(nextEnd);
    setJuzEndText(nextEnd > 0 ? String(nextEnd) : isRecitationJuz ? "0" : "");
    setSelectedJuzs(nextJuzs);
    setSelectedHizbs(nextHizbs);
    setQuranCompletion(nextCompletion);

    cleanBaselineRef.current = buildDirtySnapshot(
      nextSurahs,
      nextSettings,
      nextStart,
      nextEnd,
      nextJuzs,
      nextHizbs,
      nextCompletion,
    );
    onDirtyChangeRef.current?.(false);
  }, [discardNonce]);

  // After Save / upsert, treat current values as clean
  useEffect(() => {
    if (markCleanNonce < 1) return;
    cleanBaselineRef.current = buildDirtySnapshot(
      selectedSurahs,
      surahSettings,
      juzStart,
      juzEnd,
      selectedJuzs,
      selectedHizbs,
      quranCompletion,
    );
    onDirtyChangeRef.current?.(false);
  }, [markCleanNonce]);

  // Report dirty state while this metric is expanded
  useEffect(() => {
    if (!isActiveMetric) return;
    if (!cleanBaselineRef.current) return;
    const snapshot = buildDirtySnapshot(
      selectedSurahs,
      surahSettings,
      juzStart,
      juzEnd,
      selectedJuzs,
      selectedHizbs,
      quranCompletion,
    );
    onDirtyChangeRef.current?.(snapshot !== cleanBaselineRef.current);
  }, [
    isActiveMetric,
    selectedSurahs,
    surahSettings,
    juzStart,
    juzEnd,
    selectedJuzs,
    selectedHizbs,
    quranCompletion,
    isMemorizationSurah,
    isMemorizationJuz,
  ]);

  // Keep end >= start. Prefer bumping end up when start moves past it.
  useEffect(() => {
    if (juzStart > 0 && juzEnd > 0 && juzEnd < juzStart) {
      setJuzEnd(juzStart);
      setJuzEndText(String(juzStart));
    }
  }, [juzStart, juzEnd]);

  const ensureSetting = (id: number) => {
    setSurahSettings((prev) => {
      if (prev[id]) return prev;
      return { ...prev, [id]: { frequency: "daily", times: 0 } };
    });
  };

  const updateSurahSetting = (
    id: number,
    changes: Partial<{
      frequency: "daily" | "weekly";
      times: number | undefined;
    }>,
  ) => {
    setSurahSettings((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || { frequency: "daily", times: 0 }), ...changes },
    }));
  };

  const toggleHizb = (id: number) => {
    setSelectedHizbs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const isHizbSavedOnBackend = (id: number) =>
    (initialSelectedHizbs ?? []).includes(id) &&
    !deletedSavedHizbIds.includes(id);

  const handleHizbPress = (id: number) => {
    const isChecked = selectedHizbs.includes(id);

    if (isChecked && isMemorizationHizb && isHizbSavedOnBackend(id)) {
      openDeleteConfirm({ kind: "HIZB", itemNumber: id });
      return;
    }

    toggleHizb(id);
  };

  const deleteHizb = async (id: number) => {
    const wasSaved = isHizbSavedOnBackend(id);
    if (wasSaved && onDeleteSavedItem) {
      try {
        await onDeleteSavedItem({ itemType: "HIZB", itemNumber: id });
      } catch {
        return;
      }
      setDeletedSavedHizbIds((prev) => [...prev, id]);
    }

    const nextHizbs = selectedHizbs.filter((x) => x !== id);
    setSelectedHizbs(nextHizbs);

    cleanBaselineRef.current = buildDirtySnapshot(
      selectedSurahs,
      surahSettings,
      juzStart,
      juzEnd,
      selectedJuzs,
      nextHizbs,
      quranCompletion,
    );
    onDirtyChangeRef.current?.(false);
  };

  const deleteJuz = async (id: number) => {
    const wasSaved =
      getSavedJuzIdsOnBackend().includes(id) &&
      !deletedSavedJuzIds.includes(id);
    if (wasSaved && onDeleteSavedItem) {
      try {
        await onDeleteSavedItem({ itemType: "JUZ", itemNumber: id });
      } catch {
        return;
      }
      setDeletedSavedJuzIds((prev) => [...prev, id]);
    }

    const nextJuzs = selectedJuzs.filter((x) => x !== id);
    setSelectedJuzs(nextJuzs);

    cleanBaselineRef.current = buildDirtySnapshot(
      selectedSurahs,
      surahSettings,
      juzStart,
      juzEnd,
      nextJuzs,
      selectedHizbs,
      quranCompletion,
    );
    onDirtyChangeRef.current?.(false);
  };

  const deleteSurah = async (id: number) => {
    const wasSaved = isSurahSavedOnBackend(id);
    if (wasSaved && onDeleteSavedItem) {
      try {
        await onDeleteSavedItem({ itemType: "SURAH", itemNumber: id });
      } catch {
        return;
      }
      setDeletedSavedSurahIds((prev) => [...prev, id]);
    }

    const nextSurahs = selectedSurahs.filter((x) => x !== id);
    const nextSettings = { ...surahSettings };
    delete nextSettings[id];

    setSelectedSurahs(nextSurahs);
    setSurahSettings(nextSettings);

    cleanBaselineRef.current = buildDirtySnapshot(
      nextSurahs,
      nextSettings,
      juzStart,
      juzEnd,
      selectedJuzs,
      selectedHizbs,
      quranCompletion,
    );
    onDirtyChangeRef.current?.(false);
  };

  const clearJuzSelection = async () => {
    if (isMemorizationJuz) {
      const saved = initialSelectedJuzs?.length
        ? initialSelectedJuzs
        : (() => {
            const start = initialJuzRange?.start ?? 0;
            const end = initialJuzRange?.end ?? start;
            if (start <= 0 || end <= 0) return [] as number[];
            return Array.from(
              { length: Math.max(0, end - start + 1) },
              (_, i) => start + i,
            );
          })();
      if (onDeleteSavedItem && saved.length > 0) {
        try {
          for (const n of saved) {
            await onDeleteSavedItem({ itemType: "JUZ", itemNumber: n });
          }
        } catch {
          return;
        }
      }
      setSelectedJuzs([]);
      return;
    }
    const savedStart = initialJuzRange?.start ?? 0;
    const savedEnd = initialJuzRange?.end ?? savedStart;
    if (onDeleteSavedItem && savedStart > 0 && savedEnd > 0) {
      try {
        for (let n = savedStart; n <= savedEnd; n += 1) {
          await onDeleteSavedItem({ itemType: "JUZ", itemNumber: n });
        }
      } catch {
        return;
      }
    }
    setJuzStart(0);
    setJuzEnd(0);
    setJuzEndText(isRecitationJuz ? "0" : "");
  };

  const clearCompletionSelection = async () => {
    if (onDeleteSavedItem && (initialCompletion ?? 0) > 0) {
      try {
        await onDeleteSavedItem({
          itemType: "COMPLETION",
          itemNumber: initialCompletion || quranCompletion || 1,
        });
      } catch {
        return;
      }
    }
    setQuranCompletion(0);
  };

  const openDeleteConfirm = (payload: NonNullable<typeof pendingDelete>) => {
    setPendingDelete(payload);
    setDeleteConfirmVisible(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmVisible(false);
    setPendingDelete(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    if (isDeletingItem) return;

    try {
      if (pendingDelete.kind === "SURAH") {
        await deleteSurah(pendingDelete.itemNumber);
      } else if (pendingDelete.kind === "HIZB") {
        await deleteHizb(pendingDelete.itemNumber);
      } else if (pendingDelete.kind === "JUZ") {
        if (pendingDelete.itemNumber != null) {
          await deleteJuz(pendingDelete.itemNumber);
        } else {
          await clearJuzSelection();
        }
      } else if (pendingDelete.kind === "COMPLETION") {
        await clearCompletionSelection();
      }
    } finally {
      closeDeleteConfirm();
    }
  };

  const clampJuzNumber = (n: number) => Math.min(Math.max(1, n), 30);

  /** True when `digits` can still grow into a value in [minEnd, 30] (e.g. "1" → "15"). */
  const canBePrefixOfValidEnd = (digits: string, minEnd: number) => {
    if (!digits) return true;
    const n = parseInt(digits, 10);
    if (Number.isNaN(n)) return false;
    if (n >= minEnd && n <= 30) return true;
    if (n > 30 || digits.length >= 2) return false;
    const lo = n * 10;
    const hi = Math.min(n * 10 + 9, 30);
    if (lo > 30) return false;
    return hi >= minEnd;
  };

  const enforceJuzStart = (raw: string) => {
    if (raw === "" || raw === "0") {
      setJuzStart(0);
      return;
    }
    const n = parseInt(raw.replace(/[^0-9]/g, ""), 10);
    if (Number.isNaN(n)) {
      setJuzStart(0);
      return;
    }
    let clamped = clampJuzNumber(n);
    if (juzEnd > 0 && clamped > juzEnd) clamped = juzEnd;
    setJuzStart(clamped);
  };

  const commitJuzEnd = (value: number) => {
    const clamped =
      juzStart > 0
        ? Math.max(clampJuzNumber(value), juzStart)
        : clampJuzNumber(value);
    setJuzEnd(clamped);
    setJuzEndText(String(clamped));
  };

  const enforceJuzEnd = () => {
    if (juzEndText === "" || juzEndText === "0") {
      setJuzEnd(0);
      setJuzEndText(isRecitationJuz ? "0" : "");
      return;
    }
    const n = parseInt(juzEndText, 10);
    if (Number.isNaN(n)) {
      setJuzEnd(0);
      setJuzEndText(isRecitationJuz ? "0" : "");
      return;
    }
    commitJuzEnd(n);
  };

  const handleJuzEndChange = (v: string) => {
    const digits = v.replace(/[^0-9]/g, "").slice(0, 2);
    if (digits === "") {
      setJuzEndText("");
      setJuzEnd(0);
      return;
    }

    const n = parseInt(digits, 10);
    if (Number.isNaN(n)) {
      setJuzEndText(isRecitationJuz ? "0" : "");
      setJuzEnd(0);
      return;
    }

    if (n === 0) {
      setJuzEndText("0");
      setJuzEnd(0);
      return;
    }

    if (n > 30) {
      commitJuzEnd(30);
      return;
    }

    // Block end < start, but allow drafts like "1" when start is 10 (so user can type "15")
    if (juzStart > 0 && n < juzStart) {
      if (canBePrefixOfValidEnd(digits, juzStart)) {
        setJuzEndText(digits);
        return;
      }
      commitJuzEnd(juzStart);
      return;
    }

    setJuzEndText(digits);
    setJuzEnd(n);
  };

  const displayJuzStart = juzStart > 0 ? juzStart : undefined;
  const displayJuzEnd = (() => {
    if (!focusedInputs["juz-end"]) {
      return juzEnd > 0 ? juzEnd : undefined;
    }
    if (juzEndText === "") return undefined;
    const parsed = parseInt(juzEndText, 10);
    if (Number.isNaN(parsed)) return undefined;
    let value = clampJuzNumber(parsed);
    if (juzStart > 0 && value < juzStart) {
      // Draft in progress — keep last committed end for totals/parent payload
      if (canBePrefixOfValidEnd(juzEndText, juzStart)) {
        return juzEnd > 0 ? juzEnd : undefined;
      }
      value = juzStart;
    }
    return value;
  })();

  // Notify parent only for the active metric (avoids update loops)
  useEffect(() => {
    if (!isActiveMetric || !onMetricChangeRef.current) return;

    let payload: { metric: string; value: any } | null = null;

    if (item.name === "surah") {
      const surahNames = Object.fromEntries(
        surahData.map((s) => [s.id, s.surahTitle || s.surahName]),
      );
      payload = {
        metric: "surah",
        value: isMemorizationSurah
          ? { selectedSurahs, surahNames }
          : { selectedSurahs, surahSettings, surahNames },
      };
    } else if (item.name === "juz") {
      if (isMemorizationJuz) {
        payload = {
          metric: "juz",
          value: { selectedJuzs },
        };
      } else {
        const start =
          displayJuzStart && displayJuzStart > 0
            ? displayJuzStart
            : displayJuzEnd && displayJuzEnd > 0
              ? 1
              : 0;
        const end = displayJuzEnd && displayJuzEnd > 0 ? displayJuzEnd : start;
        payload = {
          metric: "juz",
          value: { start, end },
        };
      }
    } else if (item.name === "completion") {
      payload = {
        metric: "completion",
        value: quranCompletion,
      };
    } else if (item.name === "hizb") {
      payload = {
        metric: "hizb",
        value: { selectedHizbs },
      };
    }

    if (!payload) return;
    const serialized = JSON.stringify(payload);
    if (lastMetricPayloadRef.current === serialized) return;
    lastMetricPayloadRef.current = serialized;
    onMetricChangeRef.current(payload);
  }, [
    isActiveMetric,
    item.name,
    isMemorizationSurah,
    isMemorizationJuz,
    selectedSurahs,
    surahSettings,
    displayJuzStart,
    displayJuzEnd,
    selectedJuzs,
    quranCompletion,
    selectedHizbs,
    surahData,
  ]);
  return (
    <Fragment key={item?.id}>
      <Pressable
        key={item.id}
        onPress={handleMetricPress}
        style={styles.metrixWrapper}
      >
        <Pressable
          onPress={handleMetricPress}
          style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
        >
          <Text style={styles.metrixName}>{item.title}</Text>
          {item.name === selectedMetric ? (
            <ChevronUpIcon />
          ) : isSaved ? (
            <ChevronDownIcon />
          ) : null}
        </Pressable>

        {isSaved ? (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: Colors.light.green,
              borderRadius: 30,
              height: 24,
              width: 24,
            }}
          >
            <TickIconWithGreenBg />
          </View>
        ) : (
          <AntDesign name="plus-circle" color={Colors.light.white} size={20} />
        )}
      </Pressable>
      <TopSpace top={20} />

      {selectedMetric === item.name && isLoadingOptions && (
        <View style={{ paddingVertical: 16, alignItems: "center" }}>
          <ActivityIndicator color={Colors.light.green} />
        </View>
      )}

      {item.name === "surah" &&
        selectedMetric === item.name &&
        !isLoadingOptions && (
          <View
            style={styles.metricOptionsList}
            onTouchStart={() => onNestedScrollActiveChange?.(true)}
            onTouchEnd={() => onNestedScrollActiveChange?.(false)}
            onTouchCancel={() => onNestedScrollActiveChange?.(false)}
          >
            <FlatList
              data={surahData}
              keyExtractor={(s) => s.id.toString()}
              style={styles.metricOptionsListInner}
              contentContainerStyle={styles.metricOptionsListContent}
              nestedScrollEnabled
              removeClippedSubviews={false}
              showsVerticalScrollIndicator
              keyboardShouldPersistTaps="handled"
              bounces
              ListEmptyComponent={
                <Text style={styles.emptyOptionsText}>No surahs available</Text>
              }
              renderItem={({ item: s }) => {
                const checked = selectedSurahs.includes(s.id);
                const setting = surahSettings[s.id] || {
                  frequency: "daily",
                  times: 0,
                };
                const isDaily = setting.frequency === "daily";
                const maxTimes = isDaily ? 5 : 6;
                const timesValue = setting.times ?? 0;
                const multiplier = isDaily ? 28 : 4;
                const total = (timesValue || 0) * multiplier;

                return (
                  <View style={styles.surahItemContainer}>
                    <Pressable
                      onPress={() => handleSurahPress(s.id)}
                      style={[styles.metrixWrapper]}
                    >
                      <View
                        style={[
                          styles.surahItemWrapper,
                          { flex: 1, alignItems: "flex-start" },
                        ]}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            {
                              opacity: checked ? 1 : 0.25,
                              backgroundColor: checked
                                ? Colors.light.green
                                : "transparent",
                              borderWidth: checked ? 0 : 1,
                              marginTop: 2,
                            },
                          ]}
                        >
                          {checked && <CheckBoxTickIcon />}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              color: Colors.light.white,
                              fontSize: 14,
                              fontFamily: fonts.primary.regular,
                              letterSpacing: 0.1,
                              lineHeight: 20,
                            }}
                          >
                            {s.surahTitle}
                          </Text>
                          {isMemorizationSurah && s.verses ? (
                            <Text style={styles.surahVerseCount}>
                              {s.verses}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      {checked && !isMemorizationSurah ? (
                        <View style={styles.surahTrailingIconSlot}>
                          <ChevronUpIcon />
                        </View>
                      ) : null}
                    </Pressable>

                    {checked && !isMemorizationSurah && (
                      <View style={styles.surahExpandedContent}>
                        <View style={styles.surahRadioRow}>
                          <View style={styles.surahRadioOption}>
                            <Pressable
                              onPress={() =>
                                updateSurahSetting(s.id, {
                                  frequency: "daily",
                                })
                              }
                              style={[
                                styles.radio,
                                isDaily ? styles.radioChecked : undefined,
                              ]}
                            >
                              {isDaily && <View style={styles.radioInner} />}
                            </Pressable>
                            <Text style={styles.radioLabel}>
                              {t(
                                "monthlyGoalPlanner.quranMetrics.daily",
                              ).replace(/^./, (c) => c.toLocaleUpperCase())}
                            </Text>
                          </View>

                          <View style={styles.surahRadioOption}>
                            <Pressable
                              onPress={() =>
                                updateSurahSetting(s.id, {
                                  frequency: "weekly",
                                })
                              }
                              style={[
                                styles.radio,
                                !isDaily ? styles.radioChecked : undefined,
                              ]}
                            >
                              {!isDaily && <View style={styles.radioInner} />}
                            </Pressable>
                            <Text style={styles.radioLabel}>
                              {t(
                                "monthlyGoalPlanner.quranMetrics.weekly",
                              ).replace(/^./, (c) => c.toLocaleUpperCase())}
                            </Text>
                          </View>
                        </View>

                        <TopSpace top={12} />
                        <View style={styles.surahEnterTimesRow}>
                          <View style={styles.surahTrailingIconSlot} />
                          <Text style={styles.surahEnterTimesLabel}>
                            {t(
                              "monthlyGoalPlanner.quranMetrics.enterUpToTimes",
                              {
                                max: maxTimes,
                                frequency: isDaily
                                  ? t("monthlyGoalPlanner.quranMetrics.daily")
                                  : t("monthlyGoalPlanner.quranMetrics.weekly"),
                              },
                            )}
                          </Text>

                          <View style={styles.surahTrailingIconSlot}>
                            <Pressable
                              onPress={() => {
                                openDeleteConfirm({
                                  kind: "SURAH",
                                  itemNumber: s.id,
                                });
                              }}
                              disabled={isDeletingItem}
                              style={{
                                opacity: isDeletingItem ? 0.5 : 1,
                              }}
                              hitSlop={8}
                            >
                              <BinIcon />
                            </Pressable>
                          </View>
                        </View>

                        <TopSpace top={8} />
                        <View style={styles.surahTimesInputRow}>
                          <TextInput
                            value={String(timesValue)}
                            onChangeText={(v) => {
                              const n = parseInt(v || "0", 10);
                              const clamped = Number.isNaN(n)
                                ? undefined
                                : Math.min(Math.max(0, n), maxTimes);
                              updateSurahSetting(s.id, { times: clamped });
                            }}
                            keyboardType="numeric"
                            onFocus={() =>
                              setInputFocused(`surah-${s.id}`, true)
                            }
                            onBlur={() =>
                              setInputFocused(`surah-${s.id}`, false)
                            }
                            textAlignVertical="center"
                            style={[
                              styles.timesInput,
                              timesValue > 0 && styles.timesInputFilled,
                            ]}
                            placeholder="0"
                            placeholderTextColor={Colors.light.white}
                          />
                          <Text style={styles.surahTimesFrequencyLabel}>
                            {t(
                              "monthlyGoalPlanner.quranMetrics.timesFrequency",
                              {
                                count: timesValue || 0,
                                frequency: isDaily
                                  ? t("monthlyGoalPlanner.quranMetrics.daily")
                                  : t("monthlyGoalPlanner.quranMetrics.weekly"),
                              },
                            )}
                          </Text>
                        </View>

                        <TopSpace top={12} />
                        <View style={styles.surahFormulaBlock}>
                          <Text style={[styles.surahFormulaPrimary]}>
                            ({" "}
                            {t(
                              "monthlyGoalPlanner.quranMetrics.recitationsCount",
                              { count: total },
                            )}
                            )*
                          </Text>
                          <TopSpace top={4} />
                          <Text style={styles.surahFormulaSecondary}>
                            *
                            {t(
                              "monthlyGoalPlanner.quranMetrics.recitationsFormula",
                              {
                                times: timesValue || 0,
                                period: isDaily
                                  ? t(
                                      "monthlyGoalPlanner.quranMetrics.formulaPeriodDays",
                                    )
                                  : t(
                                      "monthlyGoalPlanner.quranMetrics.formulaPeriodWeeks",
                                    ),
                                total,
                              },
                            )}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                );
              }}
            />
          </View>
        )}
      {item.name === "juz" &&
        selectedMetric === item.name &&
        !isLoadingOptions &&
        isMemorizationJuz && (
          <View
            style={styles.metricOptionsList}
            onTouchStart={() => onNestedScrollActiveChange?.(true)}
            onTouchEnd={() => onNestedScrollActiveChange?.(false)}
            onTouchCancel={() => onNestedScrollActiveChange?.(false)}
          >
            <FlatList
              data={juzData}
              keyExtractor={(juz) => juz.id.toString()}
              style={styles.metricOptionsListInner}
              contentContainerStyle={styles.metricOptionsListContent}
              nestedScrollEnabled
              removeClippedSubviews={false}
              showsVerticalScrollIndicator
              keyboardShouldPersistTaps="handled"
              bounces
              ListEmptyComponent={
                <Text style={styles.emptyOptionsText}>No juz available</Text>
              }
              renderItem={({ item: juz }) => {
                const checked = selectedJuzs.includes(juz.id);
                return (
                  <Pressable
                    onPress={() => handleJuzPress(juz.id)}
                    style={styles.surahItemContainer}
                  >
                    <View
                      style={[
                        styles.surahItemWrapper,
                        { flex: 1, alignItems: "flex-start" },
                      ]}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          {
                            opacity: checked ? 1 : 0.25,
                            backgroundColor: checked
                              ? Colors.light.green
                              : "transparent",
                            borderWidth: checked ? 0 : 1,
                            marginTop: 2,
                          },
                        ]}
                      >
                        {checked && <CheckBoxTickIcon />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: Colors.light.white,
                            fontSize: 14,
                            fontFamily: fonts.primary.regular,
                            letterSpacing: 0.1,
                            lineHeight: 20,
                          }}
                        >
                          {juz.juzName}
                        </Text>
                        {juz.verses || juz.totalAyahs ? (
                          <Text style={styles.surahVerseCount}>
                            {juz.verses ?? `(${juz.totalAyahs} verses)`}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  </Pressable>
                );
              }}
            />
          </View>
        )}
      {item.name === "juz" &&
        selectedMetric === item.name &&
        !isLoadingOptions &&
        !isMemorizationJuz && (
          <View style={{}}>
            <View
              style={{
                flexDirection: "row",
                // alignItems: "center",
                justifyContent: "space-between",
                paddingRight: 4,
                paddingTop: 10,
              }}
            >
              <Text
                style={{
                  flex: 1,
                  color: Colors.light.white,
                  fontFamily: fonts.primary.regular,
                  fontWeight: "400",
                  fontSize: 12,
                  opacity: 0.7,
                  lineHeight: 20,
                  letterSpacing: 0.1,
                }}
              >
                {t("monthlyGoalPlanner.quranMetrics.juzRangeHint")}
              </Text>
              <Pressable
                onPress={() => {
                  openDeleteConfirm({ kind: "JUZ" });
                }}
                disabled={isDeletingItem}
                style={{ opacity: isDeletingItem ? 0.5 : 1 }}
                hitSlop={8}
              >
                <BinIcon />
              </Pressable>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginTop: 12,
                alignSelf: "center",
              }}
            >
              <Text
                style={{
                  fontWeight: "400",
                  fontSize: 14,
                  fontFamily: fonts.primary.regular,
                  color: Colors.light.white,
                }}
              >
                {t("monthlyGoalPlanner.quranMetrics.fromJuz")}
              </Text>
              <TextInput
                value={String(juzStart)}
                onChangeText={(v) => {
                  if (v === "") {
                    setJuzStart(0);
                    return;
                  }
                  const digits = v.replace(/[^0-9]/g, "");
                  const n = parseInt(digits, 10);
                  if (Number.isNaN(n)) {
                    setJuzStart(0);
                    return;
                  }
                  if (n === 0) {
                    setJuzStart(0);
                    return;
                  }
                  let clamped = Math.min(Math.max(1, n), 30);
                  // Start juz must be lesser than or equal to end juz
                  if (juzEnd > 0 && clamped > juzEnd) clamped = juzEnd;
                  setJuzStart(clamped);
                }}
                keyboardType="numeric"
                maxLength={2}
                onFocus={() => setInputFocused("juz-start", true)}
                onBlur={() => {
                  setInputFocused("juz-start", false);
                  enforceJuzStart(String(juzStart));
                }}
                textAlignVertical="center"
                style={[
                  styles.juzRangeInput,
                  juzStart > 0 && styles.timesInputFilled,
                ]}
                placeholder="0"
                placeholderTextColor={Colors.light.white}
              />
              <Text
                style={{
                  fontWeight: "400",
                  fontSize: 14,
                  fontFamily: fonts.primary.regular,
                  color: Colors.light.white,
                }}
              >
                {t("monthlyGoalPlanner.quranMetrics.toJuz")}
              </Text>
              <TextInput
                value={
                  focusedInputs["juz-end"] ? juzEndText : juzEndText || "0"
                }
                onChangeText={handleJuzEndChange}
                keyboardType="numeric"
                maxLength={2}
                onFocus={() => setInputFocused("juz-end", true)}
                onBlur={() => {
                  setInputFocused("juz-end", false);
                  enforceJuzEnd();
                }}
                onEndEditing={() => enforceJuzEnd()}
                onSubmitEditing={() => enforceJuzEnd()}
                textAlignVertical="center"
                style={[
                  styles.juzRangeInput,
                  juzEnd > 0 && styles.timesInputFilled,
                ]}
                placeholder="0"
                placeholderTextColor={Colors.light.white}
              />
            </View>
            <TopSpace top={14} />
            <Text
              style={{
                color: Colors.light.white,
                alignSelf: "center",
                opacity: 0.8,
                fontFamily: fonts.primary.regular,
                fontSize: 12,
              }}
            >
              {(() => {
                if (
                  displayJuzStart === undefined ||
                  displayJuzEnd === undefined
                )
                  return t("monthlyGoalPlanner.quranMetrics.totalJuz", {
                    total: 0,
                  });
                const total = Math.max(0, displayJuzEnd - displayJuzStart + 1);
                return t("monthlyGoalPlanner.quranMetrics.totalJuz", { total });
              })()}
            </Text>
            <TopSpace top={16} />
          </View>
        )}

      {item.name === "completion" &&
        selectedMetric === item.name &&
        !isLoadingOptions && (
          <View style={{}}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                justifyContent: "space-between",
                marginTop: 10,
                marginRight: 5,
              }}
            >
              <Text
                style={{
                  flex: 1,
                  color: Colors.light.white,
                  fontFamily: fonts.primary.regular,
                  fontWeight: "400",
                  fontSize: 12,
                  opacity: 0.7,
                  lineHeight: 20,
                  letterSpacing: 0.1,
                }}
              >
                {t("monthlyGoalPlanner.quranMetrics.enterUpToCompletions")}
              </Text>
              <Pressable
                onPress={() => {
                  openDeleteConfirm({ kind: "COMPLETION" });
                }}
                disabled={isDeletingItem}
                style={{ opacity: isDeletingItem ? 0.5 : 1 }}
                hitSlop={8}
              >
                <BinIcon />
              </Pressable>
            </View>
            <TopSpace top={16} />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                alignSelf: "center",
              }}
            >
              <TextInput
                value={String(quranCompletion)}
                onChangeText={(v) => {
                  const n = parseInt(v || "0", 10);
                  const clamped = Number.isNaN(n)
                    ? 0
                    : Math.max(0, Math.min(28, n));
                  setQuranCompletion(clamped);
                }}
                keyboardType="numeric"
                onFocus={() => setInputFocused(`completion`, true)}
                onBlur={() => setInputFocused(`completion`, false)}
                textAlignVertical="center"
                style={[
                  styles.timesInput,
                  quranCompletion > 0 && styles.timesInputFilled,
                ]}
                placeholder="0"
                placeholderTextColor={Colors.light.white}
              />
              <Text
                style={{
                  fontWeight: "400",
                  fontSize: 14,
                  fontFamily: fonts.primary.regular,
                  color: Colors.light.white,
                  letterSpacing: 0.1,
                  lineHeight: 20,
                }}
              >
                {t("monthlyGoalPlanner.quranMetrics.fullCompletions")}
              </Text>
            </View>
            <TopSpace top={16} />
          </View>
        )}
      {item.name === "hizb" &&
        selectedMetric === item.name &&
        !isLoadingOptions && (
          <View
            style={styles.metricOptionsList}
            onTouchStart={() => onNestedScrollActiveChange?.(true)}
            onTouchEnd={() => onNestedScrollActiveChange?.(false)}
            onTouchCancel={() => onNestedScrollActiveChange?.(false)}
          >
            <FlatList
              data={hizbData}
              keyExtractor={(hizb) => hizb.id.toString()}
              style={styles.metricOptionsListInner}
              contentContainerStyle={styles.metricOptionsListContent}
              nestedScrollEnabled
              removeClippedSubviews={false}
              showsVerticalScrollIndicator
              keyboardShouldPersistTaps="handled"
              bounces
              ListEmptyComponent={
                <Text style={styles.emptyOptionsText}>No hizb available</Text>
              }
              renderItem={({ item: hizb }) => {
                const checked = selectedHizbs.includes(hizb.id);

                return (
                  <Pressable
                    onPress={() => handleHizbPress(hizb.id)}
                    style={styles.surahItemContainer}
                  >
                    <View
                      style={[
                        styles.surahItemWrapper,
                        { flex: 1, alignItems: "flex-start" },
                      ]}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          {
                            opacity: checked ? 1 : 0.25,
                            backgroundColor: checked
                              ? Colors.light.green
                              : "transparent",
                            borderWidth: checked ? 0 : 1,
                            marginTop: 2,
                          },
                        ]}
                      >
                        {checked && <CheckBoxTickIcon />}
                      </View>
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text
                          style={{
                            color: Colors.light.white,
                            fontSize: 14,
                            fontFamily: fonts.primary.regular,
                            fontWeight: "400",
                            lineHeight: 20,
                            letterSpacing: 0.1,
                          }}
                        >
                          {hizb.hizbName}
                        </Text>
                        {hizb.verses ? (
                          <Text style={styles.surahVerseCount}>
                            {hizb.verses}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  </Pressable>
                );
              }}
            />
          </View>
        )}

      <WarningModal
        visible={deleteConfirmVisible}
        title={
          pendingDelete?.kind === "SURAH" && isMemorizationSurah
            ? t("monthlyGoalPlanner.quranMetrics.deleteMemorizationSurahTitle")
            : pendingDelete?.kind === "SURAH" && isRecitationSurah
              ? t("monthlyGoalPlanner.quranMetrics.deleteRecitationSurahTitle")
              : pendingDelete?.kind === "HIZB" && isMemorizationHizb
                ? t(
                    "monthlyGoalPlanner.quranMetrics.deleteMemorizationHizbTitle",
                  )
                : pendingDelete?.kind === "JUZ" &&
                    isMemorizationJuz &&
                    pendingDelete.itemNumber != null
                  ? t(
                      "monthlyGoalPlanner.quranMetrics.deleteMemorizationJuzTitle",
                    )
                  : t("monthlyGoalPlanner.quranMetrics.deleteGoalTitle")
        }
        message={
          <>
            <Text
              style={{
                color: Colors.light.white,
                fontSize: 14,
                fontWeight: "400",
                fontFamily: fonts.primary.regular,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              {pendingDelete?.kind === "SURAH" && isMemorizationSurah
                ? t(
                    "monthlyGoalPlanner.quranMetrics.deleteMemorizationSurahMessage",
                    {
                      surahName:
                        surahData.find((s) => s.id === pendingDelete.itemNumber)
                          ?.surahTitle ?? "",
                    },
                  )
                : pendingDelete?.kind === "SURAH" && isRecitationSurah
                  ? t(
                      "monthlyGoalPlanner.quranMetrics.deleteRecitationSurahMessage",
                      {
                        surahName:
                          surahData.find(
                            (s) => s.id === pendingDelete.itemNumber,
                          )?.surahTitle ?? "",
                      },
                    )
                  : pendingDelete?.kind === "HIZB" && isMemorizationHizb
                    ? t(
                        "monthlyGoalPlanner.quranMetrics.deleteMemorizationHizbMessage",
                        {
                          hizbName:
                            hizbData.find(
                              (h) => h.id === pendingDelete.itemNumber,
                            )?.hizbName ?? "",
                        },
                      )
                    : pendingDelete?.kind === "JUZ" &&
                        isMemorizationJuz &&
                        pendingDelete.itemNumber != null
                      ? t(
                          "monthlyGoalPlanner.quranMetrics.deleteMemorizationJuzMessage",
                          {
                            juzName:
                              juzData.find(
                                (j) => j.id === pendingDelete.itemNumber,
                              )?.juzName ?? "",
                          },
                        )
                      : t("monthlyGoalPlanner.quranMetrics.deleteGoalMessage")}
            </Text>
          </>
        }
        primaryButtonText={t("monthlyGoalPlanner.quranMetrics.delete")}
        secondaryButtonText={t("monthlyGoalPlanner.quranMetrics.cancel")}
        primaryButtonVariant="white"
        primaryButtonSize="modal"
        primaryButtonStyle={{
          alignSelf: "center",
          borderColor: Colors.light.red,
        }}
        primaryButtonTextStyle={{
          color: Colors.light.red,
          fontWeight: "400",
          fontFamily: fonts.primary.regular,
        }}
        secondaryButtonTextStyle={{
          color: Colors.light.green,
        }}
        onPrimaryPress={confirmDelete}
        onSecondaryPress={closeDeleteConfirm}
        onBackdropPress={closeDeleteConfirm}
      />
    </Fragment>
  );
};
const styles = StyleSheet.create({
  checkbox: {
    height: 16,
    width: 16,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: Colors.light.white,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.25,
  },
  metrixName: {
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
    fontSize: 16,
    color: Colors.light.white,
    lineHeight: 22,
  },
  metrixWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    alignSelf: "stretch",
  },
  metricOptionsList: {
    height: METRIC_LIST_HEIGHT,
    width: "100%",
  },
  metricOptionsListInner: {
    height: METRIC_LIST_HEIGHT,
  },
  metricOptionsListContent: {
    paddingBottom: 8,
  },
  surahItemContainer: {
    paddingVertical: 6,
  },
  surahItemWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  surahExpandedContent: {
    paddingTop: 20,
    alignItems: "center",
    width: "100%",
  },
  surahRadioRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
  },
  surahRadioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  /** Shared right gutter for chevron-up and bin so they share one vertical column */
  surahTrailingIconSlot: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  surahEnterTimesRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    alignSelf: "stretch",
    marginBottom: 6,
    paddingLeft: 20,
  },
  surahEnterTimesLabel: {
    flex: 1,
    color: Colors.light.white,
    opacity: 0.6,
    textAlign: "center",
    fontSize: 12,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
  },
  surahTimesInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  surahTimesFrequencyLabel: {
    color: Colors.light.white,
    fontSize: 14,
    fontWeight: "400",
    fontFamily: fonts.primary.regular,
    opacity: 0.9,
  },
  surahFormulaBlock: {
    alignItems: "center",
  },
  surahFormulaPrimary: {
    color: Colors.light.white,
    fontSize: 12,
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
    opacity: 0.6,
    textAlign: "center",
    lineHeight: 16,
  },
  surahFormulaSecondary: {
    color: Colors.light.white,
    fontSize: 10,
    fontWeight: "400",
    fontFamily: fonts.primary.regular,
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 14,
  },
  surahVerseCount: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },
  radio: {
    height: 14,
    width: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: Colors.light.grey,
    alignItems: "center",
    justifyContent: "center",
  },
  radioChecked: {
    // borderColor: Colors.light.green,
  },
  radioInner: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.green,
  },
  radioLabel: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    opacity: 0.8,
    flexShrink: 0,
  },
  timesInput: {
    width: 40,
    paddingTop: 4,
    paddingRight: 6,
    paddingBottom: 4,
    paddingLeft: 6,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    borderWidth: 1,
    borderColor: Colors.light.white,
    backgroundColor: "transparent",
    borderRadius: 4,
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
    includeFontPadding: false,
  },
  /** Wider box so 1–30 juz numbers are fully visible */
  juzRangeInput: {
    width: 44,
    paddingTop: 4,
    paddingRight: 8,
    paddingBottom: 4,
    paddingLeft: 8,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    borderWidth: 1,
    borderColor: Colors.light.white,
    backgroundColor: "transparent",
    borderRadius: 4,
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
    includeFontPadding: false,
  },
  timesInputFilled: {
    borderColor: Colors.light.green,
    backgroundColor: Colors.light.green,
  },
  emptyOptionsText: {
    color: Colors.light.white,
    opacity: 0.7,
    fontFamily: fonts.primary.regular,
    fontSize: 12,
    textAlign: "center",
    paddingVertical: 8,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "transparent",
  },
});
