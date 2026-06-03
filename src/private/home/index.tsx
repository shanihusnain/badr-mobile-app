import React, { useState, useRef } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Colors } from "@/constants/theme";
import createStyles from "./styles";
import { TaperedCircleBorder } from "@/components/atoms/TaperedCircleBorder";
import { ContainerCarousel } from "./components/ContainerCarousel";
import BottomSheet from "@gorhom/bottom-sheet";
import { DaysTrackerContainer } from "@/components/molecules/DaysTrackerContainer";
import { NamazGoalBottomSheet } from "@/components/molecules/NamazGoalBottomSheet";
import { useRouter } from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";

export default function HomeScreen() {
  const styles = createStyles();
  const CARD_WIDTH = Dimensions.get("window").width - 32;
  const [showPrayerCard, setShowPrayerCard] = useState(true);
  const [activeInspirationIndex, setActiveInspirationIndex] = useState(0);
  const namazBottomSheetRef = useRef<BottomSheet>(null);
  const router = useRouter();

  const categories = [
    { title: "PRAYERS", percentage: "0%" },
    { title: "QURAN", percentage: "0%" },
    { title: "FASTING", percentage: "0%" },
    { title: "SADAQAH", percentage: "0%" },
  ];

  const containerData = [
    {
      id: 1,
      title: "Welcome to Badr, Layla!",
      content:
        "Your 28-day goal cycle is set to begin tomorrow at Fajr. Get ready to track your prayer, Quran, fasting, and sadaqah goals. May Allah (SWT) make it easy and rewarding for you!",
      highlightedTexts: ["28-day goal cycle", "tomorrow", "Fajr"],
    },
    {
      id: 2,
      title: "Track Your Progress",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      highlightedTexts: [],
    },
  ];

  const inspirationCards = [
    {
      id: 1,
      title: "Daily Light from the Quran",
      quote: '"Indeed, it is We who guide whom We will to our ways."',
      reference: "(Surah Al-Ankabut, 29:69)",
    },
    {
      id: 2,
      title: "Hadith of the Day",
      quote: '"The best of you are those who learn the Quran and teach it."',
      reference: "(Sahih Al-Bukhari)",
    },
    {
      id: 3,
      title: "Reflection & Gratitude",
      quote: '"And if you should count the favors of Allah, you could not enumerate them."',
      reference: "(Surah Ibrahim, 14:34)",
    },
  ];

  const renderTextWithHighlight = (text: string, highlightedTexts: string[]) => {
    let parts: any[] = [];
    let lastIndex = 0;

    highlightedTexts.forEach((highlightedText) => {
      const index = text.indexOf(highlightedText, lastIndex);
      if (index !== -1) {
        if (index > lastIndex) {
          parts.push({
            text: text.substring(lastIndex, index),
            highlighted: false,
          });
        }
        parts.push({
          text: highlightedText,
          highlighted: true,
        });
        lastIndex = index + highlightedText.length;
      }
    });

    if (lastIndex < text.length) {
      parts.push({
        text: text.substring(lastIndex),
        highlighted: false,
      });
    }

    return parts.length > 0 ? parts : [{ text, highlighted: false }];
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Section with Avatar and Streak Box */}
        <View style={styles.topSection}>
          {/* Circular Avatar - No Image (Fixed) */}
          <View style={styles.avatarContainer}>
            <AntDesign size={40} color={Colors.light.white} />
          </View>

          {/* Streak Counter Box */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/streakcounter")}
          >
            <View style={styles.streakBox}>
              <Text style={styles.streakText}>0</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Prayer Card Container */}
        {showPrayerCard && (
          <View style={styles.prayerCardWrapper}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowPrayerCard(false)}
            >
              <AntDesign name="close" size={20} color={Colors.light.white} />
            </TouchableOpacity>

            <View style={styles.prayerCardContainer}>
              {/* Left Side - Prayer Details */}
              <View style={styles.prayerDetailsLeft}>
                <Text style={styles.upcomingText}>Upcoming</Text>
                <Text style={styles.prayerNameText}>ASR</Text>
                <Text style={styles.timeText}>3:53 PM</Text>
              </View>

              {/* Right Side - Date */}
              <View style={styles.dateRight}>
                <Text style={styles.dateText}>June 1, 2026</Text>
              </View>
            </View>
          </View>
        )}

        {/* Categories Section */}
        <View style={styles.categoriesContainer}>
          {categories.map((category, index) => (
            <View key={index} style={styles.categoryItemWrapper}>
              {/* Circle with Percentage */}
              <TaperedCircleBorder
                percentage={category.percentage}
                borderColor={Colors.light.calendarBg}
              />
              {/* Label with Arrow */}
              <View style={styles.categoryLabelWrapper}>
                <Text style={styles.categoryLabel}>{category.title}</Text>
                <MaterialIcons
                  name="chevron-right"
                  size={16}
                  color={Colors.light.white}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Scrollable Containers Section */}
        <View style={styles.containersSection}>
          <ContainerCarousel
            data={containerData}
            renderTextWithHighlight={renderTextWithHighlight}
          />
        </View>

        {/* Clickable Days Left Container */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => namazBottomSheetRef.current?.expand()}
          style={{ width: CARD_WIDTH, alignSelf: "center", marginTop: 16 }}
        >
          <DaysTrackerContainer isBottomSheetView={false} />
        </TouchableOpacity>

        {/* Inspiration Cards Section */}
        <View style={styles.inspirationSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + 16}
            decelerationRate="fast"
            contentContainerStyle={styles.inspirationScrollContainer}
            onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
              const idx = Math.round(
                e.nativeEvent.contentOffset.x / (CARD_WIDTH + 16)
              );
              setActiveInspirationIndex(idx);
            }}
            scrollEventThrottle={16}
          >
            {inspirationCards.map((card) => (
              <View key={card.id} style={styles.inspirationCard}>
                {/* Green toggle circle indicator */}

                {/* Card Title */}
                <Text style={styles.inspirationTitle}>{card.title}</Text>

                {/* Quote */}
                <Text style={styles.inspirationQuote}>
                  {card.quote}{" "}
                  <Text style={styles.inspirationReference}>
                    {card.reference}
                  </Text>
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Dot indicators */}
          <View style={styles.inspirationDots}>
            {inspirationCards.map((card, i) => (
              <View
                key={card.id}
                style={[
                  styles.inspirationDot,
                  i === activeInspirationIndex && styles.inspirationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Log Menstruation Container */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.menstruationContainer}
          onPress={() => router.push("/menstruationlog")}
        >
          <View style={styles.menstruationInner}>
            {/* Custom green circle icon with white plus sign */}
            <View style={styles.greenPlusCircle}>
              <Ionicons name="add" size={16} color="white" />
            </View>
            <Text style={styles.menstruationText}>LOG MENSTRUATION</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Namaz Goal Details Bottom Sheet */}
      <NamazGoalBottomSheet
        ref={namazBottomSheetRef}
        onClose={() => {}}
      />
    </SafeAreaView>
  );
}
