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
    iconContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 60,
        marginTop: 40,
    },
    cardIconContainer: {
        width: 120,
        height: 80,
        borderWidth: 5,
        borderColor: Colors.light.green,
        borderRadius: 12,
        position: "relative",
    },
    cardMagstripe: {
        height: 12,
        backgroundColor: Colors.light.green,
        marginTop: 14,
    },
    cardLine1: {
        width: 50,
        height: 5,
        backgroundColor: Colors.light.green,
        marginTop: 12,
        marginLeft: 14,
        borderRadius: 2,
    },
    cardLine2: {
        width: 25,
        height: 5,
        backgroundColor: Colors.light.green,
        marginTop: 6,
        marginLeft: 14,
        borderRadius: 2,
    },
    checkmarkBadgeContainer: {
        position: "absolute",
        bottom: -20,
        right: -20,
        backgroundColor: Colors.light.blackBackground,
        borderRadius: 30,
        padding: 4,
    },
    checkmarkBadgeInner: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 4,
        borderColor: Colors.light.green,
        alignItems: "center",
        justifyContent: "center",
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
