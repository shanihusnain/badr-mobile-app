import React, { useMemo, useState } from "react";
import { Text } from "react-native";
import { useTranslation } from "react-i18next";
import { CanadaFlagIcon } from "@/assets/icons/CanadaFlagIcon";
import { QatarFlagIcon } from "@/assets/icons/QatarFlagIcon";
import { UnitedKingdomFlagIcon } from "@/assets/icons/UnitedKingdomFlagIcon";
import { UnitedStatesFlagIcon } from "@/assets/icons/UnitedStatesFlagIcon";
import { useGetCountries } from "@/src/api/queries/useGetCountries";

const FALLBACK_COUNTRIES = [
  {
    label: "Qatar",
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
  {
    label: "Canada",
    value: "Canada",
    icon: React.createElement(CanadaFlagIcon, { size: 18 }),
  },
];

export const useCreateAccountProps = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    data: apiCountries,
    isLoading: isCountriesLoading,
    isError: isCountriesError,
  } = useGetCountries();

  const genders = [
    { label: t("createAccountScreen.male"), value: "Male" },
    { label: t("createAccountScreen.female"), value: "Female" },
  ];

  const countries = useMemo(() => {
    if (!apiCountries?.length) return FALLBACK_COUNTRIES;

    return apiCountries.map((country) => ({
      label: country.label,
      value: country.value,
      icon: country.flag
        ? React.createElement(Text, { style: { fontSize: 18 } }, country.flag)
        : undefined,
    }));
  }, [apiCountries]);

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
    isCountriesLoading,
    isCountriesError,
    calendarView,
    weekDays,
    showPassword,
    showConfirmPassword,
    onPasswordToggle,
    onConfirmPasswordToggle,
  };
};
