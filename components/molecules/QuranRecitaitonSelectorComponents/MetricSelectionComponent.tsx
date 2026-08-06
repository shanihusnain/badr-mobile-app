import { fonts } from "@/assets/fonts";
import { TopSpace } from "@/components/atoms/TopSpace";
import { Colors } from "@/constants/theme";
import { AntDesign } from "@expo/vector-icons";
import { Fragment, useState, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  TextInput,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import type {
  QuranHizbOption,
  QuranSurahOption,
} from "@/src/utils/quranGoalMap";
import { BinIcon, TickIconWithGreenBg } from "@/assets/icons";
import WarningModal from "@/components/atoms/WarningModal";

const EMPTY_SURAHS: QuranSurahOption[] = [];
const EMPTY_HIZBS: QuranHizbOption[] = [];

export const MetricSelectionComponent = ({
  item,
  handleMetricPress,
  selectedMetric,
  onMetricChange,
  variant,
  surahOptions,
  hizbOptions,
  initialSelectedSurahs,
  initialSurahSettings,
  initialJuzRange,
  initialSelectedHizbs,
  initialCompletion,
  isLoadingOptions,
  onDeleteSavedItem,
  isDeletingItem,
  onDirtyChange,
  discardNonce = 0,
  markCleanNonce = 0,
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
  initialSelectedSurahs?: number[];
  initialSurahSettings?: Record<
    number,
    { frequency: "daily" | "weekly"; times: number }
  >;
  initialJuzRange?: { start: number; end: number } | null;
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
}) => {
  const { t } = useTranslation();
  const isMemorizationSurah =
    variant === "memorization" && item.name === "surah";

  const isActiveMetric = selectedMetric === item.name;
  const [selectedSurahs, setSelectedSurahs] = useState<number[]>([]);
  const [selectedHizbs, setSelectedHizbs] = useState<number[]>([]);
  const surahData = surahOptions ?? EMPTY_SURAHS;
  const hizbData = hizbOptions ?? EMPTY_HIZBS;
  const hydratedForTypeRef = useRef<string | null>(null);
  const onMetricChangeRef = useRef(onMetricChange);
  onMetricChangeRef.current = onMetricChange;
  const onDirtyChangeRef = useRef(onDirtyChange);
  onDirtyChangeRef.current = onDirtyChange;
  const cleanBaselineRef = useRef<string>("");

  const buildDirtySnapshot = (
    surahs: number[],
    settings: Record<
      number,
      { frequency: "daily" | "weekly"; times: number | undefined }
    >,
    start: number,
    end: number,
    hizbs: number[],
    completion: number,
  ) => {
    const sortedSurahs = [...surahs].sort((a, b) => a - b);
    const settingsSlice = Object.fromEntries(
      sortedSurahs.map((id) => [
        id,
        {
          frequency: settings[id]?.frequency ?? "daily",
          times: settings[id]?.times ?? 1,
        },
      ]),
    );
    return JSON.stringify({
      surahs: sortedSurahs,
      settings: isMemorizationSurah ? {} : settingsSlice,
      juz: { start, end },
      hizbs: [...hizbs].sort((a, b) => a - b),
      completion,
    });
  };

  const toggleSurah = (id: number) => {
    setSelectedSurahs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const [surahSettings, setSurahSettings] = useState<
    Record<number, { frequency: "daily" | "weekly"; times: number | undefined }>
  >({});
  const [juzStart, setJuzStart] = useState<number>(0);
  const [juzEnd, setJuzEnd] = useState<number>(0);
  const [juzEndText, setJuzEndText] = useState<string>("");
  const [focusedInputs, setFocusedInputs] = useState<Record<string, boolean>>(
    {},
  );
  const [quranCompletion, setQuranCompletion] = useState<number>(0);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<
    | { kind: "SURAH"; itemNumber: number }
    | { kind: "JUZ" }
    | { kind: "COMPLETION" }
    | null
  >(null);
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
      initialJuzRange?.start ?? "",
      initialJuzRange?.end ?? "",
      initialCompletion ?? "",
      surahData.length,
      hizbData.length,
    ].join("|");

    if (hydratedForTypeRef.current === hydrateKey) return;
    hydratedForTypeRef.current = hydrateKey;

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
    }
    if (initialSelectedHizbs?.length) {
      setSelectedHizbs(initialSelectedHizbs);
    }
    if (initialCompletion != null && initialCompletion > 0) {
      setQuranCompletion(initialCompletion);
    }

    cleanBaselineRef.current = buildDirtySnapshot(
      initialSelectedSurahs ?? [],
      initialSurahSettings ?? {},
      initialJuzRange?.start ?? 0,
      initialJuzRange?.end ?? 0,
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
    initialSelectedHizbs,
    initialCompletion,
    surahData.length,
    hizbData.length,
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
    const nextHizbs = initialSelectedHizbs ?? [];
    const nextCompletion = initialCompletion ?? 0;

    setSelectedSurahs(nextSurahs);
    setSurahSettings(nextSettings);
    setJuzStart(nextStart);
    setJuzEnd(nextEnd);
    setJuzEndText(nextEnd > 0 ? String(nextEnd) : "");
    setSelectedHizbs(nextHizbs);
    setQuranCompletion(nextCompletion);

    cleanBaselineRef.current = buildDirtySnapshot(
      nextSurahs,
      nextSettings,
      nextStart,
      nextEnd,
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
    selectedHizbs,
    quranCompletion,
    isMemorizationSurah,
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
      return { ...prev, [id]: { frequency: "daily", times: 1 } };
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
      [id]: { ...(prev[id] || { frequency: "daily", times: 1 }), ...changes },
    }));
  };

  const toggleHizb = (id: number) => {
    setSelectedHizbs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };
  const deleteSurah = async (id: number) => {
    const wasSaved = (initialSelectedSurahs ?? []).includes(id);
    if (wasSaved && onDeleteSavedItem) {
      try {
        await onDeleteSavedItem({ itemType: "SURAH", itemNumber: id });
      } catch {
        return;
      }
    }
    setSelectedSurahs((prev) => prev.filter((x) => x !== id));
    setSurahSettings((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const clearJuzSelection = async () => {
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
    setJuzEndText("");
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
      } else if (pendingDelete.kind === "JUZ") {
        await clearJuzSelection();
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
    if (raw === "") {
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
    if (juzEndText === "") {
      setJuzEnd(0);
      setJuzEndText("");
      return;
    }
    const n = parseInt(juzEndText, 10);
    if (Number.isNaN(n)) {
      setJuzEnd(0);
      setJuzEndText("");
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
      setJuzEndText("");
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

    if (item.name === "surah") {
      const surahNames = Object.fromEntries(
        surahData.map((s) => [s.id, s.surahTitle || s.surahName]),
      );
      onMetricChangeRef.current({
        metric: "surah",
        value: isMemorizationSurah
          ? { selectedSurahs, surahNames }
          : { selectedSurahs, surahSettings, surahNames },
      });
      return;
    }
    if (item.name === "juz") {
      const start =
        displayJuzStart && displayJuzStart > 0
          ? displayJuzStart
          : displayJuzEnd && displayJuzEnd > 0
            ? 1
            : 0;
      const end = displayJuzEnd && displayJuzEnd > 0 ? displayJuzEnd : start;
      onMetricChangeRef.current({
        metric: "juz",
        value: { start, end },
      });
      return;
    }
    if (item.name === "completion") {
      onMetricChangeRef.current({
        metric: "completion",
        value: quranCompletion,
      });
      return;
    }
    if (item.name === "hizb") {
      onMetricChangeRef.current({
        metric: "hizb",
        value: { selectedHizbs },
      });
    }
  }, [
    isActiveMetric,
    item.name,
    isMemorizationSurah,
    selectedSurahs,
    surahSettings,
    displayJuzStart,
    displayJuzEnd,
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
          {item.name === selectedMetric && (
            <MaterialCommunityIcons
              name="chevron-up"
              size={24}
              color={Colors.light.white}
            />
          )}
        </Pressable>

        {selectedMetric === item.name ? (
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
          <FlatList
            data={surahData}
            keyExtractor={(s) => s.id.toString()}
            ListEmptyComponent={
              <Text style={styles.emptyOptionsText}>No surahs available</Text>
            }
            renderItem={({ item: s }) => {
              const checked = selectedSurahs.includes(s.id);
              const setting = surahSettings[s.id] || {
                frequency: "daily",
                times: 1,
              };
              const isDaily = setting.frequency === "daily";
              const maxTimes = isDaily ? 5 : 6;
              const timesValue = setting.times ?? 0;
              const multiplier = isDaily ? 28 : 4;
              const total = (timesValue || 0) * multiplier;

              return (
                <View
                  style={{
                    paddingVertical: 8,
                    paddingRight: 20,
                  }}
                >
                  <Pressable
                    onPress={() => {
                      toggleSurah(s.id);
                      if (
                        !selectedSurahs.includes(s.id) &&
                        !isMemorizationSurah
                      ) {
                        ensureSetting(s.id);
                      }
                    }}
                    style={[styles.metrixWrapper]}
                  >
                    <View style={styles.surahItemWrapper}>
                      <View
                        style={[
                          styles.checkbox,
                          {
                            opacity: checked ? 1 : 0.25,
                          },
                        ]}
                      >
                        {checked && (
                          <FontAwesome
                            name="check"
                            size={14}
                            color={Colors.light.white}
                          />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: Colors.light.white,
                            fontSize: 14,
                            fontFamily: fonts.primary.regular,
                          }}
                        >
                          {s.surahTitle}
                        </Text>
                        {s.verses ? (
                          <Text style={styles.surahVerseCount}>{s.verses}</Text>
                        ) : null}
                      </View>
                    </View>
                    {checked && !isMemorizationSurah && (
                      <MaterialCommunityIcons
                        name="chevron-up"
                        size={24}
                        color={Colors.light.white}
                      />
                    )}
                  </Pressable>

                  {checked && !isMemorizationSurah && (
                    <View
                      style={{
                        // paddingHorizontal: 8,
                        paddingTop: 12,
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 12,
                          alignItems: "center",
                        }}
                      >
                        <Pressable
                          onPress={() =>
                            updateSurahSetting(s.id, { frequency: "daily" })
                          }
                          style={[
                            styles.radio,
                            isDaily ? styles.radioChecked : undefined,
                          ]}
                        >
                          {isDaily && <View style={styles.radioInner} />}
                        </Pressable>
                        <Text style={styles.radioLabel}>
                          {t("monthlyGoalPlanner.quranMetrics.daily")}
                        </Text>

                        <Pressable
                          onPress={() =>
                            updateSurahSetting(s.id, { frequency: "weekly" })
                          }
                          style={[
                            styles.radio,
                            !isDaily ? styles.radioChecked : undefined,
                          ]}
                        >
                          {!isDaily && <View style={styles.radioInner} />}
                        </Pressable>
                        <Text style={styles.radioLabel}>
                          {t("monthlyGoalPlanner.quranMetrics.weekly")}
                        </Text>
                      </View>

                      <TopSpace top={12} />
                      <View
                        style={{
                          position: "relative",
                          alignItems: "center",
                          justifyContent: "center",
                          minHeight: 24,
                          width: "100%",
                          alignSelf: "stretch",
                        }}
                      >
                        <Text
                          style={{
                            color: Colors.light.white,
                            marginBottom: 6,
                            opacity: 0.8,
                            textAlign: "center",
                          }}
                        >
                          {t("monthlyGoalPlanner.quranMetrics.enterUpToTimes", {
                            max: maxTimes,
                            frequency: isDaily
                              ? t("monthlyGoalPlanner.quranMetrics.daily")
                              : t("monthlyGoalPlanner.quranMetrics.weekly"),
                          })}
                        </Text>
                        <Pressable
                          onPress={() => {
                            openDeleteConfirm({
                              kind: "SURAH",
                              itemNumber: s.id,
                            });
                          }}
                          disabled={isDeletingItem}
                          style={{
                            position: "absolute",
                            // Center-align under the metric tick (24x24) container.
                            // Bin icon is smaller (13x14), so anchoring at right: 0 shifts it right.
                            right: -8,
                            top: 5,
                            opacity: isDeletingItem ? 0.5 : 1,
                          }}
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
                        }}
                      >
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
                          onFocus={() => setInputFocused(`surah-${s.id}`, true)}
                          onBlur={() => setInputFocused(`surah-${s.id}`, false)}
                          style={[
                            styles.timesInput,
                            {
                              backgroundColor: focusedInputs[`surah-${s.id}`]
                                ? Colors.light.green
                                : "transparent",
                              borderColor: focusedInputs[`surah-${s.id}`]
                                ? Colors.light.green
                                : Colors.light.grey,
                            },
                          ]}
                          placeholder="0"
                        />
                        <Text
                          style={{
                            color: Colors.light.white,
                            fontSize: 14,
                            fontWeight: "400",
                            fontFamily: fonts.primary.regular,
                            opacity: 0.8,
                          }}
                        >
                          {t("monthlyGoalPlanner.quranMetrics.timesFrequency", {
                            frequency: isDaily
                              ? t("monthlyGoalPlanner.quranMetrics.daily")
                              : t("monthlyGoalPlanner.quranMetrics.weekly"),
                          })}
                        </Text>
                      </View>

                      <View style={{ height: 10 }} />

                      <View>
                        <Text
                          style={{
                            color: Colors.light.white,
                            fontSize: 12,
                            fontWeight: "400",
                            fontFamily: fonts.primary.regular,
                            opacity: 0.8,
                          }}
                        >
                          ({" "}
                          {t(
                            "monthlyGoalPlanner.quranMetrics.recitationsCount",
                            { count: timesValue || 0 },
                          )}
                          )*
                        </Text>
                        <TopSpace top={4} />
                        <Text
                          style={{
                            color: Colors.light.white,
                            fontSize: 10,
                            fontWeight: "400",
                            fontFamily: fonts.primary.regular,
                            opacity: 0.8,
                          }}
                        >
                          *
                          {t(
                            "monthlyGoalPlanner.quranMetrics.recitationsFormula",
                            {
                              times: timesValue || 0,
                              multiplier,
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
        )}
      {item.name === "juz" &&
        selectedMetric === item.name &&
        !isLoadingOptions && (
          <View style={{}}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  width: "80%",
                  color: Colors.light.white,
                  fontFamily: fonts.primary.regular,
                  fontWeight: "400",
                  fontSize: 12,
                  opacity: 0.8,
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
                <FontAwesome
                  name="trash-o"
                  size={24}
                  color={Colors.light.white}
                />
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
                  opacity: 0.8,
                }}
              >
                {t("monthlyGoalPlanner.quranMetrics.fromJuz")}
              </Text>
              <TextInput
                value={juzStart > 0 ? String(juzStart) : ""}
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
                  let clamped = Math.min(Math.max(1, n), 30);
                  // Start juz must be lesser than or equal to end juz
                  if (juzEnd > 0 && clamped > juzEnd) clamped = juzEnd;
                  setJuzStart(clamped);
                }}
                keyboardType="numeric"
                onFocus={() => setInputFocused("juz-start", true)}
                onBlur={() => {
                  setInputFocused("juz-start", false);
                  enforceJuzStart(juzStart > 0 ? String(juzStart) : "");
                }}
                style={[
                  styles.timesInput,
                  {
                    backgroundColor: focusedInputs["juz-start"]
                      ? Colors.light.green
                      : "transparent",
                    borderColor: focusedInputs["juz-start"]
                      ? Colors.light.green
                      : Colors.light.white,
                    width: 40,
                    color: Colors.light.white,
                  },
                ]}
                placeholder="1"
                placeholderTextColor={Colors.light.grey}
              />
              <Text
                style={{
                  fontWeight: "400",
                  fontSize: 14,
                  fontFamily: fonts.primary.regular,
                  color: Colors.light.white,
                  opacity: 0.8,
                }}
              >
                {t("monthlyGoalPlanner.quranMetrics.toJuz")}
              </Text>
              <TextInput
                value={juzEndText}
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
                style={[
                  styles.timesInput,
                  {
                    backgroundColor: focusedInputs["juz-end"]
                      ? Colors.light.green
                      : "transparent",
                    borderColor: focusedInputs["juz-end"]
                      ? Colors.light.green
                      : Colors.light.white,
                    width: 40,
                    color: Colors.light.white,
                  },
                ]}
                placeholder="1"
                placeholderTextColor={Colors.light.grey}
              />
            </View>
            <TopSpace top={12} />
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
              }}
            >
              <Text
                style={{
                  width: "80%",
                  color: Colors.light.white,
                  fontFamily: fonts.primary.regular,
                  fontWeight: "400",
                  fontSize: 12,
                  opacity: 0.8,
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
                <FontAwesome
                  name="trash-o"
                  size={24}
                  color={Colors.light.white}
                />
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
                style={[
                  styles.timesInput,
                  {
                    backgroundColor: focusedInputs[`completion`]
                      ? Colors.light.green
                      : "transparent",
                    borderColor: focusedInputs[`completion`]
                      ? Colors.light.green
                      : Colors.light.white,
                    textAlign: "center",
                  },
                ]}
                placeholder="0"
              />
              <Text
                style={{
                  fontWeight: "400",
                  fontSize: 14,
                  fontFamily: fonts.primary.regular,
                  color: Colors.light.white,
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
          <FlatList
            data={hizbData}
            keyExtractor={(s) => s.id.toString()}
            ListEmptyComponent={
              <Text style={styles.emptyOptionsText}>No hizb available</Text>
            }
            renderItem={({ item }) => {
              const checked = selectedHizbs.includes(item.id);

              return (
                <Pressable
                  onPress={() => toggleHizb(item.id)}
                  style={{ paddingVertical: 8, paddingRight: 20 }}
                >
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          opacity: checked ? 1 : 0.25,
                          backgroundColor: checked
                            ? Colors.light.green
                            : "transparent",
                          borderWidth: checked ? 0 : 1,
                        },
                      ]}
                    >
                      {checked && (
                        <FontAwesome
                          name="check"
                          size={14}
                          color={Colors.light.white}
                        />
                      )}
                    </View>
                    <View
                      style={[
                        styles.surahItemWrapper,
                        {
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: 4,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: Colors.light.white,
                          fontSize: 14,
                          fontFamily: fonts.primary.regular,
                          flex: 1,
                          fontWeight: "400",
                          lineHeight: 20,
                        }}
                      >
                        {item.hizbName}
                      </Text>
                      <Text
                        style={{
                          color: Colors.light.white,
                          fontSize: 14,
                          fontFamily: fonts.primary.semiBold,
                          fontWeight: "500",
                        }}
                      >
                        {item.verses}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            }}
          />
        )}

      <WarningModal
        visible={deleteConfirmVisible}
        title="DELETE GOAL?"
        message={
          <>
            <Text
              style={{
                color: Colors.light.white,
                fontSize: 14,
                fontWeight: "400",
                fontFamily: fonts.primary.regular,
                opacity: 0.8,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              Are you sure you want to delete the goal? This will remove your
              goal permanently. This action cannot be undone.
            </Text>
          </>
        }
        primaryButtonText="DELETE"
        secondaryButtonText="CANCEL"
        primaryButtonVariant="white"
        primaryButtonStyle={{
          borderColor: Colors.light.red,
        }}
        primaryButtonTextStyle={{
          color: Colors.light.red,
          fontSize: 14,
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
    height: 20,
    width: 20,
    borderRadius: 4,
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
  },
  metrixWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  surahItemWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  surahVerseCount: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },
  radio: {
    height: 18,
    width: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: Colors.light.grey,
    alignItems: "center",
    justifyContent: "center",
  },
  radioChecked: {
    // borderColor: Colors.light.green,
  },
  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.green,
  },
  radioLabel: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    marginRight: 8,
    opacity: 0.8,
  },
  timesInput: {
    height: 40,
    width: 50,
    borderWidth: 1,
    borderColor: Colors.light.white,
    borderRadius: 6,
    paddingHorizontal: 8,
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    textAlign: "center",
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
