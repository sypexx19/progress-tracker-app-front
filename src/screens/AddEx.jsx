import { View, Text, FlatList, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from '@react-navigation/native';
import { useExerciseQueue } from '../context/ExerciseQueueContext';
import { addExercise } from '../controllers/exercises_controllers';
import g from '../styles/globalStyles';

const AddEx = (props) => {
    const { workoutID, dayID } = props.route.params;
    const navigation = useNavigation();
    const { pendingExercises, removeExercise, clearQueue } = useExerciseQueue();

    const handleSave = async () => {
        if (pendingExercises.length === 0) {
            Alert.alert('No exercises', 'Add at least one exercise before saving.');
            return;
        }
        try {
            await addExercise(dayID, pendingExercises);
            clearQueue();
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Failed to save exercises: ' + error.message);
        }
    };

    const renderPendingItem = ({ item }) => (
        <View style={styles.pendingCard}>
            <View style={styles.pendingInfo}>
                <Text style={styles.pendingName}>{item.ex_name}</Text>
                <Text style={styles.pendingDetails}>
                    {item.sets} sets · {item.reps} reps · {item.weight} kg · {item.rest}s rest
                </Text>
            </View>
            <Pressable onPress={() => removeExercise(item.key)} style={styles.removeBtn}>
                <Text style={styles.removeIcon}>✕</Text>
            </Pressable>
        </View>
    );

    return (
        <SafeAreaView style={[g.container, { alignItems: 'stretch', paddingHorizontal: 0 }]}>
            {pendingExercises.length > 0 && (
                <View style={styles.pendingSection}>
                    <Text style={styles.pendingTitle}>
                        Pending ({pendingExercises.length})
                    </Text>
                    <FlatList
                        data={pendingExercises}
                        keyExtractor={(item) => item.key}
                        renderItem={renderPendingItem}
                        contentContainerStyle={{ gap: 10 }}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            )}

            {pendingExercises.length === 0 && (
                <View style={styles.empty}>
                    <Text style={styles.emptyText}>No exercises added yet.</Text>
                    <Text style={styles.emptySubText}>Tap "Add Exercise" to pick from a category.</Text>
                </View>
            )}

            <View style={styles.bottomButtons}>
                <Pressable
                    style={g.buttonOutline}
                    onPress={() => navigation.navigate('TypeEx', { workoutID, dayID })}
                >
                    <Text style={g.buttonOutlineText}>+ Add Exercise</Text>
                </Pressable>

                <Pressable
                    style={[g.button, pendingExercises.length === 0 && styles.buttonDisabled]}
                    onPress={handleSave}
                    disabled={pendingExercises.length === 0}
                >
                    <Text style={g.buttonText}>
                        Save {pendingExercises.length > 0 ? `(${pendingExercises.length})` : ''}
                    </Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
};

export default AddEx;

const styles = StyleSheet.create({
    pendingSection: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    pendingTitle: {
        color: '#ff6600',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    pendingCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 14,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    pendingInfo: {
        flex: 1,
        gap: 4,
    },
    pendingName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    pendingDetails: {
        color: '#aaa',
        fontSize: 13,
    },
    removeBtn: {
        padding: 6,
        marginLeft: 10,
    },
    removeIcon: {
        color: '#ff6600',
        fontSize: 18,
        fontWeight: 'bold',
    },
    empty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    emptyText: {
        color: '#555',
        fontSize: 18,
        fontWeight: '600',
    },
    emptySubText: {
        color: '#444',
        fontSize: 14,
    },
    bottomButtons: {
        gap: 0,
        marginBottom: 4,
    },
    buttonDisabled: {
        opacity: 0.4,
    },
});
