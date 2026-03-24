import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from '@react-navigation/native';
import { getExercises } from '../controllers/exercises_controllers';
import { getSessionExercises, createExerciseLog } from '../controllers/session_controllers';

const Progress = (props) => {
    const { dayID } = props.route.params;
    const navigation = useNavigation();

    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [onFocus, setOnFocus] = useState('');
    const [exerciseData, setExerciseData] = useState({});

    useEffect(() => {
        fetchExercises();
    }, [dayID]);

    const fetchExercises = async () => {
        setLoading(true);
        try {
            const baseExercises = await getExercises(dayID);
            const logsList = await getSessionExercises(dayID);
            const logsMap = new Map(
                Array.isArray(logsList) ? logsList.map((l) => [String(l.exercise_id), l]) : []
            );

            const list = (Array.isArray(baseExercises) ? baseExercises : []).map((ex) => {
                const logData = logsMap.get(String(ex.id));
                return {
                    exercise_id: ex.id,
                    ex_name:     ex.ex_name,
                    sets:        ex.sets,
                    reps:        ex.reps,
                    weight:      ex.weight,
                    rest:        ex.rest,
                    latest:      logData?.latest || null,
                    logs:        logData?.logs   || [],
                };
            });

            setExercises(list);

            const initial = list.reduce((acc, item) => {
                const key = item.exercise_id;
                acc[key] = {
                    sets:   item.latest?.sets   ? String(item.latest.sets)   : (item.sets   ? String(item.sets)   : ''),
                    reps:   item.latest?.reps   ? String(item.latest.reps)   : (item.reps   ? String(item.reps)   : ''),
                    weight: item.latest?.weight ? String(item.latest.weight) : (item.weight ? String(item.weight) : ''),
                    rest:   item.latest?.rest   ? String(item.latest.rest)   : (item.rest   ? String(item.rest)   : ''),
                };
                return acc;
            }, {});
            setExerciseData(initial);
        } catch (error) {
            console.error('Error fetching exercises:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (id, field, value) => {
        setExerciseData(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value },
        }));
    };

    const saveOneLog = async (exercise) => {
        const key = exercise.exercise_id;
        const form = exerciseData[key] || {};
        const sets   = parseInt(form.sets, 10);
        const reps   = parseInt(form.reps, 10);
        const weight = parseFloat(form.weight);
        const rest   = parseInt(form.rest, 10);

        if (!sets || !reps || Number.isNaN(weight) || !rest) {
            return { ok: false, message: `${exercise.ex_name}: fill Sets, Reps, Weight and Rest` };
        }

        try {
            await createExerciseLog(dayID, {
                exercise_id: key,
                ex_name: exercise.ex_name,
                sets,
                reps,
                weight,
                rest,
            });
            return { ok: true };
        } catch (error) {
            return { ok: false, message: `${exercise.ex_name}: ${error.message || 'save failed'}` };
        }
    };

    const handleConfirm = async () => {
        setSaving(true);
        try {
            const results = await Promise.all(exercises.map(saveOneLog));
            const failed = results.filter((r) => !r.ok);
            if (failed.length > 0) {
                Alert.alert('Save failed', failed.map((f) => f.message).join('\n'));
                return;
            }
            Alert.alert('Saved', 'New log entries were added.');
            await fetchExercises();
        } catch (error) {
            console.error('Error saving logs:', error);
            Alert.alert('Error', 'Unable to save logs right now.');
        } finally {
            setSaving(false);
        }
    };

    const renderItem = ({ item }) => {
        const key = item.exercise_id;
        const logs = Array.isArray(item.logs) ? item.logs : [];
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardLabel}>{item.ex_name}</Text>
                </View>
                <View style={styles.inputRow}>
                    {[
                        { field: 'sets',   label: 'Sets'     },
                        { field: 'reps',   label: 'Reps'     },
                        { field: 'weight', label: 'Weight'   },
                        { field: 'rest',   label: 'Rest (s)' },
                    ].map(({ field, label }) => (
                        <View style={styles.inputGroup} key={field}>
                            <TextInput
                                style={[styles.input, onFocus === field + key && styles.inputFocused]}
                                onFocus={() => setOnFocus(field + key)}
                                onBlur={() => setOnFocus('')}
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
                {logs.length > 0 && (
                    <View style={styles.logsWrap}>
                        <Text style={styles.logsTitle}>Previous logs</Text>
                        {logs.slice(0, 3).map((log, idx) => (
                            <Text key={`${key}-${idx}`} style={styles.logItem}>
                                {`#${logs.length - idx}  ${log.sets}x${log.reps}  ${log.weight}kg  rest ${log.rest}s`}
                            </Text>
                        ))}
                    </View>
                )}
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
            <Text style={styles.title}>Exercise Progress</Text>
            {exercises.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyText}>No exercises yet. Add one below.</Text>
                </View>
            ) : (
                <FlatList
                    style={{ flex: 1 }}
                    data={exercises}
                    keyExtractor={(item) => item.exercise_id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
            <Pressable style={styles.buttonOutline} onPress={() => navigation.navigate('AddEx', { dayID })}>
                <Text style={styles.buttonOutlineText}>+ Add Exercise</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={handleConfirm} disabled={saving}>
                <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save Log'}</Text>
            </Pressable>
        </SafeAreaView>
    );
};

export default Progress;

const styles = StyleSheet.create({
    container:       { flex: 1, backgroundColor: '#111' },
    title:           { color: '#ff6600', fontSize: 24, fontWeight: '700', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
    listContent:     { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, gap: 16 },
    cardLabel:       { color: '#fff', fontSize: 18, fontWeight: '700' },
    inputRow:        { flexDirection: 'row', justifyContent: 'space-between' },
    inputGroup:      { alignItems: 'center', gap: 8 },
    input:           { width: 58, height: 46, borderWidth: 1, borderRadius: 10, borderColor: '#555', color: '#fff', textAlign: 'center', fontSize: 16 },
    inputFocused:    { borderColor: '#ff6600' },
    inputLabel:      { color: '#aaa', fontSize: 12 },
    empty:           { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText:       { color: '#555', fontSize: 16 },
    button:          { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#ff6600', paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
    buttonText:      { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    buttonOutline:   { marginHorizontal: 16, marginBottom: 10, borderColor: '#ff6600', borderWidth: 1.5, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
    buttonOutlineText: { color: '#ff6600', fontSize: 16, fontWeight: '700' },
    card:            { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 16, gap: 16, borderWidth: 1, borderColor: '#2a2a2a' },
    cardHeader:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    logsWrap:        { borderTopWidth: 1, borderTopColor: '#2a2a2a', paddingTop: 10, gap: 4 },
    logsTitle:       { color: '#bbb', fontSize: 12, fontWeight: '600' },
    logItem:         { color: '#888', fontSize: 12 },
});
