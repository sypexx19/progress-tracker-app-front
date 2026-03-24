import { useState, useRef, useCallback } from 'react';
import { View, Text, Pressable, Animated, FlatList, StyleSheet, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getSessions } from '../controllers/workout_controllers';
import g from '../styles/globalStyles';

const workoutImages = [
    require('../assets/pushpulllegs.jpg'),
    require('../assets/arnoldsplit.jpg'),
    require('../assets/fullbody.jpg'),
    require('../assets/upperlower.jpg'),
    require('../assets/brosplit.jpg'),
    require('../assets/pplxarnold.jpg'),
    require('../assets/pplxul.jpg'),
];

const getImageForWorkout = (workoutName) => {
    const index = workoutName
        ? workoutName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % workoutImages.length
        : 0;
    return workoutImages[index];
};

const formatWorkoutName = (name) => {
    if (!name) return '';
    switch (name) {
        case 'pushpulllegs': return 'Push Pull Legs';
        case 'arnoldsplit':  return 'Arnold Split';
        case 'fullbody':     return 'Full Body';
        case 'upperlower':   return 'Upper Lower';
        case 'brosplit':     return 'Bro Split';
        case 'pplxarnold':   return 'PPL x Arnold';
        case 'pplxul':       return 'PPL x UL';
        default:
            return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
    });
};

const Completed = () => {
    const navigation = useNavigation();
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
            const data = await getSessions();
            const list = Array.isArray(data) ? data : [];
            setSessions(list.filter((item) => item.statue === 'complete'));
        } catch (error) {
            console.error('Error fetching completed sessions:', error);
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
        if (tab === 'Completed')   navigation.navigate('Completed');
        else if (tab === 'Sessions') navigation.navigate('Home');
        else if (tab === 'Workouts') navigation.navigate('Sports');
    };

    const renderItem = ({ item }) => {
        const img = getImageForWorkout(item.workout_name);
        return (
            <Pressable
                style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
                onPress={() => navigation.navigate('Chart', { sessionID: item.id })}
            >
                <ImageBackground source={img} style={styles.cardBg} imageStyle={styles.cardImg}>
                    <View style={styles.overlay} />
                    <View style={styles.cardInner}>
                        <View style={styles.topRow}>
                            <View>
                                <Text style={styles.label}>WORKOUT</Text>
                                <Text style={styles.title}>{formatWorkoutName(item.workout_name)}</Text>
                            </View>
                            <View style={styles.statusBadge}>
                                <View style={styles.dot} />
                                <Text style={styles.statusText}>Completed</Text>
                            </View>
                        </View>
                        <View style={styles.bottomRow}>
                            <View style={styles.dates}>
                                <View>
                                    <Text style={styles.dateLabel}>Started at</Text>
                                    <Text style={styles.dateValue}>{formatDate(item.started_at)}</Text>
                                </View>
                                <View>
                                    <Text style={styles.dateLabel}>Ended at</Text>
                                    <Text style={styles.dateValue}>{formatDate(item.end_at)}</Text>
                                </View>
                            </View>
                            <View style={styles.reportHintWrap}>
                                <Text style={styles.reportHint}>View report →</Text>
                            </View>
                        </View>
                    </View>
                </ImageBackground>
            </Pressable>
        );
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
                    renderItem={renderItem}
                />
            )}
        </SafeAreaView>
    );
};

export default Completed;

const styles = StyleSheet.create({
    card:          { borderRadius: 16, overflow: 'hidden', height: 160, marginBottom: 14, borderWidth: 0.5, borderColor: '#2a2a2a', elevation: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.6, shadowRadius: 16 },
    cardBg:        { flex: 1 },
    cardImg:       { borderRadius: 16 },
    overlay:       { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.72)' },
    cardInner:     { flex: 1, padding: 14, justifyContent: 'space-between' },
    topRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    label:         { fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: 1.2 },
    title:         { fontSize: 18, fontWeight: '500', color: '#fff', marginTop: 3 },
    statusBadge:   { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)' },
    dot:           { width: 8, height: 8, borderRadius: 4, backgroundColor: '#f87171' },
    statusText:    { fontSize: 11, color: 'rgba(255,255,255,0.85)' },
    bottomRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    dates:         { flexDirection: 'row', gap: 18 },
    dateLabel:     { fontSize: 10, color: 'rgba(255,255,255,0.45)' },
    dateValue:     { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 3 },
    reportHintWrap:{ alignItems: 'flex-end' },
    reportHint:    { fontSize: 12, color: '#ff6600', fontWeight: '600' },
    emptyWrap:     { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText:     { color: '#888', fontSize: 16 },
});
