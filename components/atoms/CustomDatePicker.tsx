import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Controller } from "react-hook-form";
import {
  Platform,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import moment from "moment-hijri";
import DOBCalendar from "../molecules/DOBCalendar";
import { TopSpace } from "./TopSpace";

interface CustomDatePickerProps {
  label?: string;
  placeholder: string;
  control: any;
  name: string;
  errors?: string[];
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  textStyle?: TextStyle;
  minimumDate?: Date;
  maximumDate?: Date;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  label,
  placeholder,
  control,
  name,
  errors = [],
  containerStyle,
  labelStyle,
  textStyle,
  minimumDate,
  maximumDate,
}) => {
  const [show, setShow] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null | string>("");
  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatStoredDate = (value: string): string => {
    if (!value) return "";
    if (value.includes("/")) return value;
    const parsed = moment(value, "YYYY-MM-DD", true);
    if (!parsed.isValid()) return value;
    return formatDate(parsed.toDate());
  };

  const parseDate = (value: string): Date => {
    if (!value) return new Date();
    const [day, month, year] = value.split("/").map(Number);
    return new Date(year, month - 1, day);
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <View style={styles.wrapper}>
          {label ? (
            <Text style={[styles.label, labelStyle]}>{label}</Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.container,
              containerStyle,
              {
                borderColor: show
                  ? Colors.light.green
                  : Colors.light.calendarBg,
                borderWidth: 1,
              },
            ]}
            onPress={() => setShow(!show)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.text,
                textStyle,
                !value && { color: Colors.light.icon },
              ]}
            >
              {value ? formatStoredDate(String(value)) : placeholder}
            </Text>
            <SimpleLineIcons name="calendar" size={16} color={Colors.light.white} />
          </TouchableOpacity>

          {errors.length > 0 && (
            <View style={{ marginTop: 5 }}>
              {errors.map((error, index) => (
                <Text key={index} style={styles.errorText}>
                  {error}
                </Text>
              ))}
            </View>
          )}
          {show && (
            <>
              <TopSpace top={8} />
              <DOBCalendar
                onSave={(data) => {
                  setSelectedDate(data);
                  onChange(data);
                  setShow(false);
                }}
                onCancel={() => setShow(false)}
              />
            </>
          )}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "98%",
    marginTop: 0,
  },
  label: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
    marginTop: hp(2),
    alignSelf: "flex-start",
  },
  container: {
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 48,
    marginTop: hp(1),
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  text: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
    flex: 1,
  },
  calendarIcon: {
    fontSize: 16,
  },
  webWrapper: {
    width: "100%",
    marginTop: hp(1),
  },
  errorText: {
    color: "red",
    fontSize: 12,
  },
});

export default CustomDatePicker;
