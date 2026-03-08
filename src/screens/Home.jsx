import { useContext, useState, useEffect } from 'react';
import { View, Text, Pressable, FlatList, Modal, ImageBackground, ScrollView } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import g from '../styles/globalStyles';

const Home = () => {

    const navigation = useNavigation();
    const { user, token } = useContext(AuthContext);
    const [sports, setSports] = useState([]);
    const [sportsDefault, setSportsDefault] = useState([]);
    const [isModelOpen, setIsModelOpen] = useState(false);

    const getImageForSport = (sportName) => {
        switch (sportName) {
            case "bodybuilding": return require('../assets/bodybuilding.jpg');
            case "boxing": return require('../assets/boxing.jpg');
            case "crossfit": return require('../assets/crossfit.jpg');
            case "calisthenics": return require('../assets/calesthinics.jpg');
            default: return null;
        }
    };

    useEffect(() => {
        fetchSports();
        fetchSportsDefault();
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

    const fetchSportsDefault = async () => {
        try {
            const res = await fetch("http://192.168.100.7:5000/api/sports/get/default", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();
            setSportsDefault(data);
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
                alert(data.message);
            } else {
                fetchSports();
            }
        } catch (error) {
            console.error("Error adding sport:", error);
        }
    };

    const renderSportItem = ({ item }) => {
        const img = getImageForSport(item.sport_name);
        if (!img) return null;
        return (
            <Pressable
                style={({ pressed }) => [g.card, pressed && g.cardPressed]}
                onPress={() => navigation.navigate('Workouts', { sportID: item.sport_id, sportName: item.sport_name })}
            >
                <ImageBackground source={img} style={g.cardImage} imageStyle={g.cardImageStyle} resizeMode="cover">
                    <View style={g.cardOverlay} />
                    <View style={g.cardContent}>
                        <Text style={g.cardLabel}>
                            {item.sport_name.charAt(0).toUpperCase() + item.sport_name.slice(1)}
                        </Text>
                        <View style={g.cardAccent} />
                    </View>
                </ImageBackground>
            </Pressable>
        );
    };

    const availableSports = sportsDefault.filter(
        (defaultSport) => !sports.some(
            (userSport) => userSport.sport_name === defaultSport.sport_name
        )
    );

    return (
        <SafeAreaView style={[g.container, { alignItems: 'stretch', justifyContent: 'space-between', paddingHorizontal: 0 }]}>
            <FlatList
                style={g.list}
                data={sports}
                keyExtractor={(item) => item.sport_id.toString()}
                renderItem={renderSportItem}
                contentContainerStyle={g.listContent}
                showsVerticalScrollIndicator={false}
            />

            <Pressable onPress={() => setIsModelOpen(true)} style={g.buttonOutline}>
                <Text style={g.buttonOutlineText}>+ Add Sport</Text>
            </Pressable>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isModelOpen}
                onRequestClose={() => setIsModelOpen(false)}
            >
                <View style={g.modalOverlay}>
                    <View style={g.modalContainer}>
                        <Text style={g.modalTitle}>Choose a Sport</Text>
                        <ScrollView contentContainerStyle={g.scrollContent} showsVerticalScrollIndicator={false}>
                            <View style={g.modalSports}>
                                {availableSports.length === 0 ? (
                                    <Text style={{ color: '#aaa', textAlign: 'center', marginTop: 20 }}>
                                        You've added all available sports!
                                    </Text>
                                ) : (
                                    availableSports.map(({ sport_name }) => (
                                        <Pressable
                                            key={sport_name}
                                            onPress={() => { handleAddSport(sport_name); setIsModelOpen(false); }}
                                            style={({ pressed }) => [g.modalCard, pressed && g.cardPressed]}
                                        >
                                            <ImageBackground source={getImageForSport(sport_name)} style={g.modalCardImage} imageStyle={g.cardImageStyle} resizeMode="cover">
                                                <View style={g.cardOverlay} />
                                                <View style={g.cardContent}>
                                                    <Text style={g.cardLabel}>{sport_name}</Text>
                                                    <View style={g.cardAccent} />
                                                </View>
                                            </ImageBackground>
                                        </Pressable>
                                    )))}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default Home;
