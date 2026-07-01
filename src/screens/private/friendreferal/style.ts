import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export const friendReferralStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.light.blackBackground, // Dark background as requested instead of image
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 48,
        marginBottom: 40,
    },

    headerTitle: {
        flex: 1,
        textAlign: "center",
        color: Colors.light.white,
        fontFamily: fonts.primary.semiBold,
        fontSize: 14,
        textTransform: "uppercase",
        marginRight: 40, // offset for absolute centering since back button is on left
    },
    contentContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 60, // visual adjustment for center alignment
    },
    iconContainer: {
        marginBottom: 24,
    },
    title: {
        color: Colors.light.white,
        fontFamily: fonts.primary.medium,
        fontSize: 24,
        fontWeight: "500",
        textTransform: "uppercase",
        marginBottom: 16,
        textAlign: "center",

    },
    description: {
        color: Colors.light.white,
        fontFamily: fonts.primary.medium,
        fontSize: 14,
        lineHeight: 20,
        textAlign: "center",
        textTransform: "uppercase",
        paddingHorizontal: 16,
    },
    buttonContainer: {
        marginTop: 32,
        width: "100%",
    },
});
