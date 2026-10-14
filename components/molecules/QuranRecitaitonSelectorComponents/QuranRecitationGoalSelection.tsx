import { LayoutAnimation, StyleSheet, Text, View } from "react-native";
import { GoalSelectionOpenCloseButton } from "../GoalSelectionOpenCloseButton";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGoalSelectionOpenState } from "@/hooks/useGoalSelectionOpenState";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { Divider } from "../../atoms/Divider";
import { TopSpace } from "../../atoms/TopSpace";
import { MetricSelectionComponent } from "./MetricSelectionComponent";
import GoalSelectionSaveButton from "@/components/molecules/GoalSelectionSaveButton";
import { useTranslation } from "react-i18next";
import { globalStyles } from "@/src/globalstyles/globalstyles";
import { useGetQuranGoalByType } from "@/src/api/queries/useGetQuranGoalByType";
import { useDeleteQuranGoalSingleMetric } from "@/src/api/mutations/useDeleteQuranGoalSingleMetric";
import { useBulkUpsertQuranGoals } from "@/src/api/mutations/useUpsertQuranGoal";
import {
  findApiGoalForMetric,
  getCompletionFromDetail,
  getJuzRangeFromDetail,
  getQuranGoalTypeForMetric,
  getSelectedHizbIdsFromDetail,
  getSelectedJuzIdsFromDetail,
  getSelectedSurahIdsFromDetail,
  getSurahSettingsFromDetail,
  isQuranMetricValueConfigured,
  mergeHizbOptionsWithDetail,
  mergeJuzOptionsWithDetail,
  mergeSurahOptionsWithDetail,
  metricValueFromApiGoal,
  quranMetricSnapshotCompareKey,
  type QuranGoalApiItem,
  type QuranHizbOption,
  type QuranJuzOption,
  type QuranSurahOption,
} from "@/src/utils/quranGoalMap";
import { getJuzVerseMetadata } from "@/src/screens/private/goalprogressloggingscreen/quranJuzVerseMap";

type MetricName = "surah" | "juz" | "completion" | "hizb";

export type QuranRecitationGoalSelectionProps = {
  title: string;
  onMetricsChange?: (payload: { metric: string; value: any }) => void;
  variant?: "memorization" | "others";
  onSave?: (
    payload: {
      metric?: MetricName;
      /** Persist every configured metric in one bulk request. */
      saveAll?: boolean;
    },
    onDone?: () => void,
    onFail?: () => void,
  ) => void;
  initialMetric?: "surah" | "juz" | "completion" | "hizb";
  allowedMetrics?: Array<"surah" | "juz" | "completion" | "hizb">;
  /** Metrics already persisted on the backend for this card. */
  initialSavedMetrics?: MetricName[];
  /** Card-level API rows (may include `items`) used to restore selections on expand. */
  apiGoals?: QuranGoalApiItem[];
  openOnMount?: boolean;
  collapseSignal?: number;
  /** From parent GET .../quran-goals `reference` (single fetch in GoalPlannerSheet). */
  surahReference?: QuranSurahOption[];
  hizbReference?: QuranHizbOption[];
  juzReference?: QuranJuzOption[];
  isReferenceLoading?: boolean;
  /** Disable parent list scroll while the nested metric list is scrolling. */
  onNestedScrollActiveChange?: (active: boolean) => void;
  isSaving?: boolean;
  /** Scroll parent list so metric inputs stay visible above the keyboard. */
  onInputFocus?: (layout?: { windowY: number; inputHeight: number }) => void;
  /** When true (or when initialSavedMetrics is non-empty), start in SAVED!. */
  initiallySaved?: boolean;
};

