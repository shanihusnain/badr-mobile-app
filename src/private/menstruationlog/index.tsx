import React, { useState } from "react";
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useSharedValue } from "react-native-reanimated";
import moment from "moment-hijri";
import { MenstruationCalendar } from "@/components/molecules/MenstruationCalendar";
import BackButton from "@/components/atoms/Backbutton";
import { SwitchButton } from "@/components/atoms/SwitchButton";
import { Colors } from "@/constants/theme";
import createStyles from "./style";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

export default function MenstruationLog() {
  const styles = createStyles();
  const router = useRouter();
  const isMenstruating = useSharedValue(false);
  const isStillMenstruating = useSharedValue(false);
  const [menstruating, setMenstruating] = useState(false);
  const [stillMenstruating, setStillMenstruating] = useState(false);
  const [selectedStartTime, setSelectedStartTime] = useState<string>("Before Fajr");
  const [selectedEndTime, setSelectedEndTime] = useState<string>("Before Fajr");

  // Start Date picker state
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [pickerDate, setPickerDate] = useState(today);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateExplicitlyPicked, setDateExplicitlyPicked] = useState(false);

  // End Date picker state
  const [selectedEndDate, setSelectedEndDate] = useState(todayString);
  const [endPickerDate, setEndPickerDate] = useState(today);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [endDateExplicitlyPicked, setEndDateExplicitlyPicked] = useState(false);

  // Derived display texts for the buttons
  const todayButtonLabel = dateExplicitlyPicked
    ? moment(selectedDate, "YYYY-MM-DD").format("MMM DD")
    : "Today";

  const endDateButtonLabel = endDateExplicitlyPicked
    ? moment(selectedEndDate, "YYYY-MM-DD").format("MMM DD")
    : "Today";

  // Calendar display strings
  const startMoment = moment(selectedDate, "YYYY-MM-DD");
  const endMoment = startMoment.clone().add(27, "days");
  const gregorianRange = `${startMoment.format("MMM DD").toUpperCase()} - ${endMoment.format("MMM DD, YYYY").toUpperCase()}`;
  const islamicMonthNames = [
    "Muh.", "Saf.", "Rab. I", "Rab. II", "Jum. I", "Jum. II",
    "Raj.", "Sha.", "Ram.", "Shaw.", "Dhu al-Qa.", "Dhu al-Hi.",
  ];
  const islamicRange = `${islamicMonthNames[startMoment.iMonth()]} - ${islamicMonthNames[endMoment.iMonth()]} ${startMoment.iYear()}`;

  const handleTodayPress = () => {
    if (!menstruating) return;
    setShowDatePicker((prev) => !prev);
  };

  const handleEndDatePress = () => {
    if (!menstruating || stillMenstruating) return;
    setShowEndDatePicker((prev) => !prev);
  };

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }
    if (date) {
      const ds = date.toISOString().split("T")[0];
      setPickerDate(date);
      setSelectedDate(ds);
      setDateExplicitlyPicked(true);
      setShowDatePicker(false);
    }
  };

  const handleEndDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === "dismissed") {
      setShowEndDatePicker(false);
      return;
    }
    if (date) {
      const ds = date.toISOString().split("T")[0];
      setEndPickerDate(date);
      setSelectedEndDate(ds);
      setEndDateExplicitlyPicked(true);
      setShowEndDatePicker(false);
    }
  };

  const isEndDateActive = menstruating && !stillMenstruating;

  // Format question texts: replace 'today' with selected date if explicitly picked
  const startQuestionText = dateExplicitlyPicked
    ? `When did it start ${moment(selectedDate, "YYYY-MM-DD").format("MMM D")}?`
    : "When did it start today?";

  const endQuestionText = endDateExplicitlyPicked
    ? `When did it end ${moment(selectedEndDate, "YYYY-MM-DD").format("MMM D")}?`
    : "When did it end today?";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <BackButton onPress={() => router.back()} />
          </View>
          <Text style={styles.headerTitle}>LOG MENSTRUATION</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Info Container */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Log your menstruation period to update your goals. Exempt acts of worship will be automatically adjusted, ensuring your progress stays accurate and fair.
          </Text>
        </View>

        {/* Your Menstruation Period Section */}
        <View style={styles.periodHeaderContainer}>
          <Text style={styles.periodHeaderText}>YOUR MENSTRUATION PERIOD</Text>
          <View style={styles.periodHeaderLine} />
        </View>

        {/* I'M MENSTRUATING Section */}
        <View style={styles.menstruatingContainer}>
          <Text style={[styles.menstruatingText, { color: menstruating ? Colors.light.white : Colors.light.subtext }]}>
            I'M MENSTRUATING
          </Text>
          <SwitchButton
            value={isMenstruating}
            onPress={() => {
              const newValue = !isMenstruating.value;
              isMenstruating.value = newValue;
              setMenstruating(newValue);
              if (!newValue) {
                // Reset everything when menstruating is off
                setShowDatePicker(false);
                setDateExplicitlyPicked(false);
                setSelectedDate(todayString);
                setPickerDate(today);

                setShowEndDatePicker(false);
                setEndDateExplicitlyPicked(false);
                setSelectedEndDate(todayString);
                setEndPickerDate(today);

                // Switched off automatically & disabled
                isStillMenstruating.value = false;
                setStillMenstruating(false);
              }
            }}
            style={styles.switchButton}
          />
        </View>

        {/* Start Date Section */}
        <View style={styles.startDateContainer}>
          <Text style={[styles.startDateText, { color: menstruating ? Colors.light.white : Colors.light.subtext }]}>
            Start Date
          </Text>
          <TouchableOpacity
            onPress={handleTodayPress}
            activeOpacity={menstruating ? 0.7 : 1}
            disabled={!menstruating}
          >
            <View
              style={[
                dateExplicitlyPicked && menstruating
                  ? styles.todayContainerActive
                  : styles.todayContainer,
                !menstruating && { opacity: 0.4 },
              ]}
            >
              <Text
                style={[
                  styles.todayText,
                  dateExplicitlyPicked && menstruating && { color: Colors.light.white },
                ]}
              >
                {todayButtonLabel}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Start Date Picker — shown inline under Start Date row when toggled */}
        {showDatePicker && menstruating && (
          <DateTimePicker
            value={pickerDate}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "calendar"}
            maximumDate={today}
            onChange={handleDateChange}
            themeVariant="dark"
            style={{ alignSelf: "center" }}
          />
        )}

        {/* When did it start? */}
        {menstruating && (
          <View style={styles.startTimesContainer}>
            <Text style={styles.startTimeQuestionText}>{startQuestionText}</Text>
            <View style={styles.radioOptionsList}>
              {["Before Fajr", "Before Duhr", "Before Asr", "Before Maghrib", "Before Isha"].map((time) => {
                const isSelected = selectedStartTime === time;
                return (
                  <TouchableOpacity
                    key={time}
                    style={styles.radioOption}
                    onPress={() => setSelectedStartTime(time)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.radioOuter}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.radioText}>{time}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Calendar Section */}
        <View style={styles.calendarSection}>
          <View style={styles.calendarContainer}>
            <View style={styles.dateLabelsContainer}>
              <Text style={[styles.gregorianDateText, { color: menstruating ? Colors.light.white : Colors.light.subtext }]}>
                {gregorianRange}
              </Text>
              <Text style={[styles.islamicDateText, { color: menstruating ? Colors.light.white : Colors.light.subtext }]}>
                {islamicRange}
              </Text>
            </View>
            <MenstruationCalendar
              currentDate={selectedDate}
              selectedDate={selectedDate}
              onDayPress={(dateString) => setSelectedDate(dateString)}
              isMenstruating={menstruating}
            />
          </View>
        </View>

        {/* I'M STILL MENSTRUATING Section */}
        <View style={styles.menstruatingContainer}>
          <Text style={[styles.menstruatingText, { color: menstruating ? Colors.light.white : Colors.light.subtext }]}>
            I'M STILL MENSTRUATING
          </Text>
          <SwitchButton
            value={isStillMenstruating}
            onPress={() => {
              if (!menstruating) return; // Do not perform any function when upper switch is off
              const newValue = !isStillMenstruating.value;
              isStillMenstruating.value = newValue;
              setStillMenstruating(newValue);
              if (newValue) {
                // If STILL menstruating is turned ON, hide/reset End Date pickers
                setShowEndDatePicker(false);
                setEndDateExplicitlyPicked(false);
                setSelectedEndDate(todayString);
                setEndPickerDate(today);
              }
            }}
            style={[styles.switchButton, !menstruating && { opacity: 0.4 }]}
          />
        </View>

        {/* End Date Section */}
        <View style={styles.startDateContainer}>
          <Text style={[styles.startDateText, { color: isEndDateActive ? Colors.light.white : Colors.light.subtext }]}>
            End Date
          </Text>
          <TouchableOpacity
            onPress={handleEndDatePress}
            activeOpacity={isEndDateActive ? 0.7 : 1}
            disabled={!isEndDateActive}
          >
            <View
              style={[
                endDateExplicitlyPicked && isEndDateActive
                  ? styles.todayContainerActive
                  : styles.todayContainer,
                !isEndDateActive && { opacity: 0.4 },
              ]}
            >
              <Text
                style={[
                  styles.todayText,
                  endDateExplicitlyPicked && isEndDateActive && { color: Colors.light.white },
                ]}
              >
                {endDateButtonLabel}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* End Date Picker — shown inline under End Date row when toggled */}
        {showEndDatePicker && isEndDateActive && (
          <DateTimePicker
            value={endPickerDate}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "calendar"}
            maximumDate={today}
            onChange={handleEndDateChange}
            themeVariant="dark"
            style={{ alignSelf: "center" }}
          />
        )}

        {/* When did it end? */}
        {isEndDateActive && (
          <View style={styles.startTimesContainer}>
            <Text style={styles.startTimeQuestionText}>{endQuestionText}</Text>
            <View style={styles.radioOptionsList}>
              {["Before Fajr", "Before Duhr", "Before Asr", "Before Maghrib", "Before Isha"].map((time) => {
                const isSelected = selectedEndTime === time;
                return (
                  <TouchableOpacity
                    key={time}
                    style={styles.radioOption}
                    onPress={() => setSelectedEndTime(time)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.radioOuter}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.radioText}>{time}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.8}
          onPress={() => {
            // Placeholder save action
            router.back();
          }}
        >
          <Text style={styles.saveButtonText}>SAVE</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
