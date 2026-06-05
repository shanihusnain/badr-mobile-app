/**
 * Converts English digits (0-9) to Arabic digits (٠-٩) if the language is Arabic.
 */
export const localizeNumber = (num: string | number, lng: string): string => {
  const numStr = String(num);
  if (lng !== "ar") return numStr;
  return numStr.replace(/[0-9]/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[parseInt(digit, 10)]);
};
