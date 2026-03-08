import { StyleSheet } from "react-native";

const globalStyles = StyleSheet.create({
    // __ Top Bar ________________________________________
    topBar: {
        paddingHorizontal: 20,
        paddingTop: 10,
        alignItems: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#1e1e1e',
        borderRadius: 30,
        padding: 4,
        position: 'relative',
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    slidingPill: {
        position: 'absolute',
        top: 4,
        left: 4,
        width: 126,   // match tab width
        height: '100%',
        backgroundColor: '#ff6600',
        borderRadius: 26,
        shadowColor: '#ff6600',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 4,
    },
    tab: {
        width: 126,   // fixed width so sliding works
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 26,
        zIndex: 1,
    },
    tabText: {
        color: '#888',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    tabTextActive: {
        color: '#fff',
    },

    // ── Layout ─────────────────────────────────────────
    container: {
        flex: 1,
        backgroundColor: '#111',
        alignItems: 'center',
        /*justifyContent: 'center',*/
        paddingHorizontal: 20,
    },

    // ── Typography ─────────────────────────────────────
    title: {
        fontSize: 36,
        color: '#ff6600',
        fontWeight: 'bold',
        marginBottom: 40,
    },

    label: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 6,
    },

    // ── Form ───────────────────────────────────────────
    form: {
        width: '100%',
    },

    input: {
        borderWidth: 1,
        borderColor: '#555',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 20,
        color: '#fff',
    },

    inputFocused: {
        borderColor: '#ff6600',
    },

    // ── Button ─────────────────────────────────────────
    button: {
        backgroundColor: '#ff6600',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },

    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },

    buttonOutline: {
        marginHorizontal: 16,
        marginVertical: 16,
        backgroundColor: 'transparent',
        borderColor: '#ff6600',
        borderWidth: 1.5,
        borderRadius: 14,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
    },

    buttonOutlineText: {
        color: '#ff6600',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 1,
    },

    // ── Link ───────────────────────────────────────────
    link: {
        alignItems: 'center',
        marginTop: 10,
    },

    linkText: {
        color: '#fff',
        fontSize: 16,
        textDecorationLine: 'underline',
    },

    // ── Card ───────────────────────────────────────────
    card: {
        width: '100%',
        height: 180,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius: 12,
        elevation: 10,
    },

    cardPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.98 }],
    },

    cardImage: {
        flex: 1,
        justifyContent: 'flex-end',
    },

    cardImageStyle: {
        borderRadius: 20,
    },

    cardOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.35)',
        borderRadius: 20,
    },

    cardContent: {
        padding: 16,
        gap: 6,
    },

    cardLabel: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0,0,0,0.6)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },

    cardAccent: {
        width: 36,
        height: 3,
        backgroundColor: '#ff6600',
        borderRadius: 2,
    },

    // ── List ───────────────────────────────────────────
    list: {
        flex: 1,
    },

    listContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 10,
        gap: 16,
    },

    // ── Modal ──────────────────────────────────────────
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },

    modalContainer: {
        backgroundColor: '#1a1a1a',
        borderRadius: 24,
        width: '100%',
        maxHeight: '85%',
        overflow: 'hidden',
        paddingTop: 24,
    },

    modalTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: 0.5,
        paddingHorizontal: 20,
        marginBottom: 16,
    },

    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
        gap: 14,
    },

    modalSports: {
        flexDirection: 'column',
        gap: 14,
    },

    modalCard: {
        width: '100%',
        height: 150,
        borderRadius: 18,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },

    modalCardImage: {
        flex: 1,
        justifyContent: 'flex-end',
    },

    // ── Colors (reference) ─────────────────────────────
    // background:  '#111'
    // primary:     '#ff6600'
    // text:        '#fff'
    // border:      '#555'
    // overlay:     'rgba(0,0,0,0.35)'

});

export default globalStyles;
