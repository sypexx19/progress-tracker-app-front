import { useContext, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import g from '../styles/globalStyles';

const AddEx = (props) => {
    const { workoutID, dayID } = props.route.params;
    const { token } = useContext(AuthContext);
    const navigation = useNavigation();

    // Pending queue — accumulates all exercises the user selects
    const [pendingExercises, setPendingExercises] = useState([]);

    // This callback is passed down to TypeEx → SelectEx.
    // SelectEx calls it directly, so the exercise is appended here without
    // losing any previously added ones.
    const handleAddExercise = useCallback((newExercise) => {
        setPendingExercises(prev => [
            ...prev,
            { ...newExercise, key: `${newExercise.sourceId}_${Date.now()}` }
        ]);
    }, []);

    const handleRemove = (key) => {
        setPendingExercises(prev => prev.filter(ex => ex.key !== key));
    };

    const handleSave = async () => {
        if (pendingExercises.length === 0) {
            Alert.alert('No exercises', 'Add at least one exercise before saving.');
            return;
        }
        try {
            const res = await fetch(`http://192.168.100.7:5000/api/exercises/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ dayID, exercises: pendingExercises }),
            });
            if (res.ok) {
                navigation.goBack();
            } else {
                const err = await res.json();
                Alert.alert('Error', err.message || 'Failed to save exercises');
            }
        } catch (error) {
            Alert.alert('Error', 'Server error: ' + error.message);
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
            <Pressable onPress={() => handleRemove(item.key)} style={styles.removeBtn}>
                <Text style={styles.removeIcon}>✕</Text>
            </Pressable>
        </View>
    );

    return (
        <SafeAreaView style={[g.container, { alignItems: 'stretch', paddingHorizontal: 0 }]}>

            {/* Pending queue */}
            {pendingExercises.length > 0 && (
                <View style={styles.pendingSection}>
                    <Text style={styles.pendingTitle}>
                        Pending ({pendingExercises.length})
                    </Text>
                    <FlatList
                        data={pendingExercises}
                        keyExtractor={(item) => item.key}
                        renderItem={renderPendingItem}
                        scrollEnabled={false}
                        contentContainerStyle={{ gap: 10 }}
                    />
                </View>
            )}

            {/* Empty state */}
            {pendingExercises.length === 0 && (
                <View style={styles.empty}>
                    <Text style={styles.emptyText}>No exercises added yet.</Text>
                    <Text style={styles.emptySubText}>Tap "Add Exercise" to pick from a category.</Text>
                </View>
            )}

            {/* Bottom buttons */}
            <View style={styles.bottomButtons}>
                <Pressable
                    style={g.buttonOutline}
                    onPress={() =>
                        // Pass the callback to TypeEx so it reaches SelectEx
                        navigation.navigate('TypeEx', {
                            workoutID,
                            dayID,
                            onAddExercise: handleAddExercise,
                        })
                    }
                >
                    <Text style={g.buttonOutlineText}>+ Add Exercise</Text>
                </Pressable>

                <Pressable
                    style={[g.button, pendingExercises.length === 0 && styles.buttonDisabled]}
                    onPress={handleSave}
                    disabled={pendingExercises.length === 0}
                >
                    <Text style={g.buttonText}>Save</Text>
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
