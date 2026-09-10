import { useTranslation } from "react-i18next";

export function useLocaleNumber() {
  const { i18n } = useTranslation();
  
  const formatNumber = (num: number | string) => {
    const isArabic = i18n.language && i18n.language.startsWith("ar");
    if (!isArabic) return String(num);
    const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return String(num).replace(/[0-9]/g, (w) => arabicDigits[+w]);
  };

  return formatNumber;
}
