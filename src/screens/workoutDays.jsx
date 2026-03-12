import { useContext, useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ImageBackground, Modal, TextInput, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import g from '../styles/globalStyles';

const DayItem = ({ item }) => {

    const { token } = useContext(AuthContext);

    const [open, setOpen] = useState(false);
    const animHeight = useRef(new Animated.Value(0)).current;
    const animRotate = useRef(new Animated.Value(0)).current;
    const animOpacity = useRef(new Animated.Value(0)).current;

    const [exercises, setExercises] = useState([]);

    const toggle = () => {
        const toValue = open ? 0 : 1;
        Animated.parallel([
            Animated.timing(animHeight, {
                toValue,
                duration: 250,
                useNativeDriver: false,
            }),
            Animated.timing(animRotate, {
                toValue,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(animOpacity, {
                toValue,
                duration: 250,
                useNativeDriver: false,
            }),
        ]).start();
        setOpen(!open);
    };

    const maxHeight = animHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 300], // Increased to allow more items to be shown
    });

    const rotate = animRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const opacity = animOpacity.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    useEffect(() => {
        fetchExercies(item.day_id);
    }, []);
    const fetchExercies = async (dayID) => {
        try {
            const res = await fetch(`http://192.168.100.7:5000/api/exercises/get/${dayID}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });
            const data = await res.json();
            setExercises(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching exercises:", error);
        }
    };


    return (
        <View>
            {/* ── Pressable card header ── */}
            <Pressable
                style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
                onPress={toggle}
            >
                <View style={styles.cardContent}>
                    <Text style={styles.cardLabel}>Day {item.day_id}  :  {item.day_name ? item.day_name.charAt(0).toUpperCase() + item.day_name.slice(1) : ''}</Text>
                    <Animated.Text style={[styles.arrow, { transform: [{ rotate }] }]}>
                        ▼
                    </Animated.Text>
                </View>
            </Pressable>

            {/* ── Animated dropdown below the card ── */}
            <Animated.View style={[styles.dropdown, { maxHeight, overflow: 'hidden', opacity }]}>
                <View style={styles.dropdownInner}>
                    {/* Put your dropdown content here */}
                    <Text style={styles.dropdownText}>Exercises for {item.day_name}</Text>
                    {exercises.length > 0 ? (
                        exercises.map((exercise) => (
                            <Text key={exercise.id} style={styles.dropdownText}> •  {exercise.ex_name}  -  {exercise.sets} sets  -  {exercise.reps} reps</Text>
                        ))
                    ) : (
                        <Text style={styles.dropdownText}>No exercises found</Text>
                    )}
                </View>
            </Animated.View>
        </View>
    );

}


const Days = (props) => {
    const { workoutID } = props.route.params;
    const { token } = useContext(AuthContext);
    const navigation = useNavigation();
    const { sportID } = props.route.params;

    const [days, setDays] = useState([]);


    useEffect(() => {
        fetchWorkoutDays();
    }, []);

    const fetchWorkoutDays = async () => {
        try {
            const res = await fetch(`http://192.168.100.7:5000/api/days/get/${workoutID}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });
            const data = await res.json();
            setDays(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching workout days:", error);
        }
    };


    return (
        <SafeAreaView style={[g.container, { alignItems: 'stretch', paddingHorizontal: 0, justifyContent: 'center' }]}>
            <FlatList
                style={g.list}
                data={days}
                keyExtractor={(item) => item.day_id.toString()}
                renderItem={({ item }) => <DayItem item={item} />}
                contentContainerStyle={g.listContent}
                showsVerticalScrollIndicator={false}
            />
            <View style={styles.buttonContainer}>
                <Pressable style={g.button}>
                    <Text style={g.buttonText}> Start Workout </Text>
                </Pressable>
                <Pressable style={g.buttonOutline} onPress={() => navigation.navigate('EditWorkout', { workoutID, sportID })}>
                    <Text style={g.buttonOutlineText}> Edit Workout </Text>
                </Pressable>
            </View>

        </SafeAreaView>
    );
}

export default Days;
const styles = StyleSheet.create({
    arrow: {
        color: '#ff6600',
        fontSize: 24,
        marginRight: 15,

    },
    dropdown: {
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderTopWidth: 0,
        borderColor: '#333',
        borderRadius: 10,
        marginBottom: 8,
    },
    dropdownInner: {
        padding: 14,
        gap: 8,
    },
    dropdownText: {
        color: '#ccc',
        fontSize: 14,
    },
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
    cardBadge: {
        color: '#ff6600',
        fontSize: 13,
        fontWeight: '600',
    },
});