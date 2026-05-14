import { useState } from "react";

export const useCreateAccountProps = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const genders = ["Male", "Female"];
  const countries = ["Pakistan", "Saudi Arabia"];
  const calendarView = ["Gregorian View", "Hijri View"];
  const weekDays = ["Friday & Saturday", "Saturday & Sunday"];

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