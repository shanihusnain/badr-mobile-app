import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export const aiSettingStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.light.blackBackground,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 24,
        marginTop: 38,
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
    },
    content: {
        flex: 1,
        //paddingHorizontal: 24,
        paddingTop: 20,
    },
    memoryRow: {
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
    },
    descriptionText: {
        color: Colors.light.dullWhite,
        fontFamily: fonts.primary.regular,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    boldText: {
        fontFamily: fonts.primary.bold,
        color: Colors.light.white,
    },
    separator: {
        height: 1,
        backgroundColor: Colors.light.greybuttonBackground,
        marginVertical: 20,
    },
    privacyCard: {
        backgroundColor: Colors.light.greybuttonBackground,
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    privacyTitle: {
        color: Colors.light.white,
        fontFamily: fonts.primary.semiBold,
        fontSize: 13,
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    privacyText: {
        color: Colors.light.dullWhite,
        fontFamily: fonts.primary.regular,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    learnMoreRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    learnMoreText: {
        color: Colors.light.white,
        fontFamily: fonts.primary.bold,
        fontSize: 12,
        letterSpacing: 0.5,
        marginRight: 4,
    },
});
