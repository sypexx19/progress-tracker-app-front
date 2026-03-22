import { useContext, useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import g from '../styles/globalStyles';

const SelectEx = (props) => {
    const { workoutID, dayID, typeID, onAddExercise } = props.route.params;
    const { token } = useContext(AuthContext);
    const navigation = useNavigation();

    const [exercises, setExercises] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [onFocus, setOnFocus] = useState("");
    const [exerciseData, setExerciseData] = useState({});
    const [selectedItem, setSelectedItem] = useState(null);
    const [exerciseName, setExerciseName] = useState('');
    const [customModalIsOpen, setCustomModalIsOpen] = useState(false);

    useEffect(() => {
        fetchExercises();
    }, []);

    const fetchExercises = async () => {
        try {
            const res = await fetch(`http://192.168.100.7:5000/api/exercises/default/${typeID}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });
            const text = await res.text();
            const data = JSON.parse(text);
            setExercises(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching exercises:", error);
        }
    };

    const handleChange = (key, field, val) => {
        setExerciseData(prev => ({
            ...prev,
            [key]: { ...prev[key], [field]: val }
        }));
    };

    // ✅ KEY FIX: instead of navigating back with params (which overwrites),
    // we call the callback directly — this APPENDS to the pending list in AddEx.
    const handleConfirm = () => {
        if (!selectedItem) return;

        const data = exerciseData[selectedItem.id] || {};
        const sets = parseInt(data.sets, 10);
        const reps = parseInt(data.reps, 10);
        const weight = parseFloat(data.weight);
        const rest = parseInt(data.rest, 10);

        if (!sets || !reps || isNaN(weight) || !rest) {
            Alert.alert('Missing fields', 'Please fill in Sets, Reps, Weight and Rest before adding.');
            return;
        }

        const newExercise = {
            sourceId: selectedItem.id,
            ex_name: selectedItem.e_name,
            sets,
            reps,
            weight,
            rest,
        };

        // ✅ Call the callback — appends to AddEx's pendingExercises state
        if (onAddExercise) {
            onAddExercise(newExercise);
        }

        // Clear the modal inputs for this exercise so user can add another
        setExerciseData(prev => ({ ...prev, [selectedItem.id]: {} }));
        setModalIsOpen(false);

        // Show a quick confirmation and stay on this screen
        // so the user can keep picking more exercises from this category.
        Alert.alert(
            'Added!',
            `${selectedItem.e_name} added to pending.`,
            [
                { text: 'Add More', style: 'cancel' },
                {
                    text: 'Go Back to Queue',
                    onPress: () => navigation.navigate('AddEx', { workoutID, dayID }),
                },
            ]
        );
    };

    const addDefaultExercise = async (typeID, ex_name) => {
        if (!ex_name.trim()) return;
        try {
            const res = await fetch(`http://192.168.100.7:5000/api/exercises/addDefault`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ typeID, ex_name }),
            });
            if (res.ok) {
                setCustomModalIsOpen(false);
                setExerciseName('');
                fetchExercises();
            } else {
                Alert.alert("Error", "Failed to add custom exercise");
            }
        } catch (error) {
            console.error("Error adding default exercise:", error);
        }
    };

    const renderItem = ({ item }) => (
        <Pressable
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
            onPress={() => {
                setSelectedItem(item);
                setModalIsOpen(true);
            }}
        >
            <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>
                    {item.e_name
                        ? item.e_name.charAt(0).toUpperCase() + item.e_name.slice(1)
                        : ''}
                </Text>
            </View>
        </Pressable>
    );

    return (
        <SafeAreaView style={[g.container, { alignItems: 'stretch', paddingHorizontal: 0 }]}>
            <FlatList
                data={exercises}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.row}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            <Pressable style={g.button} onPress={() => setCustomModalIsOpen(true)}>
                <Text style={g.buttonText}>Custom Exercise</Text>
            </Pressable>

            {/* Exercise detail modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
            >
                <View style={g.modalOverlay}>
                    <View style={styles.modalContainer}>
                        {selectedItem && (
                            <View>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardLabel}>{selectedItem.e_name}</Text>
                                    <Pressable
                                        style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
                                        onPress={() => setModalIsOpen(false)}
                                    >
                                        <Text style={styles.deleteIcon}>✕</Text>
                                    </Pressable>
                                </View>

                                <View style={styles.inputRow}>
                                    {[
                                        { field: 'sets', label: 'Sets' },
                                        { field: 'reps', label: 'Reps' },
                                        { field: 'weight', label: 'Weight' },
                                        { field: 'rest', label: 'Rest (s)' },
                                    ].map(({ field, label }) => (
                                        <View style={styles.inputGroup} key={field}>
                                            <TextInput
                                                style={[
                                                    styles.input,
                                                    onFocus === field + selectedItem.id && styles.inputFocused
                                                ]}
                                                onFocus={() => setOnFocus(field + selectedItem.id)}
                                                onBlur={() => setOnFocus("")}
                                                keyboardType="numeric"
                                                placeholder="0"
                                                placeholderTextColor="#555"
                                                value={exerciseData[selectedItem.id]?.[field] ?? ''}
                                                onChangeText={(val) => handleChange(selectedItem.id, field, val)}
                                            />
                                            <Text style={styles.inputLabel}>{label}</Text>
                                        </View>
                                    ))}
                                </View>

                                <Pressable
                                    style={[g.button, { marginTop: 20 }]}
                                    onPress={handleConfirm}
                                >
                                    <Text style={g.buttonText}>Add to Queue</Text>
                                </Pressable>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Custom exercise modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={customModalIsOpen}
                onRequestClose={() => setCustomModalIsOpen(false)}
            >
                <View style={g.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={[styles.cardLabel, { marginBottom: 16 }]}>Custom Exercise</Text>
                        <TextInput
                            style={[g.input, { width: '100%', alignSelf: 'center', marginBottom: 15, color: 'white' }]}
                            placeholder="Exercise Name"
                            placeholderTextColor="#555"
                            value={exerciseName}
                            onChangeText={setExerciseName}
                        />
                        <Pressable
                            style={[g.button, { width: '100%', alignSelf: 'center', marginBottom: 10 }]}
                            onPress={() => addDefaultExercise(typeID, exerciseName)}
                        >
                            <Text style={g.buttonText}>Add Custom Exercise</Text>
                        </Pressable>
                        <Pressable onPress={() => setCustomModalIsOpen(false)}>
                            <Text style={[styles.deleteIcon, { textAlign: 'center', marginTop: 4 }]}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default SelectEx;

const styles = StyleSheet.create({
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 10,
        gap: 16,
    },
    row: {
        gap: 16,
        marginBottom: 16,
    },
    card: {
        flex: 1,
        height: 120,
        borderRadius: 20,
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    cardContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardLabel: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    inputGroup: {
        alignItems: 'center',
        gap: 8,
    },
    input: {
        width: 58,
        height: 46,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#555',
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
    },
    inputFocused: {
        borderColor: '#ff6600',
    },
    inputLabel: {
        color: '#aaa',
        fontSize: 12,
    },
    deleteBtn: {
        padding: 6,
    },
    deleteBtnPressed: {
        opacity: 0.6,
    },
    deleteIcon: {
        color: '#ff6600',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalContainer: {
        backgroundColor: '#1a1a1a',
        borderRadius: 24,
        width: '100%',
        maxHeight: '85%',
        overflow: 'hidden',
        padding: 20,
    },
});
