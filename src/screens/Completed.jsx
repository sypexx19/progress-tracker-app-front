import { useState, useRef, useCallback, useContext } from 'react';
import { View, Text, Pressable, Animated, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import g from '../styles/globalStyles';
import { AuthContext } from '../context/AuthContext';

const Completed = () => {
    const navigation = useNavigation();
    const { token, user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('Completed');
    const slideAnim = useRef(new Animated.Value(0)).current;
    const tabs = ['Completed', 'Sessions', 'Workouts'];
    const [tabContainerWidth, setTabContainerWidth] = useState(0);
    const tabWidth = tabContainerWidth > 8 ? (tabContainerWidth - 8) / tabs.length : 0;
    const [sessions, setSessions] = useState([]);

    useFocusEffect(
        useCallback(() => {
            setActiveTab('Completed');
            slideAnim.setValue(0);
            fetchCompletedSessions();
        }, [slideAnim])
    );

    const fetchCompletedSessions = async () => {
        try {
            const res = await fetch(`http://192.168.100.7:5000/api/workouts/get/sessions/${user.id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });
            const data = await res.json();
            const list = Array.isArray(data) ? data : [];
            const completed = list.filter((item) => item.statue === 'complete');
            setSessions(completed);
        } catch (error) {
            console.error("Error fetching completed sessions:", error);
            setSessions([]);
        }
    };

    const handleTabPress = (tab, index) => {
        setActiveTab(tab);
        Animated.spring(slideAnim, {
            toValue: index,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
        }).start();

        if (tab === 'Completed') {
            navigation.navigate('Completed');
        } else if (tab === 'Sessions') {
            navigation.navigate('Home');
        } else if (tab === 'Workouts') {
            navigation.navigate('Sports');
        }
    };

    return (
        <SafeAreaView style={[g.container, { alignItems: 'stretch', justifyContent: 'space-between', paddingHorizontal: 0 }]}>
            <View style={g.topBar}>
                <View
                    style={g.tabContainer}
                    onLayout={(e) => setTabContainerWidth(e.nativeEvent.layout.width)}
                >
                    <Animated.View
                        style={[
                            g.slidingPill,
                            tabWidth > 0 && { width: tabWidth },
                            {
                                transform: [{
                                    translateX: slideAnim.interpolate({
                                        inputRange: tabs.map((_, idx) => idx),
                                        outputRange: tabs.map((_, idx) => idx * tabWidth),
                                    }),
                                }],
                            },
                        ]}
                    />
                    {tabs.map((tab, index) => (
                        <Pressable
                            key={tab}
                            style={[g.tab, { flex: 1, width: 'auto' }]}
                            onPress={() => handleTabPress(tab, index)}
                        >
                            <Text style={[g.tabText, activeTab === tab && g.tabTextActive]}>
                                {tab}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            {sessions.length === 0 ? (
                <View style={styles.emptyWrap}>
                    <Text style={styles.emptyText}>No completed sessions yet.</Text>
                </View>
            ) : (
                <FlatList
                    style={g.list}
                    data={sessions}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={g.listContent}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <Pressable
                            style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
                            onPress={() => navigation.navigate('Chart', { sessionID: item.id })}
                        >
                            <Text style={styles.workout}>{item.workout_name}</Text>
                            <Text style={styles.meta}>
                                {new Date(item.started_at).toLocaleDateString()} - {new Date(item.end_at).toLocaleDateString()}
                            </Text>
                            <Text style={styles.reportHint}>Tap to view full progress report</Text>
                        </Pressable>
                    )}
                />
            )}
        </SafeAreaView>
    );
};

export default Completed;

const styles = StyleSheet.create({
    emptyWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#888',
        fontSize: 16,
    },
    card: {
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        borderRadius: 16,
        padding: 14,
        gap: 6,
    },
    workout: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    meta: {
        color: '#aaa',
        fontSize: 12,
    },
    reportHint: {
        color: '#ff6600',
        fontSize: 12,
        marginTop: 2,
    },
});
