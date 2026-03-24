import { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Modal, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getDays, addDay } from '../controllers/days_controllers';
import g from '../styles/globalStyles';

const DayItem2 = ({ item, index, workoutID }) => {
    const navigation = useNavigation();
    return (
        <Pressable
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
            onPress={() => navigation.navigate('AddEx', { workoutID, dayID: item.day_id })}
        >
            <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>
                    Day {index + 1}  :  {item.day_name
                        ? item.day_name.charAt(0).toUpperCase() + item.day_name.slice(1)
                        : ''}
                </Text>
            </View>
        </Pressable>
    );
};

const Create = (props) => {
    const { workoutID, sportID, sportName } = props.route.params;
    const navigation = useNavigation();
    const [days, setDays] = useState([]);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [dayName, setDayName] = useState('');

    const fetchWorkoutDays = async () => {
        try {
            const data = await getDays(workoutID);
            setDays(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching workout days:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchWorkoutDays();
        }, [workoutID])
    );

    const handleAddDay = async () => {
        if (!dayName.trim()) return;
        try {
            const data = await addDay(parseInt(workoutID, 10), dayName);
            setDayName('');
            await fetchWorkoutDays();
            if (data.dayId) {
                navigation.navigate('AddEx', { workoutID, dayID: data.dayId });
            }
        } catch (error) {
            console.error('Error adding day:', error);
        }
    };

    return (
        <SafeAreaView style={[g.container, { alignItems: 'stretch', justifyContent: 'space-between', paddingHorizontal: 0 }]}>
            <FlatList
                style={g.list}
                data={days}
                keyExtractor={(item) => item.day_id.toString()}
                renderItem={({ item, index }) => <DayItem2 item={item} index={index} workoutID={workoutID} />}
                contentContainerStyle={g.listContent}
                showsVerticalScrollIndicator={false}
            />
            <Pressable style={[g.buttonOutline, { marginHorizontal: 16, marginBottom: 10 }]} onPress={() => setIsModelOpen(true)}>
                <Text style={g.buttonOutlineText}> Add Day </Text>
            </Pressable>
            <Pressable style={[g.button, { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#ff6600', paddingVertical: 15, borderRadius: 12, alignItems: 'center' }]}
                onPress={() => navigation.navigate('Workouts', { sportID, sportName })}
            >
                <Text style={g.buttonText}> Save </Text>
            </Pressable>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isModelOpen}
                onRequestClose={() => setIsModelOpen(false)}
            >
                <View style={g.modalOverlay}>
                    <View style={g.modalContainer}>
                        <Text style={g.modalTitle}>Add Day</Text>
                        <ScrollView contentContainerStyle={g.scrollContent} showsVerticalScrollIndicator={false}>
                            <View style={g.modalSports}>
                                <TextInput
                                    style={[g.input, { width: '90%', alignSelf: 'center', marginBottom: 15, color: 'white' }]}
                                    placeholder="Day Name"
                                    placeholderTextColor="#aaa"
                                    value={dayName}
                                    onChangeText={setDayName}
                                />
                                <Pressable style={g.button} onPress={() => { handleAddDay(); setIsModelOpen(false); }}>
                                    <Text style={g.buttonText}>Add Day</Text>
                                </Pressable>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default Create;

const styles = StyleSheet.create({
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
});
