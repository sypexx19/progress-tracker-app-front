import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from '@react-navigation/native';
import { getTypes } from '../controllers/exercises_controllers';
import g from '../styles/globalStyles';

const TypeItem = ({ item, workoutID, dayID }) => {
    const navigation = useNavigation();
    return (
        <Pressable
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
            onPress={() =>
                navigation.navigate('SelectEx', {
                    workoutID,
                    dayID,
                    typeID: item.id,
                    typeName: item.t_name,
                })
            }
        >
            <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>
                    {item.t_name ? item.t_name.charAt(0).toUpperCase() + item.t_name.slice(1) : ''}
                </Text>
            </View>
        </Pressable>
    );
};

const TypeEx = (props) => {
    const { workoutID, dayID } = props.route.params;
    const [types, setTypes] = useState([]);

    useEffect(() => {
        fetchTypes();
    }, []);

    const fetchTypes = async () => {
        try {
            const data = await getTypes();
            setTypes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching types:', error);
        }
    };

    return (
        <SafeAreaView style={[g.container, { alignItems: 'stretch', paddingHorizontal: 0 }]}>
            <FlatList
                data={types}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.row}
                renderItem={({ item }) => (
                    <TypeItem item={item} workoutID={workoutID} dayID={dayID} />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

export default TypeEx;

const styles = StyleSheet.create({
    listContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10, gap: 16 },
    row:         { gap: 16, marginBottom: 16 },
    card:        { flex: 1, height: 120, borderRadius: 20, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
    cardContent: { alignItems: 'center', justifyContent: 'center' },
    cardLabel:   { color: '#fff', fontSize: 18, fontWeight: '700', letterSpacing: 0.5, textAlign: 'center' },
});
