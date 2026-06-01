import {
  LayoutAnimation,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GoalSelectionOpenCloseButton } from "./GoalSelectionOpenCloseButton";
import { Fragment, useState } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Colors } from "@/constants/theme";
import { Divider } from "../atoms/Divider";
import { TopSpace } from "../atoms/TopSpace";
import { fonts } from "@/assets/fonts";

export const QuranRecitationGoalSelection = ({ title }: { title: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleToggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };
  const [selectedMetrix, setSelectedMetrix] = useState<
    "surah" | "juz" | "completion"
  >();

  const [selectedMetric, setSelectedMetric] = useState<
    "surah" | "juz" | "completion"
  >();
  interface IItem {
    id: number;
    name: "surah" | "juz" | "completion";
  }
  const matrices: IItem[] = [
    {
      id: 1,
      name: "surah",
    },
    {
      id: 2,
      name: "juz",
    },
    {
      id: 3,
      name: "completion",
    },
  ];
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
          {matrices.map((item: IItem) => {
            return (
              <Fragment key={item?.id}>
                <Pressable
                  onPress={() => handlePressMetrix(item)}
                  style={styles.metrixWrapper}
                >
                  <Text style={styles.metrixName}>{item.name}</Text>

                  <AntDesign
                    name="plus-circle"
                    color={Colors.light.white}
                    size={20}
                  />
                </Pressable>
                <TopSpace top={20} />
              </Fragment>
            );
          })}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  wrapper: {
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
  },
});
