import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Modal, TextInput } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from '@react-navigation/native';
import { getDays, deleteDay } from '../controllers/days_controllers';
import { updateWorkoutName } from '../controllers/workout_controllers';

const DayItem = ({ item, exercisesForDay, onPress, onDelete, index }) => (
    <View style={{ position: 'relative' }}>
        <Pressable
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
            onPress={onPress}
        >
            <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>
                    Day {index + 1}  :  {item.day_name
                        ? item.day_name.charAt(0).toUpperCase() + item.day_name.slice(1)
                        : ''}
                </Text>
                {exercisesForDay.length > 0 && (
                    <Text style={styles.cardBadge}>✓ {exercisesForDay.length} exercises</Text>
                )}
            </View>
        </Pressable>
        <Pressable
            style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
            onPress={onDelete}
        >
            <Text style={styles.deleteIcon}>✕</Text>
        </Pressable>
    </View>
);

const EditWorkout = (props) => {
    const { sportID, workoutID, sportName } = props.route.params;
    const navigation = useNavigation();

    const [isModelOpen, setIsModelOpen] = useState(false);
    const [workoutName, setWorkoutName] = useState('');
    const [days, setDays] = useState([]);
    const [daysData, setDaysData] = useState({});

    useEffect(() => {
        fetchWorkoutDays();
    }, []);

    const fetchWorkoutDays = async () => {
        try {
            const data = await getDays(workoutID);
            const fetched = Array.isArray(data) ? data : [];
            setDays(fetched);
            const mapped = fetched.reduce((acc, day) => {
                acc[day.day_id] = { ...day, exercises: [] };
                return acc;
            }, {});
            setDaysData(mapped);
        } catch (error) {
            console.error('Error fetching workout days:', error);
        }
    };

    const handleDeleteDay = async (dayID) => {
        try {
            await deleteDay(dayID);
            setDays(prev => prev.filter(d => d.day_id !== dayID));
            setDaysData(prev => {
                const updated = { ...prev };
                delete updated[dayID];
                return updated;
            });
        } catch (error) {
            alert(error.message || 'Error deleting day');
        }
    };

    const handleDayPress = (item) => {
        navigation.navigate('EditEx', {
            day: item.day_name,
            dayID: item.day_id,
            onSave: (dayID, updatedExercises) => {
                setDaysData(prev => ({
                    ...prev,
                    [dayID]: { ...prev[dayID], exercises: updatedExercises },
                }));
            },
        });
    };

    const handleSave = async () => {
        if (!workoutName.trim()) {
            setIsModelOpen(false);
            navigation.navigate('Workouts', { sportID, sportName });
            return;
        }
        try {
            await updateWorkoutName(workoutID, workoutName);
            setIsModelOpen(false);
            navigation.navigate('Workouts', { sportID, sportName });
        } catch (error) {
            alert(error.message || 'Failed to update workout');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                style={{ flex: 1 }}
                data={days}
                keyExtractor={(item) => item.day_id.toString()}
                renderItem={({ item, index }) => (
                    <DayItem
                        item={item}
                        exercisesForDay={daysData[item.day_id]?.exercises || []}
                        onPress={() => handleDayPress(item)}
                        onDelete={() => handleDeleteDay(item.day_id)}
                        index={index}
                    />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
            <Pressable style={styles.button} onPress={() => setIsModelOpen(true)}>
                <Text style={styles.buttonText}>Save Workout</Text>
            </Pressable>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isModelOpen}
                onRequestClose={() => setIsModelOpen(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Rename Workout (optional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Workout Name"
                            placeholderTextColor="#999"
                            value={workoutName}
                            onChangeText={setWorkoutName}
                        />
                        <Pressable style={styles.button} onPress={handleSave}>
                            <Text style={styles.buttonText}>Save</Text>
                        </Pressable>
                        <Pressable onPress={() => setIsModelOpen(false)}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default EditWorkout;

const styles = StyleSheet.create({
    container:       { flex: 1, backgroundColor: '#111' },
    listContent:     { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10, gap: 16 },
    card:            { width: '100%', height: 100, borderRadius: 20, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
    cardContent:     { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    cardLabel:       { color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: 0.5 },
    cardBadge:       { color: '#ff6600', fontSize: 13, fontWeight: '600' },
    button:          { marginHorizontal: 16, marginVertical: 16, backgroundColor: '#ff6600', paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
    buttonText:      { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
    modalContainer:  { backgroundColor: '#1a1a1a', borderRadius: 24, width: '100%', padding: 24, gap: 15 },
    modalTitle:      { color: '#fff', fontSize: 18, fontWeight: '700' },
    input:           { borderWidth: 1, borderColor: '#555', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, color: '#fff' },
    cancelText:      { color: '#888', textAlign: 'center', fontSize: 15, marginTop: 4 },
    deleteBtn:       { position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(30,0,0,0.75)', borderWidth: 1, borderColor: '#ff2222', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
    deleteBtnPressed:{ backgroundColor: '#ff2222', transform: [{ scale: 0.92 }] },
    deleteIcon:      { color: '#ff4444', fontSize: 12, fontWeight: '700' },
});
