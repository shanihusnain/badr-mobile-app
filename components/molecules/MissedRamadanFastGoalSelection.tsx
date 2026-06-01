import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, LayoutAnimation } from "react-native";
import { Feather } from "@expo/vector-icons";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { Colors } from "../../constants/theme";
import { fonts } from "../../assets/fonts";
import PrimaryButton from "../atoms/Primary-button";
import { useLocaleNumber } from "../../hooks/useLocaleNumber";
import RamadanCalendar from "./RamadanCalendar";

export default function MissedRamadanFastGoalSelection() {
    const formatNumber = useLocaleNumber();
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsOpen(!isOpen);
    };

    const handleSave = () => {
        console.log("Saved missed Ramadan fasts dates:", selectedDates);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.headerRow} onPress={toggleDropdown} activeOpacity={0.7}>
                <Text style={styles.titleText}>
                    Select how many missed Ramadan fasts to make up this month
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
                    <View style={styles.legendRow}>
                        <View style={styles.legendRing} />
                        <Text style={styles.legendText}>MISSED RAMADAN FASTS</Text>
                    </View>

                    <View style={styles.calendarWrapper}>
                        <RamadanCalendar
                            hideFooter
                            hideLegend
                            selectedDates={selectedDates}
                            onDatesChange={setSelectedDates}
                        />
                    </View>

                    <View style={styles.advisoryContainer}>
                        <EvilIcons name="exclamation" size={24} color={Colors.light.grey} style={styles.advisoryIcon} />
                        <Text style={styles.advisoryText}>
                            You have the entire month to complete this fasting goal and make up missed planned dates, as long as they don’t overlap with your other fasting goals.
                        </Text>
                    </View>

                    <Text style={styles.valueText}>
                        {formatNumber(selectedDates.length)}
                        <Text style={styles.whiteText}> Missed Ramadan Fasts</Text>
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
    legendRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        marginTop: 0,
        marginBottom: 16,
    },
    legendRing: {
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: Colors.light.ringRamadan,
        marginRight: 8,
    },
    legendText: {
        fontSize: 10,
        fontWeight: "400",
        color: Colors.light.grey,
        fontFamily: fonts.primary.regular,
        letterSpacing: 0.5,
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
        color: Colors.light.ringRamadan,
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
