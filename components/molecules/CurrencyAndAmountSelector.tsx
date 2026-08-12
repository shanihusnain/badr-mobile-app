import { Colors } from "@/constants/theme";
import { StyleSheet, View } from "react-native";
import { useState } from "react";
import CustomDropdown from "../atoms/CustomDropdown";
import WarningModal from "../atoms/WarningModal";
import { fonts } from "@/assets/fonts";
import { setDefaultSadaqahCurrency } from "@/src/storage/sadaqahCurrencyStorage";
import { useTranslation } from "react-i18next";

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
  {
    label: "🇺🇸 USD – US DOLLAR ($)",
    value: "🇺🇸 USD – US DOLLAR ($)",
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
  onSetAsDefaultCurrency,
}: {
  control: any;
  name: string;
  /** Called when user confirms using this currency as default for all sadaqah goals. */
  onSetAsDefaultCurrency?: (currencyOptionValue: string) => void;
}) => {
  const { t } = useTranslation();
  const [defaultCurrencyModalVisible, setDefaultCurrencyModalVisible] =
    useState(false);
  const [pendingCurrency, setPendingCurrency] = useState<string | null>(null);

  const closeDefaultCurrencyModal = () => {
    setDefaultCurrencyModalVisible(false);
    setPendingCurrency(null);
  };

  const confirmDefaultCurrency = async () => {
    if (!pendingCurrency) {
      closeDefaultCurrencyModal();
      return;
    }
    try {
      await setDefaultSadaqahCurrency(pendingCurrency);
    } catch {
      // Still apply in-session even if persistence fails
    }
    onSetAsDefaultCurrency?.(pendingCurrency);
    closeDefaultCurrencyModal();
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.dropdownWrapper}>
        <CustomDropdown
          control={control}
          name={name}
          label=""
          options={[...SADAQAH_CURRENCY_OPTIONS]}
          onSelect={(option) => {
            const value = typeof option === "string" ? option : String(option);
            if (!value) return;
            setPendingCurrency(value);
            setDefaultCurrencyModalVisible(true);
          }}
          selectedTextStyle={styles.selectedTextStyle}
          containerStyle={styles.triggerStyle}
          menuStyle={styles.menuStyle}
          borderColor={Colors.light.white}
          placeholder={t("monthlyGoalPlanner.selectCurrency")}
        />
      </View>

      <WarningModal
        visible={defaultCurrencyModalVisible}
        title={t("monthlyGoalPlanner.currencyUpdatedTitle")}
        message={t("monthlyGoalPlanner.currencyUpdatedMessage")}
        primaryButtonText={t("monthlyGoalPlanner.currencyUpdatedYes")}
        secondaryButtonText={t("monthlyGoalPlanner.currencyUpdatedNo")}
        primaryButtonVariant="green"
        onPrimaryPress={confirmDefaultCurrency}
        onSecondaryPress={closeDefaultCurrencyModal}
        onBackdropPress={closeDefaultCurrencyModal}
        secondaryButtonTextStyle={{ color: Colors.light.white }}
        primaryButtonSize="compact"
      />
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
    fontSize: 15,
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
  },
  /** Figma: height 32, padding 0 8 — scoped to sadaqah currency only */
  triggerStyle: {
    height: 36,
    paddingHorizontal: 8,
    marginTop: 0,
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center",
    paddingRight: 12,
    width: "96%",
    borderRadius: 4,
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
    width: "100%",
    paddingTop: 16,
    paddingBottom: 0,
    paddingHorizontal: 0,
  },
});
