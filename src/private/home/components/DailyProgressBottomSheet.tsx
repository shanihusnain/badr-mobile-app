import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { IbadahsProgressCard } from "./IbadahsProgressCard";
import { DetailedIbadahsProgressCard } from "./DetailedIbadahsProgressCards";
import BackButton from "@/components/atoms/Backbutton";

type ViewType = "main" | "categories" | "detail";

type Props = {
    onClose?: () => void;
};

// Sub-goal data per category
const PRAYER_GOALS = [
    { id: "tahiyyat", title: "Tahiyyat Al-Wudhu", count: "10", label: "/25 prayers", percentage: "40%", progressColor: Colors.light.ringPrayer, titleFontSize: 15 },
    { id: "tahiyyatMasjid", title: "Tahiyyat Al-Masjid\nPrayer", count: "12", label: "/47 prayers", percentage: "25%", progressColor: Colors.light.ringPrayer, titleFontSize: 15 },
    { id: "tawbah", title: "Tawbah Prayer", count: "4", label: "/10 prayers", percentage: "40%", progressColor: Colors.light.ringPrayer },
    { id: "istikhara", title: "Istikhara Prayer", count: "2", label: "/9 prayers", percentage: "22%", progressColor: Colors.light.ringPrayer },
    { id: "shukr", title: "Shukr Prayer", count: "3", label: "/8 prayers", percentage: "37%", progressColor: Colors.light.ringPrayer },
    { id: "sunnah", title: "Sunnah Rawatib", count: "5", label: "/12 prayers", percentage: "42%", progressColor: Colors.light.ringPrayer },
    { id: "duha", title: "Duha Prayer", count: "11", label: "/22 prayers", percentage: "50%", progressColor: Colors.light.ringPrayer },
    { id: "qiyam", title: "Qiyam Al-Layl", count: "3", label: "/10 prayers", percentage: "30%", progressColor: Colors.light.ringPrayer },
    { id: "missed", title: "Missed Past Prayers", count: "2", label: "/17 prayers", percentage: "12%", progressColor: Colors.light.ringPrayer },
    { id: "fiveDailyPrayers", title: "The Five Daily Prayers", count: "3", label: "/28 days", percentage: "11%", progressColor: Colors.light.ringPrayer, titleFontSize: 14.5 },
];

const QURAN_GOALS = [
    { id: "recitation", title: "Quran Recitation", count: "3", label: "/10 pages", percentage: "30%", progressColor: Colors.light.ringQuran },
    { id: "memorisation", title: "Quran Memorisation", count: "1", label: "/5 pages", percentage: "20%", progressColor: Colors.light.ringQuran },
    { id: "listening", title: "Quran Listening", count: "5", label: "/10 pages", percentage: "50%", progressColor: Colors.light.ringQuran },
    { id: "Tajweed", title: "Quran Tajweed", count: "8", label: "/12", percentage: "66%", progressColor: Colors.light.ringQuran }

];

const FASTING_GOALS = [
    { id: "ramadan", title: "Ramadan Fasts", count: "20", label: "/30 days", percentage: "67%", progressColor: Colors.light.green },
    { id: "whiteDays", title: "White Days Fasts", count: "2", label: "/3 days", percentage: "67%", progressColor: Colors.light.green },
    { id: "mondayThursday", title: "Monday & Thursday\nFasts", count: "3", label: "/8 days", percentage: "38%", progressColor: Colors.light.green },
    { id: "Dawwod(AS)", title: "Prophet Dawwod(AS)\nFasts", count: "13", label: "/14 days", percentage: "93%", progressColor: Colors.light.green },
];

const SADAQAH_GOALS = [
    { id: "sadaqahJariyah", title: "Sadaqah Jariyah", count: "$200", label: "/$1000", percentage: "20%", progressColor: Colors.light.ringSadaqah },
    { id: "daily", title: "Daily Charity", count: "12", label: "/28 days", percentage: "43%", progressColor: Colors.light.ringSadaqah },
    { id: "zakat", title: "Missed zakat", count: "16", label: "/28 days", percentage: "60", progressColor: Colors.light.ringSadaqah },
    { id: "kafarah", title: "Kaffarah for breaking\nFasts or Oaths", count: "1", label: "/2 days", percentage: "50", progressColor: Colors.light.ringSadaqah, titleFontSize: 14 },
    { id: "fidya", title: "Fidya", count: "$12", label: "/$30", percentage: "44%", progressColor: Colors.light.ringSadaqah },
    { id: "Lillah", title: "Lillah Donation", count: "$50", label: "/$100", percentage: "50%", progressColor: Colors.light.ringSadaqah },
    { id: "volunteering", title: "Volunteering\nServices", count: "2", label: "/4", percentage: "50%", progressColor: Colors.light.ringQuran },
];

const CATEGORY_GOALS: Record<string, typeof PRAYER_GOALS> = {
    PRAYER: PRAYER_GOALS,
    QURAN: QURAN_GOALS,
    FASTING: FASTING_GOALS,
    SADAQAH: SADAQAH_GOALS,
};

const CATEGORY_TITLES: Record<string, string> = {
    PRAYER: "SELECT PRAYER GOAL",
    QURAN: "SELECT QURAN GOAL",
    FASTING: "SELECT FASTING GOAL",
    SADAQAH: "SELECT SADAQAH GOAL",
};

const CATEGORY_ICON_COLOR: Record<string, string> = {
    PRAYER: Colors.light.ringPrayer,
    QURAN: Colors.light.ringQuran,
    FASTING: Colors.light.green,
    SADAQAH: Colors.light.ringSadaqah,
};

