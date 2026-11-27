/**
 * dummy — Verification screen for MissedRamadanFastGoalSelection
 */

import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import MissedRamadanFastGoalSelection from "@/components/molecules/MissedRamadanFastGoalSelection";
import ProphetDawoodFastGoalSelection from "@/components/molecules/ProphetDawoodFastGoalSelection";
import MondayThursdayFastGoalSelection from "@/components/molecules/MondayThursdayFastGoalSelection";
import WhiteDaysFastGoalSelection from "@/components/molecules/WhiteDaysFastGoalSelection";
import { ms, s } from "@/src/utils/responsive";

export const DummyScreen = () => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Fasting Goal Selection Test</Text>
      <Text style={styles.subtitle}>
        This is a temporary dummy screen to verify and preview the newly implemented Missed Ramadan Fast Goal Selection and Prophet Dawood Fast Goal Selection components.
      </Text>
      
      <MissedRamadanFastGoalSelection />
      <ProphetDawoodFastGoalSelection />
      <MondayThursdayFastGoalSelection />
      <WhiteDaysFastGoalSelection />
    </ScrollView>
  );
};

export default DummyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground,
  },
  scroll: {
    padding: ms(16),
    paddingTop: ms(60),
    paddingBottom: ms(40),
  },
  title: {
    fontSize: ms(22),
    fontWeight: "700",
    color: Colors.light.white,
    fontFamily: fonts.primary.bold,
    marginBottom: ms(8),
    textAlign: "center",
  },
  subtitle: {
    fontSize: ms(14),
    color: Colors.light.grey,
    fontFamily: fonts.primary.regular,
    marginBottom: ms(24),
    textAlign: "center",
    lineHeight: ms(20),
  },
});
