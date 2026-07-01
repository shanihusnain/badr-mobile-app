import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export const paymentSuccessStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.light.blackBackground,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        alignItems: "center",
    },
    title: {
        color: Colors.light.white,
        fontFamily: fonts.primary.medium,
        fontSize: 24,
        textTransform: "uppercase",
        marginTop: 80,
        marginBottom: 60,
        //letterSpacing: 1.5,
    },
    iconContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 60,
    },
    messageText: {
        color: Colors.light.white,
        fontFamily: fonts.primary.medium,
        fontSize: 16,
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 30,
    },
    subMessageText: {
        color: Colors.light.dullWhite,
        fontFamily: fonts.primary.regular,
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 30,
    },
    orderIdText: {
        color: Colors.light.white,
        fontFamily: fonts.primary.semiBold,
        fontSize: 16,
        textAlign: "center",
    },
    bottomSection: {
        marginTop: "auto",
        width: "100%",
        paddingBottom: 40,
    },
});
