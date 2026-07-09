import React, { useState } from "react";
import {
    View,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useForm } from "react-hook-form";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { Colors } from "@/constants/theme";
import { changePasswordStyles as styles } from "./style";
import { useRouter } from "expo-router";
import PrimaryButton from "@/components/atoms/Primary-button";
import CustomTextInput from "@/components/atoms/CustomTextInput";

export default function ChangePasswordScreen() {
    const router = useRouter();
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { control, watch } = useForm({
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const [currentPassword, newPassword, confirmPassword] = watch([
        "currentPassword",
        "newPassword",
        "confirmPassword",
    ]);

    const isFormComplete =
        (currentPassword ?? "").length > 0 &&
        (newPassword ?? "").length >= 8 &&
        (confirmPassword ?? "").length > 0 &&
        newPassword === confirmPassword;

    const handleBack = () => {
        router.back();
    };

    const handleSave = () => {
        router.back();
    };

    return (
        <BlackScreenWrapper>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                
                <View style={styles.inputGroup}>
                    <CustomTextInput
                        label="Current Password"
                        placeholder="Enter your current password"
                        control={control}
                        name="currentPassword"
                        secureTextEntry={!showCurrent}
                        showEye
                        onToggleEye={() => setShowCurrent(!showCurrent)}
                        containerStyle={styles.inputBox}
                        inputStyle={styles.inputText}
                        labelStyle={styles.label}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <CustomTextInput
                        label="New Password"
                        placeholder="Your password must be at least 8 characters"
                        control={control}
                        name="newPassword"
                        secureTextEntry={!showNew}
                        showEye
                        onToggleEye={() => setShowNew(!showNew)}
                        containerStyle={styles.inputBox}
                        inputStyle={styles.inputText}
                        labelStyle={styles.label}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <CustomTextInput
                        label="Confirm Password"
                        placeholder="Confirm your new password"
                        control={control}
                        name="confirmPassword"
                        secureTextEntry={!showConfirm}
                        showEye
                        onToggleEye={() => setShowConfirm(!showConfirm)}
                        containerStyle={styles.inputBox}
                        inputStyle={styles.inputText}
                        labelStyle={styles.label}
                    />
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
        </BlackScreenWrapper>
    );
}
