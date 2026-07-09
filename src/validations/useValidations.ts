import z from "zod";
import { useTranslation } from "react-i18next";


export const useValidations = () => {
  const { t } = useTranslation();
  const createAccountSchema = z
    .object({
      name: z.string().min(1, t("validations.inputMissing")),
      password: z
        .string()
        .min(1, t("validations.inputMissing"))
        .min(8, t("validations.passwordMin"))
        .regex(/[A-Z]/, t("validations.mustContainUppercase"))
        .regex(/[a-z]/, t("validations.mustContainLowercase"))
        .regex(/[0-9]/, t("validations.mustContainNumber"))
        .regex(
          /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
          t("validations.mustContainSpecialChar"),
        ),
      confirmPassword: z.string().min(1, t("validations.inputMissing")),
      email: z.string().min(1, t("validations.inputMissing")).email(t("validations.invalidEmail")),
      gender: z.string().min(1, t("validations.inputMissing")),
      dob: z.string().min(1, t("validations.inputMissing")),
      country: z.string().min(1, t("validations.inputMissing")),
      dateView: z.string().min(1, t("validations.inputMissing")),
      week: z.string().min(1, t("validations.inputMissing")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validations.passwordsDontMatch"),
      path: ["confirmPassword"],
    });
  const loginSchema = z.object({
    email: z.string().min(1, t("validations.inputMissing")).email(t("validations.invalidEmail")),
    password: z
      .string()
      .min(1, t("validations.inputMissing"))
      .min(8, t("validations.passwordMin"))
      .regex(/[A-Z]/, t("validations.mustContainUppercase"))
      .regex(/[a-z]/, t("validations.mustContainLowercase"))
      .regex(/[0-9]/, t("validations.mustContainNumber"))
      .regex(
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
        t("validations.mustContainSpecialChar"),
      ),
  });
    const giftCurrentMemberSchema = z.object({
    recipientName: z.string().min(1, t("validations.inputMissing")),
    recipientEmail: z.string().min(1, t("validations.inputMissing")).email(t("validations.invalidEmail")),
    personalMessage: z.string().min(1, t("validations.inputMissing")),
    yourName: z.string().min(1, t("validations.inputMissing")),
  })
  const forgotPasswordSchema = z.object({
    email: z.string().min(1, t("validations.inputMissing")).email(t("validations.invalidEmail")),
  });

  const confirmPasswordSchema = z
    .object({
      password: z
        .string()
        .min(1, t("validations.inputMissing"))
        .min(8, t("validations.passwordMin"))
        .regex(/[A-Z]/, t("validations.mustContainUppercase"))
        .regex(/[a-z]/, t("validations.mustContainLowercase"))
        .regex(/[0-9]/, t("validations.mustContainNumber"))
        .regex(
          /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
          t("validations.mustContainSpecialChar"),
        ),
      confirmPassword: z.string().min(1, t("validations.inputMissing")),
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
  }
}