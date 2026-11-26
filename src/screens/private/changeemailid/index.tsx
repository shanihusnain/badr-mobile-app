import React from "react";
import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { Colors } from "@/constants/theme";
import { changeEmailStyles as styles } from "./style";
import { useRouter } from "expo-router";
import PrimaryButton from "@/components/atoms/Primary-button";
import CustomTextInput from "@/components/atoms/CustomTextInput";
import { useAuth } from "@/provider/useAuth";
import { useUpdateProfile } from "@/src/api/mutations/useUpdateProfile";

const changeEmailSchema = z.object({
  email: z
    .string()
    .min(1, "Please enter your email")
    .email("Please enter a valid email address"),
});

export default function ChangeEmailIdScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<z.infer<typeof changeEmailSchema>>({
    resolver: zodResolver(changeEmailSchema),
    mode: "onChange",
    defaultValues: {
      email: user?.email ?? "",
    },
  });

  const onSave = async (data: z.infer<typeof changeEmailSchema>) => {
    const nextEmail = data.email.trim().toLowerCase();
    if (nextEmail === (user?.email ?? "").trim().toLowerCase()) {
      router.back();
      return;
    }

    try {
      const response = await updateProfile({ email: nextEmail });
      const savedEmail = response?.data?.user?.email ?? nextEmail;
      if (user) {
        await updateUser({ ...user, email: savedEmail });
      }
      router.back();
    } catch {
      // Toast handled in useUpdateProfile
    }
  };

  return (
    <BlackScreenWrapper>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Text style={styles.sectionTitle}>EDIT EMAIL</Text>

        <Text style={styles.description}>
          This will change the account email you use to sign in with{" "}
          <Text style={styles.descriptionBold}>Badr</Text> and where you
          receive notifications.
        </Text>

        <CustomTextInput
          placeholder="Email Address"
          control={control}
          name="email"
          keyboardType="email-address"
          autoCapitalize="none"
          containerStyle={styles.inputBox}
          inputStyle={{
            color: Colors.light.white,
            fontFamily: styles.inputBox.fontFamily,
            fontSize: styles.inputBox.fontSize,
          }}
          errors={errors.email?.message ? [errors.email.message] : []}
        />

        <View style={styles.bottomSection}>
          <PrimaryButton
            text="SAVE"
            onPress={handleSubmit(onSave)}
            disabled={!isValid || isPending}
            isLoading={isPending}
            style={
              isValid && !isPending
                ? undefined
                : { backgroundColor: Colors.light.inactivegreen }
            }
          />
        </View>
      </KeyboardAvoidingView>
    </BlackScreenWrapper>
  );
}
