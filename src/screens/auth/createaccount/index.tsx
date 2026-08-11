import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Platform, View, Image, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import AntDesign from "@expo/vector-icons/AntDesign";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import createStyles from "./styles";
import CustomDropdown from "@/components/atoms/CustomDropdown";
import CustomDatePicker from "@/components/atoms/CustomDatePicker";
import CustomTextInput from "@/components/atoms/CustomTextInput";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { useValidations } from "@/src/validations/useValidations";
import { useCreateAccountProps } from "./useCreateAccountProps";
import PrimaryButton from "@/components/atoms/Primary-button";
import { useTranslation } from "react-i18next";
import { TopSpace } from "@/components/atoms/TopSpace";
import { ProfileInformationIcon } from "@/assets/icons";
import {
  useRegister,
  type RegisterPayload,
} from "@/src/api/mutations/useRegister";
import { useUpdateProfile } from "@/src/api/mutations/useUpdateProfile";
import { useAuth } from "@/provider/useAuth";
import { useUploadAvatar } from "@/src/api/mutations/useUploadAvatar";
import { normalizeWeekendDays } from "@/src/utils/needsSocialProfileCompletion";

type SocialUserParam = {
  id?: string;
  email?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  country?: string | null;
  preferredDateView?: string | null;
  calendarView?: string | null;
  weekendDays?: string | string[] | null;
};

const genderFromApi = (value?: string | null) => {
  if (value === "MALE") return "Male";
  if (value === "FEMALE") return "Female";
  return "";
};

const dateViewFromApi = (value?: string | null) => {
  if (!value) return "";
  const normalized = String(value).trim().toUpperCase();
  if (normalized === "HIJRI" || normalized === "HIJRI VIEW")
    return "Hijri View";
  if (normalized === "GREGORIAN" || normalized === "GREGORIAN VIEW") {
    return "Gregorian View";
  }
  if (value === "Hijri View" || value === "Gregorian View") return value;
  return "";
};

const normalizeDob = (value?: string | null) => {
  if (!value) return "";
  // API may return ISO datetime; form/date picker expects YYYY-MM-DD.
  return value.includes("T") ? value.slice(0, 10) : value;
};

const weekendFromApi = (value?: string | string[] | null) => {
  const days = normalizeWeekendDays(value);
  if (!days) return "";
  if (days.includes("FRIDAY") && days.includes("SATURDAY")) {
    return "Friday & Saturday";
  }
  if (days.includes("SATURDAY") && days.includes("SUNDAY")) {
    return "Saturday & Sunday";
  }
  return "";
};

const firstParam = (raw?: string | string[]) =>
  Array.isArray(raw) ? raw[0] : raw;

const parseSocialUser = (raw?: string | string[]): SocialUserParam | null => {
  const value = firstParam(raw);
  if (!value) return null;
  if (typeof value === "object") return value as SocialUserParam;
  try {
    return JSON.parse(value) as SocialUserParam;
  } catch {
    return null;
  }
};

const extractRemoteAvatarUrl = (payload: unknown): string | null => {
  if (!payload || typeof payload !== "object") return null;

  const root = payload as Record<string, unknown>;
  const data =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : null;
  const user =
    data?.user && typeof data.user === "object"
      ? (data.user as Record<string, unknown>)
      : null;

  // Backend: { data: { user: { avatarUrl } } }
  const candidates = [
    user?.avatarUrl,
    data?.avatarUrl,
    data?.url,
    typeof root.data === "string" ? root.data : null,
    root.avatarUrl,
    root.url,
  ];

  for (const candidate of candidates) {
    if (
      typeof candidate === "string" &&
      candidate.length > 0 &&
      (candidate.startsWith("http://") || candidate.startsWith("https://"))
    ) {
      return candidate;
    }
  }

  return null;
};

