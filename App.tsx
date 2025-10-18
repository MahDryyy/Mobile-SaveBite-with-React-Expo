import React from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import your screens
import LoginScreen from './app/screens/LoginScreen';
import RegisterScreen from './app/screens/RegisterScreen';
import HomeScreen from './app/screens/HomeScreen';
import AdminHomeScreen from './app/screens/AdminHome';
import UserListScreen from './app/screens/UserListScreen';
import LoginLogsScreen from './app/screens/LoginLogsScreen';
import FoodManagement from './app/screens/FoodManagement';
import RecipeManagement from './app/screens/RecipeManagement';
import CategoryManagementScreen from './app/screens/CategoryManagementScreen';
import FoodsScreen from './app/screens/FoodsScreen';
import AddFoodScreen from './app/screens/AddfoodScreen';
import HistoryScreen from './app/screens/HistoryScreen';
import FertilizerHistoryScreen from './app/screens/FertilizerHistory';
import FirstScreen from './app/screens/FirstScreen';

// Add type for RootStackParamList
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  AdminHome: undefined;
  UserList: undefined;
  LoginLogs: undefined;
  Foods: undefined;
  AddFood: undefined;
  History: undefined;
  FertilizerHistory: undefined;
  FoodManagement: undefined;
  RecipeManagement: undefined;
  CategoryManagement: undefined;
  FirstScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

export default function App() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (navigationRef.isReady()) {
        navigationRef.reset({ index: 0, routes: [{ name: 'FirstScreen' }] });
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="FirstScreen"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="FirstScreen" component={FirstScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
        <Stack.Screen name="UserList" component={UserListScreen} />
        <Stack.Screen name="LoginLogs" component={LoginLogsScreen} />
        <Stack.Screen name="Foods" component={FoodsScreen} />
        <Stack.Screen name="AddFood" component={AddFoodScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="FertilizerHistory" component={FertilizerHistoryScreen} />
        <Stack.Screen name="FoodManagement" component={FoodManagement} />
        <Stack.Screen name="RecipeManagement" component={RecipeManagement} />
        <Stack.Screen name="CategoryManagement" component={CategoryManagementScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 