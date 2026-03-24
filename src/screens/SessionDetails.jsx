import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { getSessionDays } from '../controllers/session_controllers';
import { completeSession } from '../controllers/workout_controllers';
import g from '../styles/globalStyles';

const Details = (props) => {
    const { sessionID } = props.route.params;
    const navigation = useNavigation();
    const [session, setSession] = useState([]);
    const [isCompleting, setIsCompleting] = useState(false);

    useEffect(() => {
        fetchSession();
    }, [sessionID]);

    const fetchSession = async () => {
        try {
            const data = await getSessionDays(sessionID);
            setSession(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching session:', error);
        }
    };

    const handleCompleteSession = async () => {
        if (isCompleting) return;
        setIsCompleting(true);
        try {
            await completeSession(sessionID);
            Alert.alert('Completed', 'Session marked as complete.');
            navigation.navigate('Completed');
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to complete session.');
        } finally {
            setIsCompleting(false);
        }
    };

    const handleTerminate = () => {
        Alert.alert(
            'Terminate Session',
            'Are you sure you want to complete this session?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Complete', onPress: handleCompleteSession, style: 'destructive' },
            ]
        );
    };

    const renderDay = ({ item, index }) => (
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

    return (
        <SafeAreaView style={[g.container, { alignItems: 'stretch', paddingHorizontal: 0, justifyContent: 'center' }]}>
            <FlatList
                style={[g.list, { flex: 1 }]}
                data={Array.isArray(session) ? session : []}
                renderItem={renderDay}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={[g.listContent, { paddingBottom: 100 }]}
                showsVerticalScrollIndicator={false}
            />
            <View style={styles.bottomBar}>
                <Pressable style={styles.barButton} onPress={() => navigation.navigate('Chart', { sessionID })}>
                    <Text style={styles.iconPlaceholder}>📊</Text>
                    <Text style={styles.barText}>Charts</Text>
                </Pressable>
                <View style={styles.divider} />
                <Pressable style={styles.barButton} onPress={handleTerminate}>
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
    card:            { width: '100%', height: 100, borderRadius: 20, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
    cardContent:     { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    cardLabel:       { color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: 0.5 },
    bottomBar:       { flexDirection: 'row', height: 80, backgroundColor: '#121212', borderTopWidth: 1, borderTopColor: '#333', paddingBottom: 10, alignItems: 'center', justifyContent: 'space-around', position: 'absolute', bottom: 0, left: 0, right: 0 },
    barButton:       { alignItems: 'center', justifyContent: 'center', flex: 1 },
    barText:         { color: '#fff', fontSize: 12, fontWeight: '600', marginTop: 4 },
    iconPlaceholder: { fontSize: 24 },
    divider:         { width: 1, height: '50%', backgroundColor: '#333' },
});
