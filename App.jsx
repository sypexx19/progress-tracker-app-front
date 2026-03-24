/**
* Sample React Native App
* https://github.com/facebook/react-native
*
* @format
*/
import { useEffect } from 'react';
import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets, } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';

enableScreens();

import { NavigationContainer } from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from "./src/context/AuthContext.jsx";
import { ExerciseQueueProvider } from "./src/context/ExerciseQueueContext.jsx";
import {initDB } from "./src/controllers/db.js"


import Home from './src/screens/Home.jsx';

import Sports from './src/screens/Sports.jsx';

import Workouts from './src/screens/Workouts.jsx';

import Days from './src/screens/workoutDays.jsx';

import EditWorkout from './src/screens/editWorkout.jsx';

import EditEx from './src/screens/EditEx.jsx';

import Create from './src/screens/Create.jsx';

import TypeEx from './src/screens/TypeEx.jsx';

import SelectEx from './src/screens/SelectEx.jsx';

import AddEx from './src/screens/AddEx.jsx';

import Details from './src/screens/SessionDetails.jsx';

import Progress from './src/screens/Progress.jsx';

import Chart from './src/screens/Chart.jsx';

import Completed from './src/screens/Completed.jsx';

const Stack = createNativeStackNavigator();






function App() {

  useEffect(() => {
    const setupDB = async () => {
      try {
        await initDB();
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Database init failed:', error);
      }
    };
  
    setupDB();
  }, []);



  return (

    <SafeAreaProvider>
      <AuthProvider>
        <ExerciseQueueProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Home" >
              <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
              <Stack.Screen name="Completed" component={Completed} options={{ headerShown: false }} />
              <Stack.Screen name="Sports" component={Sports} options={{ headerShown: false }} />
              <Stack.Screen name="Workouts" component={Workouts} options={{ headerShown: false }} />
              <Stack.Screen name="Workout-days" component={Days} options={{ headerShown: false }} />
              <Stack.Screen name="EditWorkout" component={EditWorkout} options={{ headerShown: false }} />
              <Stack.Screen name="EditEx" component={EditEx} options={{ headerShown: false }} />
              <Stack.Screen name="Create" component={Create} options={{ headerShown: false }} />
              <Stack.Screen name="TypeEx" component={TypeEx} options={{ headerShown: false }} />
              <Stack.Screen name="SelectEx" component={SelectEx} options={{ headerShown: false }} />
              <Stack.Screen name="AddEx" component={AddEx} options={{ headerShown: false }} />
              <Stack.Screen name="Details" component={Details} options={{ headerShown: false }} />
              <Stack.Screen name="Progress" component={Progress} options={{ headerShown: false }} />
              <Stack.Screen name="Chart" component={Chart} options={{ headerShown: false }} />
            </Stack.Navigator>
          </NavigationContainer>
        </ExerciseQueueProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;