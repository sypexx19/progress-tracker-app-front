import { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, FlatList, Modal, ImageBackground, ScrollView, Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import g from '../styles/globalStyles';

const Home = (props) => {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('Sessions');
    const slideAnim = useRef(new Animated.Value(0)).current;
    const tabs = ['Completed', 'Sessions', 'Workouts'];
    const [tabContainerWidth, setTabContainerWidth] = useState(0);
    const tabWidth = tabContainerWidth > 8 ? (tabContainerWidth - 8) / tabs.length : 0;
    const { token } = useContext(AuthContext);
    const { user } = useContext(AuthContext);
    const userId = user.id;
    console.log('user object:', JSON.stringify(user));
    const [sessions, setSessions] = useState([]);

    useFocusEffect(
        useCallback(() => {
            setActiveTab('Sessions');
            slideAnim.setValue(1);
        }, [slideAnim])
    );

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
    useEffect(() => {
        fetchSessions();
    }, [userId]);
    const fetchSessions = async () => {
        try {
            const res = await fetch(`http://192.168.100.7:5000/api/workouts/get/sessions/${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });
            const data1 = await res.json();
            const data = data1.filter(session => session.statue === 'progress');
            console.log('Sessions data:', JSON.stringify(data)); // ADD THIS
            setSessions(data)
        } catch (error) {
            console.error("Error fetching sessions:", error);
        }
    };

    const formatWorkoutName = (name) => {
        if (!name) return "";
        switch (name) {
            case "pushpulllegs": return "Push Pull Legs";
            case "arnoldsplit": return "Arnold Split";
            case "fullbody": return "Full Body";
            case "upperlower": return "Upper Lower";
            case "brosplit": return "Bro Split";
            case "pplxarnold": return "PPL x Arnold";
            case "pplxul": return "PPL x UL";
            default:
                return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }
    };
    const renderWorkoutItem = ({ item }) => {
        const img = require('../assets/bodybuilding.jpg');
        const isComplete = item.statue === 'complete';

        const formatDate = (dateStr) => {
            if (!dateStr) return '—';
            return new Date(dateStr).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            });
        };

        return (
            <Pressable
                style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
                onPress={() => navigation.navigate('Details', {
                    sessionID: item.id,
                })}
            >
                <ImageBackground source={img} style={styles.cardBg} imageStyle={styles.cardImg}>
                    <View style={styles.overlay} />
                    <View style={styles.cardInner}>
                        {/* TOP ROW */}
                        <View style={styles.topRow}>
                            <View>
                                <Text style={styles.label}>WORKOUT</Text>
                                <Text style={styles.title}>{formatWorkoutName(item.workout_name)}</Text>
                            </View>
                            <View style={styles.statusBadge}>
                                <View style={[styles.dot, { backgroundColor: isComplete ? '#f87171' : '#4ade80' }]} />
                                <Text style={styles.statusText}>
                                    {isComplete ? 'Complete' : 'In progress'}
                                </Text>
                            </View>
                        </View>

                        {/* BOTTOM ROW */}
                        <View style={styles.bottomRow}>
                            <View style={styles.dates}>
                                <View>
                                    <Text style={styles.dateLabel}>Started at</Text>
                                    <Text style={styles.dateValue}>{formatDate(item.started_at)}</Text>
                                </View>
                                <View>
                                    <Text style={styles.dateLabel}>End it</Text>
                                    <Text style={styles.dateValue}>{formatDate(item.end_at)}</Text>
                                </View>
                            </View>
                            <View style={styles.daysBox}>
                                <Text style={styles.dateLabel}>Days / week</Text>
                                <Text style={styles.daysCount}>{item.days_per_week ?? '—'}</Text>
                            </View>
                        </View>
                    </View>
                </ImageBackground>
            </Pressable>
        );
    };


    return (
        <SafeAreaView style={[styles.container, { alignItems: 'stretch', justifyContent: 'space-between', paddingHorizontal: 0 }]}>
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
                                    })
                                }]
                            }
                        ]}
                    />
                    {tabs.map((tab, index) => (
                        <Pressable
                            key={tab}
                            style={[g.tab, { flex: 1, width: 'auto' }]}
                            onPress={() => { handleTabPress(tab, index) }}
                        >
                            <Text style={[
                                g.tabText,
                                activeTab === tab && g.tabTextActive
                            ]}>
                                {tab}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>
            <FlatList
                style={g.list}
                data={sessions}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderWorkoutItem}
                contentContainerStyle={g.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111', alignItems: 'center', paddingHorizontal: 20 },
    card: { borderRadius: 16, overflow: 'hidden', height: 160, marginBottom: 14, borderWidth: 0.5, borderColor: '#2a2a2a', elevation: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.6, shadowRadius: 16, },
    cardBg: { flex: 1 },
    cardImg: { borderRadius: 16 },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.72)' },
    cardInner: { flex: 1, padding: 14, justifyContent: 'space-between' },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    label: { fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: 1.2 },
    title: { fontSize: 18, fontWeight: '500', color: '#fff', marginTop: 3 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)' },
    dot: { width: 8, height: 8, borderRadius: 4 },
    statusText: { fontSize: 11, color: 'rgba(255,255,255,0.85)' },
    bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    dates: { flexDirection: 'row', gap: 18 },
    dateLabel: { fontSize: 10, color: 'rgba(255,255,255,0.45)' },
    dateValue: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 3 },
    daysBox: { alignItems: 'flex-end' },
    daysCount: { fontSize: 20, fontWeight: '500', color: '#fff', marginTop: 3 },
});
