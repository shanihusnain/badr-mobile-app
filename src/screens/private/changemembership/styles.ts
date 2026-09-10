import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export const changeMembershipStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.light.blackBackground,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 24,
        marginTop: 38,
        marginBottom: 8,
    },
    backButton: {
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
        fontFamily: fonts.primary.bold,
        fontSize: 14,
        letterSpacing: 1,
    },
    content: {
        flex: 1,
        //paddingHorizontal: 24,
        paddingTop: 24,
    },
    screenTitle: {
        color: Colors.light.white,
        fontFamily: fonts.primary.medium,
        fontSize: 24,
        textAlign: "center",
        marginBottom: 12,
    },
    subtitle: {
        color: Colors.light.subtext,
        fontFamily: fonts.primary.regular,
        fontSize: 14,
        textAlign: "center",
        marginBottom: 32,
    },
    planCard: {
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: Colors.light.greybuttonBackground,
    },
    planCardSelected: {},
    planLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.light.subtext,
        justifyContent: "center",
        alignItems: "center",
    },
    radioOuterSelected: {},
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.light.green,
    },
    planNameContainer: {
        gap: 2,
    },
    planName: {
        color: Colors.light.green,
        fontFamily: fonts.primary.semiBold,
        fontSize: 15,
    },
    planNameInactive: {
        color: Colors.light.green,
        fontFamily: fonts.primary.semiBold,
        fontSize: 15,
    },
    planSavings: {
        color: Colors.light.subtext,
        fontFamily: fonts.primary.regular,
        fontSize: 12,
    },
    planRight: {
        alignItems: "flex-end",
        gap: 2,
    },
    planPrice: {
        color: Colors.light.white,
        fontFamily: fonts.primary.bold,
        fontSize: 15,
    },
    planPriceSub: {
        color: Colors.light.subtext,
        fontFamily: fonts.primary.regular,
        fontSize: 12,
    },
    bottomContainer: {
        //paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 16,
        gap: 12,
    },
    cancelButton: {
        paddingVertical: 14,
        alignItems: "center",
    },
    cancelButtonText: {
        color: Colors.light.white,
        fontFamily: fonts.primary.semiBold,
        fontSize: 14,
        letterSpacing: 1,
    },
});
