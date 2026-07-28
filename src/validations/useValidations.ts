import z from "zod";
import { useTranslation } from "react-i18next";

export const useValidations = () => {
  const { t } = useTranslation();

  const passwordSchema = z
    .string()
    .min(1, t("validations.passwordRequired"))
    .min(8, t("validations.passwordMin"))
    .regex(/[A-Z]/, t("validations.mustContainUppercase"))
    .regex(/[a-z]/, t("validations.mustContainLowercase"))
    .regex(/[0-9]/, t("validations.mustContainNumber"))
    .regex(
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      t("validations.mustContainSpecialChar"),
    );

  const createAccountSchema = z
    .object({
      name: z.string().min(1, t("validations.nameRequired")),
      password: passwordSchema,
      confirmPassword: z
        .string()
        .min(1, t("validations.confirmPasswordRequired")),
      email: z
        .string()
        .min(1, t("validations.emailRequired"))
        .email(t("validations.invalidEmail")),
      gender: z.string().min(1, t("validations.genderRequired")),
      dob: z.string().min(1, t("validations.dobRequired")),
      country: z.string().min(1, t("validations.countryRequired")),
      dateView: z.string().min(1, t("validations.dateViewRequired")),
      week: z.string().min(1, t("validations.weekRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validations.passwordsDontMatch"),
      path: ["confirmPassword"],
    });

  const loginSchema = z.object({
    email: z
      .string()
      .min(1, t("validations.emailRequired"))
      .email(t("validations.invalidEmail")),
    password: passwordSchema,
  });

  const giftCurrentMemberSchema = z.object({
    recipientName: z.string().min(1, t("validations.recipientNameRequired")),
    recipientEmail: z
      .string()
      .min(1, t("validations.recipientEmailRequired"))
      .email(t("validations.invalidEmail")),
    personalMessage: z
      .string()
      .min(1, t("validations.personalMessageRequired")),
    yourName: z.string().min(1, t("validations.yourNameRequired")),
  });

  const forgotPasswordSchema = z.object({
    email: z
      .string()
      .min(1, t("validations.emailRequired"))
      .email(t("validations.invalidEmail")),
  });

  const confirmPasswordSchema = z
    .object({
      password: passwordSchema,
      confirmPassword: z
        .string()
        .min(1, t("validations.confirmPasswordRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validations.passwordsDontMatch"),
      path: ["confirmPassword"],
    });

  return {
    createAccountSchema,
    loginSchema,
    forgotPasswordSchema,
    confirmPasswordSchema,
    giftCurrentMemberSchema,
  };
};
