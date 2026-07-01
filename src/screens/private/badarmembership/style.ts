import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export const badarMembershipStyles = StyleSheet.create({
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
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.light.greybuttonversion,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    },
    headerTitleContainer: {
        position: "absolute",
        left: 0,
        right: 0,
        alignItems: "center",
    },
    headerTitle: {
        color: Colors.light.white,
        fontFamily: fonts.primary.semiBold,
        fontSize: 14,
        textTransform: "uppercase",
        fontWeight: "600",
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    sectionTitle: {
        color: Colors.light.white,
        fontFamily: fonts.primary.medium,
        fontSize: 24,
        textAlign: "center",
        marginBottom: 8,
    },
    sectionSubtitle: {
        color: Colors.light.dullWhite,
        fontFamily: fonts.primary.regular,
        fontSize: 14,
        textAlign: "center",
        marginBottom: 16,

    },
    membershipCard: {
        backgroundColor: Colors.light.calendarBg,
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
    },
    cardTitle: {
        color: Colors.light.white,
        fontFamily: fonts.primary.semiBold,
        fontSize: 16,
        textAlign: "center",
        marginBottom: 8,
        fontWeight: "600",
    },
    cardSubtitle: {
        color: Colors.light.dullWhite,
        fontFamily: fonts.primary.regular,
        fontSize: 14,
        textAlign: "center",
        marginBottom: 16,
    },
    planRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    planLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    checkIcon: {
        width: 20,
        marginRight: 8,
    },
    planName: {
        color: Colors.light.white,
        fontFamily: fonts.primary.semiBold,
        fontSize: 14,
    },
    planNameInactive: {
        color: Colors.light.subtext,
        fontFamily: fonts.primary.regular,
        fontSize: 14,
        marginLeft: 28, // match padding of checkIcon + margin
    },
    planPrice: {
        color: Colors.light.white,
        fontFamily: fonts.primary.regular,
        fontSize: 12,
    },
    planPriceInactive: {
        color: Colors.light.subtext,
        fontFamily: fonts.primary.regular,
        fontSize: 12,
    },
    buttonContainer: {
        marginTop: 16,
        gap: 12,
    },
    actionCard: {
        backgroundColor: Colors.light.calendarBg,
        borderRadius: 12,
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    actionIconContainer: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "flex-start",
    },
    actionTextContainer: {
        flex: 1,
    },
    actionTitle: {
        color: Colors.light.white,
        fontFamily: fonts.primary.semiBold,
        fontSize: 14,
        marginBottom: 4,
    },
    actionSubtitle: {
        color: Colors.light.subtext,
        fontFamily: fonts.primary.regular,
        fontSize: 13,
    },
});
