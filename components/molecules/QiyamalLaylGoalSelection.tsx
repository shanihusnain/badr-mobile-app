import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, LayoutAnimation, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "../../constants/theme";
import { fonts } from "../../assets/fonts";
import CustomSlider from "../atoms/CustomSlider";
import PrimaryButton from "../atoms/Primary-button";
import { useTranslation } from "react-i18next";
import { useLocaleNumber } from "../../hooks/useLocaleNumber";

export default function QiyamalLaylGoalSelection() {
    const { t } = useTranslation();
    const formatNumber = useLocaleNumber();
    const [isOpen, setIsOpen] = useState(false);
    const [commitment, setCommitment] = useState<"every_night" | "flexible">("flexible");
    const [sliderValue, setSliderValue] = useState(1);
    const [trackTahajjud, setTrackTahajjud] = useState<"yes" | "no">("yes");

    const toggleDropdown = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsOpen(!isOpen);
    };

    const handleSave = () => {
        console.log("Saved target Qiyam Al-Layl:", {
            commitment,
            twoRakAhPrayers: sliderValue,
            witrPrayers: 28,
            trackTahajjud,
        });
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.headerRow} onPress={toggleDropdown} activeOpacity={0.7}>
                <Text style={styles.titleText}>
                    {t("prayerGoals.qiyamTitle")}
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
                    {/* STEP 1 */}
                    <View style={styles.stepBadge}>
                        <Text style={styles.stepBadgeText}>{t("prayerGoals.step1")}</Text>
                    </View>
                    <Text style={styles.stepTitle}>
                        {t("prayerGoals.qiyamCommitQuestion")}
                    </Text>
                    <View style={styles.radioRow}>
                        <TouchableOpacity
                            style={styles.radioOption}
                            onPress={() => setCommitment("every_night")}
                            activeOpacity={0.7}
                        >
                            <View style={styles.radioOuter}>
                                {commitment === "every_night" && <View style={styles.radioInner} />}
                            </View>
                            <Text style={styles.radioText}>{t("prayerGoals.commitEveryNight")}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.radioOption}
                            onPress={() => setCommitment("flexible")}
                            activeOpacity={0.7}
                        >
                            <View style={styles.radioOuter}>
                                {commitment === "flexible" && <View style={styles.radioInner} />}
                            </View>
                            <Text style={styles.radioText}>{t("prayerGoals.keepFlexible")}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* STEP 2 */}
                    <View style={styles.stepBadge}>
                        <Text style={styles.stepBadgeText}>{t("prayerGoals.step2")}</Text>
                    </View>
                    <Text style={styles.stepTitle}>
                        {t("prayerGoals.qiyamGoalQuestion")}
                    </Text>
                    <View style={styles.sliderContainer}>
                        <CustomSlider
                            maxDays={150}
                            initialDays={sliderValue}
                            onChange={(val) => setSliderValue(val)}
                        />
                    </View>

                    {/* STEP 3 */}
                    <View style={styles.stepBadge}>
                        <Text style={styles.stepBadgeText}>{t("prayerGoals.step3")}</Text>
                    </View>
                    <Text style={styles.stepTitle}>
                        {t("prayerGoals.qiyamTrackQuestion")}
                    </Text>
                    <View style={styles.radioCol}>
                        <TouchableOpacity
                            style={styles.radioOptionCol}
                            onPress={() => setTrackTahajjud("yes")}
                            activeOpacity={0.7}
                        >
                            <View style={styles.radioOuterCol}>
                                {trackTahajjud === "yes" && <View style={styles.radioInnerCol} />}
                            </View>
                            <Text style={styles.radioTextCol}>
                                {t("prayerGoals.yes")} <Text style={styles.greyDescription}>{t("prayerGoals.yesDesc")}</Text>
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.radioOptionCol}
                            onPress={() => setTrackTahajjud("no")}
                            activeOpacity={0.7}
                        >
                            <View style={styles.radioOuterCol}>
                                {trackTahajjud === "no" && <View style={styles.radioInnerCol} />}
                            </View>
                            <Text style={styles.radioTextCol}>
                                {t("prayerGoals.no")} <Text style={styles.greyDescription}>{t("prayerGoals.noDesc")}</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Result / Save area */}
                    <View style={styles.resultContainer}>
                        <Text style={styles.valueText}>
                            {formatNumber(sliderValue)}
                            <Text style={styles.whiteText}>
                                {sliderValue === 1 ? t("prayerGoals.rakahPrayer") : t("prayerGoals.rakahPrayers")}
                                {commitment === "every_night" ? t("prayerGoals.and28Witr") : t("prayerGoals.plusWitrFlexible")}
                            </Text>
                        </Text>
                        <Text style={styles.witrDescription}>
                            {t("prayerGoals.witrDesc")}
                        </Text>
                        <View style={styles.buttonContainer}>
                            <PrimaryButton
                                text={t("prayerGoals.save")}
                                onPress={handleSave}
                                style={styles.saveButton}
                                textStyle={styles.saveButtonText}
                            />
                        </View>
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
        width: "100%",
    },
    stepBadge: {
        backgroundColor: Colors.light.darkgrey,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 5,
        alignSelf: "flex-start",
        marginBottom: 6,
        marginTop: 14,
    },
    stepBadgeText: {
        color: "white",
        fontSize: 10,
        fontWeight: "700",
        fontFamily: fonts.primary.bold,
    },
    stepTitle: {
        color: Colors.light.white,
        fontFamily: fonts.primary.medium,
        fontSize: 12,
        lineHeight: 18,
        marginBottom: 10,
    },
    sliderContainer: {
        marginTop: -9,
        marginBottom: -13,
    },
    radioRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 20,
        marginVertical: 8,
        width: "100%",
    },
    radioOption: {
        flexDirection: "row",
        alignItems: "center",
    },
    radioOuter: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: Colors.light.grey,
        backgroundColor: Colors.light.calendarBg,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 7,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.light.green,
    },
    radioText: {
        color: Colors.light.white,
        fontFamily: fonts.primary.medium,
        fontSize: 12,
        fontWeight: "500",
    },
    radioCol: {
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 12,
        marginVertical: 8,
        width: "100%",
    },
    radioOptionCol: {
        flexDirection: "row",
        alignItems: "flex-start",
        width: "100%",
    },
    radioOuterCol: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: Colors.light.grey,
        backgroundColor: Colors.light.calendarBg,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
        marginTop: 3,
    },
    radioInnerCol: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.light.green,
    },
    radioTextCol: {
        flex: 1,
        color: Colors.light.white,
        fontFamily: fonts.primary.medium,
        fontSize: 12,
        fontWeight: "500",
        lineHeight: 18,
    },
    greyDescription: {
        color: Colors.light.grey,
        fontFamily: fonts.primary.regular,
        fontSize: 11,
        lineHeight: 16,
    },
    resultContainer: {
        width: "100%",
        alignItems: "center",
        marginTop: 20,
    },
    valueText: {
        color: Colors.light.green,
        fontFamily: fonts.primary.medium,
        fontSize: 18,
        fontWeight: "500",
        marginBottom: 8,
        textAlign: "center",
    },
    whiteText: {
        color: Colors.light.white,
    },
    witrDescription: {
        color: Colors.light.grey,
        fontFamily: fonts.primary.regular,
        fontSize: 12,
        lineHeight: 18,
        textAlign: "center",
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    buttonContainer: {
        width: "100%",
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
