import z from "zod";
import ForgotPasswordScreen from "../auth/forgotpassword";

export const useValidations = () => {
  const createAccountSchema = z
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
  const loginSchema = z.object({
    email: z.string().min(1, "Input missing").email("Invalid email"),
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
  });
  const forgotPasswordSchema = z.object({
    email: z.string().min(1, "Input missing").email("Invalid email"),
  });

  const confirmPasswordSchema = z
    .object({
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
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });
  return {
    createAccountSchema,
    loginSchema,
    forgotPasswordSchema,
    confirmPasswordSchema,

  }
}