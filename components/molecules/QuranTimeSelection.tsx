import { globalStyles } from "@/src/globalstyles/globalstyles";
import {
  LayoutAnimation,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { GoalSelectionOpenCloseButton } from "./GoalSelectionOpenCloseButton";
import { Divider } from "../atoms/Divider";
import { TopSpace } from "../atoms/TopSpace";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { useState } from "react";

export const QuranTimeSelection = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");
  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };
  return (
    <View style={styles.container}>
      <GoalSelectionOpenCloseButton
        isOpen={isOpen}
        title={title}
        toggleDropdown={toggleDropdown}
      />
      {isOpen && (
        <View>
          <Divider />
          <TopSpace top={16} />
          <Text style={styles.header}>Enter upto 280 hours.</Text>
          <TopSpace top={12} />
          <View style={styles.outerRow}>
            {/* group both input and description so they center together */}
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={Colors.light.icon}
              style={{
                borderColor:
                  inputValue && inputValue.trim().length > 0
                    ? Colors.light.green
                    : Colors.light.white,
                backgroundColor:
                  inputValue && inputValue.trim().length > 0
                    ? Colors.light.green
                    : "transparent",
                borderWidth: 1,
                width: 60,
                alignItems: "center",
                textAlign: "center",
                justifyContent: "center",
                borderRadius: 8,
                color: Colors.light.white,
                fontSize: 12,
                fontWeight: "400",
                fontFamily: fonts.primary.regular,
              }}
            />

            <Text style={styles.descriptionText}>{description}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  descriptionText: {
    color: Colors.light.white,
    fontSize: 12,
    fontWeight: "400",
    fontFamily: fonts.primary.regular,
    textAlign: "center",
  },
  innerRow: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
  },
  outerRow: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    flexDirection: "row",
  },
  header: {
    fontSize: 12,
    color: Colors.light.white,
    opacity: 0.8,
    fontWeight: "400",
    fontFamily: fonts.primary.regular,
    textAlign: "left",
  },
  container: {
    ...globalStyles.goalSelectionWrapper,
    alignItems: "flex-start",
  },
  textInput: {
    borderWidth: 1,
    width: 60,
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
    borderRadius: 8,
    color: Colors.light.white,
    fontSize: 12,
    fontWeight: "400",
    fontFamily: fonts.primary.regular,
  },
});
