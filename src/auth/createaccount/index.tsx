import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import PrimaryButton from "../../../components/atoms/Primary-button";
import { Colors } from "../../../constants/theme";
import CustomDropdown from "./component/CustomDropdown";
import CustomTextInput from "./component/CustomTextInput";
import createStyles from "./styles";

const schema = z
  .object({
    name: z.string().min(1, "Input missing"),
    password: z
      .string()
      .min(1, "Input missing")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase")
      .regex(/[a-z]/, "Must contain lowercase")
      .regex(/[0-9]/, "Must contain number")
      .regex(
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
        "Must contain special character",
      ),
    confirmPassword: z.string().min(1, "Input missing"),
    email: z.string().min(1, "Input missing").email("Invalid email"),
    gender: z.string().min(1, "Input missing"),
    dob: z.string().min(1, "Input missing"),
    country: z.string().min(1, "Input missing"),
    dateView: z.string().min(1, "Input missing"),
    week: z.string().min(1, "Input missing"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function CreateAccountScreen() {
  const styles = createStyles();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),

    mode: "onChange",
    reValidateMode: "onChange",

    defaultValues: {
      name: "",
      password: "",
      confirmPassword: "",
      email: "",
      gender: "",
      dob: "",
      country: "",
      dateView: "",
      week: "",
    },
  });

  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDateViewOpen, setIsDateViewOpen] = useState(false);
  const [isWeekOpen, setIsWeekOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = (data: z.infer<typeof schema>) => {
    router.push("/otp");
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
        {/* use our own component make it more customizable and reusable */}
        <View style={styles.formWrapper}>
          {/* USERNAME */}
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <CustomTextInput
                label="User name"
                placeholder="Enter user name"
                value={value}
                onChangeText={onChange}
                errors={errors.name?.message ? [errors.name.message] : []}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <CustomTextInput
                label="Password"
                placeholder="Enter password"
                value={value}
                onChangeText={onChange}
                secureTextEntry={!showPassword}
                showEye
                onToggleEye={() => setShowPassword(!showPassword)}
                errors={
                  errors.password?.message ? [errors.password.message] : []
                }
              />
            )}
          />
          {/* CONFIRM PASSWORD */}
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <CustomTextInput
                label="Confirm Password"
                placeholder="Confirm password"
                value={value}
                onChangeText={onChange}
                secureTextEntry={!showConfirmPassword}
                showEye
                onToggleEye={() => setShowConfirmPassword(!showConfirmPassword)}
                errors={
                  errors.confirmPassword?.message
                    ? [errors.confirmPassword.message]
                    : []
                }
              />
            )}
          />
          {/* EMAIL */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <CustomTextInput
                label="Email Address"
                placeholder="Enter email address"
                value={value}
                onChangeText={onChange}
                errors={errors.email?.message ? [errors.email.message] : []}
              />
            )}
          />
          <Controller
            control={control}
            name="gender"
            render={({ field: { onChange, value } }) => (
              <CustomDropdown
                label="Gender"
                placeholder="Enter Gender"
                selectedValue={value}
                options={["Male", "Female"]}
                isOpen={isGenderOpen}
                onToggle={() => setIsGenderOpen(!isGenderOpen)}
                onSelect={(item) => {
                  onChange(item);
                  setIsGenderOpen(false);
                }}
                errors={errors.gender?.message ? [errors.gender.message] : []}
                labelStyle={styles.genderLabel}
                containerStyle={styles.genderContainer}
                selectedTextStyle={styles.genderText}
              />
            )}
          />
          {/* DOB */}
          <View style={{ alignSelf: "flex-start", width: "100%" }}>
            <Controller
              control={control}
              name="dob"
              render={({ field: { onChange, value } }) => (
                <>
                  <Text style={styles.doblabel}>Date Of Birth</Text>
                  <TouchableOpacity
                    style={styles.dobContainer}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text style={[styles.dobText, { flex: 1 }]}>
                        {value || "Enter Date Of Birth"}
                      </Text>
                      <Text style={{ color: Colors.light.white }}>📅</Text>
                    </View>
                  </TouchableOpacity>
                  {errors.dob?.message && (
                    <View style={{ marginTop: 5 }}>
                      <Text
                        style={{
                          color: "red",
                          fontSize: 12,
                        }}
                      >
                        {errors.dob.message}
                      </Text>
                    </View>
                  )}
                  {showDatePicker && (
                    <DateTimePicker
                      value={new Date()}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) {
                          const formatted =
                            selectedDate.getDate() +
                            "/" +
                            (selectedDate.getMonth() + 1) +
                            "/" +
                            selectedDate.getFullYear();
                          onChange(formatted);
                        }
                      }}
                    />
                  )}
                </>
              )}
            />
          </View>
          <Controller
            control={control}
            name="country"
            render={({ field: { onChange, value } }) => (
              <CustomDropdown
                label="Country"
                placeholder="Country"
                selectedValue={value}
                options={["Pakistan", "Saudi Arabia"]}
                isOpen={isCountryOpen}
                onToggle={() => setIsCountryOpen(!isCountryOpen)}
                onSelect={(item) => {
                  onChange(item);
                  setIsCountryOpen(false);
                }}
                errors={errors.country?.message ? [errors.country.message] : []}
                labelStyle={styles.countrylabel}
                containerStyle={styles.countryContainer}
                selectedTextStyle={styles.countryText}
              />
            )}
          />

          <Controller
            control={control}
            name="dateView"
            render={({ field: { onChange, value } }) => (
              <CustomDropdown
                label="Your Preferred Date View"
                placeholder="Select Date View"
                selectedValue={value}
                options={["Gregorian View", "Hijri View"]}
                isOpen={isDateViewOpen}
                onToggle={() => setIsDateViewOpen(!isDateViewOpen)}
                onSelect={(item) => {
                  onChange(item);
                  setIsDateViewOpen(false);
                }}
                errors={
                  errors.dateView?.message ? [errors.dateView.message] : []
                }
                labelStyle={styles.dateviewLabel}
                containerStyle={styles.dateviewContainer}
                selectedTextStyle={styles.dateviewText}
              />
            )}
          />

          <Controller
            control={control}
            name="week"
            render={({ field: { onChange, value } }) => (
              <CustomDropdown
                label="Week Days"
                placeholder="Select Week Days"
                selectedValue={value}
                options={["Friday & Saturday", "Saturday & Sunday"]}
                isOpen={isWeekOpen}
                onToggle={() => setIsWeekOpen(!isWeekOpen)}
                onSelect={(item) => {
                  onChange(item);
                  setIsWeekOpen(false);
                }}
                errors={errors.week?.message ? [errors.week.message] : []}
                labelStyle={styles.weeklabel}
                containerStyle={styles.weekContainer}
                selectedTextStyle={styles.weekText}
              />
            )}
          />

          <View style={{ width: 333, marginTop: hp(3) }}>
            <PrimaryButton
              text="CREATE ACCOUNT"
              onPress={handleSubmit(onSubmit)}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
