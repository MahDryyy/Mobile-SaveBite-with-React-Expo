import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import foodAnimation from '../../assets/animasion/resep.json';
import { BASE_URL } from '../config/api';

type RootStackParamList = {
  Home: undefined;
  Foods: undefined;
  Login: undefined;
};

type Recipe = {
  id: number;
  recipe: string;
  createdAt: string;
  ingredients: string[];
};

const HistoryScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Token tidak ditemukan', 'Silakan login terlebih dahulu');
        navigation.navigate('Login');
        return;
      }

      const response = await axios.get(`${BASE_URL}/recipes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        const cleanedRecipes = response.data.map((recipe: Recipe) => ({
          ...recipe,
          recipe: recipe.recipe.replace(/[#*]/g, '')
        }));
        setRecipes(cleanedRecipes);
      } else {
        console.log('No recipes data in response');
        setRecipes([]);
      }
    } catch (error: any) {
      console.error('Error fetching recipes:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Gagal mengambil data resep'
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteRecipe = async (id: number) => {
    Alert.alert(
      'Konfirmasi',
      'Apakah Anda yakin ingin menghapus resep ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const token = await AsyncStorage.getItem('userToken');
              if (!token) {
                Alert.alert('Token tidak ditemukan', 'Silakan login terlebih dahulu');
                navigation.navigate('Login');
                return;
              }

              await axios.delete(`${BASE_URL}/recipes/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              setRecipes(prev => prev.filter(recipe => recipe.id !== id));
              Alert.alert('Sukses', 'Resep berhasil dihapus');
            } catch (error: any) {
              console.error('Error deleting recipe:', error);
              console.error('Error response:', error.response?.data);
              Alert.alert(
                'Error',
                error.response?.data?.error || 'Gagal menghapus resep'
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderRecipe = ({ item, index }: { item: Recipe; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 100)} style={styles.recipeContainer}>
      <Text style={styles.recipeTitle}>Resep #{item.id}</Text>
      <Text style={styles.timestamp}>Dibuat: {formatDate(item.createdAt)}</Text>
      {item.ingredients && item.ingredients.length > 0 && (
        <Text style={styles.ingredients}>
          Bahan: {item.ingredients.join(', ')}
        </Text>
      )}
      <Text style={styles.recipeText}>{item.recipe}</Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteRecipe(item.id)}
      >
        <Text style={styles.deleteButtonText}>Hapus</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>History Resep</Text>
          <View style={styles.lottieContainer}>
            <LottieView
              source={foodAnimation}
              autoPlay
              loop
              style={styles.lottieAnimation}
              resizeMode="contain"
            />
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#4caf50" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={recipes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderRecipe}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Belum ada resep tersimpan</Text>
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={fetchRecipes}
                >
                  <Text style={styles.refreshButtonText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}

        <TouchableOpacity 
          style={styles.homeButton} 
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.homeButtonText}>🏠 Kembali ke Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f9f1',
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 20) + 10 : 10,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 10,
  },
  lottieContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieAnimation: {
    width: '100%',
    height: '100%',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  recipeContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 4,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#388e3c',
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  ingredients: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  recipeText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  deleteButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
    backgroundColor: '#e53935',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  homeButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#4caf50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 4,
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default HistoryScreen;
