import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export const calendarSettingStyles = StyleSheet.create({
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
        paddingTop: 16,
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        marginLeft: 13,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.light.subtext,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    radioOuterSelected: {},
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.light.green,
    },
    optionText: {
        color: Colors.light.white,
        fontFamily: fonts.primary.regular,
        fontSize: 14,
    },
    bottomContainer: {
        //paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 16,
    },
    infoContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginTop: 16,
        justifyContent: "center",
        //paddingHorizontal: 12,
    },
    infoText: {
        color: Colors.light.white,
        fontFamily: fonts.primary.regular,
        fontSize: 12,
        textAlign: "center",
        lineHeight: 18,
        marginLeft: 6,
    },
});
