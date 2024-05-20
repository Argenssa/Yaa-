// Navigation.js
import React from 'react';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import LoginScreen from "./src/screens/LoginScreen";
import BottomTabs from "./BottomTabs";
import Player from "./src/components/Player"; // Импортируем компонент Player

const Stack = createNativeStackNavigator();

function Navigation() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name={"Login"} component={LoginScreen} options={{headerShown:false}}/>
                <Stack.Screen name={"Main"} component={BottomTabs} options={{ headerShown: false }} />
            </Stack.Navigator>
            <Player />
        </NavigationContainer>
    )
}

export default Navigation;