export const DailyProgressBottomSheet = ({ onClose }: Props) => {
    const [currentView, setCurrentView] = useState<ViewType>("main");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedCard, setSelectedCard] = useState<string | null>(null);
    const [selectedDetailCard, setSelectedDetailCard] = useState<string | null>(null);

    const handleBack = () => {
        if (currentView === "detail") {
            setCurrentView("categories");
            setSelectedDetailCard(null);
        } else if (currentView === "categories") {
            setCurrentView("main");
            setSelectedCategory(null);
            setSelectedCard(null);
        } else {
            onClose?.();
        }
    };

    const handleCategoryPress = (category: string) => {
        setSelectedCard(category);
        setSelectedCategory(category);
        setCurrentView("detail");
    };

    const getTitle = () => {
        if (currentView === "main") return "LOG DAILY PROGRESS";
        if (currentView === "categories") return "SELECT CATEGORY";
        if (currentView === "detail" && selectedCategory) return CATEGORY_TITLES[selectedCategory];
        return "";
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <BackButton onPress={handleBack} />
                <Text style={styles.sheetTitle}>{getTitle()}</Text>
                <View style={styles.headerSpacer} />
            </View>

            {currentView === "main" && (
                <View style={styles.mainViewContainer}>
                    <TouchableOpacity
                        style={styles.mainCard}
                        onPress={() => setCurrentView("categories")}
                        activeOpacity={0.7}
                    >
                        <View style={styles.mainCardLeft}>
                            <View style={styles.gridIconWrapper}>
                                <Ionicons name="grid" size={18} color={Colors.light.white} />
                            </View>
                            <Text style={styles.mainCardTitle}>SELECT CATEGORY</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={Colors.light.white} />
                    </TouchableOpacity>
                </View>
            )}

            {currentView === "categories" && (
                <View style={styles.listContainer}>
                    <IbadahsProgressCard
                        title="PRAYER"
                        subtitle="10 goals"
                        icon={<FontAwesome6 name="person-praying" size={20} color={Colors.light.white} />}
                        iconBgColor={Colors.light.ringPrayer + "33"}
                        percentage="34%"
                        progressColor={Colors.light.ringPrayer}
                        isSelected={selectedCard === "PRAYER"}
                        onPress={() => handleCategoryPress("PRAYER")}
                    />
                    <IbadahsProgressCard
                        title="QURAN"
                        subtitle="4 goals"
                        icon={<Ionicons name="book" size={20} color={Colors.light.white} />}
                        iconBgColor={Colors.light.ringQuran + "33"}
                        percentage="40%"
                        progressColor={Colors.light.ringQuran}
                        isSelected={selectedCard === "QURAN"}
                        onPress={() => handleCategoryPress("QURAN")}
                    />
                    <IbadahsProgressCard
                        title="FASTING"
                        subtitle="4 goals"
                        icon={<MaterialCommunityIcons name="food-off" size={20} color={Colors.light.white} />}
                        iconBgColor={Colors.light.green + "33"}
                        percentage="65%"
                        progressColor={Colors.light.green}
                        isSelected={selectedCard === "FASTING"}
                        onPress={() => handleCategoryPress("FASTING")}
                    />
                    <IbadahsProgressCard
                        title="SADAQAH"
                        subtitle="6 goal"
                        icon={<FontAwesome6 name="hand-holding-heart" size={18} color={Colors.light.white} />}
                        iconBgColor={Colors.light.ringSadaqah + "33"}
                        percentage="85%"
                        progressColor={Colors.light.ringSadaqah}
                        isSelected={selectedCard === "SADAQAH"}
                        onPress={() => handleCategoryPress("SADAQAH")}
                    />
                </View>
            )}

            {currentView === "detail" && selectedCategory && (
                <View style={styles.listContainer}>
                    {CATEGORY_GOALS[selectedCategory].map((goal) => (
                        <DetailedIbadahsProgressCard
                            key={goal.id}
                            title={goal.title}
                            subtitleCount={goal.count}
                            subtitleLabel={goal.label}
                            icon={
                                <FontAwesome6
                                    name="person-praying"
                                    size={18}
                                    color={CATEGORY_ICON_COLOR[selectedCategory]}
                                />
                            }
                            iconBgColor={CATEGORY_ICON_COLOR[selectedCategory] + "22"}
                            percentage={goal.percentage}
                            progressColor={goal.progressColor}
                            isSelected={selectedDetailCard === goal.id}
                            onPress={() => setSelectedDetailCard(goal.id)}
                            titleFontSize={goal.titleFontSize}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 28,
    },
    headerSpacer: {
        width: 30,
    },
    sheetTitle: {
        color: Colors.light.white,
        fontSize: 14,
        fontFamily: fonts.primary.semiBold,
        fontWeight: "600",
        textAlign: "center",
        flex: 1,
        letterSpacing: 0.5,
    },
    mainViewContainer: {
        paddingBottom: 20,
    },
    mainCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: Colors.light.calendarBg,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 18,
    },
    mainCardLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    gridIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.light.selectcategory,
        alignItems: "center",
        justifyContent: "center",
    },
    mainCardTitle: {
        color: Colors.light.white,
        fontFamily: fonts.primary.semiBold,
        fontWeight: "600",
        fontSize: 15,
        marginLeft: 14,
    },
    listContainer: {
        paddingBottom: 20,
    },
});
