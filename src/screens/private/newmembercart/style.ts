import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export const newMemberCartStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.light.blackBackground,
    },
    container: {
        flex: 1,
        //paddingHorizontal: 24,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 56,
        marginBottom: 40,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: "center",
        marginRight: 40, // Offset for back button width to center the title
    },
    headerTitle: {
        color: Colors.light.white,
        fontFamily: fonts.primary.semiBold,
        fontSize: 14,
        textTransform: "uppercase",
        //letterSpacing: 1,
    },
    cartItemContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 30,
    },
    appIconBox: {
        width: 80,
        height: 80,
        backgroundColor: Colors.light.greybuttonversion,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    appIconText: {
        color: Colors.light.white,
        fontFamily: fonts.primary.bold,
        fontSize: 20,
        marginTop: 4,
    },
    itemDetails: {
        flex: 1,
    },
    itemTitle: {
        color: Colors.light.white,
        fontFamily: fonts.primary.medium,
        fontSize: 14,
        marginBottom: 4,
    },
    itemSubtitle: {
        color: Colors.light.subtext,
        fontFamily: fonts.primary.regular,
        fontSize: 12,
    },
    priceContainer: {
        alignItems: "flex-end",
    },
    currentPrice: {
        color: Colors.light.white,
        fontFamily: fonts.primary.medium,
        fontSize: 16,
        marginBottom: 4,
    },
    originalPrice: {
        color: Colors.light.subtext,
        fontFamily: fonts.primary.regular,
        fontSize: 14,
        textDecorationLine: "line-through",
        marginBottom: 12,
    },
    quantitySelector: {
        flexDirection: "row",
        alignItems: "center",
    },
    quantityButton: {
        width: 28,
        height: 28,
        backgroundColor: Colors.light.greybuttonversion,
        borderRadius: 6,
        justifyContent: "center",
        alignItems: "center",
    },
    quantityTextContainer: {
        width: 32,
        alignItems: "center",
    },
    quantityText: {
        color: Colors.light.white,
        fontFamily: fonts.primary.medium,
        fontSize: 14,
    },
    summaryContainer: {
        marginTop: 10,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    summaryLabel: {
        color: Colors.light.white,
        fontFamily: fonts.primary.medium,
        fontSize: 14,
    },
    summaryValueWhite: {
        color: Colors.light.white,
        fontFamily: fonts.primary.medium,
        fontSize: 14,
    },
    summaryValueGreen: {
        color: Colors.light.green,
        fontFamily: fonts.primary.medium,
        fontSize: 14,
    },
    bottomSection: {
        marginTop: "auto",
        paddingBottom: 40,
    },
});
