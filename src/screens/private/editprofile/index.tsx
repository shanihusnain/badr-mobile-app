import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { LoadingComponent } from "@/components/atoms/LoadingComponent";
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
import { useGetMe } from "@/src/api/queries/useGetMe";
import { useUpdateProfile } from "@/src/api/mutations/useUpdateProfile";
import { useUploadAvatar } from "@/src/api/mutations/useUploadAvatar";
import { useAuth } from "@/provider/useAuth";
import { useQueryClient } from "@tanstack/react-query";

type EditProfileForm = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
  country: string;
  gender: string;
};

const normalizeDob = (value?: string | null) => {
  if (!value) return "";
  return value.includes("T") ? value.slice(0, 10) : value;
};

const genderFromApi = (value?: string | null) => {
  const normalized = (value ?? "").toUpperCase();
  if (normalized === "MALE") return "Male";
  if (normalized === "FEMALE") return "Female";
  if (value === "Male" || value === "Female") return value;
  return "";
};

const genderToApi = (value: string): "MALE" | "FEMALE" | undefined => {
  if (value === "Male") return "MALE";
  if (value === "Female") return "FEMALE";
  return undefined;
};

const extractRemoteAvatarUrl = (payload: unknown): string | null => {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data = root.data as Record<string, unknown> | undefined;
  const user = data?.user as Record<string, unknown> | undefined;
  const candidates = [
    user?.avatarUrl,
    data?.avatarUrl,
    data?.url,
    root.avatarUrl,
  ];
  for (const value of candidates) {
    if (typeof value === "string" && value.startsWith("http")) return value;
  }
  return null;
};

export default function EditProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: authUser, updateUser } = useAuth();
  const { data: meUser, isLoading: isMeLoading } = useGetMe();
  const { mutateAsync: updateProfile, isPending: isUpdating } =
    useUpdateProfile();
  const { mutateAsync: uploadAvatar, isPending: isUploadingAvatar } =
    useUploadAvatar();

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [lockDobDropdownScroll, setLockDobDropdownScroll] = useState(false);

  const { genders, countries } = useCreateAccountProps();
  const { control, watch, reset, handleSubmit } = useForm<EditProfileForm>({
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      dob: "",
      country: "",
      gender: "",
    },
  });

  const profile = (meUser ?? authUser) as
    | (Record<string, unknown> & {
        id?: string;
        username?: string;
        email?: string;
        avatarUrl?: string | null;
        dateOfBirth?: string | null;
        gender?: string | null;
        country?: string | null;
      })
    | null
    | undefined;

  useEffect(() => {
    if (!profile) return;
    reset({
      username: profile.username ?? "",
      firstName:
        typeof profile.firstName === "string" ? profile.firstName : "",
      lastName: typeof profile.lastName === "string" ? profile.lastName : "",
      email: profile.email ?? "",
      dob: normalizeDob(
        profile.dateOfBirth ??
          (typeof profile.dob === "string" ? profile.dob : null),
      ),
      country: profile.country ?? "",
      gender: genderFromApi(profile.gender),
    });
    if (
      typeof profile.avatarUrl === "string" &&
      profile.avatarUrl.startsWith("http")
    ) {
      setProfileImage(profile.avatarUrl);
    }
  }, [profile, reset]);

  const [username, email, dob, watchedCountry, watchedGender] = watch([
    "username",
    "email",
    "dob",
    "country",
    "gender",
  ]);

  const isFormComplete = useMemo(
    () =>
      (username ?? "").trim().length > 0 &&
      (email ?? "").trim().length > 0 &&
      (dob ?? "").trim().length > 0 &&
      (watchedCountry ?? "").trim().length > 0 &&
      (watchedGender ?? "").trim().length > 0,
    [username, email, dob, watchedCountry, watchedGender],
  );

  const pickCameraImage = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);
      setLocalImageUri(uri);
    }
  };

  const onSave = async (data: EditProfileForm) => {
    const userId = profile?.id ?? authUser?.id;
    if (!userId) return;

    const gender = genderToApi(data.gender);
    if (!gender) return;

    try {
      let avatarUrl =
        typeof profile?.avatarUrl === "string" &&
        profile.avatarUrl.startsWith("http")
          ? profile.avatarUrl
          : null;

      if (localImageUri) {
        const uploadResult = await uploadAvatar({
          imageUri: localImageUri,
          userId,
        });
        const remoteAvatarUrl = extractRemoteAvatarUrl(uploadResult);
        if (remoteAvatarUrl) {
          avatarUrl = remoteAvatarUrl;
        }
      }

      const response = await updateProfile({
        userId,
        username: data.username.trim(),
        email: data.email.trim(),
        gender,
        dob: data.dob,
        country: data.country,
      });

      const savedUser = response?.data?.user;
      const nextUser = {
        ...(authUser ?? profile ?? {}),
        ...(savedUser ?? {}),
        id: userId,
        username: savedUser?.username ?? data.username.trim(),
        email: savedUser?.email ?? data.email.trim().toLowerCase(),
        gender,
        dateOfBirth: data.dob,
        country: data.country,
        avatarUrl: avatarUrl ?? authUser?.avatarUrl ?? null,
      };

      await updateUser(nextUser);
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      router.back();
    } catch {
      // Toast handled in mutations
    }
  };

  if (isMeLoading && !profile) {
    return (
      <BlackScreenWrapper>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <LoadingComponent size="large" />
        </View>
      </BlackScreenWrapper>
    );
  }

  const isSaving = isUpdating || isUploadingAvatar;

  return (
    <BlackScreenWrapper>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          scrollEnabled={!lockDobDropdownScroll}
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
              onDropdownOpenChange={setLockDobDropdownScroll}
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
              searchable
              searchPlaceholder="Search country"
              emptySearchText="No countries found"
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
              onPress={handleSubmit(onSave)}
              disabled={!isFormComplete || isSaving}
              isLoading={isSaving}
              style={
                isFormComplete && !isSaving
                  ? undefined
                  : { backgroundColor: Colors.light.inactivegreen }
              }
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BlackScreenWrapper>
  );
}
