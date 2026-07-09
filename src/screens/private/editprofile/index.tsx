import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { useForm } from "react-hook-form";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { editProfileStyles as styles } from "./styles";
import { useRouter } from "expo-router";
import PrimaryButton from "@/components/atoms/Primary-button";
import CustomDropdown from "@/components/atoms/CustomDropdown";
import CustomDatePicker from "@/components/atoms/CustomDatePicker";
import CustomTextInput from "@/components/atoms/CustomTextInput";
import { useCreateAccountProps } from "@/src/screens/auth/createaccount/useCreateAccountProps";

export default function EditProfileScreen() {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const { genders, countries } = useCreateAccountProps();
  const { control, watch } = useForm({
    defaultValues: {
      username: "Layla9",
      firstName: "Layla",
      lastName: "Najia",
      email: "layla.najia@gmail.com",
      dob: "17/06/1984",
      country: "Qatar",
      gender: "Female",
    },
  });

  const [username, firstName, lastName, email, dob, watchedCountry, watchedGender] = watch([
    "username",
    "firstName",
    "lastName",
    "email",
    "dob",
    "country",
    "gender",
  ]);

  const pickCameraImage = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const isFormComplete =
    (username ?? "").trim().length > 0 &&
    (firstName ?? "").trim().length > 0 &&
    (lastName ?? "").trim().length > 0 &&
    (email ?? "").trim().length > 0 &&
    (dob ?? "").trim().length > 0 &&
    (watchedCountry ?? "").trim().length > 0 &&
    (watchedGender ?? "").trim().length > 0;

  const handleSave = () => {
    router.back();
  };

  return (
    <BlackScreenWrapper>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        
        

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileImageContainer}>
            <Image
              source={
                profileImage
                  ? { uri: profileImage }
                  : require("@/assets/images/icon.png")
              }
              style={styles.profileImage}
            />
            <Pressable style={styles.cameraButton} onPress={pickCameraImage}>
              <Feather name="camera" size={16} color={Colors.light.white} />
            </Pressable>
          </View>

          <View style={styles.inputGroup}>
            <CustomTextInput
              label="Username"
              placeholder="Username"
              control={control}
              name="username"
              containerStyle={[styles.inputBox, styles.disabledInputBox]}
              inputStyle={[styles.inputText, styles.disabledInputText]}
              labelStyle={styles.label}
              editable={false}
              selectTextOnFocus={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <CustomTextInput
              label="First Name"
              placeholder="First Name"
              control={control}
              name="firstName"
              containerStyle={styles.inputBox}
              inputStyle={styles.inputText}
              labelStyle={styles.label}
            />
          </View>

          <View style={styles.inputGroup}>
            <CustomTextInput
              label="Last Name"
              placeholder="Last Name"
              control={control}
              name="lastName"
              containerStyle={styles.inputBox}
              inputStyle={styles.inputText}
              labelStyle={styles.label}
            />
          </View>

          <View style={styles.inputGroup}>
            <CustomTextInput
              label="Email Address"
              placeholder="Email Address"
              control={control}
              name="email"
              keyboardType="email-address"
              autoCapitalize="none"
              containerStyle={styles.inputBox}
              inputStyle={styles.inputText}
              labelStyle={styles.label}
            />
          </View>

          <View style={styles.inputGroup}>
            <CustomDatePicker
              label="Date of Birth"
              placeholder="Select your birth date"
              control={control}
              name="dob"
              labelStyle={styles.label}
              containerStyle={styles.inputBox}
              textStyle={styles.inputText}
            />
          </View>

          <View style={styles.inputGroup}>
            <CustomDropdown
              label="Country"
              placeholder="Select your country"
              options={countries}
              control={control}
              name="country"
              labelStyle={styles.dropdownLabel}
              containerStyle={styles.dropdownContainer}
            />
          </View>

          <View style={styles.inputGroup}>
            <CustomDropdown
              label="Gender"
              placeholder="Select your gender"
              options={genders}
              control={control}
              name="gender"
              labelStyle={styles.dropdownLabel}
              containerStyle={styles.dropdownContainer}
            />
          </View>

          <View style={styles.saveButtonContainer}>
            <PrimaryButton
              text="SAVE"
              onPress={handleSave}
              style={isFormComplete ? undefined : { backgroundColor: Colors.light.inactivegreen }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BlackScreenWrapper>
  );
}
