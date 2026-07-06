import React, { useRef, useCallback, useMemo } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { Colors } from "@/constants/theme";
import { statusInsightsStyles as styles } from "./style";
import { useRouter } from "expo-router";
import { SwitchButton } from "@/components/atoms/SwitchButton";
import { useSharedValue } from "react-native-reanimated";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import type { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import SecondaryButton from "@/components/atoms/Secondary-button";
import PrimaryButton from "@/components/atoms/Primary-button";
import WarningModal from "@/components/atoms/WarningModal";
import { BirthIcon, FeelingSickIcon, MenstruatingIcon, TravelingIcon, GaveBirthIcon, HeartBreakIcon, ExamIcon, WorkLoadIcon, WalletIcon } from "@/assets/icons";

const MODES = [
    { id: "feeling_sick", label: "FEELING SICK", icon: <FeelingSickIcon size={24} color={Colors.light.subtext} /> },
    { id: "menstruating", label: "MENSTRUATING", icon: <MenstruatingIcon size={24} color={Colors.light.subtext} /> },
    { id: "traveling", label: "TRAVELING", icon: <TravelingIcon size={24} color={Colors.light.subtext} /> },
    { id: "pregnant", label: "PREGNANT", icon: <BirthIcon size={24} color={Colors.light.subtext} /> },
    { id: "just_gave_birth", label: "JUST GAVE BIRTH", icon: <GaveBirthIcon size={24} color={Colors.light.subtext} /> },
    { id: "grieving_a_loss", label: "GRIEVING A LOSS", icon: <HeartBreakIcon size={24} color={Colors.light.subtext} /> },
    { id: "preparing_for_exams", label: "PREPARING FOR EXAMS", icon: <ExamIcon size={24} color={Colors.light.subtext} /> },
    { id: "experiencing_work_overload", label: "EXPERIENCING WORK OVERLOAD", icon: <WorkLoadIcon size={24} color={Colors.light.subtext} /> },
    { id: "coping_with_financial_challenges", label: "COPING WITH FINANCIAL CHALLENGES", icon: <WalletIcon size={24} color={Colors.light.subtext} /> },
    { id: "everyday_life", label: "EVERYDAY LIFE", icon: <Feather name="smile" size={24} color={Colors.light.subtext} /> },
];

export default function StatusInsightsScreen() {
    const router = useRouter();
    const statusInsightsEnabled = useSharedValue(true);
    const [selectedMode, setSelectedMode] = React.useState("everyday_life");
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["98%"], []);
    const [initialMode, setInitialMode] = React.useState("everyday_life");
    const [warningVisible, setWarningVisible] = React.useState(false);

    const handleClose = () => {
        router.back();
    };

    const handleToggleStatusInsights = () => {
        statusInsightsEnabled.value = !statusInsightsEnabled.value;
    };

    const handleModeSelect = () => {
        setInitialMode(selectedMode);
        bottomSheetRef.current?.expand();
    };

    const handleLearnMore = () => {
        // Handle learn more action
    };

    const handleSheetClose = useCallback(() => {
        bottomSheetRef.current?.close();
    }, []);

    const handleSave = useCallback(() => {
        if (selectedMode !== initialMode) {
            setWarningVisible(true);
        } else {
            bottomSheetRef.current?.close();
        }
    }, [selectedMode, initialMode]);

    const handleConfirmSwitch = useCallback(() => {
        setWarningVisible(false);
        setInitialMode(selectedMode);
        bottomSheetRef.current?.close();
    }, [selectedMode]);

    const handleCancelSwitch = useCallback(() => {
        setWarningVisible(false);
    }, []);

    const renderBackdrop = useCallback(
        (props: BottomSheetDefaultBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                pressBehavior="close"
            />
        ),
        []
    );

    const selectedModeObj = MODES.find((m) => m.id === selectedMode) || MODES[MODES.length - 1];
    const selectedModeLabel = selectedModeObj.label;

    return (
        <BlackScreenWrapper>
            <View style={styles.content}>
                <View style={styles.row}>
                    <Text style={styles.sectionTitle}>STATUS INSIGHTS</Text>
                    <SwitchButton
                        value={statusInsightsEnabled}
                        onPress={handleToggleStatusInsights}
                        trackColors={{ off: Colors.light.subtext, on: Colors.light.green }}
                        size="small"
                    />
                </View>

                <Text style={styles.descriptionText}>
                    Learn how your current life stage impacts your{"\n"}
                    progress in goals and journal entries. Enable to{"\n"}
                    receive tailored guidance based on each stage.
                </Text>

                <View style={styles.modeHeaderRow}>
                    <Text style={styles.modeLabel}>MODE</Text>
                    <View style={styles.modeLine} />
                </View>

                <Pressable style={styles.modeButton} onPress={handleModeSelect}>
                    <View style={styles.modeButtonLeft}>
                        {/* Render the currently selected mode's icon */}
                        <View style={styles.modeButtonIcon}>
                            {selectedModeObj.icon}
                        </View>
                        <Text style={styles.modeButtonText}>{selectedModeLabel}</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color={Colors.light.white} />
                </Pressable>

                <View style={styles.privacyCard}>
                    <Text style={styles.privacyTitle}>PRIVACY</Text>
                    <Text style={styles.privacyText}>
                        We deeply care about you—and that includes
                        your privacy. You have full control over your
                        information, with the ability to access or erase
                        your data anytime.
                    </Text>
                    <Pressable style={styles.learnMoreRow} onPress={handleLearnMore}>
                        <Text style={styles.learnMoreText}>LEARN MORE</Text>
                        <Feather name="chevron-right" size={16} color={Colors.light.white} />
                    </Pressable>
                </View>
            </View>

            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={snapPoints}
                enablePanDownToClose
                backdropComponent={renderBackdrop}
                backgroundStyle={{ backgroundColor: Colors.light.greybuttonBackground }}
                handleIndicatorStyle={{ backgroundColor: Colors.light.grey, width: 40 }}
            >
                <BottomSheetView style={styles.sheetContainer}>
                    {/* Header title only */}
                    <Text style={styles.sheetTitle}>MODE</Text>

                    {/* Mode list fills remaining space */}
                    <View style={styles.sheetList}>
                        {MODES.map((mode) => {
                            const isSelected = selectedMode === mode.id;
                            const iconColor = isSelected ? Colors.light.white : Colors.light.subtext;
                            return (
                                <Pressable
                                    key={mode.id}
                                    style={[styles.sheetItem, isSelected && styles.sheetItemSelected]}
                                    onPress={() => setSelectedMode(mode.id)}
                                >
                                    {/* Clone the element to override its color if it supports it, or apply a tint */}
                                    <View style={styles.sheetItemIcon}>
                                        {mode.icon}
                                    </View>
                                    <Text style={[styles.sheetItemText, isSelected && styles.sheetItemTextSelected]}>
                                        {mode.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* SAVE button: dimmed until a new mode is selected */}
                    <View style={styles.sheetFooter}>
                        <PrimaryButton
                            text="SAVE"
                            onPress={handleSave}
                            style={{ opacity: selectedMode !== initialMode ? 1 : 0.35 }}
                        />
                    </View>
                </BottomSheetView>
            </BottomSheet>

            <WarningModal
                visible={warningVisible}
                title={`ARE YOU SURE YOU WANT TO SWITCH TO ${selectedModeLabel.toUpperCase()}?`}
                message="Switching modes will reset the data in the current mode."
                primaryButtonText="Switch Mode"
                secondaryButtonText="Cancel"
                onPrimaryPress={handleConfirmSwitch}
                onSecondaryPress={handleCancelSwitch}
                onBackdropPress={handleCancelSwitch}
            />
        </BlackScreenWrapper>
    );
}
