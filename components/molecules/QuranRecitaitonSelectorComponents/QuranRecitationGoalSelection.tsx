import { LayoutAnimation, StyleSheet, View } from "react-native";
import { GoalSelectionOpenCloseButton } from "../GoalSelectionOpenCloseButton";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Colors } from "@/constants/theme";
import { Divider } from "../../atoms/Divider";
import { TopSpace } from "../../atoms/TopSpace";
import { MetricSelectionComponent } from "./MetricSelectionComponent";
import PrimaryButton from "@/components/atoms/Primary-button";
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

  const [selectedMetric, setSelectedMetric] = useState<
    "surah" | "juz" | "completion" | "hizb" | undefined
  >(initialMetric);

  useEffect(() => {
    if (!selectedMetric && allowedMetrics && allowedMetrics.length === 1) {
      setSelectedMetric(allowedMetrics[0]);
    }
  }, [allowedMetrics, selectedMetric]);

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
    name: "surah" | "juz" | "completion" | "hizb";
    title: string;
  }
  const memorizationMetrices = [
    {
      id: 1,
      name: "juz" as const,
      title: t("monthlyGoalPlanner.reviewLabels.juz"),
    },
    {
      id: 2,
      name: "hizb" as const,
      title: t("monthlyGoalPlanner.reviewLabels.hizb"),
    },
    {
      id: 3,
      name: "surah" as const,
      title: t("monthlyGoalPlanner.reviewLabels.surah"),
    },
  ];
  const otherMetrices = [
    {
      id: 1,
      name: "surah" as const,
      title: t("monthlyGoalPlanner.reviewLabels.surah"),
    },
    {
      id: 2,
      name: "completion" as const,
      title: t("monthlyGoalPlanner.quranMetrics.completionKhatma"),
    },
    {
      id: 3,
      name: "juz" as const,
      title: t("monthlyGoalPlanner.reviewLabels.juz"),
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

  const handlePressMetrix = (item: IItem) => {
    setSelectedMetric(item.name);
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
          {metricesDecider().map((item: any) => {
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
        }}
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
});
