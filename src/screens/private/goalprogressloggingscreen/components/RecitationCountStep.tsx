import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { useTranslation } from "react-i18next";

interface RecitationCountStepProps {
  maxQuantity: number;
  count: number;
  onChangeCount: (count: number) => void;
  styles: any;
}

export const RecitationCountStep: React.FC<RecitationCountStepProps> = ({
  maxQuantity,
  count,
  onChangeCount,
  styles,
}) => {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();

  const handleDecrement = () => {
    if (count <= 1) return;
    onChangeCount(count - 1);
  };

  const handleIncrement = () => {
    if (count >= maxQuantity) return;
    onChangeCount(count + 1);
  };

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 5,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
      }}
    >
      <View
        style={[
          styles.recitationCounterRow,
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            paddingHorizontal: 5,
            paddingVertical: 2,
            borderRadius: 12,
            width: "40%",
            borderWidth: 1,
            borderColor: Colors.light.white,
            alignSelf: "center",
          },
        ]}
      >
        <View style={styles.recitationCounterControls}>
          <TouchableOpacity
            onPress={handleDecrement}
            disabled={count <= 1}
            hitSlop={{
              top: 12,
              bottom: 12,
              left: 12,
              right: 12,
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="remove" size={28} color={Colors.light.white} />
          </TouchableOpacity>

          <View style={[styles.recitationCounterValueColumn]}>
            <View style={styles.recitationCounterValue}>
              <Text style={styles.recitationCounterValueText}>
                {formatNumber(count)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleIncrement}
              disabled={count >= maxQuantity}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.8}
            >
              <Ionicons
                name="add"
                size={28}
                color={
                  count >= maxQuantity
                    ? Colors.light.dullWhiteOpacity
                    : Colors.light.white
                }
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Text style={styles.recitationMaxLabel}>
        {t("progressLogging.recitationMaxLabel", {
          max: formatNumber(maxQuantity),
        })}
      </Text>
    </View>
  );
};
