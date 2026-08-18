import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";

interface StartTimeStepProps {
  startHour: string;
  setStartHour: (h: string) => void;
  startMinute: string;
  setStartMinute: (m: string) => void;
  startPeriod: "am" | "pm";
  setStartPeriod: (p: "am" | "pm") => void;
  isPeriodDropdownOpen: boolean;
  setIsPeriodDropdownOpen: (open: boolean) => void;
  styles: any;
}

export const StartTimeStep: React.FC<StartTimeStepProps> = ({
  startHour,
  setStartHour,
  startMinute,
  setStartMinute,
  startPeriod,
  setStartPeriod,
  isPeriodDropdownOpen,
  setIsPeriodDropdownOpen,
  styles,
}) => {
  const [isHourFocused, setIsHourFocused] = React.useState(false);
  const [isMinuteFocused, setIsMinuteFocused] = React.useState(false);

  return (
    <View style={styles.timePickerContainer}>
      <View style={styles.timePickerRow}>
        {/* Hour Input */}
        <TextInput
          style={[
            styles.timeInput,
            isHourFocused && { borderColor: Colors.light.white },
          ]}
          value={startHour}
          onChangeText={(text) => {
            const cleaned = text.replace(/[^0-9]/g, "");
            if (cleaned.length <= 2) {
              setStartHour(cleaned);
            }
          }}
          onFocus={() => setIsHourFocused(true)}
          onBlur={() => setIsHourFocused(false)}
          keyboardType="number-pad"
          maxLength={2}
          placeholder="06"
          placeholderTextColor={Colors.light.subtext}
        />

        <Text style={styles.timeSeparator}>:</Text>

        {/* Minute Input */}
        <TextInput
          style={[
            styles.timeInput,
            isMinuteFocused && { borderColor: Colors.light.white },
          ]}
          value={startMinute}
          onChangeText={(text) => {
            const cleaned = text.replace(/[^0-9]/g, "");
            if (cleaned.length <= 2) {
              setStartMinute(cleaned);
            }
          }}
          onFocus={() => setIsMinuteFocused(true)}
          onBlur={() => setIsMinuteFocused(false)}
          keyboardType="number-pad"
          maxLength={2}
          placeholder="15"
          placeholderTextColor={Colors.light.subtext}
        />

        {/* Period Dropdown Selector */}
        <View style={styles.dropdownWrapper}>
          <TouchableOpacity
            style={[
              styles.periodSelector,
              isPeriodDropdownOpen && { borderColor: Colors.light.white },
            ]}
            onPress={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
            activeOpacity={0.8}
          >
            <Text style={styles.periodText}>{startPeriod}</Text>
            <Ionicons name="chevron-down" size={14} color={Colors.light.white} style={{ marginTop: 2 }} />
          </TouchableOpacity>

          {isPeriodDropdownOpen && (
            <View style={styles.periodDropdown}>
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setStartPeriod(startPeriod === "am" ? "pm" : "am");
                  setIsPeriodDropdownOpen(false);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.dropdownRadioOuter}>
                  <View style={styles.dropdownRadioInner} />
                </View>
                <Text style={styles.dropdownOptionText}>
                  {startPeriod === "am" ? "pm" : "am"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

interface DurationStepProps {
  durationHours: string;
  setDurationHours: (h: string) => void;
  durationMinutes: string;
  setDurationMinutes: (m: string) => void;
  styles: any;
}

export const DurationStep: React.FC<DurationStepProps> = ({
  durationHours,
  setDurationHours,
  durationMinutes,
  setDurationMinutes,
  styles,
}) => {
  const [isHourFocused, setIsHourFocused] = React.useState(false);
  const [isMinuteFocused, setIsMinuteFocused] = React.useState(false);

  return (
    <View style={styles.timePickerContainer}>
      <View style={styles.timePickerRow}>
        {/* Hour Input */}
        <TextInput
          style={[
            styles.timeInput,
            isHourFocused && { borderColor: Colors.light.white },
          ]}
          value={durationHours}
          onChangeText={(text) => {
            const cleaned = text.replace(/[^0-9]/g, "");
            if (cleaned.length <= 2) {
              setDurationHours(cleaned);
            }
          }}
          onFocus={() => setIsHourFocused(true)}
          onBlur={() => setIsHourFocused(false)}
          keyboardType="number-pad"
          maxLength={2}
          placeholder="0"
          placeholderTextColor={Colors.light.subtext}
        />
        <Text style={styles.timeUnitLabel}>h</Text>

        {/* Minute Input */}
        <TextInput
          style={[
            styles.timeInput,
            isMinuteFocused && { borderColor: Colors.light.white },
          ]}
          value={durationMinutes}
          onChangeText={(text) => {
            const cleaned = text.replace(/[^0-9]/g, "");
            if (cleaned.length <= 2) {
              setDurationMinutes(cleaned);
            }
          }}
          onFocus={() => setIsMinuteFocused(true)}
          onBlur={() => setIsMinuteFocused(false)}
          keyboardType="number-pad"
          maxLength={2}
          placeholder="0"
          placeholderTextColor={Colors.light.subtext}
        />
        <Text style={styles.timeUnitLabel}>m</Text>
      </View>
    </View>
  );
};
