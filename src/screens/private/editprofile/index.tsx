import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { useForm } from "react-hook-form";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { editProfileStyles as styles } from "./styles";
import { useRouter } from "expo-router";
import PrimaryButton from "@/components/atoms/Primary-button";
import CustomDropdown from "@/components/atoms/CustomDropdown";
import { useCreateAccountProps } from "@/src/screens/auth/createaccount/useCreateAccountProps";

export default function EditProfileScreen() {
  const router = useRouter();

  const [username, setUsername] = useState("Layla9");
  const [firstName, setFirstName] = useState("Layla");
  const [lastName, setLastName] = useState("Najia");
  const [email, setEmail] = useState("layla.najia@gmail.com");
  const [dob, setDob] = useState("17/06/1984");

  const { genders, countries } = useCreateAccountProps();
  const { control, watch } = useForm({
    defaultValues: {
      country: "Qatar",
      gender: "Female",
    },
  });

  const watchedCountry = watch("country");
  const watchedGender = watch("gender");

  const handleBack = () => {
    router.back();
  };

  const isFormComplete =
    username.trim().length > 0 &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    dob.trim().length > 0 &&
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
              source={require("@/assets/images/icon.png")} // Placeholder
              style={styles.profileImage}
            />
            <Pressable style={styles.cameraButton}>
              <Feather name="camera" size={16} color={Colors.light.white} />
            </Pressable>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <View style={[styles.inputBox, styles.disabledInputBox]}>
              <TextInput
                style={[styles.inputText, styles.disabledInputText]}
                value={username}
                editable={false}
                selectTextOnFocus={false}
                placeholderTextColor={Colors.light.icon}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.inputText}
                value={firstName}
                onChangeText={setFirstName}
                placeholderTextColor={Colors.light.icon}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.inputText}
                value={lastName}
                onChangeText={setLastName}
                placeholderTextColor={Colors.light.icon}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.inputText}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={Colors.light.icon}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth</Text>
            <Pressable style={styles.inputBox}>
              <Text style={styles.inputText}>{dob}</Text>
              <Feather
                name="calendar"
                size={18}
                color={Colors.light.icon}
                style={styles.rightIcon}
              />
            </Pressable>
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
