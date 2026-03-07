/**
* Sample React Native App
* https://github.com/facebook/react-native
*
* @format
*/
import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {SafeAreaProvider,useSafeAreaInsets,} from 'react-native-safe-area-context';
import {enableScreens} from 'react-native-screens';

enableScreens();

import { NavigationContainer } from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from "./src/context/AuthContext.jsx";
import Signin from './src/screens/Signin.jsx';

import Login from './src/screens/Login.jsx';

import Home from './src/screens/Home.jsx';

import Workouts from './src/screens/Workouts.jsx';

const Stack = createNativeStackNavigator();

  

function App() {

  

return (

  <SafeAreaProvider>
    <AuthProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LogIn" >
        <Stack.Screen name="SignIn" component={Signin} options={{ headerShown: false }}/>
        <Stack.Screen name="LogIn" component={Login} options={{ headerShown: false }}/>
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }}/>
        <Stack.Screen name="Workouts" component={Workouts} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
    </AuthProvider>
  </SafeAreaProvider>
  );
}

export default App ;