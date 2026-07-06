import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export const aboutStyles = StyleSheet.create({
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
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.light.greybuttonBackground,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
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
        paddingHorizontal: 24,
        paddingTop: 8,
    },
    listItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.light.greybuttonBackground,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 18,
        marginBottom: 10,
    },
    listItemText: {
        color: Colors.light.white,
        fontFamily: fonts.primary.semiBold,
        fontSize: 13,
        textTransform: "uppercase",
        marginLeft: 14,
        letterSpacing: 0.3,
    },
});
