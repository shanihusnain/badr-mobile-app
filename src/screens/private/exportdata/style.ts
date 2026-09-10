import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export const exportDataStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.light.blackBackground,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 24,
        marginTop: 38,
        marginBottom: 32,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.light.greybuttonBackground,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    },
    headerTitleContainer: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        color: Colors.light.white,
        fontFamily: fonts.primary.semiBold,
        fontSize: 14,
        letterSpacing: 1,
        textTransform: "uppercase",
    },
    content: {
        flex: 1,
       // paddingHorizontal: 24,
    },
    descriptionText: {
        color: Colors.light.dullWhite,
        fontFamily: fonts.primary.regular,
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 16,
    },
    emailText: {
        color: Colors.light.green,
    },
    linkRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 40,
    },
    linkText: {
        color: Colors.light.white,
        fontFamily: fonts.primary.bold,
        fontSize: 12,
        letterSpacing: 0.5,
        marginRight: 4,
        textTransform: "uppercase",
    },
    bottomContainer: {
       // paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 16,
    },
});
