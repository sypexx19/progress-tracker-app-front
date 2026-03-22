import { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, Pressable, ImageBackground, Modal, TextInput, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from '../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import g from '../styles/globalStyles';

const Workouts = (props) => {
    const navigation = useNavigation();
    const { sportID } = props.route.params;
    const { token } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('Workouts');
    const slideAnim = useRef(new Animated.Value(2)).current;
    const tabs = ['Completed', 'Sessions', 'Workouts'];
    const [tabContainerWidth, setTabContainerWidth] = useState(0);
    const tabWidth = tabContainerWidth > 8 ? (tabContainerWidth - 8) / tabs.length : 0;

    const [workouts, setWorkouts] = useState([]);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [workoutName, setWorkoutName] = useState("");
    const [workoutDescription, setWorkoutDescription] = useState("");
    useEffect(() => {
    }, []);
    useFocusEffect(useCallback(() => { fetchWorkouts(); }, [sportID]));
    useFocusEffect(
        useCallback(() => {
            setActiveTab('Workouts');
            slideAnim.setValue(2);
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

    const fetchWorkouts = async () => {
        try {
            const res = await fetch(`http://192.168.100.7:5000/api/workouts/get/${sportID}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });
            const data = await res.json();
            setWorkouts(data);
        } catch (error) {
            console.error("Error fetching workouts:", error);
        }
    };
    const getImageForWorkout = (workoutName) => {
        switch (workoutName) {
            case "pushpulllegs": return require('../assets/pushpulllegs.jpg');
            case "arnoldsplit": return require('../assets/arnoldsplit.jpg');
            case "fullbody": return require('../assets/fullbody.jpg');
            case "upperlower": return require('../assets/upperlower.jpg');
            case "brosplit": return require('../assets/brosplit.jpg');
            case "pplxarnold": return require('../assets/pplxarnold.jpg');
            case "pplxul": return require('../assets/pplxul.jpg');
            default: return null;
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


    const handleAddWorkoutNonDefault = async () => {
        try {
            const res = await fetch(`http://192.168.100.7:5000/api/workouts/addNonDefault`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ sportID, workoutName, workoutDescription }),
            });
            const data = await res.json();
            if (!res.ok) {
                alert(data.message || "Error adding workout");
            } else {
                navigation.navigate('Create', { workoutID: data.workoutID, sportID, sportName: props.route.params.sportName });
            }
        } catch (error) {
            console.error("Error adding workout:", error);
        }
    };

    const handleDeleteWorkout = async (workoutID) => {
        try {
            const res = await fetch(`http://192.168.100.7:5000/api/workouts/delete/${workoutID}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });
            if (res.ok) {
                fetchWorkouts();

            } else {
                const data = await res.json();
                alert(data.message || "Error deleting workout");
            }
        } catch (error) {
            console.error("Error deleting workout:", error);
        }
    };

    const renderWorkoutItem = ({ item }) => {
        const img = getImageForWorkout(item.workout_name);
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
                            <Text style={g.cardLabel}>
                                {formatWorkoutName(item.workout_name)}
                            </Text>
                            <View style={g.cardAccent} />
                        </View>
                    </ImageBackground>
                </Pressable>
                {/* ✕ delete button — top right corner of the card */}
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
                            <Text style={[g.tabText, activeTab === tab && g.tabTextActive]}>
                                {tab}
                            </Text>
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
                onRequestClose={() => setIsModelOpen(false)}>
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

import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({
    deleteBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: 'rgba(30,0,0,0.75)',
        borderWidth: 1,
        borderColor: '#ff2222',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    deleteBtnPressed: {
        backgroundColor: '#ff2222',
        transform: [{ scale: 0.92 }],
    },
    deleteIcon: {
        color: '#ff4444',
        fontSize: 12,
        fontWeight: '700',
    },
});
