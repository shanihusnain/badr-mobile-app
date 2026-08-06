import { LayoutAnimation, StyleSheet, Text, View } from "react-native";
import { GoalSelectionOpenCloseButton } from "../GoalSelectionOpenCloseButton";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { Divider } from "../../atoms/Divider";
import { TopSpace } from "../../atoms/TopSpace";
import { MetricSelectionComponent } from "./MetricSelectionComponent";
import PrimaryButton from "@/components/atoms/Primary-button";
import WarningModal from "@/components/atoms/WarningModal";
import { useTranslation } from "react-i18next";
import { useGetQuranGoalByType } from "@/src/api/queries/useGetQuranGoalByType";
import { useDeleteQuranGoalSingleMetric } from "@/src/api/mutations/useDeleteQuranGoalSingleMetric";
import {
  getCompletionFromDetail,
  getJuzRangeFromDetail,
  getQuranGoalTypeForMetric,
  getSelectedHizbIdsFromDetail,
  getSelectedSurahIdsFromDetail,
  getSurahSettingsFromDetail,
  mergeHizbOptionsWithDetail,
  mergeSurahOptionsWithDetail,
  type QuranHizbOption,
  type QuranSurahOption,
} from "@/src/utils/quranGoalMap";

type MetricName = "surah" | "juz" | "completion" | "hizb";

export type QuranRecitationGoalSelectionProps = {
  title: string;
  onMetricsChange?: (payload: { metric: string; value: any }) => void;
  variant?: "memorization" | "others";
  onSave?: (payload: {
    metric: "surah" | "juz" | "completion" | "hizb";
  }) => void;
  initialMetric?: "surah" | "juz" | "completion" | "hizb";
  allowedMetrics?: Array<"surah" | "juz" | "completion" | "hizb">;
  openOnMount?: boolean;
  /** From parent GET .../quran-goals `reference` (single fetch in GoalPlannerSheet). */
  surahReference?: QuranSurahOption[];
  hizbReference?: QuranHizbOption[];
  isReferenceLoading?: boolean;
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
  isReferenceLoading = false,
}: QuranRecitationGoalSelectionProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(!!openOnMount);
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
    <View style={styles.wrapper}>
      <GoalSelectionOpenCloseButton
        isOpen={isOpen}
        toggleDropdown={handleToggleDropdown}
        title={title}
      />
      {isOpen && (
        <>
          <Divider />
          <TopSpace top={16} />
          {(variant === "memorization" || variant === "others") && (
            <Text style={styles.selectMoreText}>
              You can select more than one.
            </Text>
          )}
          {metricesDecider().map((item: IItem) => {
            const isActiveMetric = resolvedMetric === item.name;
            return (
              <MetricSelectionComponent
                key={item.id}
                item={item}
                handleMetricPress={() => handlePressMetrix(item)}
                selectedMetric={resolvedMetric}
                onMetricChange={onMetricsChange}
                variant={variant}
                surahOptions={isActiveMetric ? surahOptions : undefined}
                hizbOptions={isActiveMetric ? hizbOptions : undefined}
                initialSelectedSurahs={
                  isActiveMetric ? initialSelectedSurahs : undefined
                }
                initialSurahSettings={
                  isActiveMetric ? initialSurahSettings : undefined
                }
                initialJuzRange={isActiveMetric ? initialJuzRange : undefined}
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
              />
            );
          })}
        </>
      )}
      <TopSpace top={16} />
      <PrimaryButton
        text={t("monthlyGoalPlanner.save")}
        style={{
          width: "100%",
        }}
        onPress={() => {
          if (onSave && resolvedMetric) onSave({ metric: resolvedMetric });
          setMarkCleanNonce((n) => n + 1);
          setIsMetricDirty(false);
        }}
      />

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
  wrapper: {
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
  },
  selectMoreText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 12,
    fontWeight: "400",
    opacity: 0.85,
    marginBottom: 12,
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
