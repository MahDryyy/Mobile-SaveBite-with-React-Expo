import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import your screens
import LoginScreen from './app/screens/LoginScreen';
import RegisterScreen from './app/screens/RegisterScreen';
import HomeScreen from './app/screens/HomeScreen';
import AdminHomeScreen from './app/screens/AdminHome';
import UserListScreen from './app/screens/UserListScreen';
import LoginLogsScreen from './app/screens/LoginLogsScreen';
import FoodManagementScreen from './app/screens/FoodManagementScreen';
import RecipeManagementScreen from './app/screens/RecipeManagementScreen';
import CategoryManagementScreen from './app/screens/CategoryManagementScreen';

// Add type for RootStackParamList
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  AdminHome: undefined;
  UserList: undefined;
  LoginLogs: undefined;
  FoodManagement: undefined;
  RecipeManagement: undefined;
  CategoryManagement: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
        <Stack.Screen name="UserList" component={UserListScreen} />
        <Stack.Screen name="LoginLogs" component={LoginLogsScreen} />
        <Stack.Screen name="FoodManagement" component={FoodManagementScreen} />
        <Stack.Screen name="RecipeManagement" component={RecipeManagementScreen} />
        <Stack.Screen name="CategoryManagement" component={CategoryManagementScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 