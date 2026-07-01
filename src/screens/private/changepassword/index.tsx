import React, { useState } from "react";
import {
    View,
    Text,
    SafeAreaView,
    Pressable,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { changePasswordStyles as styles } from "./style";
import { useRouter } from "expo-router";
import PrimaryButton from "@/components/atoms/Primary-button";

export default function ChangePasswordScreen() {
    const router = useRouter();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const isFormComplete =
        currentPassword.length > 0 &&
        newPassword.length >= 12 &&
        confirmPassword.length > 0 &&
        newPassword === confirmPassword;

    const handleBack = () => {
        router.back();
    };

    const handleSave = () => {
        router.back();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <View style={styles.header}>
                    <Pressable style={styles.backButton} onPress={handleBack}>
                        <Feather name="chevron-left" size={24} color={Colors.light.white} />
                    </Pressable>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>CHANGE PASSWORD</Text>
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Current Password</Text>
                    <View style={styles.inputBox}>
                        <TextInput
                            style={styles.inputText}
                            placeholder="Enter your current password"
                            placeholderTextColor={Colors.light.icon}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            secureTextEntry={!showCurrent}
                        />
                        <Pressable style={styles.eyeButton} onPress={() => setShowCurrent(!showCurrent)}>
                            <Feather
                                name={showCurrent ? "eye" : "eye-off"}
                                size={18}
                                color={Colors.light.icon}
                            />
                        </Pressable>
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>New Password</Text>
                    <View style={styles.inputBox}>
                        <TextInput
                            style={styles.inputText}
                            placeholder="Your password must be at least 12 characters"
                            placeholderTextColor={Colors.light.icon}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry={!showNew}
                        />
                        <Pressable style={styles.eyeButton} onPress={() => setShowNew(!showNew)}>
                            <Feather
                                name={showNew ? "eye" : "eye-off"}
                                size={18}
                                color={Colors.light.icon}
                            />
                        </Pressable>
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <View style={styles.inputBox}>
                        <TextInput
                            style={styles.inputText}
                            placeholder="Confirm your new password"
                            placeholderTextColor={Colors.light.icon}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirm}
                        />
                        <Pressable style={styles.eyeButton} onPress={() => setShowConfirm(!showConfirm)}>
                            <Feather
                                name={showConfirm ? "eye" : "eye-off"}
                                size={18}
                                color={Colors.light.icon}
                            />
                        </Pressable>
                    </View>
                </View>

                <View style={styles.bottomSection}>
                    <PrimaryButton
                        text="SAVE"
                        onPress={handleSave}
                        style={
                            isFormComplete
                                ? undefined
                                : { backgroundColor: Colors.light.greybuttonversion }
                        }
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
