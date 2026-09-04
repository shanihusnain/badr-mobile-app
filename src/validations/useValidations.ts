import z from "zod";
import { useTranslation } from "react-i18next";
import moment from "moment-hijri";

const MINIMUM_SIGNUP_AGE_YEARS = 13;

const parseDobMoment = (value: string) => {
  if (!value) return null;
  if (value.includes("/")) {
    const parsed = moment(value, "DD/MM/YYYY", true);
    return parsed.isValid() ? parsed : null;
  }
  const parsed = moment(value, "YYYY-MM-DD", true);
  return parsed.isValid() ? parsed : null;
};

const isAtLeastMinimumAge = (value: string) => {
  const dob = parseDobMoment(value);
  if (!dob) return false;
  // Full cutoff year is allowed (e.g. any date in 2013 when min age is 13 in 2026).
  const maxAllowedDob = moment()
    .subtract(MINIMUM_SIGNUP_AGE_YEARS, "years")
    .endOf("year");
  return dob.isSameOrBefore(maxAllowedDob, "day");
};

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

  const dobSchema = z
    .string()
    .min(1, t("validations.dobRequired"))
    .refine(isAtLeastMinimumAge, {
      message: t("validations.dobMinimumAge", {
        age: MINIMUM_SIGNUP_AGE_YEARS,
      }),
    });

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
      dob: dobSchema,
      country: z.string().min(1, t("validations.countryRequired")),
      dateView: z.string().min(1, t("validations.dateViewRequired")),
      week: z.string().min(1, t("validations.weekRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validations.passwordsDontMatch"),
      path: ["confirmPassword"],
    });

  /** Social signup: passwords are not collected; profile is completed via PUT /users/profile. */
  const socialCompleteProfileSchema = z.object({
    name: z.string().min(1, t("validations.nameRequired")),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    email: z
      .string()
      .min(1, t("validations.emailRequired"))
      .email(t("validations.invalidEmail")),
    gender: z.string().min(1, t("validations.genderRequired")),
    dob: dobSchema,
    country: z.string().min(1, t("validations.countryRequired")),
    dateView: z.string().min(1, t("validations.dateViewRequired")),
    week: z.string().min(1, t("validations.weekRequired")),
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
    socialCompleteProfileSchema,
    loginSchema,
    forgotPasswordSchema,
    confirmPasswordSchema,
    giftCurrentMemberSchema,
  };
};
