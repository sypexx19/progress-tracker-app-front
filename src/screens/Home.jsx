import {useContext , useState , useEffect} from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Modal, ImageBackground, ScrollView} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

const Home = () => {

    const navigation = useNavigation();

    const { user, token } = useContext(AuthContext);
    const [sports, setSports] = useState([]);
    const [isModelOpen, setIsModelOpen] = useState(false);

    const getImageForSport = (sportName) => {
        switch (sportName) {
            case "bodybuilding":
                return require('../assets/bodybuilding.jpg');
            case "boxing":
                return require('../assets/boxing.jpg');
            case "crossfit":
                return require('../assets/crossfit.jpg');
            case "calesthenics":
                return require('../assets/calesthinics.jpg');
            default:
                return null;
        }
    };

    useEffect(() => {
        fetchSports();
    }, []);

    const fetchSports = async () => {
        try {
            const res = await fetch("http://192.168.100.7:5000/api/sports/get", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });
            const data = await res.json();
            setSports(data);
        } catch (error) {
            console.error("Error fetching sports:", error);
        }
    };

    const handleAddSport = async (sport_name) => {
        try {
            const res = await fetch("http://192.168.100.7:5000/api/sports/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ name: sport_name }),
            });
            const data = await res.json();
            if (!res.ok) {
                alert("Error", data.message);
            }
        } catch (error) {
            console.error("Error adding sport:", error);
        }
    };

    const renderSportItem = ({ item }) => {
        const img = getImageForSport(item.sport_name);
        if (!img) return null;
        return (
            <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => navigation.navigate('Workouts',{sportID : item.sport_id})}>
                <ImageBackground
                    source={img}
                    style={styles.cardImage}
                    imageStyle={styles.cardImageStyle}
                    resizeMode="cover"
                >
                    <View style={styles.cardOverlay} />
                    <View style={styles.cardContent}>
                        <Text style={styles.cardLabel}>
                            {item.sport_name.charAt(0).toUpperCase() + item.sport_name.slice(1)}
                        </Text>
                        <View style={styles.cardAccent} />
                    </View>
                </ImageBackground>
            </Pressable>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                style={styles.list}
                data={sports}
                keyExtractor={(item) => item.sport_id.toString()}
                renderItem={renderSportItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            <Pressable onPress={() => setIsModelOpen(true)} style={styles.addButton}>
                <Text style={styles.addButtonText}>+ Add Sport</Text>
            </Pressable>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isModelOpen}
                onRequestClose={() => setIsModelOpen(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Choose a Sport</Text>
                        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                            <View style={styles.modalSports}>
                                {[
                                    { key: "bodybuilding", label: "Body Building", img: require('../assets/bodybuilding.jpg') },
                                    { key: "boxing", label: "Boxing", img: require('../assets/boxing.jpg') },
                                    { key: "crossfit", label: "Crossfit", img: require('../assets/crossfit.jpg') },
                                    { key: "calesthenics", label: "Calisthenics", img: require('../assets/calesthinics.jpg') },
                                ].map(({ key, label, img }) => (
                                    <Pressable
                                        key={key}
                                        onPress={() => { handleAddSport(key); setIsModelOpen(false); }}
                                        style={({ pressed }) => [styles.modalCard, pressed && styles.cardPressed]}
                                    >
                                        <ImageBackground
                                            source={img}
                                            style={styles.modalCardImage}
                                            imageStyle={styles.cardImageStyle}
                                            resizeMode="cover"
                                        >
                                            <View style={styles.cardOverlay} />
                                            <View style={styles.cardContent}>
                                                <Text style={styles.cardLabel}>{label}</Text>
                                                <View style={styles.cardAccent} />
                                            </View>
                                        </ImageBackground>
                                    </Pressable>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default Home;

const styles = StyleSheet.create({

    container: {
        backgroundColor: '#111',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },

    list: {
        flex: 1,
    },

    listContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 10,
        gap: 16,
    },

    // ── Card ─────────────────────────────────────────
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

    // Orange accent line under label
    cardAccent: {
        width: 36,
        height: 3,
        backgroundColor: '#ff6600',
        borderRadius: 2,
    },

    // ── Add Button ────────────────────────────────────
    addButton: {
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

    addButtonText: {
        color: '#ff6600',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 1,
    },

    // ── Modal ─────────────────────────────────────────
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
});