export const QuranRecitationGoalSelection = ({
  title,
  onMetricsChange,
  variant,
  onSave,
  initialMetric,
  allowedMetrics,
  initialSavedMetrics,
  apiGoals,
  openOnMount,
  collapseSignal = 0,
  surahReference = [],
  hizbReference = [],
  juzReference = [],
  isReferenceLoading = false,
  onNestedScrollActiveChange,
  isSaving = false,
  onInputFocus,
  initiallySaved = false,
}: QuranRecitationGoalSelectionProps) => {
  const { t } = useTranslation();
  // Do not pass onInputFocus as onOpened — panel open must not trigger
  // keyboard keep-visible (only MetricSelection TextInput focus should).
  const [isOpen, setIsOpen] = useGoalSelectionOpenState(
    openOnMount,
    undefined,
    collapseSignal,
  );
  const handleToggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  const [selectedMetric, setSelectedMetric] = useState<MetricName | undefined>(
    initialMetric,
  );
  const [markCleanNonce, setMarkCleanNonce] = useState(0);
  /** Metrics that have been successfully saved (session or API with real items). */
  const [savedMetrics, setSavedMetrics] = useState<Set<MetricName>>(
    () => new Set(initialSavedMetrics ?? []),
  );
  /** Metrics with enough local selection to include in a bulk save. */
  const [configuredMetrics, setConfiguredMetrics] = useState<Set<MetricName>>(
    () => new Set(),
  );
  /**
   * Working metric values while the panel is open. On collapse without save,
   * these revert to `savedSnapshotsRef` (last successful save / API seed).
   */
  const [metricSnapshots, setMetricSnapshots] = useState<
    Partial<Record<MetricName, any>>
  >({});
  const metricSnapshotsRef = useRef(metricSnapshots);
  metricSnapshotsRef.current = metricSnapshots;
  const savedSnapshotsRef = useRef<Partial<Record<MetricName, any>>>({});

  // Reconcile ticks from API list, but never resurrect a metric we cleared
  // locally (empty savedSnapshotsRef) while the list refetch is still stale.
  useEffect(() => {
    const apiList = initialSavedMetrics ?? [];
    setSavedMetrics((prev) => {
      const next = new Set<MetricName>();
      apiList.forEach((m) => {
        if (
          Object.prototype.hasOwnProperty.call(savedSnapshotsRef.current, m) &&
          !isQuranMetricValueConfigured(m, savedSnapshotsRef.current[m])
        ) {
          return;
        }
        next.add(m);
      });
      // Keep optimistic ticks from a save that has not landed in apiGoals yet.
      prev.forEach((m) => {
        if (next.has(m)) return;
        if (
          Object.prototype.hasOwnProperty.call(savedSnapshotsRef.current, m) &&
          isQuranMetricValueConfigured(m, savedSnapshotsRef.current[m])
        ) {
          next.add(m);
        }
      });
      if (next.size === prev.size && [...next].every((m) => prev.has(m))) {
        return prev;
      }
      return next;
    });
  }, [initialSavedMetrics]);

  // Seed snapshots from list API so expanding a saved metric shows prior picks
  // even before / without the per-type detail refetch.
  useEffect(() => {
    if (!apiGoals?.length) return;
    const variantKey = variant === "memorization" ? "memorization" : "others";
    setMetricSnapshots((prev) => {
      let changed = false;
      const next: Partial<Record<MetricName, any>> = { ...prev };
      (["surah", "juz", "hizb", "completion"] as MetricName[]).forEach(
        (metric) => {
          if (
            prev[metric] != null &&
            isQuranMetricValueConfigured(metric, prev[metric])
          ) {
            return;
          }
          // After a delete emptied this metric, savedSnapshotsRef holds that
          // empty value — do not resurrect items from a stale apiGoals refetch.
          if (
            Object.prototype.hasOwnProperty.call(
              savedSnapshotsRef.current,
              metric,
            ) &&
            !isQuranMetricValueConfigured(
              metric,
              savedSnapshotsRef.current[metric],
            )
          ) {
            if (prev[metric] !== savedSnapshotsRef.current[metric]) {
              next[metric] = savedSnapshotsRef.current[metric];
              changed = true;
            }
            return;
          }
          const goal = findApiGoalForMetric(apiGoals, variantKey, metric);
          const snap = metricValueFromApiGoal(metric, goal as any);
          if (
            snap != null &&
            isQuranMetricValueConfigured(metric, snap)
          ) {
            next[metric] = snap;
            savedSnapshotsRef.current = {
              ...savedSnapshotsRef.current,
              [metric]: snap,
            };
            changed = true;
          }
        },
      );
      return changed ? next : prev;
    });
  }, [apiGoals, variant]);

  // Collapse without save → discard dirty metric edits.
  useEffect(() => {
    if (isOpen) return;
    setMetricSnapshots({ ...savedSnapshotsRef.current });
    setConfiguredMetrics(new Set());
  }, [isOpen]);

  useEffect(() => {
    if (initialMetric) return;
    if (!allowedMetrics || allowedMetrics.length !== 1) return;
    setSelectedMetric((prev) => prev ?? allowedMetrics[0]);
  }, [allowedMetrics, initialMetric]);

  const resolvedMetric = selectedMetric;

  const supportsMultiMetricSave =
    (variant === "memorization" || variant === "others") &&
    (!allowedMetrics || allowedMetrics.length !== 1);

  const quranGoalType = useMemo(() => {
    if (!resolvedMetric) return null;
    return getQuranGoalTypeForMetric(
      variant === "memorization" ? "memorization" : "others",
      resolvedMetric,
    );
  }, [resolvedMetric, variant]);

  const listGoalForActiveMetric = useMemo(() => {
    if (!resolvedMetric) return null;
    return findApiGoalForMetric(
      apiGoals,
      variant === "memorization" ? "memorization" : "others",
      resolvedMetric,
    );
  }, [apiGoals, resolvedMetric, variant]);

  const { data: goalDetail, isLoading: loadingDetail } = useGetQuranGoalByType(
    quranGoalType,
    { enabled: isOpen && !!quranGoalType },
  );

  // Detail endpoint wins; fall back to the list row for the active metric.
  const effectiveDetail = goalDetail ?? (listGoalForActiveMetric as any) ?? null;

  const { mutateAsync: deleteGoalItem, isPending: isDeletingItem } =
    useDeleteQuranGoalSingleMetric();
  const { mutateAsync: bulkUpsertQuranGoals, isPending: isClearingCompletion } =
    useBulkUpsertQuranGoals();

  const handleDeleteSavedItem = useCallback(
    async (args: {
      itemType: "SURAH" | "JUZ" | "HIZB" | "COMPLETION";
      itemNumber: number;
      nextMetricValue?: any;
    }) => {
      if (!quranGoalType) return;

      // Completion is a goal-level completionTarget — not a SURAH/JUZ/HIZB item.
      // DELETE ?itemType=COMPLETION returns 400 Invalid itemType.
      if (args.itemType === "COMPLETION") {
        await bulkUpsertQuranGoals({
          goals: [
            {
              quranGoalType,
              isActive: true,
              frequency: "MONTHLY",
              completionTarget: 0,
              items: [],
            },
          ],
        });
      } else {
        await deleteGoalItem({
          quranGoalType,
          itemType: args.itemType,
          itemNumber: args.itemNumber,
        });
      }

      const metric: MetricName =
        args.itemType === "SURAH"
          ? "surah"
          : args.itemType === "JUZ"
            ? "juz"
            : args.itemType === "HIZB"
              ? "hizb"
              : "completion";

      const prevSnap =
        savedSnapshotsRef.current[metric] ??
        metricSnapshotsRef.current[metric];
      let nextValue = args.nextMetricValue;
      if (nextValue === undefined) {
        if (metric === "surah") {
          const selectedSurahs = (prevSnap?.selectedSurahs ?? [])
            .map(Number)
            .filter((n: number) => n > 0 && n !== args.itemNumber);
          const surahSettings = { ...(prevSnap?.surahSettings ?? {}) };
          delete surahSettings[args.itemNumber];
          const surahNames = { ...(prevSnap?.surahNames ?? {}) };
          delete surahNames[args.itemNumber];
          nextValue = { selectedSurahs, surahSettings, surahNames };
        } else if (metric === "hizb") {
          nextValue = {
            selectedHizbs: (prevSnap?.selectedHizbs ?? [])
              .map(Number)
              .filter((n: number) => n > 0 && n !== args.itemNumber),
          };
        } else if (metric === "juz") {
          let start = Number(prevSnap?.start ?? 0);
          let end = Number(prevSnap?.end ?? 0);
          let selectedJuzs: number[] = Array.isArray(prevSnap?.selectedJuzs)
            ? prevSnap.selectedJuzs.map(Number).filter((n: number) => n > 0)
            : [];
          if (selectedJuzs.length === 0 && start > 0 && end > 0) {
            selectedJuzs = Array.from(
              { length: Math.max(0, end - start + 1) },
              (_, i) => start + i,
            );
          }
          selectedJuzs = selectedJuzs.filter((n) => n !== args.itemNumber);
          if (selectedJuzs.length > 0) {
            start = Math.min(...selectedJuzs);
            end = Math.max(...selectedJuzs);
          } else {
            start = 0;
            end = 0;
          }
          nextValue = { selectedJuzs, start, end };
        } else {
          nextValue = 0;
        }
      } else if (metric === "surah" && prevSnap?.surahNames) {
        // Preserve names map; drop the deleted id.
        const surahNames = { ...prevSnap.surahNames };
        delete surahNames[args.itemNumber];
        nextValue = { ...nextValue, surahNames };
      }

      // Persist delete into "saved" snapshots so collapse does not resurrect.
      savedSnapshotsRef.current = {
        ...savedSnapshotsRef.current,
        [metric]: nextValue,
      };
      setMetricSnapshots((prev) => ({ ...prev, [metric]: nextValue }));

      const stillConfigured = isQuranMetricValueConfigured(metric, nextValue);
      setConfiguredMetrics((prev) => {
        const has = prev.has(metric);
        if (stillConfigured === has) return prev;
        const next = new Set(prev);
        if (stillConfigured) next.add(metric);
        else next.delete(metric);
        return next;
      });
      if (!stillConfigured) {
        setSavedMetrics((prev) => {
          if (!prev.has(metric)) return prev;
          const next = new Set(prev);
          next.delete(metric);
          return next;
        });
      }

      onMetricsChange?.({ metric, value: nextValue });
      // Refresh initialSelected* memos that read savedSnapshotsRef.
      setMarkCleanNonce((n) => n + 1);
    },
    [bulkUpsertQuranGoals, deleteGoalItem, onMetricsChange, quranGoalType],
  );

  const handleMetricsChange = useCallback(
    (payload: { metric: string; value: any }) => {
      onMetricsChange?.(payload);
      const metric = payload.metric as MetricName;
      if (
        metric !== "surah" &&
        metric !== "juz" &&
        metric !== "completion" &&
        metric !== "hizb"
      ) {
        return;
      }
      setMetricSnapshots((prev) => {
        if (prev[metric] === payload.value) return prev;
        return { ...prev, [metric]: payload.value };
      });
      const configured = isQuranMetricValueConfigured(metric, payload.value);
      setConfiguredMetrics((prev) => {
        const has = prev.has(metric);
        if (configured === has) return prev;
        const next = new Set(prev);
        if (configured) next.add(metric);
        else next.delete(metric);
        return next;
      });
    },
    [onMetricsChange],
  );

  const needsReference =
    isOpen &&
    (resolvedMetric === "surah" ||
      resolvedMetric === "hizb" ||
      resolvedMetric === "juz");

  const surahOptions = useMemo(
    () => mergeSurahOptionsWithDetail(surahReference, effectiveDetail),
    [surahReference, effectiveDetail],
  );
  const hizbOptions = useMemo(
    () => mergeHizbOptionsWithDetail(hizbReference, effectiveDetail),
    [hizbReference, effectiveDetail],
  );
  const juzOptions = useMemo(() => {
    const merged = mergeJuzOptionsWithDetail(juzReference, effectiveDetail);
    const base: QuranJuzOption[] =
      merged.length > 0
        ? merged
        : Array.from({ length: 30 }, (_, i) => ({
            id: i + 1,
            juzName: `Juz ${i + 1}`,
          }));

    return base.map((juz) => {
      if (juz.juzName.includes("|") && juz.verses) return juz;
      try {
        const meta = getJuzVerseMetadata(juz.id);
        return {
          ...juz,
          juzName: `Juz ${juz.id} | ${meta.rangeLabel}`,
          verses: juz.verses ?? `(${meta.totalVerses} verses)`,
          totalAyahs: juz.totalAyahs ?? meta.totalVerses,
          startSurah: juz.startSurah ?? meta.startSurahNumber,
          startAyah: juz.startAyah ?? meta.startAyah,
          endSurah: juz.endSurah ?? meta.endSurahNumber,
          endAyah: juz.endAyah ?? meta.endAyah,
        };
      } catch {
        return juz;
      }
    });
  }, [juzReference, effectiveDetail]);
  const apiSelectedSurahs = useMemo(
    () => getSelectedSurahIdsFromDetail(effectiveDetail),
    [effectiveDetail],
  );
  const apiSurahSettings = useMemo(
    () => getSurahSettingsFromDetail(effectiveDetail),
    [effectiveDetail],
  );
  const apiJuzRange = useMemo(
    () => getJuzRangeFromDetail(effectiveDetail),
    [effectiveDetail],
  );
  const apiSelectedJuzs = useMemo(
    () => getSelectedJuzIdsFromDetail(effectiveDetail),
    [effectiveDetail],
  );
  const apiSelectedHizbs = useMemo(
    () => getSelectedHizbIdsFromDetail(effectiveDetail),
    [effectiveDetail],
  );
  const apiCompletion = useMemo(
    () => getCompletionFromDetail(effectiveDetail),
    [effectiveDetail],
  );

  // Prefer savedSnapshotsRef (last save + deletes) over API detail so a stale
  // refetch cannot resurrect removed items after collapse/reopen.
  // Never feed live dirty `metricSnapshots` here (that made unsaved picks look saved).
  const initialSelectedSurahs = useMemo(() => {
    if (
      Object.prototype.hasOwnProperty.call(savedSnapshotsRef.current, "surah")
    ) {
      const snap = savedSnapshotsRef.current.surah?.selectedSurahs;
      return Array.isArray(snap)
        ? snap.map(Number).filter((n) => n > 0)
        : [];
    }
    return apiSelectedSurahs;
  }, [apiSelectedSurahs, markCleanNonce]);

  const initialSurahSettings = useMemo(() => {
    if (
      Object.prototype.hasOwnProperty.call(savedSnapshotsRef.current, "surah")
    ) {
      return savedSnapshotsRef.current.surah?.surahSettings;
    }
    if (apiSurahSettings && Object.keys(apiSurahSettings).length > 0) {
      return apiSurahSettings;
    }
    return undefined;
  }, [apiSurahSettings, markCleanNonce]);

  const initialSelectedJuzs = useMemo(() => {
    if (
      Object.prototype.hasOwnProperty.call(savedSnapshotsRef.current, "juz")
    ) {
      const snap = savedSnapshotsRef.current.juz?.selectedJuzs;
      if (Array.isArray(snap) && snap.length > 0) {
        return snap.map(Number).filter((n) => n > 0);
      }
      const start = Number(savedSnapshotsRef.current.juz?.start ?? 0);
      const end = Number(savedSnapshotsRef.current.juz?.end ?? 0);
      if (start > 0 && end > 0) {
        return Array.from(
          { length: Math.max(0, end - start + 1) },
          (_, i) => start + i,
        );
      }
      return [];
    }
    if (apiSelectedJuzs.length > 0) return apiSelectedJuzs;
    return [];
  }, [apiSelectedJuzs, markCleanNonce]);

  const initialJuzRange = useMemo(() => {
    if (
      Object.prototype.hasOwnProperty.call(savedSnapshotsRef.current, "juz")
    ) {
      const start = Number(savedSnapshotsRef.current.juz?.start ?? 0);
      const end = Number(savedSnapshotsRef.current.juz?.end ?? 0);
      if (start > 0 || end > 0) {
        // Do not coerce missing end → start (or the To Juz input mirrors From).
        return {
          start: start > 0 ? start : end > 0 ? 1 : 0,
          end: end > 0 ? end : 0,
        };
      }
      if (initialSelectedJuzs.length > 0) {
        return {
          start: Math.min(...initialSelectedJuzs),
          end: Math.max(...initialSelectedJuzs),
        };
      }
      return { start: 0, end: 0 };
    }
    if (apiJuzRange) return apiJuzRange;
    if (initialSelectedJuzs.length > 0) {
      return {
        start: Math.min(...initialSelectedJuzs),
        end: Math.max(...initialSelectedJuzs),
      };
    }
    return null;
  }, [apiJuzRange, initialSelectedJuzs, markCleanNonce]);

  const initialSelectedHizbs = useMemo(() => {
    if (
      Object.prototype.hasOwnProperty.call(savedSnapshotsRef.current, "hizb")
    ) {
      const snap = savedSnapshotsRef.current.hizb?.selectedHizbs;
      return Array.isArray(snap)
        ? snap.map(Number).filter((n) => n > 0)
        : [];
    }
    return apiSelectedHizbs;
  }, [apiSelectedHizbs, markCleanNonce]);

  const initialCompletion = useMemo(() => {
    if (
      Object.prototype.hasOwnProperty.call(
        savedSnapshotsRef.current,
        "completion",
      )
    ) {
      const snap = savedSnapshotsRef.current.completion;
      if (typeof snap === "number") return snap;
      return Number(snap?.completion ?? 0) || 0;
    }
    if (apiCompletion > 0) return apiCompletion;
    return 0;
  }, [apiCompletion, markCleanNonce]);

  interface IItem {
    id: number;
    name: MetricName;
    title: string;
  }
  const memorizationMetrices = [
    {
      id: 1,
      name: "surah" as const,
      title: t("monthlyGoalPlanner.reviewLabels.surah"),
    },
    {
      id: 2,
      name: "hizb" as const,
      title: t("monthlyGoalPlanner.reviewLabels.hizb"),
    },
    {
      id: 3,
      name: "juz" as const,
      title: t("monthlyGoalPlanner.reviewLabels.juz"),
    },
  ];
  const otherMetrices = [
    {
      id: 1,
      name: "surah" as const,
      title: t("monthlyGoalPlanner.reviewLabels.surah"),
    },
    {
      id: 3,
      name: "juz" as const,
      title: t("monthlyGoalPlanner.reviewLabels.juz"),
    },
    {
      id: 2,
      name: "completion" as const,
      title: t("monthlyGoalPlanner.quranMetrics.completionKhatma"),
    },
  ];
  const metricesDecider = () => {
    const list =
      variant === "memorization" ? memorizationMetrices : otherMetrices;
    if (!allowedMetrics || allowedMetrics.length === 0) return list;
    return list.filter((m) =>
      allowedMetrics.includes(
        m.name as "surah" | "juz" | "completion" | "hizb",
      ),
    );
  };

  const applyMetricChange = useCallback((next: MetricName | undefined) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedMetric(next);
  }, []);

  const handlePressMetrix = (item: IItem) => {
    // Expand / collapse / switch freely — each metric keeps its own local
    // state, so no unsaved-changes modal on Surah / Juz / Completion.
    const nextMetric: MetricName | undefined =
      selectedMetric === item.name ? undefined : item.name;
    applyMetricChange(nextMetric);
  };

  const isLoadingOptions =
    loadingDetail ||
    (needsReference && isReferenceLoading && surahReference.length === 0);

  const canSave = supportsMultiMetricSave
    ? configuredMetrics.size > 0
    : !!resolvedMetric;

  // SAVED! when parent says so OR at least one metric was submitted (ticks).
  // Edits on another metric flip back to Save via saveValueKey dirty tracking.
  const showAsInitiallySaved = initiallySaved || savedMetrics.size > 0;

  /**
   * Delay dirty-tracking until API/detail hydrate finishes. Including
   * metricSnapshots in valueKey before that flipped SAVED! → Save on
   * recitation-by-surah (async surah list / settings).
   */
  const [saveBaselineReady, setSaveBaselineReady] = useState(
    () => !initiallySaved && (initialSavedMetrics?.length ?? 0) === 0,
  );

  useEffect(() => {
    if (saveBaselineReady) return;
    if (!isOpen) return;

    const active =
      resolvedMetric ?? initialMetric ?? allowedMetrics?.[0] ?? undefined;
    const hasLive =
      !!active &&
      isQuranMetricValueConfigured(active, metricSnapshots[active]);
    const stillLoading =
      loadingDetail ||
      (needsReference && isReferenceLoading && surahReference.length === 0);

    if (!hasLive && stillLoading) return;

    // Wait until every already-saved metric has a seeded snapshot so reopen
    // does not lock an empty baseline and then look falsely dirty.
    const savedList = Array.from(savedMetrics);
    if (savedList.length > 0) {
      const allSeeded = savedList.every((m) =>
        isQuranMetricValueConfigured(m, savedSnapshotsRef.current[m]),
      );
      if (!allSeeded) return;
    }

    // Fill missing live keys from saved — never overwrite a saved metric with
    // a sparse/empty live snapshot during baseline lock.
    const nextSaved = { ...savedSnapshotsRef.current };
    (["surah", "juz", "hizb", "completion"] as MetricName[]).forEach((m) => {
      const live = metricSnapshots[m];
      if (live == null) return;
      if (
        Object.prototype.hasOwnProperty.call(nextSaved, m) &&
        isQuranMetricValueConfigured(m, nextSaved[m])
      ) {
        return;
      }
      nextSaved[m] = live;
    });
    savedSnapshotsRef.current = nextSaved;

    if (hasLive && active) {
      setSavedMetrics((prev) => {
        if (prev.has(active)) return prev;
        const next = new Set(prev);
        next.add(active);
        return next;
      });
    }
    setSaveBaselineReady(true);
  }, [
    saveBaselineReady,
    isOpen,
    resolvedMetric,
    initialMetric,
    allowedMetrics,
    metricSnapshots,
    loadingDetail,
    needsReference,
    isReferenceLoading,
    surahReference.length,
    savedMetrics,
  ]);

  // Stable when clean; only changes when live snapshots diverge from saved.
  // Compare via normalized keys — child vs API shapes differ for the same picks.
  const saveValueKey = useMemo(() => {
    if (!saveBaselineReady) return undefined;
    const metrics: MetricName[] = ["surah", "juz", "hizb", "completion"];
    const dirty: string[] = [];
    for (const m of metrics) {
      const live = quranMetricSnapshotCompareKey(m, metricSnapshots[m]);
      const saved = quranMetricSnapshotCompareKey(
        m,
        savedSnapshotsRef.current[m],
      );
      // Missing live while saved exists = not hydrated yet, not a user edit.
      if (!live && saved) continue;
      if (live !== saved) {
        dirty.push(`${m}:${live}`);
      }
    }
    return dirty.length === 0
      ? `clean|${Array.from(savedMetrics).sort().join(",")}|${markCleanNonce}`
      : `dirty|${dirty.join("|")}|${markCleanNonce}`;
  }, [saveBaselineReady, metricSnapshots, savedMetrics, markCleanNonce]);

  return (
    <View
      style={[
        globalStyles.goalSelectionWrapper,
        { paddingBottom: isOpen ? 6 : 10 },
      ]}
    >
      <GoalSelectionOpenCloseButton
        isOpen={isOpen}
        toggleDropdown={handleToggleDropdown}
        title={title}
      />
      {isOpen && (
        <View style={styles.openContent}>
          <Divider />
          <TopSpace top={10} />
          {(variant === "memorization" || variant === "others") && (
            <Text style={styles.selectMoreText}>
              You can select more than one.
            </Text>
          )}
          <View style={styles.metricsScrollArea}>
            {metricesDecider().map((item: IItem) => {
              const isActiveMetric = resolvedMetric === item.name;
              return (
                <MetricSelectionComponent
                  key={item.id}
                  item={item}
                  handleMetricPress={() => handlePressMetrix(item)}
                  selectedMetric={resolvedMetric}
                  isSaved={savedMetrics.has(item.name)}
                  onMetricChange={handleMetricsChange}
                  variant={variant}
                  surahOptions={isActiveMetric ? surahOptions : undefined}
                  hizbOptions={isActiveMetric ? hizbOptions : undefined}
                  juzOptions={isActiveMetric ? juzOptions : undefined}
                  initialSelectedSurahs={
                    isActiveMetric ? initialSelectedSurahs : undefined
                  }
                  initialSurahSettings={
                    isActiveMetric ? initialSurahSettings : undefined
                  }
                  initialJuzRange={isActiveMetric ? initialJuzRange : undefined}
                  initialSelectedJuzs={
                    isActiveMetric ? initialSelectedJuzs : undefined
                  }
                  initialSelectedHizbs={
                    isActiveMetric ? initialSelectedHizbs : undefined
                  }
                  initialCompletion={
                    isActiveMetric ? initialCompletion : undefined
                  }
                  isLoadingOptions={isActiveMetric && isLoadingOptions}
                  onDeleteSavedItem={
                    isActiveMetric ? handleDeleteSavedItem : undefined
                  }
                  isDeletingItem={
                    isActiveMetric && (isDeletingItem || isClearingCompletion)
                  }
                  markCleanNonce={isActiveMetric ? markCleanNonce : 0}
                  onNestedScrollActiveChange={
                    isActiveMetric ? onNestedScrollActiveChange : undefined
                  }
                  onInputFocus={isActiveMetric ? onInputFocus : undefined}
                />
              );
            })}
          </View>
          <View style={styles.saveFooter}>
            <GoalSelectionSaveButton
              text={t("monthlyGoalPlanner.save")}
              style={{
                width: "100%",
              }}
              isLoading={isSaving}
              disabled={isSaving || !canSave}
              initiallySaved={showAsInitiallySaved}
              valueKey={saveValueKey}
              onPress={(markSaved, markFailed) => {
                if (!onSave) {
                  markFailed();
                  return;
                }
                if (supportsMultiMetricSave) {
                  const metricsJustSaved = Array.from(configuredMetrics);
                  onSave(
                    { saveAll: true },
                    () => {
                      // Show SAVED! before local state updates so both cards
                      // match prayer/hours: loading → SAVED! → collapse.
                      markSaved?.();
                      savedSnapshotsRef.current = { ...metricSnapshots };
                      setSavedMetrics((prev) => {
                        const next = new Set(prev);
                        metricsJustSaved.forEach((m) => next.add(m));
                        return next;
                      });
                      setMarkCleanNonce((n) => n + 1);
                    },
                    markFailed,
                  );
                  return;
                }
                if (!resolvedMetric) {
                  markFailed();
                  return;
                }
                onSave(
                  { metric: resolvedMetric },
                  () => {
                    markSaved?.();
                    savedSnapshotsRef.current = { ...metricSnapshots };
                    setSavedMetrics((prev) => {
                      const next = new Set(prev);
                      next.add(resolvedMetric);
                      return next;
                    });
                    setMarkCleanNonce((n) => n + 1);
                  },
                  markFailed,
                );
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  openContent: {
    width: "100%",
    paddingBottom: 6,
  },
  metricsScrollArea: {
    width: "100%",
  },
  saveFooter: {
    width: "100%",
    paddingTop: 16,
    backgroundColor: Colors.light.calendarBg,
  },
  selectMoreText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 12,
    fontWeight: "400",
    opacity: 0.85,
    marginBottom: 12,
    alignSelf: "flex-start",
  },
});
