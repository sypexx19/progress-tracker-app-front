/**
* Sample React Native App
* https://github.com/facebook/react-native
*
* @format
*/
import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets, } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';

enableScreens();

import { NavigationContainer } from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from "./src/context/AuthContext.jsx";
import Signin from './src/screens/Signin.jsx';

import Login from './src/screens/Login.jsx';

import Home from './src/screens/Home.jsx';

import Workouts from './src/screens/Workouts.jsx';

import Sessions from './src/screens/session.jsx';

import Days from './src/screens/workoutDays.jsx';

import EditWorkout from './src/screens/editWorkout.jsx';

import EditEx from './src/screens/EditEx.jsx';

import AddEx from './src/screens/AddEx.jsx';

import ExType from './src/screens/ExType.jsx';

const Stack = createNativeStackNavigator();



function App() {



  return (

    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="LogIn" >
            <Stack.Screen name="SignIn" component={Signin} options={{ headerShown: false }} />
            <Stack.Screen name="LogIn" component={Login} options={{ headerShown: false }} />
            <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
            <Stack.Screen name="Workouts" component={Workouts} options={{ headerShown: false }} />
            <Stack.Screen name="Sessions" component={Sessions} options={{ headerShown: false }} />
            <Stack.Screen name="Workout-days" component={Days} options={{ headerShown: false }} />
            <Stack.Screen name="EditWorkout" component={EditWorkout} options={{ headerShown: false }} />
            <Stack.Screen name="EditEx" component={EditEx} options={{ headerShown: false }} />
            <Stack.Screen name="AddEx" component={AddEx} options={{ headerShown: false }} />
            <Stack.Screen name="ExType" component={ExType} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;