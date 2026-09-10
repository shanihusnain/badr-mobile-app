import { LayoutAnimation, StyleSheet, Text, View } from "react-native";
import { GoalSelectionOpenCloseButton } from "../GoalSelectionOpenCloseButton";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useGoalSelectionOpenState } from "@/hooks/useGoalSelectionOpenState";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { Divider } from "../../atoms/Divider";
import { TopSpace } from "../../atoms/TopSpace";
import { MetricSelectionComponent } from "./MetricSelectionComponent";
import GoalSelectionSaveButton from "@/components/molecules/GoalSelectionSaveButton";
import WarningModal from "@/components/atoms/WarningModal";
import { useTranslation } from "react-i18next";
import { globalStyles } from "@/src/globalstyles/globalstyles";
import { useGetQuranGoalByType } from "@/src/api/queries/useGetQuranGoalByType";
import { useDeleteQuranGoalSingleMetric } from "@/src/api/mutations/useDeleteQuranGoalSingleMetric";
import {
  getCompletionFromDetail,
  getJuzRangeFromDetail,
  getQuranGoalTypeForMetric,
  getSelectedHizbIdsFromDetail,
  getSelectedJuzIdsFromDetail,
  getSelectedSurahIdsFromDetail,
  getSurahSettingsFromDetail,
  mergeHizbOptionsWithDetail,
  mergeJuzOptionsWithDetail,
  mergeSurahOptionsWithDetail,
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
      metric: "surah" | "juz" | "completion" | "hizb";
    },
    onDone?: () => void,
    onFail?: () => void,
  ) => void;
  initialMetric?: "surah" | "juz" | "completion" | "hizb";
  allowedMetrics?: Array<"surah" | "juz" | "completion" | "hizb">;
  openOnMount?: boolean;
  /** From parent GET .../quran-goals `reference` (single fetch in GoalPlannerSheet). */
  surahReference?: QuranSurahOption[];
  hizbReference?: QuranHizbOption[];
  juzReference?: QuranJuzOption[];
  isReferenceLoading?: boolean;
  /** Disable parent bottom-sheet scroll while the nested metric list is scrolling. */
  onNestedScrollActiveChange?: (active: boolean) => void;
  isSaving?: boolean;
};

