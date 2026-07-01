import { Dimensions, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 32;

export { width, CARD_WIDTH };

// ─── MoreScreen (index.tsx) ───────────────────────────────────────────────────
export const moreScreenStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.light.blackBackground,
    },
    container: {
        flex: 1,
        backgroundColor: Colors.light.blackBackground,
    },
    contentContainer: {
        paddingBottom: 40,
    },
    logoutContainer: {
        marginTop: 32,
        paddingHorizontal: 16,
        alignItems: "center",
    },
    versionText: {
        marginTop: 16,
        color: Colors.light.white,
        fontFamily: fonts.primary.regular,
        fontSize: 10,
        textTransform: "uppercase",
    },
});

// ─── MoreCarousel ─────────────────────────────────────────────────────────────
export const moreCarouselStyles = StyleSheet.create({
    container: {
        marginTop: 60,
        marginBottom: 24,
    },
    cardContainer: {
        paddingHorizontal: 16,
        alignItems: "center",
    },
    card: {
        width: CARD_WIDTH,
        height: 140,
        backgroundColor: Colors.light.calendarBg,
        borderRadius: 12,
        justifyContent: "flex-end",
        padding: 16,
        overflow: "hidden",
    },
    cardContent: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
    },
    textContainer: {
        flex: 1,
        paddingRight: 16,
    },
    title: {
        color: Colors.light.white,
        fontFamily: fonts.primary.semiBold,
        fontSize: 12,
        marginBottom: 4,
        textTransform: "uppercase",
    },
    description: {
        color: Colors.light.dullWhite,
        fontFamily: fonts.primary.regular,
        fontSize: 12,
        lineHeight: 18,
    },
    dotContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 16,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: Colors.light.green,
    },
    inactiveDot: {
        backgroundColor: Colors.light.white,
    },
});

// ─── MoreSectionHeader ────────────────────────────────────────────────────────
export const moreSectionHeaderStyles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        marginTop: 24,
        marginBottom: 8,
    },
    title: {
        color: Colors.light.white,
        fontFamily: fonts.primary.semiBold,
        fontSize: 14,
        textTransform: "uppercase",
    },
});

// ─── MoreListItem ─────────────────────────────────────────────────────────────
export const moreListItemStyles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 8,
        overflow: "hidden",
    },
    defaultBackground: {
        backgroundColor: Colors.light.greybuttonBackground,
    },
    gradientBackground: {
        flex: 1,
    },
    pressed: {
        opacity: 0.8,
    },
    contentContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 16,
        minHeight: 56,
    },
    icon: {
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
        justifyContent: "center",
    },
    title: {
        color: Colors.light.white,
        fontFamily: fonts.primary.medium,
        fontSize: 14,
        textTransform: "uppercase",
    },
    titleHighlighted: {
        color: Colors.light.text,
    },
    description: {
        color: Colors.light.subtext,
        fontFamily: fonts.primary.medium,
        fontSize: 12,
        marginTop: 4,
    },
    descriptionHighlighted: {
        color: Colors.light.subtext,
    },
});
