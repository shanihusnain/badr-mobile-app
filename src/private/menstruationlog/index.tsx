import React, { useState } from "react";
import { View, Text, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSharedValue } from "react-native-reanimated";
import moment from "moment-hijri";
import { CalendarGrid } from "@/components/molecules/CalendarGrid";
import BackButton from "@/components/atoms/Backbutton";
import { SwitchButton } from "@/components/atoms/SwitchButton";
import createStyles from "./style";

export default function MenstruationLog() {
  const styles = createStyles();
  const router = useRouter();
  const isMenstruating = useSharedValue(false);
  const isStillMenstruating = useSharedValue(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Calculate date range (28 days from selected date)
  const startDate = moment(selectedDate, "YYYY-MM-DD");
  const endDate = startDate.clone().add(27, "days");

  // Format Gregorian date range
  const gregorianRange = `${startDate.format("MMM DD").toUpperCase()} - ${endDate.format("MMM DD, YYYY").toUpperCase()}`;

  // Format Islamic date range
  const islamicStart = startDate.format("iYYYY iM iD");
  const islamicEnd = endDate.format("iYYYY iM iD");
  const islamicMonthNames = ["Muh.", "Saf.", "Rab. I", "Rab. II", "Jum. I", "Jum. II", "Raj.", "Sha.", "Ram.", "Shaw.", "Dhu al-Qa.", "Dhu al-Hi."];
  const islamicRange = `${islamicMonthNames[startDate.iMonth()]} - ${islamicMonthNames[endDate.iMonth()]} ${startDate.iYear()}`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

        {/* I'm Menstruating Section */}
        <View style={styles.menstruatingContainer}>
          <Text style={styles.menstruatingText}>I'M MENSTRUATING</Text>
          <SwitchButton
            value={isMenstruating}
            onPress={() => {
              isMenstruating.value = !isMenstruating.value;
            }}
            style={styles.switchButton}
          />
        </View>

        {/* Start Date Section */}
        <View style={styles.startDateContainer}>
          <Text style={styles.startDateText}>Start Date</Text>
          <View style={styles.todayContainer}>
            <Text style={styles.todayText}>Today</Text>
          </View>
        </View>

        {/* Calendar Section */}
        <View style={styles.calendarSection}>
          <View style={styles.calendarContainer}>
            <View style={styles.dateLabelsContainer}>
              <Text style={styles.gregorianDateText}>{gregorianRange}</Text>
              <Text style={styles.islamicDateText}>{islamicRange}</Text>
            </View>
            <CalendarGrid
              mode="dob"
              currentDate={selectedDate}
              selectedDate={selectedDate}
              onDayPress={(dateString) => setSelectedDate(dateString)}
            />
          </View>
        </View>

        {/* End Date Section */}
        <View style={styles.startDateContainer}>
          <Text style={styles.startDateText}>End Date</Text>
          <View style={styles.todayContainer}>
            <Text style={styles.todayText}>Today</Text>
          </View>
        </View>

        {/* I'm Still Menstruating Section */}
        <View style={styles.menstruatingContainer}>
          <Text style={styles.menstruatingText}>I'M STILL MENSTRUATING</Text>
          <SwitchButton
            value={isStillMenstruating}
            onPress={() => {
              isStillMenstruating.value = !isStillMenstruating.value;
            }}
            style={styles.switchButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
