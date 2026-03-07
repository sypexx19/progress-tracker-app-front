import {useContext , useState , useEffect} from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Modal, ImageBackground, ScrollView} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';



const Workouts = (props) => {

    const {sportID} = props.route.params.sportID;

    return (
        <SafeAreaView>
         <Text> Helllllooo </Text>
        </SafeAreaView>
    )

};

export default Workouts ;
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#111',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },

})