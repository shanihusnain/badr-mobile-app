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

export const QuranRecitationGoalSelection = ({
  title,
  onMetricsChange,
  variant,
}: {
  title: string;
  onMetricsChange?: (payload: { metric: string; value: any }) => void;
  variant?: "memorization" | "others";
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleToggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  const [selectedMetric, setSelectedMetric] = useState<
    "surah" | "juz" | "completion" | "hizb"
  >();
  interface IItem {
    id: number;
    name: "surah" | "juz" | "completion" | "hizb";
    title: string;
  }
  const memorizationMetrices = [
    {
      id: 1,
      name: "surah",
      title: "Surah",
    },
    {
      id: 2,
      name: "hizb",
      title: "Hizb",
    },
    {
      id: 3,
      name: "juz",
      title: "Juz",
    },
  ];

  const otherMetrices = [
    {
      id: 1,
      name: "surah",
      title: "Surah",
    },
    {
      id: 2,
      name: "juz",
      title: "Juz",
    },
    {
      id: 3,
      name: "hizb",
      title: "Hizb",
    },
    {
      id: 4,
      name: "completion",
      title: "Completion (Khatma)",
    },
  ];
  const metricesDecider = () => {
    return variant === "memorization" ? memorizationMetrices : otherMetrices;
  };

  const handlePressMetrix = (item: IItem) => {
    console.log("Selected metric:", item.name);
    setSelectedMetric(item.name);
  };
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
              />
            );
          })}
        </>
      )}
      <TopSpace top={16} />
      <PrimaryButton
        text="Save"
        onPress={() => {
          // Handle save selection logic here
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
