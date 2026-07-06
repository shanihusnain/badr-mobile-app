import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export const privacySettingStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.light.blackBackground,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 24,
        marginTop: 48,
        marginBottom: 32,
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
        paddingTop: 20,
    },
    sectionHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    sectionLabel: {
        color: Colors.light.subtext,
        fontFamily: fonts.primary.semiBold,
        fontSize: 12,
        letterSpacing: 0.5,
        textTransform: "uppercase",
        marginRight: 16,
    },
    sectionLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.light.greybuttonBackground,
    },
    settingBlock: {
        marginBottom: 32,
    },
    settingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    settingTitle: {
        color: Colors.light.white,
        fontFamily: fonts.primary.semiBold,
        fontSize: 13,
        textTransform: "uppercase",
        flex: 1,
        marginRight: 16,
    },
    settingDescription: {
        color: Colors.light.dullWhite,
        fontFamily: fonts.primary.regular,
        fontSize: 14,
        lineHeight: 20,
    },
    deleteButtonContainer: {
        marginTop: 8,
    }
});
