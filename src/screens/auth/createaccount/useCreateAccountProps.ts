import { useState } from "react";
import { useTranslation } from "react-i18next";

export const useCreateAccountProps = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const genders = [
    { label: t("createAccountScreen.male"), value: "Male" },
    { label: t("createAccountScreen.female"), value: "Female" },
  ];
  const countries = [
    { label: t("createAccountScreen.pakistan"), value: "Pakistan" },
    { label: t("createAccountScreen.saudiArabia"), value: "Saudi Arabia" },
  ];
  const calendarView = [
    { label: t("createAccountScreen.gregorianView"), value: "Gregorian View" },
    { label: t("createAccountScreen.hijriView"), value: "Hijri View" },
  ];
  const weekDays = [
    { label: t("createAccountScreen.friSat"), value: "Friday & Saturday" },
    { label: t("createAccountScreen.satSun"), value: "Saturday & Sunday" },
  ];

  const defaultValues = {
    name: "",
    password: "",
    confirmPassword: "",
    email: "",
    gender: "",
    dob: "",
    country: "",
    dateView: "",
    week: "",
  };

  const onPasswordToggle = () => setShowPassword((prev) => !prev);
  const onConfirmPasswordToggle = () => setShowConfirmPassword((prev) => !prev);

  return {
    genders,
    countries,
    calendarView,
    weekDays,
    showPassword,
    showConfirmPassword,
    onPasswordToggle,
    onConfirmPasswordToggle,
    defaultValues,
  };
};