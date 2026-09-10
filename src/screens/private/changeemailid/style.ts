import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export const changeEmailStyles = StyleSheet.create({
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
        marginTop: 48,
        marginBottom: 40,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.light.greybuttonversion,
        justifyContent: "center",
        alignItems: "center",
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
        fontSize: 16,
        textTransform: "uppercase",
        //letterSpacing: 1,
    },
    sectionTitle: {
        color: Colors.light.white,
        fontFamily: fonts.primary.bold,
        fontSize: 16,
        textTransform: "uppercase",
        marginBottom: 12,
    },
    description: {
        color: Colors.light.dullWhite,
        fontFamily: fonts.primary.regular,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 24,
    },
    descriptionBold: {
        color: Colors.light.white,
        fontFamily: fonts.primary.bold,
    },
    inputBox: {
        backgroundColor: Colors.light.calendarBg,
        borderRadius: 8,
        height: 48,
        paddingHorizontal: 16,
        color: Colors.light.white,
        fontFamily: fonts.primary.regular,
        fontSize: 14,
    },
    bottomSection: {
        marginTop: "auto",
        paddingBottom: 32,
    },
});
