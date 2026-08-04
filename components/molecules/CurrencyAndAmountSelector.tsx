import { Colors } from "@/constants/theme";
import { StyleSheet, View } from "react-native";
import CustomDropdown from "../atoms/CustomDropdown";
import { fonts } from "@/assets/fonts";

export const SADAQAH_CURRENCY_OPTIONS = [
  {
    label: "🇸🇦 SAR – Saudi Riyal (ر.س)",
    value: "🇸🇦 SAR – Saudi Riyal (ر.س)",
  },
  {
    label: "🇪🇬 EGP – Egyptian Pound (E£)",
    value: "🇪🇬 EGP – Egyptian Pound (E£)",
  },
  {
    label: "🇵🇰 PKR – Pakistani Rupee (₨)",
    value: "🇵🇰 PKR – Pakistani Rupee (₨)",
  },
  {
    label: "🇮🇩 IDR – Indonesian Rupiah (Rp)",
    value: "🇮🇩 IDR – Indonesian Rupiah (Rp)",
  },
  {
    label: "🇧🇩 BDT – Bangladeshi Taka (৳)",
    value: "🇧🇩 BDT – Bangladeshi Taka (৳)",
  },
  { label: "🇹🇷 TRY – Turkish Lira (₺)", value: "🇹🇷 TRY – Turkish Lira (₺)" },
  {
    label: "🇲🇾 MYR – Malaysian Ringgit (RM)",
    value: "🇲🇾 MYR – Malaysian Ringgit (RM)",
  },
  { label: "🇦🇪 AED – UAE Dirham (د.إ)", value: "🇦🇪 AED – UAE Dirham (د.إ)" },
  {
    label: "🇲🇦 MAD – Moroccan Dirham (د.م.)",
    value: "🇲🇦 MAD – Moroccan Dirham (د.م.)",
  },
  {
    label: "🇩🇿 DZD – Algerian Dinar (د.ج)",
    value: "🇩🇿 DZD – Algerian Dinar (د.ج)",
  },
  {
    label: "🇳🇬 NGN – Nigerian Naira (₦)",
    value: "🇳🇬 NGN – Nigerian Naira (₦)",
  },
  { label: "🇮🇳 INR – Indian Rupee (₹)", value: "🇮🇳 INR – Indian Rupee (₹)" },
  {
    label: "🇬🇧 GBP – British Pound (£)",
    value: "🇬🇧 GBP – British Pound (£)",
  },
] as const;

/** Map ISO code (e.g. "SAR") to the dropdown option value string. */
export function currencyOptionFromCode(
  code: string | null | undefined,
  fallbackCode = "SAR",
): string {
  const normalized = (code || fallbackCode).trim().toUpperCase();
  const match = SADAQAH_CURRENCY_OPTIONS.find((opt) =>
    opt.value.includes(normalized),
  );
  return match?.value ?? SADAQAH_CURRENCY_OPTIONS[0].value;
}

export const CurrencyAndAmountSelector = ({
  control,
  name,
}: {
  control: any;
  name: string;
}) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.dropdownWrapper}>
        <CustomDropdown
          control={control}
          name={name}
          label=""
          options={[...SADAQAH_CURRENCY_OPTIONS]}
          onSelect={(option) => {
            console.log(option);
          }}
          selectedTextStyle={styles.selectedTextStyle}
          menuStyle={styles.menuStyle}
          borderColor={Colors.light.white}
          placeholder=""
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  menuStyle: {
    backgroundColor: Colors.light.calendarBg,
    borderColor: Colors.light.white,
    shadowColor: Colors.light.green,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedTextStyle: {
    color: Colors.light.green,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
  },
  dropdownWrapper: {
    backgroundColor: Colors.light.calendarBg,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    width: "100%",
    alignSelf: "center",
  },
  wrapper: {
    backgroundColor: Colors.light.calendarBg,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
});
