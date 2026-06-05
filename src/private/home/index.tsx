import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Entypo from "@expo/vector-icons/Entypo";
import { Colors } from "@/constants/theme";
import createStyles from "./styles";
import { TaperedCircleBorder } from "@/components/atoms/TaperedCircleBorder";
import { ContainerCarousel } from "./components/ContainerCarousel";
import BottomSheet from "@gorhom/bottom-sheet";
import { DaysTrackerContainer } from "@/components/molecules/DaysTrackerContainer";
import { NamazGoalBottomSheet } from "@/components/molecules/NamazGoalBottomSheet";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { localizeNumber } from "@/src/utils/localizeNumbers";

import Ionicons from "@expo/vector-icons/Ionicons";

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const styles = createStyles();
  const CARD_WIDTH = Dimensions.get("window").width - 32;
  const [showPrayerCard, setShowPrayerCard] = useState(true);
  const [activeInspirationIndex, setActiveInspirationIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showMoreExpanded, setShowMoreExpanded] = useState(false);
  const namazBottomSheetRef = useRef<BottomSheet>(null);
  const router = useRouter();

  const categories = [
    { title: t("homeScreen.prayers"), percentage: localizeNumber("0", lng) + "%" },
    { title: t("homeScreen.quran"), percentage: localizeNumber("0", lng) + "%" },
    { title: t("homeScreen.fasting"), percentage: localizeNumber("0", lng) + "%" },
    { title: t("homeScreen.sadaqah"), percentage: localizeNumber("0", lng) + "%" },
  ];

  const greetingcard = [
    {
      id: 1,
      title: t("homeScreen.welcomeTitle", { name: "Layla" }),
      content: t("homeScreen.welcomeContent"),
      highlightedTexts: [
        t("homeScreen.welcomeHighlightCycle"),
        t("homeScreen.welcomeHighlightTomorrow"),
        t("homeScreen.welcomeHighlightFajr"),
      ],
    },
    {
      id: 2,
      title: t("homeScreen.trackProgressTitle"),
      content: t("homeScreen.trackProgressContent"),
      highlightedTexts: [],
    },
  ];

  const inspirationCards = [
    {
      id: 1,
      title: t("homeScreen.dailyLightTitle"),
      quote: t("homeScreen.dailyLightQuote"),
      reference: t("homeScreen.dailyLightRef"),
    },
    {
      id: 2,
      title: t("homeScreen.hadithTitle"),
      quote: t("homeScreen.hadithQuote"),
      reference: t("homeScreen.hadithRef"),
    },
    {
      id: 3,
      title: t("homeScreen.reflectionTitle"),
      quote: t("homeScreen.reflectionQuote"),
      reference: t("homeScreen.reflectionRef"),
    },
  ];

  const renderTextWithHighlight = (text: string, highlightedTexts: string[]) => {
    let parts: any[] = [];
    let lastIndex = 0;

    highlightedTexts.forEach((highlightedText) => {
      if (!highlightedText) return;
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
              <Text style={styles.streakText}>{localizeNumber("0", lng)}</Text>
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
                <Text style={styles.upcomingText}>{t("homeScreen.upcoming")}</Text>
                <Text style={styles.prayerNameText}>{t("prayerGoals.asr").toUpperCase()}</Text>
                <Text style={styles.timeText}>{localizeNumber("3:53 PM", lng)}</Text>
              </View>

              {/* Right Side - Date */}
              <View style={styles.dateRight}>
                <Text style={styles.dateText}>{t("homeScreen.juneDate")}</Text>
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
            data={greetingcard}
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
            <Text style={styles.menstruationText}>{t("homeScreen.logMenstruation")}</Text>
          </View>
        </TouchableOpacity>

        {/* Customize Your Journal Container */}
        <View style={styles.journalContainer}>
          <Text style={styles.journalTitle}>{t("homeScreen.customizeJournalTitle")}</Text>
          <Text style={styles.journalDescription}>
            {t("homeScreen.customizeJournalDesc")}
          </Text>
          <TouchableOpacity style={styles.getStartedButton}>
            <Text style={styles.getStartedText}>{t("homeScreen.getStarted")}</Text>
            <Entypo name="chevron-right" size={24} color={Colors.light.green} />
          </TouchableOpacity>
        </View>

        {/* My Dashboard Section */}
        <View style={styles.dashboardSection}>
          <Text style={styles.dashboardText}>{t("homeScreen.myDashboard")}</Text>
          <View style={styles.customizeContainer}>
            <Text style={styles.customizeText}>{t("homeScreen.customize")}</Text>
          </View>
        </View>

        {/* Category Filter Section */}
        <View style={styles.categoryFilterSection}>
          <TouchableOpacity
            style={[styles.categoryFilterItem, selectedCategory === "All" && styles.categoryFilterItemActive]}
            onPress={() => setSelectedCategory("All")}
          >
            <Text style={[styles.categoryFilterText, selectedCategory === "All" && styles.categoryFilterTextActive]}>{t("homeScreen.filterAll")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryFilterItemWide, selectedCategory === "Prayer" && styles.categoryFilterItemActive]}
            onPress={() => setSelectedCategory("Prayer")}
          >
            <Text style={[styles.categoryFilterText, selectedCategory === "Prayer" && styles.categoryFilterTextActive]}>{t("homeScreen.filterPrayer")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryFilterItemWide, selectedCategory === "Quran" && styles.categoryFilterItemActive]}
            onPress={() => setSelectedCategory("Quran")}
          >
            <Text style={[styles.categoryFilterText, selectedCategory === "Quran" && styles.categoryFilterTextActive]}>{t("homeScreen.filterQuran")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryFilterItemWide, selectedCategory === "Fasting" && styles.categoryFilterItemActive]}
            onPress={() => setSelectedCategory("Fasting")}
          >
            <Text style={[styles.categoryFilterText, selectedCategory === "Fasting" && styles.categoryFilterTextActive]}>{t("homeScreen.filterFasting")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryFilterItemWide, selectedCategory === "Sadaqah" && styles.categoryFilterItemActive]}
            onPress={() => setSelectedCategory("Sadaqah")}
          >
            <Text style={[styles.categoryFilterText, selectedCategory === "Sadaqah" && styles.categoryFilterTextActive]}>{t("homeScreen.filterSadaqah")}</Text>
          </TouchableOpacity>
        </View>

        {/* Tahiyyat Al-Wudhu Container */}
        {(selectedCategory === "All" || selectedCategory === "Prayer") && (
          <View style={styles.tahiyyatContainer}>
            <View style={styles.tahiyyatLeft}>
              <Text style={styles.tahiyyatTitle}>{t("homeScreen.tahiyyatAlWudhu")}</Text>
              <Text style={styles.tahiyyatSubtitle}>
                <Text style={styles.tahiyyatNumber}>{localizeNumber("0", lng)}</Text>
                <Text style={styles.tahiyyatDivider}>{t("homeScreen.prayersCount", { count: localizeNumber("25", lng) })}</Text>
              </Text>
            </View>
            <View style={styles.tahiyyatCircleWrapper}>
              <TaperedCircleBorder borderColor={Colors.light.calendarBg} size={48}>
                <View style={styles.circleTextContainer}>
                  <Text style={styles.circleMainText}>{localizeNumber("0", lng)}</Text>
                  <Text style={styles.circlePercentText}>%</Text>
                </View>
              </TaperedCircleBorder>
            </View>
          </View>
        )}

        {/* Sunnah Rawatib Container */}
        {(selectedCategory === "All" || selectedCategory === "Prayer") && (
          <View style={styles.tahiyyatContainer}>
            <View style={styles.tahiyyatLeft}>
              <Text style={styles.tahiyyatTitle}>{t("homeScreen.sunnahRawatib")}</Text>
              <Text style={styles.tahiyyatSubtitle}>
                <Text style={styles.tahiyyatNumber}>{localizeNumber("0", lng)}</Text>
                <Text style={styles.tahiyyatDivider}>{t("homeScreen.countSuffix", { count: localizeNumber("252", lng) })}</Text>
              </Text>
            </View>
            <View style={styles.tahiyyatCircleWrapper}>
              <TaperedCircleBorder borderColor={Colors.light.calendarBg} size={48}>
                <View style={styles.circleTextContainer}>
                  <Text style={styles.circleMainText}>{localizeNumber("0", lng)}</Text>
                  <Text style={styles.circlePercentText}>%</Text>
                </View>
              </TaperedCircleBorder>
            </View>
          </View>
        )}

        {/* Tahiyyat Al-Masjid Container */}
        {(selectedCategory === "All" || selectedCategory === "Prayer") && (
          <View style={styles.tahiyyatContainer}>
            <View style={styles.tahiyyatLeft}>
              <Text style={styles.tahiyyatTitle}>{t("homeScreen.tahiyyatAlMasjid")}</Text>
              <Text style={styles.tahiyyatSubtitle}>
                <Text style={styles.tahiyyatNumber}>{localizeNumber("0", lng)}</Text>
                <Text style={styles.tahiyyatDivider}>{t("homeScreen.countSuffix", { count: localizeNumber("47", lng) })}</Text>
              </Text>
            </View>
            <View style={styles.tahiyyatCircleWrapper}>
              <TaperedCircleBorder borderColor={Colors.light.calendarBg} size={48}>
                <View style={styles.circleTextContainer}>
                  <Text style={styles.circleMainText}>{localizeNumber("0", lng)}</Text>
                  <Text style={styles.circlePercentText}>%</Text>
                </View>
              </TaperedCircleBorder>
            </View>
          </View>
        )}

        {/* Qiyam Al-Layl Container */}
        {(selectedCategory === "All" || selectedCategory === "Prayer") && (
          <View style={styles.tahiyyatContainer}>
            <View style={styles.tahiyyatLeft}>
              <Text style={styles.tahiyyatTitle}>{t("homeScreen.qiyamAlLayl")}</Text>
              <Text style={styles.tahiyyatSubtitle}>
                <Text style={styles.tahiyyatNumber}>{localizeNumber("0", lng)}</Text>
                <Text style={styles.tahiyyatDivider}>{t("homeScreen.countSuffix", { count: localizeNumber("23", lng) })}</Text>
              </Text>
            </View>
            <View style={styles.tahiyyatCircleWrapper}>
              <TaperedCircleBorder borderColor={Colors.light.calendarBg} size={48}>
                <View style={styles.circleTextContainer}>
                  <Text style={styles.circleMainText}>{localizeNumber("0", lng)}</Text>
                  <Text style={styles.circlePercentText}>%</Text>
                </View>
              </TaperedCircleBorder>
            </View>
          </View>
        )}

        {/* Missed Past Prayers Container */}
        {(selectedCategory === "All" || selectedCategory === "Prayer") && (
          <View style={styles.tahiyyatContainer}>
            <View style={styles.tahiyyatLeft}>
              <Text style={styles.tahiyyatTitle}>{t("homeScreen.missedPastPrayers")}</Text>
              <Text style={styles.tahiyyatSubtitle}>
                <Text style={styles.tahiyyatNumber}>{localizeNumber("0", lng)}</Text>
                <Text style={styles.tahiyyatDivider}>{t("homeScreen.countSuffix", { count: localizeNumber("17", lng) })}</Text>
              </Text>
            </View>
            <View style={styles.tahiyyatCircleWrapper}>
              <TaperedCircleBorder borderColor={Colors.light.calendarBg} size={48}>
                <View style={styles.circleTextContainer}>
                  <Text style={styles.circleMainText}>{localizeNumber("0", lng)}</Text>
                  <Text style={styles.circlePercentText}>%</Text>
                </View>
              </TaperedCircleBorder>
            </View>
          </View>
        )}

        {/* Al-Shukar Container */}
        {(selectedCategory === "All" || selectedCategory === "Prayer") && (
          <View style={styles.tahiyyatContainer}>
            <View style={styles.tahiyyatLeft}>
              <Text style={styles.tahiyyatTitle}>{t("homeScreen.alShukar")}</Text>
              <Text style={styles.tahiyyatSubtitle}>
                <Text style={styles.tahiyyatNumber}>{localizeNumber("0", lng)}</Text>
                <Text style={styles.tahiyyatDivider}>{t("homeScreen.countSuffix", { count: localizeNumber("12", lng) })}</Text>
              </Text>
            </View>
            <View style={styles.tahiyyatCircleWrapper}>
              <TaperedCircleBorder borderColor={Colors.light.calendarBg} size={48}>
                <View style={styles.circleTextContainer}>
                  <Text style={styles.circleMainText}>{localizeNumber("0", lng)}</Text>
                  <Text style={styles.circlePercentText}>%</Text>
                </View>
              </TaperedCircleBorder>
            </View>
          </View>
        )}

        {/* Quran Recitation Container */}
        {(selectedCategory === "All" || selectedCategory === "Quran") && (
          <View style={styles.tahiyyatContainer}>
            <View style={styles.tahiyyatLeft}>
              <Text style={styles.tahiyyatTitle}>{t("homeScreen.quranRecitation")}</Text>
              <Text style={styles.tahiyyatSubtitle}>
                <Text style={styles.tahiyyatNumber}>{localizeNumber("0", lng)}</Text>
                <Text style={styles.tahiyyatDivider}>{t("homeScreen.countSuffix", { count: localizeNumber("3", lng) })}</Text>
              </Text>
            </View>
            <View style={styles.tahiyyatCircleWrapper}>
              <TaperedCircleBorder borderColor={Colors.light.calendarBg} size={48}>
                <View style={styles.circleTextContainer}>
                  <Text style={styles.circleMainText}>{localizeNumber("0", lng)}</Text>
                  <Text style={styles.circlePercentText}>%</Text>
                </View>
              </TaperedCircleBorder>
            </View>
          </View>
        )}

        {/* Sadaqah Jariyah Container */}
        {(selectedCategory === "All" || selectedCategory === "Sadaqah") && (
          <View style={styles.tahiyyatContainer}>
            <View style={styles.tahiyyatLeft}>
              <Text style={styles.tahiyyatTitle}>{t("homeScreen.sadaqahJariyah")}</Text>
              <Text style={styles.tahiyyatSubtitle}>
                <Text style={styles.tahiyyatNumber}>{lng === "ar" ? "٠$" : "$0"}</Text>
                <Text style={styles.tahiyyatDivider}>{t("homeScreen.sadaqahAmount", { amount: localizeNumber("1,000", lng) })}</Text>
              </Text>
            </View>
            <View style={styles.tahiyyatCircleWrapper}>
              <TaperedCircleBorder borderColor={Colors.light.calendarBg} size={48}>
                <View style={styles.circleTextContainer}>
                  <Text style={styles.circleMainText}>{localizeNumber("0", lng)}</Text>
                  <Text style={styles.circlePercentText}>%</Text>
                </View>
              </TaperedCircleBorder>
            </View>
          </View>
        )}

        {/* Missed Ramadan Fasts Container */}
        {(selectedCategory === "Fasting" || (selectedCategory === "All" && showMoreExpanded)) && (
          <View style={styles.tahiyyatContainer}>
            <View style={styles.tahiyyatLeft}>
              <Text style={styles.tahiyyatTitle}>{t("homeScreen.missedRamadanFasts")}</Text>
              <Text style={styles.tahiyyatSubtitle}>
                <Text style={styles.tahiyyatNumber}>{localizeNumber("0", lng)}</Text>
                <Text style={styles.tahiyyatDivider}>{t("homeScreen.countSuffix", { count: localizeNumber("7", lng) })}</Text>
              </Text>
            </View>
            <View style={styles.tahiyyatCircleWrapper}>
              <TaperedCircleBorder borderColor={Colors.light.calendarBg} size={48}>
                <View style={styles.circleTextContainer}>
                  <Text style={styles.circleMainText}>{localizeNumber("0", lng)}</Text>
                  <Text style={styles.circlePercentText}>%</Text>
                </View>
              </TaperedCircleBorder>
            </View>
          </View>
        )}

        {/* The Fasts of Prophet Dawood Container */}
        {(selectedCategory === "Fasting" || (selectedCategory === "All" && showMoreExpanded)) && (
          <View style={styles.tahiyyatContainer}>
            <View style={styles.tahiyyatLeft}>
              <Text style={styles.tahiyyatTitle}>{t("homeScreen.fastsProphetDawood")}</Text>
              <Text style={styles.tahiyyatSubtitle}>
                <Text style={styles.tahiyyatNumber}>{localizeNumber("0", lng)}</Text>
                <Text style={styles.tahiyyatDivider}>{t("homeScreen.countSuffix", { count: localizeNumber("14", lng) })}</Text>
              </Text>
            </View>
            <View style={styles.tahiyyatCircleWrapper}>
              <TaperedCircleBorder borderColor={Colors.light.calendarBg} size={48}>
                <View style={styles.circleTextContainer}>
                  <Text style={styles.circleMainText}>{localizeNumber("0", lng)}</Text>
                  <Text style={styles.circlePercentText}>%</Text>
                </View>
              </TaperedCircleBorder>
            </View>
          </View>
        )}

        {/* Monday & Thursday Fasts Container */}
        {(selectedCategory === "Fasting" || (selectedCategory === "All" && showMoreExpanded)) && (
          <View style={styles.tahiyyatContainer}>
            <View style={styles.tahiyyatLeft}>
              <Text style={styles.tahiyyatTitle}>{t("homeScreen.mondayThursdayFasts")}</Text>
              <Text style={styles.tahiyyatSubtitle}>
                <Text style={styles.tahiyyatNumber}>{localizeNumber("0", lng)}</Text>
                <Text style={styles.tahiyyatDivider}>{t("homeScreen.countSuffix", { count: localizeNumber("4", lng) })}</Text>
              </Text>
            </View>
            <View style={styles.tahiyyatCircleWrapper}>
              <TaperedCircleBorder borderColor={Colors.light.calendarBg} size={48}>
                <View style={styles.circleTextContainer}>
                  <Text style={styles.circleMainText}>{localizeNumber("0", lng)}</Text>
                  <Text style={styles.circlePercentText}>%</Text>
                </View>
              </TaperedCircleBorder>
            </View>
          </View>
        )}

        {/* White Days Fast Container */}
        {(selectedCategory === "Fasting" || (selectedCategory === "All" && showMoreExpanded)) && (
          <View style={styles.tahiyyatContainer}>
            <View style={styles.tahiyyatLeft}>
              <Text style={styles.tahiyyatTitle}>{t("homeScreen.whiteDaysFast")}</Text>
              <Text style={styles.tahiyyatSubtitle}>
                <Text style={styles.tahiyyatNumber}>{localizeNumber("0", lng)}</Text>
                <Text style={styles.tahiyyatDivider}>{t("homeScreen.countSuffix", { count: localizeNumber("3", lng) })}</Text>
              </Text>
            </View>
            <View style={styles.tahiyyatCircleWrapper}>
              <TaperedCircleBorder borderColor={Colors.light.calendarBg} size={48}>
                <View style={styles.circleTextContainer}>
                  <Text style={styles.circleMainText}>{localizeNumber("0", lng)}</Text>
                  <Text style={styles.circlePercentText}>%</Text>
                </View>
              </TaperedCircleBorder>
            </View>
          </View>
        )}

        {/* Show More Button */}
        {selectedCategory === "All" && (
          <TouchableOpacity style={styles.showMoreButton} onPress={() => setShowMoreExpanded(!showMoreExpanded)}>
            <Text style={styles.showMoreText}>{showMoreExpanded ? t("homeScreen.showLess") : t("homeScreen.showMore")}</Text>
            <Entypo name={showMoreExpanded ? "chevron-up" : "chevron-down"} size={24} color="white" />
          </TouchableOpacity>
        )}
      </ScrollView>
      
      {/* Namaz Goal Details Bottom Sheet */}
      <NamazGoalBottomSheet
        ref={namazBottomSheetRef}
        onClose={() => {}}
      />
    </SafeAreaView>
  );
}
