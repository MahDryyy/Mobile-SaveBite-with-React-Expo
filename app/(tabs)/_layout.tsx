import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import FoodsScreen from '../screens/FoodsScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AddFoodScreen from '../screens/AddfoodScreen';
import HistoryScreen from '../screens/HistoryScreen';
import AdminHome from '../screens/AdminHome';
import LoginLogsScreen from '../screens/LoginLogsScreen'; 
import UserListScreen from '../screens/UserListScreen';
import CategoryManagementScreen from '../screens/CategoryManagementScreen';
import FoodManagement from '../screens/FoodManagement';
import RecipeManagement from '../screens/RecipeManagement'; 
import FirstScreen from '../screens/FirstScreen';





function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

const Stack = createStackNavigator();

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack.Navigator initialRouteName="FirstScreen">
      <Stack.Screen name="FirstScreen" component={FirstScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Foods" component={FoodsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="UserList" component={UserListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LoginLogs" component={LoginLogsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddFood" component={AddFoodScreen} options={{ headerShown: false }} />
      <Stack.Screen name="History" component={HistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminHome" component={AdminHome} options={{ headerShown: false }} />
      <Stack.Screen name="CategoryManagement" component={CategoryManagementScreen} options={{ headerShown: false }} />
      <Stack.Screen name="FoodManagement" component={FoodManagement} options={{ headerShown: false }} />
      <Stack.Screen name="RecipeManagement" component={RecipeManagement} options={{headerShown: false}} />
    </Stack.Navigator>
  );
}
