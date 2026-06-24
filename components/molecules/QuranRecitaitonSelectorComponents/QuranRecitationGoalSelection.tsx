import {
  LayoutAnimation,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GoalSelectionOpenCloseButton } from "../GoalSelectionOpenCloseButton";
import { Fragment, useState } from "react";
import { Colors } from "@/constants/theme";
import { Divider } from "../../atoms/Divider";
import { TopSpace } from "../../atoms/TopSpace";
import { MetricSelectionComponent } from "./MetricSelectionComponent";
import PrimaryButton from "@/components/atoms/Primary-button";
import { useTranslation } from "react-i18next";

export const QuranRecitationGoalSelection = ({
  title,
  onMetricsChange,
  variant,
  onSave,
  initialMetric,
  allowedMetrics,
  openOnMount,
}: {
  title: string;
  onMetricsChange?: (payload: { metric: string; value: any }) => void;
  variant?: "memorization" | "others";
  onSave?: () => void;
  initialMetric?: "surah" | "juz" | "completion" | "hizb";
  allowedMetrics?: Array<"surah" | "juz" | "completion" | "hizb">;
  openOnMount?: boolean;
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(!!openOnMount);
  const handleToggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  const [selectedMetric, setSelectedMetric] = useState<
    "surah" | "juz" | "completion" | "hizb" | undefined
  >(initialMetric);
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
  // For recitation we prefer showing Surah, Completion (Khatma), then Juz
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
      // m.name is a string in the inferred type; cast to the specific union so includes check types correctly
      allowedMetrics.includes(
        m.name as "surah" | "juz" | "completion" | "hizb",
      ),
    );
  };

  const handlePressMetrix = (item: IItem) => {
    console.log("Selected metric:", item.name);
    setSelectedMetric(item.name);
  };

  // If allowedMetrics contains only one option and no initialMetric provided, auto-select it
  if (!selectedMetric && allowedMetrics && allowedMetrics.length === 1) {
    setSelectedMetric(allowedMetrics[0]);
  }
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
            return (
              <MetricSelectionComponent
                key={item.id}
                item={item}
                handleMetricPress={() => handlePressMetrix(item)}
                selectedMetric={selectedMetric}
                onMetricChange={onMetricsChange}
                variant={variant}
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
          if (onSave) onSave();
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
