import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React from "react";
import {  useForm } from "react-hook-form";
import { Platform, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import createStyles from "./styles";
import CustomDropdown from "@/components/atoms/CustomDropdown";
import CustomDatePicker from "@/components/atoms/CustomDatePicker";
import CustomTextInput from "@/components/atoms/CustomTextInput";
import { useValidations } from "@/src/validations/useValidations";
import { useCreateAccountProps } from "./useCreateAccountProps";
import PrimaryButton from "@/components/atoms/Primary-button";

export default function CreateAccountScreen() {
  const styles = createStyles();
  const router = useRouter();
  const { createAccountSchema } = useValidations();

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

  const onSubmit = (data: z.infer<typeof createAccountSchema>) => {
    router.push({
        pathname:"./verifyemail/[fromsignup]",
        params:{fromsignup:"true"}
    });
  };
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        enableAutomaticScroll
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={Platform.OS === "ios" ? 20 : 100}
        keyboardOpeningTime={0}
      >
        <CustomTextInput
          label="User name"
          placeholder="Enter user name"
          value={defaultValues.name}
          errors={errors.name?.message ? [errors.name.message] : []}
          control={control}
          name="name"
        />
        <CustomTextInput
          label="Password"
          placeholder="Enter password"
          value={defaultValues.password}
          errors={errors.password?.message ? [errors.password.message] : []}
          control={control}
          name="password"
          showEye
          secureTextEntry={!showPassword}
          onToggleEye={onPasswordToggle}
        />
        <CustomTextInput
          label="Confirm Password"
          placeholder="Enter password"
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
        <CustomTextInput
          label="Email Address"
          placeholder="Enter email address"
          value={defaultValues.email}
          errors={errors.email?.message ? [errors.email.message] : []}
          control={control}
          name="email"
        />
        <CustomDropdown
          label="Gender"
          placeholder="Enter Gender"
          options={genders}
          errors={errors.gender?.message ? [errors.gender.message] : []}
          control={control}
          name="gender"
        />

        <CustomDatePicker 
          label="Date Of Birth"
          placeholder="Enter Date Of Birth"
          control={control}
          name="dob"
          errors={errors.dob?.message ? [errors.dob.message] : []}
        />

        <CustomDropdown
          label="Country"
          placeholder="Country"
          options={countries}
          errors={errors.country?.message ? [errors.country.message] : []}
          labelStyle={styles.countrylabel}
          containerStyle={styles.countryContainer}
          selectedTextStyle={styles.countryText}
          control={control}
          name="country"
        />

        <CustomDropdown
          label="Your Preferred Date View"
          placeholder="Select Date View"
          options={calendarView}
          errors={errors.dateView?.message ? [errors.dateView.message] : []}
          labelStyle={styles.dateviewLabel}
          containerStyle={styles.dateviewContainer}
          selectedTextStyle={styles.dateviewText}
          control={control}
          name="dateView"
        />

        <CustomDropdown
          label="Week Days"
          placeholder="Select Week Days"
          options={weekDays}
          errors={errors.week?.message ? [errors.week.message] : []}
          labelStyle={styles.weeklabel}
          containerStyle={styles.weekContainer}
          selectedTextStyle={styles.weekText}
          control={control}
          name="week"
        />
        <View style={styles.btnWrapper}>
          <PrimaryButton
            text="CREATE ACCOUNT"
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
