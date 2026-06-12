/**
 * calendarexample — verification screen showing all 5 calendar components.
 */

import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { ScrollView, StyleSheet, Text } from "react-native";
import DOBCalendar from "@/components/molecules/DOBCalendar";
import RamadanCalendar from "@/components/molecules/RamadanCalendar";
import DawoodCalendar from "@/components/molecules/DawoodCalendar";
import MonThuCalendar from "@/components/molecules/MonThuCalendar";
import WhiteDaysCalendar from "@/components/molecules/WhiteDaysCalendar";

export const CalendarExample = () => (
  <ScrollView
    style={styles.container}
    contentContainerStyle={styles.scroll}
    showsVerticalScrollIndicator={false}
  >
    <DOBCalendar
      onSave={(date) => console.log("DOB saved:", date)}
      onCancel={() => console.log("DOB cancelled")}
    />

    <Text style={styles.sectionLabel}>🌙 Missed Ramadan Fasts</Text>
    <RamadanCalendar onSave={(dates) => console.log("Ramadan saved:", dates)} />

    <Text style={styles.sectionLabel}>🕌 Dawood Fasts</Text>
    <DawoodCalendar
      onSave={(startDay) => console.log("Dawood startDay:", startDay)}
    />

    <Text style={styles.sectionLabel}>📆 Monday & Thursday Fasts</Text>
    <MonThuCalendar onSave={(count) => console.log("MonThu count:", count)} />

    <Text style={styles.sectionLabel}>🌕 White Days Fasts</Text>
    <WhiteDaysCalendar
      onSave={(count) => console.log("WhiteDays count:", count)}
    />
  </ScrollView>
);

export default CalendarExample;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.greybuttonBackground,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.white,
    fontFamily: fonts.primary.bold,
    marginBottom: 12,
    marginTop: 24,
  },
});
