import { useContext, useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, Pressable, ImageBackground, Modal, TextInput, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import g from '../styles/globalStyles';

const Workouts = (props) => {
    const navigation = useNavigation();
    const { sportID } = props.route.params;
    const { token } = useContext(AuthContext);

    const [workouts, setWorkouts] = useState([]);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [workoutName, setWorkoutName] = useState("");
    const [workoutDescription, setWorkoutDescription] = useState("");
    const [defaultWorkouts, setDefaultWorkouts] = useState([]);

    const [activeTab, setActiveTab] = useState('Workouts');
    const slideAnim = useRef(new Animated.Value(0)).current;
    const tabs = ['Workouts', 'Sessions'];

    const handleTabPress = (tab, index) => {
        setActiveTab(tab);
        Animated.spring(slideAnim, {
            toValue: index,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
        }).start();
        if (tab === 'Sessions') {
            navigation.navigate('Sessions', { sportID, sportName: props.route.params.sportName });
        } else if (tab === 'Workouts') {
            navigation.navigate('Workouts', { sportID, sportName: props.route.params.sportName });
        }
    };

    useEffect(() => {
        fetchWorkouts();
        fetchDefaultWorkouts();
    }, []);

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
    const fetchDefaultWorkouts = async () => {
        const { sportName } = props.route.params;

        const sportIDMap = {
            "bodybuilding": 1,
            "boxing": 2,
            "calisthenics": 3,
            "crossfit": 4,
        };

        const id = sportIDMap[sportName];
        if (!id) return; // unknown sport

        try {
            const res = await fetch(`http://192.168.100.7:5000/api/workouts/get/default/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });
            const data = await res.json();
            setDefaultWorkouts(data);
        } catch (error) {
            console.error("Error fetching default workouts:", error);
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

    const handleAddWorkout = async (selectedName) => {
        try {
            const res = await fetch(`http://192.168.100.7:5000/api/workouts/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ sportID, workoutName: selectedName, workoutDescription }),
            });
            const data = await res.json();
            if (!res.ok) {
                alert(data.message || "Error adding workout");
            } else {
                fetchWorkouts();
            }
        } catch (error) {
            console.error("Error adding workout:", error);
        }
    };

    const renderWorkoutItem = ({ item }) => {
        const img = getImageForWorkout(item.workout_name);
        if (!img) return null;
        return (
            <Pressable
                style={({ pressed }) => [g.card, pressed && g.cardPressed]}
                onPress={() => navigation.navigate('Workout', { workoutID: item.workout_id })}
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
        );
    };

    const availableWorkouts = defaultWorkouts.filter(
        (defaultWorkout) => !workouts.some(
            (userWorkout) => userWorkout.workout_name === defaultWorkout.workout_name
        )
    );

    return (
        <SafeAreaView style={[g.container, { alignItems: 'stretch', justifyContent: 'space-between', paddingHorizontal: 0 }]}>
            <View style={g.topBar}>
                <View style={g.tabContainer}>

                    <Animated.View
                        style={[
                            g.slidingPill,
                            {
                                transform: [{
                                    translateX: slideAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 130], // adjust to your tab width
                                    })
                                }]
                            }
                        ]}
                    />
                    {tabs.map((tab, index) => (
                        <Pressable
                            key={tab}
                            style={g.tab}
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
                                {availableWorkouts.map(({ workout_name }) => (
                                    <Pressable
                                        key={workout_name}
                                        onPress={() => { handleAddWorkout(workout_name); setIsModelOpen(false); }}
                                        style={({ pressed }) => [g.modalCard, pressed && g.cardPressed]}
                                    >
                                        <ImageBackground source={getImageForWorkout(workout_name)} style={g.modalCardImage} imageStyle={g.cardImageStyle} resizeMode="cover">
                                            <View style={g.cardOverlay} />
                                            <View style={g.cardContent}>
                                                <Text style={g.cardLabel}>{formatWorkoutName(workout_name)}</Text>
                                                <View style={g.cardAccent} />
                                            </View>
                                        </ImageBackground>
                                    </Pressable>
                                ))}
                                <Text style={g.modalTitle}>Or Create Your Own</Text>
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
                                <Pressable style={g.button} onPress={() => { handleAddWorkout(); setIsModelOpen(false); }}>
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
