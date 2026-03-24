import { useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, Pressable, ImageBackground, Modal, TextInput, ScrollView, Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getWorkouts, addWorkoutNonDefault, deleteWorkout } from '../controllers/workout_controllers';
import g from '../styles/globalStyles';

const Workouts = (props) => {
    const navigation = useNavigation();
    const { sportID } = props.route.params;
    const [activeTab, setActiveTab] = useState('Workouts');
    const slideAnim = useRef(new Animated.Value(2)).current;
    const tabs = ['Completed', 'Sessions', 'Workouts'];
    const [tabContainerWidth, setTabContainerWidth] = useState(0);
    const tabWidth = tabContainerWidth > 8 ? (tabContainerWidth - 8) / tabs.length : 0;

    const [workouts, setWorkouts] = useState([]);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [workoutName, setWorkoutName] = useState('');
    const [workoutDescription, setWorkoutDescription] = useState('');

    useFocusEffect(useCallback(() => { fetchWorkouts(); }, [sportID]));
    useFocusEffect(useCallback(() => {
        setActiveTab('Workouts');
        slideAnim.setValue(2);
    }, [slideAnim]));

    const handleTabPress = (tab, index) => {
        setActiveTab(tab);
        Animated.spring(slideAnim, { toValue: index, useNativeDriver: true, tension: 80, friction: 10 }).start();
        if (tab === 'Completed')    navigation.navigate('Completed');
        else if (tab === 'Sessions')  navigation.navigate('Home');
        else if (tab === 'Workouts')  navigation.navigate('Sports');
    };

    const fetchWorkouts = async () => {
        try {
            const data = await getWorkouts(sportID);
            setWorkouts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching workouts:', error);
        }
    };

    const workoutImages = [
        require('../assets/pushpulllegs.jpg'),
        require('../assets/arnoldsplit.jpg'),
        require('../assets/fullbody.jpg'),
        require('../assets/upperlower.jpg'),
        require('../assets/brosplit.jpg'),
        require('../assets/pplxarnold.jpg'),
        require('../assets/pplxul.jpg'),
    ];

    const getImageForWorkout = () =>
        workoutImages[Math.floor(Math.random() * workoutImages.length)];

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

    const handleAddWorkoutNonDefault = async () => {
        try {
            const data = await addWorkoutNonDefault(sportID, workoutName, workoutDescription);
            navigation.navigate('Create', {
                workoutID: data.workoutID,
                sportID,
                sportName: props.route.params.sportName,
            });
        } catch (error) {
            alert(error.message || 'Error adding workout');
        }
    };

    const handleDeleteWorkout = async (workoutID) => {
        try {
            await deleteWorkout(workoutID);
            fetchWorkouts();
        } catch (error) {
            alert(error.message || 'Error deleting workout');
        }
    };

    const renderWorkoutItem = ({ item }) => {
        const img = getImageForWorkout();
        return (
            <View style={{ position: 'relative' }}>
                <Pressable
                    style={({ pressed }) => [g.card, pressed && g.cardPressed]}
                    onPress={() => navigation.navigate('Workout-days', {
                        workoutID: item.workout_id,
                        sportID,
                        sportName: props.route.params.sportName,
                    })}
                >
                    <ImageBackground source={img} style={g.cardImage} imageStyle={g.cardImageStyle} resizeMode="cover">
                        <View style={g.cardOverlay} />
                        <View style={g.cardContent}>
                            <Text style={g.cardLabel}>{formatWorkoutName(item.workout_name)}</Text>
                            <View style={g.cardAccent} />
                        </View>
                    </ImageBackground>
                </Pressable>
                <Pressable
                    style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
                    onPress={() => handleDeleteWorkout(item.workout_id)}
                >
                    <Text style={styles.deleteIcon}>✕</Text>
                </Pressable>
            </View>
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
                            <Text style={[g.tabText, activeTab === tab && g.tabTextActive]}>{tab}</Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            <FlatList
                style={g.list}
                data={workouts}
                keyExtractor={(item) => item.workout_id.toString()}
                renderItem={renderWorkoutItem}
                contentContainerStyle={g.listContent}
                showsVerticalScrollIndicator={false}
            />

            <Pressable style={g.buttonOutline} onPress={() => setIsModelOpen(true)}>
                <Text style={g.buttonOutlineText}>+ Add Workout</Text>
            </Pressable>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isModelOpen}
                onRequestClose={() => setIsModelOpen(false)}
            >
                <View style={g.modalOverlay}>
                    <View style={g.modalContainer}>
                        <Text style={g.modalTitle}>Add Workout</Text>
                        <ScrollView contentContainerStyle={g.scrollContent} showsVerticalScrollIndicator={false}>
                            <View style={g.modalSports}>
                                <TextInput
                                    style={[g.input, { width: '90%', alignSelf: 'center', marginBottom: 15, color: 'white' }]}
                                    placeholder="Workout Name"
                                    placeholderTextColor="#aaa"
                                    value={workoutName}
                                    onChangeText={setWorkoutName}
                                />
                                <TextInput
                                    style={[g.input, { width: '90%', alignSelf: 'center', marginBottom: 15, color: 'white' }]}
                                    placeholder="Workout Description (Optional)"
                                    placeholderTextColor="#aaa"
                                    value={workoutDescription}
                                    onChangeText={setWorkoutDescription}
                                />
                                <Pressable style={g.button} onPress={() => { handleAddWorkoutNonDefault(); setIsModelOpen(false); }}>
                                    <Text style={g.buttonText}>Create Workout</Text>
                                </Pressable>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default Workouts;

const styles = StyleSheet.create({
    deleteBtn:        { position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(30,0,0,0.75)', borderWidth: 1, borderColor: '#ff2222', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
    deleteBtnPressed: { backgroundColor: '#ff2222', transform: [{ scale: 0.92 }] },
    deleteIcon:       { color: '#ff4444', fontSize: 12, fontWeight: '700' },
});
