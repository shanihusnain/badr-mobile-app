import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import AntDesign from "@expo/vector-icons/AntDesign";
import axios from "axios";
import { Platform, StyleSheet, Text, View } from "react-native";
import Toast, { ToastConfigParams } from "react-native-toast-message";

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string | string[] }
      | undefined;

    if (Array.isArray(data?.message)) {
      return data.message.join(", ");
    }

    if (typeof data?.message === "string" && data.message.length > 0) {
      return data.message;
    }

    if (error.message === "Network Error") {
      return "Network error. Please check your connection and try again.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export const showToast = (type: "success" | "error", message: string) => {
  Toast.show({
    type,
    text1: message,
    position: "top",
    visibilityTime: 3000,
    autoHide: true,
    topOffset: Platform.OS === "ios" ? 60 : 40,
    keyboardOffset: Platform.OS === "ios" ? 40 : 0,
  });
};
export const toastConfig = {
  success: (props: ToastConfigParams<any>) => (
    <View
      style={[
        styles.toastContainer,
        styles.successContainer,
        {
          flexDirection: "row",
          gap: 8,
          alignItems: "center",
          justifyContent: "center",
        },
      ]}
    >
      {/* <View
        style={{
          height: 20,
          width: 20,
          borderRadius: 20,
          backgroundColor: Colors.light.lightGreen,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AntDesign name="check" size={15} color={Colors.light.white} />
      </View> */}
      <Text style={[styles.toastText, { color: Colors.light.blackBackground }]}>
        {props.text1}
      </Text>
    </View>
  ),
  error: (props: ToastConfigParams<any>) => (
    <View
      style={[
        styles.toastContainer,

        {
          flexDirection: "row",
          gap: 8,
          alignItems: "center",
          justifyContent: "center",
          // paddingHorizontal: 10,
          backgroundColor: Colors.light.white,
        },
      ]}
    >
      <View
        style={{
          height: 20,
          width: 20,
          borderRadius: 20,
          backgroundColor: Colors.light.red,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AntDesign name="close" size={15} color={Colors.light.white} />
      </View>
      <Text style={[styles.toastText]}>{props.text1}</Text>
    </View>
  ),
};

const styles = StyleSheet.create({
  toastContainer: {
    padding: 15,
    borderRadius: 8,
    marginTop: Platform.OS === "ios" ? 50 : 30,
    width: "90%",
    zIndex: 99999,
    elevation: 99999,
  },
  successContainer: {
    backgroundColor: Colors.light.white,
  },
  errorContainer: {
    backgroundColor: Colors.light.red,
  },
  toastText: {
    color: Colors.light.red,
    fontSize: 16,
    fontFamily: fonts.primary.medium,
    textAlign: "center",
    flexWrap: "wrap",
  },
});