export default function CreateAccountScreen() {
  const styles = createStyles();
  const fieldLabelStyle = {
    color: Colors.light.grey,
    fontFamily: fonts.primary.regular,
    fontWeight: "400" as const,
  };
  const params = useLocalSearchParams<{
    user?: string | string[];
    calendarView?: string | string[];
    weekendDays?: string | string[];
  }>();
  const router = useRouter();
  const { updateUser, user: authUser, signIn } = useAuth();

  // Prefer auth user (arrays intact after signIn) over route params, which can
  // drop nested weekendDays when Expo Router serializes the query string.
  const socialUser = useMemo(() => {
    const fromParams = parseSocialUser(params.user);
    const paramCalendarView = firstParam(params.calendarView) || null;
    const paramWeekendDays = firstParam(params.weekendDays) || null;

    const fromAuth =
      authUser && typeof authUser === "object"
        ? (authUser as SocialUserParam)
        : null;

    const base =
      fromParams?.id && fromAuth?.id && fromParams.id === fromAuth.id
        ? { ...fromParams, ...fromAuth }
        : fromParams?.id
          ? fromParams
          : fromAuth?.id
            ? fromAuth
            : null;

    if (!base?.id) return null;

    return {
      ...base,
      calendarView:
        paramCalendarView ||
        base.calendarView ||
        base.preferredDateView ||
        null,
      preferredDateView:
        base.preferredDateView ||
        paramCalendarView ||
        base.calendarView ||
        null,
      weekendDays:
        normalizeWeekendDays(paramWeekendDays) ??
        normalizeWeekendDays(base.weekendDays) ??
        null,
    };
  }, [authUser, params.calendarView, params.user, params.weekendDays]);

  const isSocialFlow = !!socialUser?.id;

  const { createAccountSchema, socialCompleteProfileSchema } = useValidations();
  const { t } = useTranslation();
  const { mutateAsync: registerUser, isPending: isRegistering } = useRegister();
  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } =
    useUpdateProfile();
  const { mutateAsync: uploadAvatar, isPending: isUploadingAvatar } =
    useUploadAvatar();
  const defaultValues = useMemo(
    () => ({
      name: socialUser?.username ?? "",
      password: "",
      confirmPassword: "",
      email: socialUser?.email ?? "",
      gender: genderFromApi(socialUser?.gender),
      dob: normalizeDob(socialUser?.dateOfBirth),
      country: socialUser?.country ?? "",
      dateView: dateViewFromApi(
        socialUser?.preferredDateView ?? socialUser?.calendarView,
      ),
      week: weekendFromApi(socialUser?.weekendDays),
    }),
    [socialUser],
  );

  const {
    genders,
    showPassword,
    showConfirmPassword,
    countries,
    calendarView,
    weekDays,
    onPasswordToggle,
    onConfirmPasswordToggle,
  } = useCreateAccountProps();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(
      isSocialFlow ? socialCompleteProfileSchema : createAccountSchema,
    ),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues,
  });

  // Route/auth prefs can arrive after first mount — keep dropdowns in sync.
  useEffect(() => {
    if (!isSocialFlow) return;
    reset(defaultValues);
  }, [defaultValues, isSocialFlow, reset]);

  const [image, setImage] = useState<string | null>(
    socialUser?.avatarUrl ?? null,
  );
  /** Only local camera/gallery URIs should be uploaded (not remote social avatar URLs). */
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (!localImageUri && socialUser?.avatarUrl) {
      setImage(socialUser.avatarUrl);
    }
  }, [localImageUri, socialUser?.avatarUrl]);

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

  const weekendDaysArrayMap: Record<
    string,
    Array<"FRIDAY" | "SATURDAY" | "SUNDAY">
  > = {
    "Friday & Saturday": ["FRIDAY", "SATURDAY"],
    "Saturday & Sunday": ["SATURDAY", "SUNDAY"],
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
      const uri = result.assets[0].uri;
      setImage(uri);
      setLocalImageUri(uri);
    }
  };

  const onSubmit = async (
    data:
      | z.infer<typeof createAccountSchema>
      | z.infer<typeof socialCompleteProfileSchema>,
  ) => {
    if (isSocialFlow && socialUser?.id) {
      try {
        await updateProfile({
          userId: socialUser.id,
          username: data.name.trim(),
          email: data.email.trim(),
          gender: genderMap[data.gender],
          dob: data.dob,
          country: data.country,
          preferredDateView: calendarViewMap[data.dateView],
          weekendDays: weekendDaysArrayMap[data.week],
        });

        let avatarUrl =
          typeof socialUser.avatarUrl === "string" &&
          socialUser.avatarUrl.startsWith("http")
            ? socialUser.avatarUrl
            : null;

        if (localImageUri) {
          const uploadResult = await uploadAvatar({
            imageUri: localImageUri,
            userId: socialUser.id,
          });

          // Must come from upload API only: data.user.avatarUrl
          const remoteAvatarUrl = extractRemoteAvatarUrl(uploadResult);
          if (!remoteAvatarUrl) {
            throw new Error(
              "Avatar uploaded but server did not return data.user.avatarUrl",
            );
          }
          avatarUrl = remoteAvatarUrl;
        }

        const nextUser = {
          ...(authUser ?? socialUser),
          username: data.name.trim(),
          email: data.email.trim(),
          gender: genderMap[data.gender],
          dateOfBirth: data.dob,
          country: data.country,
          preferredDateView: calendarViewMap[data.dateView],
          weekendDays: weekendDaysArrayMap[data.week],
          avatarUrl,
        };

        await updateUser(nextUser);

        router.replace("/(private)/greetingsscreen");
      } catch {
        // Toast handled in mutations
      }
      return;
    } else if (!isSocialFlow) {
      const payload: RegisterPayload = {
        username: data.name.trim(),
        email: data.email.trim(),
        password: data.password ?? "",
        confirmPassword: data.confirmPassword ?? "",
        gender: genderMap[data.gender],
        dateOfBirth: data.dob,
        country: data.country,
        calendarView: calendarViewMap[data.dateView],
        weekendDays: weekendDaysMap[data.week],
      };

      try {
        const response = await registerUser(payload);
        if (!response?.success) {
          throw new Error(response?.message ?? "Registration failed");
        }

        const authData = response.data ?? {};
        const { accessToken, refreshToken, user } = authData;

        if (!accessToken) {
          throw new Error("Registration succeeded but no access token was returned");
        }

        // Required for authenticated avatar upload; private stack only after OTP.
        let nextUser = { ...(user ?? {}) };

        await signIn(accessToken, refreshToken, nextUser);

        if (localImageUri && user?.id) {
          const uploadResult = await uploadAvatar({
            imageUri: localImageUri,
            userId: user.id,
          });
          const remoteAvatarUrl = extractRemoteAvatarUrl(uploadResult);
          if (remoteAvatarUrl) {
            nextUser = { ...nextUser, avatarUrl: remoteAvatarUrl };
            await updateUser(nextUser);
          }
        }

        router.replace({
          pathname: "/(auth)/verifyemail/[fromsignup]",
          params: {
            fromsignup: "true",
            email: data.email.trim(),
          },
        });
      } catch {
        // Toast handled in useRegister / useUploadAvatar
      }
    }
  };

  const onInvalid = (formErrors: typeof errors) => {
    console.log("[create-account] validation failed", formErrors);
  };

  const isPending = isRegistering || isUpdatingProfile || isUploadingAvatar;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        style={{ width: "100%" }}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        enableAutomaticScroll
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
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
          labelStyle={fieldLabelStyle}
          placeholder={t("createAccountScreen.usernamePlaceholder")}
          errors={errors.name?.message ? [errors.name.message] : []}
          control={control}
          name="name"
        />
        <TopSpace top={16} />

        {!isSocialFlow ? (
          <>
            <CustomTextInput
              label={t("createAccountScreen.passwordLabel")}
              labelStyle={fieldLabelStyle}
              placeholder={t("createAccountScreen.passwordPlaceholder")}
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
              labelStyle={fieldLabelStyle}
              placeholder={t("createAccountScreen.confirmPasswordPlaceholder")}
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
          </>
        ) : null}

        <CustomTextInput
          label={t("createAccountScreen.emailLabel")}
          labelStyle={fieldLabelStyle}
          placeholder={t("createAccountScreen.emailPlaceholder")}
          errors={errors.email?.message ? [errors.email.message] : []}
          control={control}
          name="email"
          autoCapitalize="none"
        />
        <TopSpace top={16} />

        <CustomDropdown
          label={t("createAccountScreen.genderLabel")}
          labelStyle={fieldLabelStyle}
          placeholder={t("createAccountScreen.genderPlaceholder")}
          options={genders}
          errors={errors.gender?.message ? [errors.gender.message] : []}
          control={control}
          name="gender"
        />

        <CustomDatePicker
          label={t("createAccountScreen.dobLabel")}
          labelStyle={fieldLabelStyle}
          placeholder={t("createAccountScreen.dobPlaceholder")}
          control={control}
          name="dob"
          errors={errors.dob?.message ? [errors.dob.message] : []}
        />
        <TopSpace top={16} />

        <CustomDropdown
          label={t("createAccountScreen.countryLabel")}
          labelStyle={fieldLabelStyle}
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
          labelStyle={fieldLabelStyle}
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
          labelStyle={fieldLabelStyle}
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
            text={
              isSocialFlow
                ? "UPDATE ACCOUNT"
                : t("createAccountScreen.createAccountBtn")
            }
            onPress={handleSubmit(onSubmit, onInvalid)}
            disabled={isPending}
            isLoading={isPending}
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
