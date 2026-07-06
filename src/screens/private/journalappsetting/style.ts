import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export const journalAppSettingStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.light.blackBackground,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 24,
        marginTop: 48,
        marginBottom: 24,
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
        //paddingHorizontal: 24,
        paddingTop: 16,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: {
        color: Colors.light.white,
        fontFamily: fonts.primary.semiBold,
        fontSize: 13,
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },
    descriptionText: {
        color: Colors.light.dullWhite,
        fontFamily: fonts.primary.regular,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 24,
    },
    boldText: {
        fontFamily: fonts.primary.bold,
        color: Colors.light.white,
    },
    customizeButton: {
        backgroundColor: Colors.light.greybuttonBackground,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    customizeIcon: {
        marginRight: 12,
    },
    customizeText: {
        color: Colors.light.white,
        fontFamily: fonts.primary.semiBold,
        fontSize: 12,
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },
});
