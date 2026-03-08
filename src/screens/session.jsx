import { useContext, useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, Pressable, ImageBackground, Modal, TextInput, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import g from '../styles/globalStyles';

const Sessions = (props) => {
    const navigation = useNavigation();
    const { sportID } = props.route.params;
    const { token } = useContext(AuthContext);

    const [activeTab, setActiveTab] = useState('Sessions');
    const slideAnim = useRef(new Animated.Value(1)).current;
    const tabs = ['Workouts', 'Sessions'];

    const handleTabPress = (tab, index) => {
        setActiveTab(tab);
        Animated.spring(slideAnim, {
            toValue: index,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
        }).start();
        if (tab === 'Sessions') {
            navigation.navigate('Sessions', { sportID, sportName: props.route.params.sportName });
        } else if (tab === 'Workouts') {
            navigation.navigate('Workouts', { sportID, sportName: props.route.params.sportName });
        }
    };
    return (
        <SafeAreaView style={g.container}>
            <View style={g.topBar}>
                <View style={g.tabContainer}>

                    <Animated.View
                        style={[
                            g.slidingPill,
                            {
                                transform: [{
                                    translateX: slideAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 130], // adjust to your tab width
                                    })
                                }]
                            }
                        ]}
                    />
                    {tabs.map((tab, index) => (
                        <Pressable
                            key={tab}
                            style={g.tab}
                            onPress={() => { handleTabPress(tab, index) }}
                        >
                            <Text style={[
                                g.tabText,
                                activeTab === tab && g.tabTextActive
                            ]}>
                                {tab}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>

        </SafeAreaView>
    )

}

export default Sessions;