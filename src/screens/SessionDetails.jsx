import { React, useContext, useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import g from '../styles/globalStyles';

const Details = (props) => {
    const { sessionID } = props.route.params;
    const { token } = useContext(AuthContext);
    const navigation = useNavigation();
    const [session, setSession] = useState([]);
    const [isCompleting, setIsCompleting] = useState(false);

    useEffect(() => {
        fetchSession();
    }, [sessionID]);

    const fetchSession = async () => {
        try {
            const res = await fetch(`http://192.168.100.7:5000/api/session/get/${sessionID}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });
            const data = await res.json();
            setSession(data.days ?? data);
        } catch (error) {
            console.error("Error fetching session:", error);
        }
    };

    const completeSession = async () => {
        if (isCompleting) return;
        setIsCompleting(true);
        try {
            const res = await fetch(`http://192.168.100.7:5000/api/workouts/completeSession/${sessionID}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });

            const data = await res.json();
            if (!res.ok) {
                Alert.alert("Error", data?.message || "Failed to complete session.");
                return;
            }

            Alert.alert("Completed", "Session marked as complete.");
            navigation.navigate('Completed');
        } catch (error) {
            console.error("Error completing session:", error);
            Alert.alert("Error", "Unable to complete session right now.");
        } finally {
            setIsCompleting(false);
        }
    };

    const handleTerminate = () => {
        Alert.alert(
            "Terminate Session",
            "Are you sure you want to complete this session?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Complete", onPress: completeSession, style: "destructive" }
            ]
        );
    };

    const renderDay = ({ item, index }) => {
        return (
            <View style={{ marginBottom: 15 }}>
                <Pressable
                    style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
                    onPress={() => navigation.navigate('Progress', { dayID: item.id })}
                >
                    <View style={styles.cardContent}>
                        <Text style={styles.cardLabel}>
                            Day {index + 1} : {item.day_name ? item.day_name.charAt(0).toUpperCase() + item.day_name.slice(1) : ''}
                        </Text>
                    </View>
                </Pressable>
            </View>
        );
    };

    return (
        <SafeAreaView style={[g.container, { alignItems: 'stretch', paddingHorizontal: 0, justifyContent: 'center' }]}>
            {/* Main Content */}
            <FlatList
                style={[g.list, { flex: 1 }]}
                data={Array.isArray(session) ? session : []}
                renderItem={renderDay}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={[g.listContent, { paddingBottom: 100 }]} // Extra padding so items aren't hidden
                showsVerticalScrollIndicator={false}
            />

            {/* --- Bottom Action Bar --- */}
            <View style={styles.bottomBar}>
                <Pressable
                    style={styles.barButton}
                    onPress={() => navigation.navigate('Chart', { sessionID })}
                >
                    <Text style={styles.iconPlaceholder}>📊</Text>
                    <Text style={styles.barText}>Charts</Text>
                </Pressable>

                <View style={styles.divider} />

                <Pressable
                    style={styles.barButton}
                    onPress={handleTerminate}
                >
                    <Text style={[styles.iconPlaceholder, { color: '#ff4444' }]}>🏁</Text>
                    <Text style={[styles.barText, { color: '#ff4444' }]}>
                        {isCompleting ? 'Completing...' : 'Terminate'}
                    </Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
};

export default Details;

const styles = StyleSheet.create({
    card: {
        width: '100%',
        height: 100,
        borderRadius: 20,
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    cardContent: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardLabel: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    // --- New Styles for Bottom Bar ---
    bottomBar: {
        flexDirection: 'row',
        height: 80,
        backgroundColor: '#121212',
        borderTopWidth: 1,
        borderTopColor: '#333',
        paddingBottom: 10, // Adjust for notch devices
        alignItems: 'center',
        justifyContent: 'space-around',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    barButton: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    barText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
    iconPlaceholder: {
        fontSize: 24,
    },
    divider: {
        width: 1,
        height: '50%',
        backgroundColor: '#333',
    }
});