export const QuranRecitationGoalSelection = ({
  title,
  onMetricsChange,
  variant,
  onSave,
  initialMetric,
  allowedMetrics,
  openOnMount,
  surahReference = [],
  hizbReference = [],
  juzReference = [],
  isReferenceLoading = false,
  onNestedScrollActiveChange,
  isSaving = false,
}: QuranRecitationGoalSelectionProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useGoalSelectionOpenState(openOnMount);
  const handleToggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  const [selectedMetric, setSelectedMetric] = useState<MetricName | undefined>(
    initialMetric,
  );
  const [isMetricDirty, setIsMetricDirty] = useState(false);
  const [unsavedModalVisible, setUnsavedModalVisible] = useState(false);
  const [pendingMetric, setPendingMetric] = useState<MetricName | undefined>(
    undefined,
  );
  const [hasPendingMetricChange, setHasPendingMetricChange] = useState(false);
  const [discardNonce, setDiscardNonce] = useState(0);
  const [markCleanNonce, setMarkCleanNonce] = useState(0);
  const [shouldApplyPendingMetric, setShouldApplyPendingMetric] =
    useState(false);
  /** Metrics that have been successfully saved in this session (or pre-exist from API). */
  const [savedMetrics, setSavedMetrics] = useState<Set<MetricName>>(
    () => new Set(initialMetric ? [initialMetric] : []),
  );

  useEffect(() => {
    if (initialMetric) return;
    if (!allowedMetrics || allowedMetrics.length !== 1) return;
    setSelectedMetric((prev) => prev ?? allowedMetrics[0]);
  }, [allowedMetrics, initialMetric]);

  const resolvedMetric = selectedMetric;

  const quranGoalType = useMemo(() => {
    if (!resolvedMetric) return null;
    return getQuranGoalTypeForMetric(
      variant === "memorization" ? "memorization" : "others",
      resolvedMetric,
    );
  }, [resolvedMetric, variant]);

  const { data: goalDetail, isLoading: loadingDetail } = useGetQuranGoalByType(
    quranGoalType,
    { enabled: isOpen && !!quranGoalType },
  );

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

  const needsReference =
    isOpen &&
    (resolvedMetric === "surah" ||
      resolvedMetric === "hizb" ||
      resolvedMetric === "juz");

  const surahOptions = useMemo(
    () => mergeSurahOptionsWithDetail(surahReference, goalDetail),
    [surahReference, goalDetail],
  );
  const hizbOptions = useMemo(
    () => mergeHizbOptionsWithDetail(hizbReference, goalDetail),
    [hizbReference, goalDetail],
  );
  const juzOptions = useMemo(() => {
    const merged = mergeJuzOptionsWithDetail(juzReference, goalDetail);
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
  }, [juzReference, goalDetail]);
  const initialSelectedSurahs = useMemo(
    () => getSelectedSurahIdsFromDetail(goalDetail),
    [goalDetail],
  );
  const initialSurahSettings = useMemo(
    () => getSurahSettingsFromDetail(goalDetail),
    [goalDetail],
  );
  const initialJuzRange = useMemo(
    () => getJuzRangeFromDetail(goalDetail),
    [goalDetail],
  );
  const initialSelectedJuzs = useMemo(
    () => getSelectedJuzIdsFromDetail(goalDetail),
    [goalDetail],
  );
  const initialSelectedHizbs = useMemo(
    () => getSelectedHizbIdsFromDetail(goalDetail),
    [goalDetail],
  );
  const initialCompletion = useMemo(
    () => getCompletionFromDetail(goalDetail),
    [goalDetail],
  );

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
    setIsMetricDirty(false);
  }, []);

  // Discard local edits first (while metric still expanded), then collapse/switch
  useEffect(() => {
    if (!shouldApplyPendingMetric) return;
    applyMetricChange(pendingMetric);
    setShouldApplyPendingMetric(false);
    setHasPendingMetricChange(false);
  }, [
    shouldApplyPendingMetric,
    pendingMetric,
    applyMetricChange,
    discardNonce,
  ]);

  const handlePressMetrix = (item: IItem) => {
    const nextMetric: MetricName | undefined =
      selectedMetric === item.name ? undefined : item.name;
    const leavingExpanded =
      !!selectedMetric &&
      (nextMetric === undefined || nextMetric !== selectedMetric);

    if (leavingExpanded && isMetricDirty) {
      setPendingMetric(nextMetric);
      setHasPendingMetricChange(true);
      setUnsavedModalVisible(true);
      return;
    }

    applyMetricChange(nextMetric);
  };

  const handleConfirmLeave = () => {
    setUnsavedModalVisible(false);
    setDiscardNonce((n) => n + 1);
    if (hasPendingMetricChange) {
      setShouldApplyPendingMetric(true);
    }
  };

  const handleCancelLeave = () => {
    setUnsavedModalVisible(false);
    setHasPendingMetricChange(false);
  };

  const isLoadingOptions =
    loadingDetail ||
    (needsReference && isReferenceLoading && surahReference.length === 0);

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
                  onMetricChange={onMetricsChange}
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
                  onDirtyChange={isActiveMetric ? setIsMetricDirty : undefined}
                  discardNonce={isActiveMetric ? discardNonce : 0}
                  markCleanNonce={isActiveMetric ? markCleanNonce : 0}
                  onNestedScrollActiveChange={
                    isActiveMetric ? onNestedScrollActiveChange : undefined
                  }
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
              disabled={isSaving || !resolvedMetric}
              onPress={(markSaved, markFailed) => {
                const handleSaved = () => {
                  markSaved?.();
                  setTimeout(() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setIsOpen(false);
                  }, 2000);
                };
                if (onSave && resolvedMetric) {
                  onSave(
                    { metric: resolvedMetric },
                    () => {
                      setSavedMetrics((prev) => {
                        const next = new Set(prev);
                        next.add(resolvedMetric);
                        return next;
                      });
                      handleSaved();
                    },
                    markFailed,
                  );
                  setMarkCleanNonce((n) => n + 1);
                  setIsMetricDirty(false);
                  return;
                }
                markFailed();
              }}
            />
          </View>
        </View>
      )}

      <WarningModal
        visible={unsavedModalVisible}
        title="UNSAVED CHANGES"
        message="Are you sure you want to leave this page? Your changes will not be saved."
        primaryButtonText="Leave"
        secondaryButtonText="Cancel"
        primaryButtonVariant="white"
        primaryButtonStyle={styles.leaveButton}
        primaryButtonTextStyle={styles.leaveButtonText}
        secondaryButtonTextStyle={styles.cancelButtonText}
        onPrimaryPress={handleConfirmLeave}
        onSecondaryPress={handleCancelLeave}
        onBackdropPress={handleCancelLeave}
      />
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
  leaveButton: {
    borderColor: Colors.light.red,
  },
  leaveButtonText: {
    color: Colors.light.red,
  },
  cancelButtonText: {
    color: Colors.light.green,
  },
});
