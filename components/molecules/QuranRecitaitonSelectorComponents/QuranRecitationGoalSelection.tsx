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
  onInputFocus?: () => void;
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
  const [isOpen, setIsOpen] = useGoalSelectionOpenState(
    openOnMount,
    onInputFocus,
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
  const savedSnapshotsRef = useRef<Partial<Record<MetricName, any>>>({});

  useEffect(() => {
    if (!initialSavedMetrics?.length) return;
    setSavedMetrics((prev) => {
      let changed = false;
      const next = new Set(prev);
      initialSavedMetrics.forEach((m) => {
        if (!next.has(m)) {
          next.add(m);
          changed = true;
        }
      });
      return changed ? next : prev;
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

  const handleDeleteSavedItem = useCallback(
    async (args: {
      itemType: "SURAH" | "JUZ" | "HIZB" | "COMPLETION";
      itemNumber: number;
    }) => {
      if (!quranGoalType) return;
      await deleteGoalItem({
        quranGoalType,
        itemType: args.itemType,
        itemNumber: args.itemNumber,
      });
    },
    [deleteGoalItem, quranGoalType],
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

  // Prefer API when present; otherwise restore from the last local snapshot.
  const initialSelectedSurahs = useMemo(() => {
    if (apiSelectedSurahs.length > 0) return apiSelectedSurahs;
    const snap = metricSnapshots.surah?.selectedSurahs;
    return Array.isArray(snap) ? snap.map(Number).filter((n) => n > 0) : [];
  }, [apiSelectedSurahs, metricSnapshots.surah]);

  const initialSurahSettings = useMemo(() => {
    if (apiSurahSettings && Object.keys(apiSurahSettings).length > 0) {
      return apiSurahSettings;
    }
    return metricSnapshots.surah?.surahSettings;
  }, [apiSurahSettings, metricSnapshots.surah]);

  const initialSelectedJuzs = useMemo(() => {
    if (apiSelectedJuzs.length > 0) return apiSelectedJuzs;
    const snap = metricSnapshots.juz?.selectedJuzs;
    if (Array.isArray(snap) && snap.length > 0) {
      return snap.map(Number).filter((n) => n > 0);
    }
    const start = Number(metricSnapshots.juz?.start ?? 0);
    const end = Number(metricSnapshots.juz?.end ?? 0);
    if (start > 0 && end > 0) {
      return Array.from(
        { length: Math.max(0, end - start + 1) },
        (_, i) => start + i,
      );
    }
    return [];
  }, [apiSelectedJuzs, metricSnapshots.juz]);

  const initialJuzRange = useMemo(() => {
    if (apiJuzRange) return apiJuzRange;
    const start = Number(metricSnapshots.juz?.start ?? 0);
    const end = Number(metricSnapshots.juz?.end ?? 0);
    if (start > 0 || end > 0) {
      return {
        start: start > 0 ? start : 1,
        end: end > 0 ? end : start,
      };
    }
    if (initialSelectedJuzs.length > 0) {
      return {
        start: Math.min(...initialSelectedJuzs),
        end: Math.max(...initialSelectedJuzs),
      };
    }
    return null;
  }, [apiJuzRange, metricSnapshots.juz, initialSelectedJuzs]);

  const initialSelectedHizbs = useMemo(() => {
    if (apiSelectedHizbs.length > 0) return apiSelectedHizbs;
    const snap = metricSnapshots.hizb?.selectedHizbs;
    return Array.isArray(snap) ? snap.map(Number).filter((n) => n > 0) : [];
  }, [apiSelectedHizbs, metricSnapshots.hizb]);

  const initialCompletion = useMemo(() => {
    if (apiCompletion > 0) return apiCompletion;
    const snap = metricSnapshots.completion;
    if (typeof snap === "number") return snap;
    return Number(snap?.completion ?? 0) || 0;
  }, [apiCompletion, metricSnapshots.completion]);

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

  const showAsInitiallySaved =
    initiallySaved || (initialSavedMetrics?.length ?? 0) > 0;
  const saveValueKey = `${Array.from(savedMetrics).sort().join(",")}|${Array.from(configuredMetrics).sort().join(",")}|${JSON.stringify(metricSnapshots)}|${resolvedMetric ?? ""}|${markCleanNonce}`;

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
                  isDeletingItem={isActiveMetric && isDeletingItem}
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
