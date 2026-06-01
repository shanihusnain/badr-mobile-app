import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, LayoutAnimation } from "react-native";
import { Feather } from "@expo/vector-icons";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import moment from "moment-hijri";
import { Colors } from "../../constants/theme";
import { fonts } from "../../assets/fonts";
import PrimaryButton from "../atoms/Primary-button";
import { useLocaleNumber } from "../../hooks/useLocaleNumber";
import { WhiteDaysCalendar } from "./WhiteDaysCalendar";

export default function WhiteDaysFastGoalSelection() {
    const formatNumber = useLocaleNumber();
    const [isOpen, setIsOpen] = useState(false);
    const [missedRamadanDates, setMissedRamadanDates] = useState<string[]>([]);

    const whiteDayCount = useMemo(
        () =>
            Array.from({ length: 28 }, (_, i) => {
                const hijri = moment().add(i, "days").iDate();
                return hijri === 13 || hijri === 14 || hijri === 15;
            }).filter(Boolean).length,
        []
    );

    const toggleDropdown = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsOpen(!isOpen);
    };

    const handleSave = () => {
        console.log("Saved White Days fasts with count:", whiteDayCount);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.headerRow} onPress={toggleDropdown} activeOpacity={0.7}>
                <Text style={styles.titleText}>
                    White Days are selected — tap 'Save' to confirm.
                </Text>
                <Feather
                    name={isOpen ? "chevron-up" : "chevron-down"}
                    size={24}
                    color={Colors.light.white}
                    style={styles.icon}
                />
            </TouchableOpacity>

            {isOpen && <View style={styles.divider} />}

            {isOpen && (
                <View style={styles.expandedContent}>
                    <View style={styles.calendarWrapper}>
                        <WhiteDaysCalendar
                            hideFooter
                            missedRamadanDates={missedRamadanDates}
                        />
                    </View>

                    <View style={styles.advisoryContainer}>
                        <EvilIcons name="exclamation" size={24} color={Colors.light.grey} style={styles.advisoryIcon} />
                        <Text style={styles.advisoryText}>
                            The White Days are the 13th, 14th and 15th of each Islamic month. All other days are dimmed. Missed Ramadan and Mon/Thu fasts are shown with their respective colours.
                        </Text>
                    </View>

                    <Text style={styles.valueText}>
                        {formatNumber(whiteDayCount)}
                        <Text style={styles.whiteText}> White Days Fasts</Text>
                    </Text>

                    <View style={styles.buttonContainer}>
                        <PrimaryButton
                            text="Save"
                            onPress={handleSave}
                            style={styles.saveButton}
                            textStyle={styles.saveButtonText}
                        />
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        backgroundColor: Colors.light.calendarBg,
        borderRadius: 12,
        padding: 16,
        marginVertical: 10,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    titleText: {
        flex: 1,
        color: Colors.light.white,
        fontFamily: fonts.primary.medium,
        fontSize: 14,
        fontWeight: "500",
        lineHeight: 20,
        marginRight: 8,
    },
    icon: {
        marginLeft: 4,
    },
    divider: {
        height: 1,
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        width: "100%",
        marginTop: 12,
    },
    expandedContent: {
        marginTop: 16,
        alignItems: "center",
        width: "100%",
    },
    calendarWrapper: {
        width: "100%",
        marginHorizontal: -16,
    },
    advisoryContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        width: "100%",
        marginTop: -20,
        marginBottom: 10,
        paddingHorizontal: 4,
    },
    advisoryIcon: {
        marginTop: -1,
        marginRight: 6,
    },
    advisoryText: {
        flex: 1,
        color: Colors.light.grey,
        fontFamily: fonts.primary.regular,
        fontSize: 12,
        lineHeight: 18,
        textAlign: "left",
    },
    valueText: {
        color: Colors.light.white,
        fontFamily: fonts.primary.medium,
        fontSize: 18,
        fontWeight: "500",
        marginTop: 12,
        marginBottom: 25,
        textAlign: "center",
    },
    whiteText: {
        color: Colors.light.white,
    },
    buttonContainer: {
        width: "100%",
        marginTop: 6,
        alignItems: "center",
    },
    saveButton: {
        width: "100%",
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: "500",
        fontFamily: fonts.primary.medium,
    },
});
