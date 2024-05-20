// BottomTabs.js
import React from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Foundation } from '@expo/vector-icons';
import { Octicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen from "./src/screens/HomeScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import SearchScreen from "./src/screens/SearchScreen";
import { FontAwesome } from '@expo/vector-icons';
const Tab = createBottomTabNavigator();

function BottomTabs() {
    return (
        <Tab.Navigator
            tabBarOptions={{
                labelStyle: {
                    color: 'white', // цвет текста черный
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: "Главная",
                    headerShown: false,
                    tabBarIcon: ({ focused }) =>
                        focused ? (
                            <Foundation name="home" size={24} color="white" />
                        ) : (
                            <Octicons name="home" size={21} color="white" />
                        ),
                    tabBarStyle: {
                        backgroundColor: '#170117', // задний фон для экрана Home
                    },
                }}
            />
            <Tab.Screen
                name="Search"
                component={SearchScreen}
                options={{
                    tabBarLabel: "Поиск",
                    headerShown: false,
                    tabBarIcon: ({ focused }) =>
                        focused ? (
                            <FontAwesome name="search" size={24} color="white" />
                        ) : (
                            <FontAwesome name="search" size={24} color="gray" />
                        ),
                    tabBarStyle: {
                        backgroundColor: '#170117', // задний фон для экрана Home
                    },
                }}
            />

            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: "Моя медиатека",
                    headerShown: false,
                    tabBarIcon: ({ focused }) =>
                        focused ? (
                            <MaterialCommunityIcons name="music-box-multiple" size={24} color="white" />
                        ) : (
                            <MaterialCommunityIcons name="music-box-multiple-outline" size={24} color="white" />
                        ),
                    tabBarStyle: {
                        backgroundColor: '#170117', // задний фон для экрана Profile
                    },
                }}
            />
        </Tab.Navigator>
    )
}

export default BottomTabs;
