import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Platform, View, Image, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import AntDesign from "@expo/vector-icons/AntDesign";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import createStyles from "./styles";
import CustomDropdown from "@/components/atoms/CustomDropdown";
import CustomDatePicker from "@/components/atoms/CustomDatePicker";
import CustomTextInput from "@/components/atoms/CustomTextInput";
import { Colors } from "@/constants/theme";
import { useValidations } from "@/src/validations/useValidations";
import { useCreateAccountProps } from "./useCreateAccountProps";
import PrimaryButton from "@/components/atoms/Primary-button";
import { useTranslation } from "react-i18next";
import { TopSpace } from "@/components/atoms/TopSpace";
import { ProfileInformationIcon, ReferUserIcon } from "@/assets/icons";
import {
  useRegister,
  type RegisterPayload,
} from "@/src/api/mutations/useRegister";

export default function CreateAccountScreen() {
  const styles = createStyles();
  const router = useRouter();
  const { createAccountSchema } = useValidations();
  const { t } = useTranslation();
  const { mutateAsync: registerUser, isPending } = useRegister();
  const {
    genders,
    showPassword,
    showConfirmPassword,
    countries,
    calendarView,
    weekDays,
    onPasswordToggle,
    onConfirmPasswordToggle,
    defaultValues,
  } = useCreateAccountProps();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createAccountSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues,
  });

  const [image, setImage] = useState<string | null>(null);

  const genderMap: Record<string, RegisterPayload["gender"]> = {
    Male: "MALE",
    Female: "FEMALE",
  };

  const calendarViewMap: Record<
    string,
    NonNullable<RegisterPayload["calendarView"]>
  > = {
    "Gregorian View": "GREGORIAN",
    "Hijri View": "HIJRI",
  };

  const weekendDaysMap: Record<
    string,
    NonNullable<RegisterPayload["weekendDays"]>
  > = {
    "Friday & Saturday": "FRIDAY_SATURDAY",
    "Saturday & Sunday": "SATURDAY_SUNDAY",
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      cameraType: ImagePicker.CameraType.front,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const onSubmit = async (data: z.infer<typeof createAccountSchema>) => {
    console.log("[create-account] submit", data, image);

    const payload: RegisterPayload = {
      username: data.name.trim(),
      email: data.email.trim(),
      password: data.password,
      confirmPassword: data.confirmPassword,
      gender: genderMap[data.gender],
      dateOfBirth: data.dob,
      country: data.country,
      calendarView: calendarViewMap[data.dateView],
      weekendDays: weekendDaysMap[data.week],
      avatarUrl: image ?? undefined,
    };

    try {
      await registerUser(payload);
    } catch (error: any) {}
  };

  const onInvalid = (formErrors: typeof errors) => {
    console.log("[create-account] validation failed", formErrors);
  };
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        style={{ width: "100%" }}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        enableAutomaticScroll
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={Platform.OS === "ios" ? 20 : 100}
        keyboardOpeningTime={0}
      >
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={pickImage}
          activeOpacity={0.8}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.avatarImage} />
          ) : (
            <ProfileInformationIcon Color={Colors.light.white} />
          )}
          <View style={styles.cameraIconContainer}>
            <AntDesign name="camera" size={14} color={Colors.light.white} />
          </View>
        </TouchableOpacity>

        <CustomTextInput
          label={t("createAccountScreen.usernameLabel")}
          labelStyle={{ color: Colors.light.grey }}
          placeholder={t("createAccountScreen.usernamePlaceholder")}
          value={defaultValues.name}
          errors={errors.name?.message ? [errors.name.message] : []}
          control={control}
          name="name"
        />
        <TopSpace top={16} />
        <CustomTextInput
          label={t("createAccountScreen.passwordLabel")}
          labelStyle={{ color: Colors.light.grey }}
          placeholder={t("createAccountScreen.passwordPlaceholder")}
          value={defaultValues.password}
          errors={errors.password?.message ? [errors.password.message] : []}
          control={control}
          name="password"
          showEye
          secureTextEntry={!showPassword}
          onToggleEye={onPasswordToggle}
        />
        <TopSpace top={16} />

        <CustomTextInput
          label={t("createAccountScreen.confirmPasswordLabel")}
          labelStyle={{ color: Colors.light.grey }}
          placeholder={t("createAccountScreen.confirmPasswordPlaceholder")}
          value={defaultValues.confirmPassword}
          errors={
            errors.confirmPassword?.message
              ? [errors.confirmPassword.message]
              : []
          }
          control={control}
          name="confirmPassword"
          showEye
          secureTextEntry={!showConfirmPassword}
          onToggleEye={onConfirmPasswordToggle}
        />
        <TopSpace top={16} />

        <CustomTextInput
          label={t("createAccountScreen.emailLabel")}
          labelStyle={{ color: Colors.light.grey }}
          placeholder={t("createAccountScreen.emailPlaceholder")}
          value={defaultValues.email}
          errors={errors.email?.message ? [errors.email.message] : []}
          control={control}
          name="email"
          autoCapitalize="none"
        />
        <TopSpace top={16} />

        <CustomDropdown
          label={t("createAccountScreen.genderLabel")}
          labelStyle={{ color: Colors.light.grey }}
          placeholder={t("createAccountScreen.genderPlaceholder")}
          options={genders}
          errors={errors.gender?.message ? [errors.gender.message] : []}
          control={control}
          name="gender"
        />

        <CustomDatePicker
          label={t("createAccountScreen.dobLabel")}
          labelStyle={{ color: Colors.light.grey }}
          placeholder={t("createAccountScreen.dobPlaceholder")}
          control={control}
          name="dob"
          errors={errors.dob?.message ? [errors.dob.message] : []}
        />
        <TopSpace top={16} />

        <CustomDropdown
          label={t("createAccountScreen.countryLabel")}
          labelStyle={{ color: Colors.light.grey }}
          placeholder={t("createAccountScreen.countryPlaceholder")}
          options={countries}
          errors={errors.country?.message ? [errors.country.message] : []}
          containerStyle={styles.countryContainer}
          selectedTextStyle={styles.countryText}
          control={control}
          name="country"
        />
        <TopSpace top={16} />

        <CustomDropdown
          label={t("createAccountScreen.dateViewLabel")}
          labelStyle={{ color: Colors.light.grey }}
          placeholder={t("createAccountScreen.dateViewPlaceholder")}
          options={calendarView}
          errors={errors.dateView?.message ? [errors.dateView.message] : []}
          containerStyle={styles.dateviewContainer}
          selectedTextStyle={styles.dateviewText}
          control={control}
          name="dateView"
        />
        <TopSpace top={16} />

        <CustomDropdown
          label={t("createAccountScreen.weekendDaysLabel")}
          labelStyle={{ color: Colors.light.grey }}
          placeholder={t("createAccountScreen.weekendDaysPlaceholder")}
          options={weekDays}
          errors={errors.week?.message ? [errors.week.message] : []}
          containerStyle={styles.weekContainer}
          selectedTextStyle={styles.weekText}
          control={control}
          name="week"
        />
        <TopSpace top={16} />

        <View style={styles.btnWrapper}>
          <PrimaryButton
            text={t("createAccountScreen.createAccountBtn")}
            onPress={handleSubmit(onSubmit, onInvalid)}
            disabled={isPending}
            isLoading={isPending}
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
