import React from "react";
import { View, Text, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import BackButton from "@/components/atoms/Backbutton";
import createStyles from "./style";

export default function StreakCounter() {
  const styles = createStyles();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>

      {/* 1. Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <BackButton onPress={() => router.back()} />
        </View>
        <Text style={styles.headerTitle}>DAY STREAK</Text>
        <View style={styles.headerRight}>
          <View style={styles.infoIconContainer}>
            <AntDesign name="info-circle" size={24} color="white" />
          </View>
        </View>
      </View>

      {/* 2. Main Center Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.streakNumber}>205</Text>
        <Text style={styles.streakSublabel}>DAY STREAK</Text>
      </View>

      {/* 3. Horizontal Stats Grid (Bottom Section) */}
      <View style={styles.statsGrid}>
        {/* Column 1 */}
        <View style={styles.statsColumn}>
          <Text style={styles.statsValueLight}>Jul 8, 2026</Text>
          <Text style={styles.statsLabel}>Streak started</Text>
        </View>

        {/* Vertical Divider */}
        <View style={styles.verticalDivider} />

        {/* Column 2 */}
        <View style={styles.statsColumn}>
          <Text style={styles.statsValue}>Top 30%</Text>
          <Text style={styles.statsLabel}>badr</Text>
        </View>

        {/* Vertical Divider */}
        <View style={styles.verticalDivider} />

        {/* Column 3 */}
        <View style={styles.statsColumn}>
          <Text style={styles.statsValue}>391</Text>
          <Text style={styles.statsLabel}>Max streak</Text>
        </View>
      </View>

      {/* 4. This Week Tracker Container */}
      <View style={styles.thisWeekContainer}>
        <Text style={styles.thisWeekHeader}>THIS WEEK</Text>
        <View style={styles.daysRow}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <Text key={day} style={styles.dayText}>{day}</Text>
          ))}
        </View>
      </View>

      {/* 5. Milestone Tracker Container */}
      <View style={styles.milestoneContainer}>
        {/* Left Circle */}
        <View style={styles.milestoneLeftCircle} />

        {/* Center Column */}
        <View style={styles.milestoneCenterColumn}>
          <Text style={styles.milestoneDays}>160 more days</Text>
          
          {/* Progress Line */}
          <View style={styles.progressLineBg}>
            <View style={styles.progressLineFill} />
          </View>

          <Text style={styles.milestoneSubtext}>
            to unlock your{"\n"}next milestone.
          </Text>
        </View>

        {/* Right Circle */}
        <View style={styles.milestoneRightCircle} />
      </View>

      {/* 6. Consistency Container */}
      <View style={styles.consistencyContainer}>
        <Text style={styles.consistencyHeader}>
          Stay Consistent for Long-Term Barakah
        </Text>
        <Text style={styles.consistencyBody}>
          Your daily commitment to logging on Badr is more than a routine—it’s a step toward spiritual growth, bringing you closer to your goals, strengthening worship, and deepening your connection with Allah.
        </Text>
      </View>
    </SafeAreaView>
  );
}
