import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { QatarFlagIcon } from "@/assets/icons/QatarFlagIcon";
import { UnitedKingdomFlagIcon } from "@/assets/icons/UnitedKingdomFlagIcon";
import { UnitedStatesFlagIcon } from "@/assets/icons/UnitedStatesFlagIcon";

export const useCreateAccountProps = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const genders = [
    { label: t("createAccountScreen.male"), value: "Male" },
    { label: t("createAccountScreen.female"), value: "Female" },
  ];
  const countries = [
    {
      label: t("createAccountScreen.qatar"),
      value: "Qatar",
      icon: React.createElement(QatarFlagIcon, { size: 18 }),
    },
    {
      label: "United States",
      value: "United States",
      icon: React.createElement(UnitedStatesFlagIcon, { size: 18 }),
    },
    {
      label: "United Kingdom",
      value: "United Kingdom",
      icon: React.createElement(UnitedKingdomFlagIcon, { size: 18 }),
    },
  ];
  const calendarView = [
    { label: t("createAccountScreen.gregorianView"), value: "Gregorian View" },
    { label: t("createAccountScreen.hijriView"), value: "Hijri View" },
  ];
  const weekDays = [
    { label: t("createAccountScreen.friSat"), value: "Friday & Saturday" },
    { label: t("createAccountScreen.satSun"), value: "Saturday & Sunday" },
  ];

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
  };
};
