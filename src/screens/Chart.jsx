import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSessionDays, getSessionExercises } from '../controllers/session_controllers';

const METRICS = [
    { key: 'weight', label: 'Weight (kg)', color: '#ff6600' },
    { key: 'reps',   label: 'Reps',        color: '#4ade80' },
    { key: 'sets',   label: 'Sets',        color: '#60a5fa' },
    { key: 'rest',   label: 'Rest (s)',    color: '#f59e0b' },
];

const MetricBars = ({ points, metric, color }) => {
    const values = points.map((p) => Number(p?.[metric] ?? 0));
    const maxValue = Math.max(...values, 1);

    return (
        <View style={styles.metricWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.barsRow}>
                    {points.map((point, index) => {
                        const value = Number(point?.[metric] ?? 0);
                        const h = Math.max(8, (value / maxValue) * 72);
                        return (
                            <View key={`${metric}-${index}`} style={styles.barItem}>
                                <Text style={styles.barValue}>{value}</Text>
                                <View style={[styles.bar, { height: h, backgroundColor: color }]} />
                                <Text style={styles.barLabel}>{index + 1}</Text>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
};

const Chart = (props) => {
    const { sessionID } = props.route.params;
    const [loading, setLoading] = useState(true);
    const [exerciseSeries, setExerciseSeries] = useState([]);

    useEffect(() => {
        fetchChartData();
    }, [sessionID]);

    const fetchChartData = async () => {
        setLoading(true);
        try {
            const daysData = await getSessionDays(sessionID);
            const days = Array.isArray(daysData) ? daysData : [];

            const exResults = await Promise.all(
                days.map((day) => getSessionExercises(day.id))
            );

            const map = new Map();
            exResults.flat().forEach((exercise) => {
                const key = String(exercise.exercise_id);
                const existing = map.get(key) || {
                    exercise_id: exercise.exercise_id,
                    ex_name: exercise.ex_name,
                    points: [],
                };
                const logs = Array.isArray(exercise.logs) ? exercise.logs : [];
                logs.forEach((log) => {
                    existing.points.push({
                        weight: Number(log.weight ?? 0),
                        reps:   Number(log.reps   ?? 0),
                        sets:   Number(log.sets   ?? 0),
                        rest:   Number(log.rest   ?? 0),
                        created_at: log.created_at,
                    });
                });
                map.set(key, existing);
            });

            const normalized = Array.from(map.values())
                .map((item) => ({
                    ...item,
                    points: item.points.sort(
                        (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
                    ),
                }))
                .filter((item) => item.points.length > 0);

            setExerciseSeries(normalized);
        } catch (error) {
            console.error('Error fetching chart data:', error);
            setExerciseSeries([]);
        } finally {
            setLoading(false);
        }
    };

    const totalLogs = useMemo(
        () => exerciseSeries.reduce((acc, ex) => acc + ex.points.length, 0),
        [exerciseSeries]
    );

    const renderExercise = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.exerciseName}>{item.ex_name}</Text>
            <Text style={styles.logsCount}>{item.points.length} logs</Text>
            {METRICS.map((m) => (
                <View key={m.key} style={styles.metricBlock}>
                    <Text style={styles.metricTitle}>{m.label}</Text>
                    <MetricBars points={item.points} metric={m.key} color={m.color} />
                </View>
            ))}
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#ff6600" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Progress Charts</Text>
            <Text style={styles.subtitle}>
                {exerciseSeries.length} exercises - {totalLogs} total logs
            </Text>
            {exerciseSeries.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.emptyText}>No logs found for this session.</Text>
                </View>
            ) : (
                <FlatList
                    data={exerciseSeries}
                    keyExtractor={(item) => item.exercise_id.toString()}
                    renderItem={renderExercise}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
};

export default Chart;

const styles = StyleSheet.create({
    container:     { flex: 1, backgroundColor: '#111' },
    center:        { flex: 1, alignItems: 'center', justifyContent: 'center' },
    title:         { color: '#ff6600', fontSize: 24, fontWeight: '700', paddingHorizontal: 16, paddingTop: 16 },
    subtitle:      { color: '#aaa', fontSize: 13, paddingHorizontal: 16, paddingTop: 4 },
    listContent:   { padding: 16, gap: 14 },
    card:          { backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', borderWidth: 1, borderRadius: 14, padding: 14, gap: 12 },
    exerciseName:  { color: '#fff', fontSize: 18, fontWeight: '700' },
    logsCount:     { color: '#999', fontSize: 12, marginTop: -6 },
    metricBlock:   { gap: 8 },
    metricTitle:   { color: '#ddd', fontSize: 13, fontWeight: '600' },
    metricWrap:    { borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 10, backgroundColor: '#131313', paddingVertical: 8, paddingHorizontal: 6 },
    barsRow:       { flexDirection: 'row', alignItems: 'flex-end', gap: 10, minHeight: 110, paddingHorizontal: 4 },
    barItem:       { width: 30, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
    barValue:      { color: '#bbb', fontSize: 10 },
    bar:           { width: 20, borderRadius: 5 },
    barLabel:      { color: '#777', fontSize: 10 },
    emptyText:     { color: '#666', fontSize: 16 },
});
