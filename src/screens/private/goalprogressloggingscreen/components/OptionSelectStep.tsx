import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/theme";

interface OptionSelectStepProps<T extends string> {
  options: T[];
  selectedValue: T;
  onSelectValue: (value: T) => void;
  getLabel: (option: T) => string;
  radioInnerColor?: string;
  styles: any;
}

interface OptionItemProps<T extends string> {
  option: T;
  isSelected: boolean;
  onSelectValue: (value: T) => void;
  getLabel: (option: T) => string;
  radioInnerColor: string;
  styles: any;
}

const OptionItem = React.memo(function OptionItem<T extends string>({
  option,
  isSelected,
  onSelectValue,
  getLabel,
  radioInnerColor,
  styles,
}: OptionItemProps<T>) {
  const handlePress = React.useCallback(() => {
    onSelectValue(option);
  }, [onSelectValue, option]);

  return (
    <TouchableOpacity
      style={styles.timingOption}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.radioOuter,
          isSelected && styles.radioOuterSelected,
        ]}
      >
        {isSelected && (
          <View
            style={[
              styles.radioInner,
              { backgroundColor: radioInnerColor },
            ]}
          />
        )}
      </View>
      <Text style={styles.timingLabel}>{getLabel(option)}</Text>
    </TouchableOpacity>
  );
}) as <T extends string>(props: OptionItemProps<T>) => React.ReactElement;

export function OptionSelectStep<T extends string>({
  options,
  selectedValue,
  onSelectValue,
  getLabel,
  radioInnerColor = Colors.light.white,
  styles,
}: OptionSelectStepProps<T>) {
  return (
    <View style={styles.timingRow}>
      {options.map((option) => (
        <OptionItem
          key={option}
          option={option}
          isSelected={selectedValue === option}
          onSelectValue={onSelectValue}
          getLabel={getLabel}
          radioInnerColor={radioInnerColor}
          styles={styles}
        />
      ))}
    </View>
  );
}
