import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export const statusInsightsStyles = StyleSheet.create({
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
        fontSize: 16,
        textTransform: "uppercase",
    },
    descriptionText: {
        color: Colors.light.dullWhite,
        fontFamily: fonts.primary.regular,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 32,
    },
    modeHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    modeLabel: {
        color: Colors.light.subtext,
        fontFamily: fonts.primary.semiBold,
        fontSize: 12,
        letterSpacing: 0.5,
        textTransform: "uppercase",
        marginRight: 8,
    },
    modeLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.light.greybuttonBackground,
    },
    modeButton: {
        backgroundColor: Colors.light.greybuttonBackground,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        marginBottom: 24,
    },
    modeButtonLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    modeButtonIcon: {
        marginRight: 12,
    },
    modeButtonText: {
        color: Colors.light.white,
        fontFamily: fonts.primary.semiBold,
        fontSize: 13,
        letterSpacing: 0.5,
        textTransform: "uppercase",
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
        marginBottom: 12,
        textTransform: "uppercase",
    },
    privacyText: {
        color: Colors.light.dullWhite,
        fontFamily: fonts.primary.regular,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
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
        textTransform: "uppercase",
    },
    // Bottom sheet styles
    sheetContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    sheetHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    sheetHeaderSpacer: {
        width: 32,
    },
    sheetCloseButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.light.blackBackground,
        justifyContent: "center",
        alignItems: "center",
    },
    sheetTitle: {
        color: Colors.light.white,
        fontFamily: fonts.primary.semiBold,
        fontSize: 16,
        textTransform: "uppercase",
        textAlign: "center",
        marginTop: -10,
        marginBottom: 20,
    },
    sheetList: {
        flex: 1,
    },
    sheetItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.light.blackBackground,
        borderRadius: 10,
        padding: 16,
        marginBottom: 10,
    },
    sheetItemSelected: {
        backgroundColor: Colors.light.green,
    },
    sheetItemIcon: {
        marginRight: 14,
    },
    sheetItemText: {
        color: Colors.light.subtext,
        fontFamily: fonts.primary.semiBold,
        fontSize: 13,
        letterSpacing: 0.5,
        textTransform: "uppercase",
        flex: 1,
    },
    sheetItemTextSelected: {
        color: Colors.light.white,
    },
    sheetFooter: {
        paddingBottom: 32,
        paddingTop: 12,
    },
});
