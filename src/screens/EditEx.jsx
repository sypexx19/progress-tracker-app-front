import { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

const EditEx = (props) => {
    const { day, dayID, onSave } = props.route.params;
    const { token } = useContext(AuthContext);
    const navigation = useNavigation();

    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [onFocus, setOnFocus] = useState("");
    const [exerciseData, setExerciseData] = useState({});

    useEffect(() => {
        fetchExercises();
    }, []);

    const fetchExercises = async () => {
        try {
            const res = await fetch(`http://192.168.100.7:5000/api/exercises/get/${dayID}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });
            const data = await res.json();
            const list = Array.isArray(data) ? data : [];
            setExercises(list);
            const initial = list.reduce((acc, item) => {
                const key = item.ex_id ?? item.id;
                acc[key] = {
                    sets: item.sets ? String(item.sets) : '',
                    reps: item.reps ? String(item.reps) : '',
                    weight: item.weight ? String(item.weight) : '',
                    rest: item.rest ? String(item.rest) : '',
                };
                return acc;
            }, {});
            setExerciseData(initial);
        } catch (error) {
            console.error("Error fetching exercises:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (id, field, value) => {
        setExerciseData(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
    };

    // ✅ THE FIX: call the onSave callback that EditWorkout passed in params.
    // This directly calls setDaysData inside EditWorkout — no navigation params,
    // no useFocusEffect, no race conditions. Then go back normally.
    const handleConfirm = () => {
        const payload = exercises.map(ex => {
            const key = ex.ex_id ?? ex.id;
            return {
                exercise_id: key,
                ex_name: ex.ex_name,
                dayID,
                ...(exerciseData[key] || { sets: '', reps: '', weight: '', rest: '' })
            };
        });

        if (onSave) {
            onSave(dayID, payload); // updates EditWorkout state directly
        }

        navigation.goBack(); // go back to the existing EditWorkout instance
    };

    const renderItem = ({ item }) => {
        const key = item.ex_id ?? item.id;
        return (
            <View style={styles.card}>
                <Text style={styles.cardLabel}>{item.ex_name}</Text>
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
                                    onFocus === field + key && styles.inputFocused
                                ]}
                                onFocus={() => setOnFocus(field + key)}
                                onBlur={() => setOnFocus("")}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor="#555"
                                value={exerciseData[key]?.[field] ?? ''}
                                onChangeText={(val) => handleChange(key, field, val)}
                            />
                            <Text style={styles.inputLabel}>{label}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#ff6600" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>
                {day ? day.charAt(0).toUpperCase() + day.slice(1) : 'Exercises'}
            </Text>

            {exercises.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyText}>No exercises yet. Add one below.</Text>
                </View>
            ) : (
                <FlatList
                    style={{ flex: 1 }}
                    data={exercises}
                    keyExtractor={(item) => (item.ex_id ?? item.id).toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <Pressable
                style={styles.buttonOutline}
                onPress={() => navigation.navigate('AddEx', { dayID })}
            >
                <Text style={styles.buttonOutlineText}>+ Add Exercise</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={handleConfirm}>
                <Text style={styles.buttonText}>Save</Text>
            </Pressable>
        </SafeAreaView>
    );
};

export default EditEx;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111',
    },
    title: {
        color: '#ff6600',
        fontSize: 24,
        fontWeight: '700',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 4,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 10,
        gap: 16,
    },
    card: {
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        padding: 16,
        gap: 16,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    cardLabel: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
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
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#555',
        fontSize: 16,
    },
    button: {
        marginHorizontal: 16,
        marginBottom: 12,
        backgroundColor: '#ff6600',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonOutline: {
        marginHorizontal: 16,
        marginBottom: 10,
        borderColor: '#ff6600',
        borderWidth: 1.5,
        borderRadius: 12,
        paddingVertical: 13,
        alignItems: 'center',
    },
    buttonOutlineText: {
        color: '#ff6600',
        fontSize: 16,
        fontWeight: '700',
    },
});
