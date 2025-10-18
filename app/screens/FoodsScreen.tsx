// screens/FoodsScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import foodAnimation from '../../assets/animasion/daftar.json';
import { BASE_URL } from '../../lib/api';

type RootStackParamList = {
  Home: undefined;
  Foods: undefined;
  Login: undefined;
};

interface Food {
  id: number;
  name: string;
  expiry_date: string;
  quantity: number;
  category_name: string;
}

type ExpiryStatus = {
  status: 'fresh' | 'warning' | 'expired';
  message: string;
  color: string;
};

interface RecipeIngredient {
  id: number;
  quantity: number;
}

const getExpiryStatus = (expiryDate: string): ExpiryStatus => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) {
    return {
      status: 'expired',
      message: 'Kadaluwarsa',
      color: '#d32f2f'
    };
  } else if (daysUntilExpiry <= 3) {
    return {
      status: 'warning',
      message: `Segera kadaluwarsa (${daysUntilExpiry} hari)`,
      color: '#f57c00'
    };
  } else {
    return {
      status: 'fresh',
      message: `${daysUntilExpiry} hari lagi`,
      color: '#388e3c'
    };
  }
};

const CustomSwitch = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
  <TouchableOpacity onPress={onChange} activeOpacity={0.8} style={styles.switchContainer}>
    <View style={[styles.switchTrack, value && styles.switchTrackActive]}>
      <Animated.View style={[styles.switchThumb, value && styles.switchThumbActive]} />
    </View>
  </TouchableOpacity>
);

const SectionHeader = ({ title, count, color }: { title: string; count: number; color: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
    <Text style={[styles.sectionCount, { color }]}>({count})</Text>
  </View>
);

export default function FoodsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<number[]>([]);
  const [selectedQuantities, setSelectedQuantities] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<string | null>(null);
  const [fertilizer, setFertilizer] = useState<string | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        navigation.navigate('Login');
      } else {
        fetchFoods();
      }
    };
    checkToken();
  }, [navigation]);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const response = await axios.get(`${BASE_URL}/foods`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && Array.isArray(response.data)) {
          setFoods(response.data);
        } else {
          setFoods([]);
          console.warn('Invalid data format received:', response.data);
        }
      }
    } catch (error) {
      console.error('Error fetching foods:', error);
      Alert.alert('Error', 'Gagal mengambil data makanan');
      setFoods([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteFood = async (foodId: number) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.delete(`${BASE_URL}/foods/${foodId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Sukses', 'Makanan berhasil dihapus');
      fetchFoods();
    } catch (error) {
      console.error('Error deleting food:', error);
      Alert.alert('Error', 'Gagal menghapus makanan');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (foodId: number) => {
    setSelectedFoods((prev) => {
      const newSelected = prev.includes(foodId) 
        ? prev.filter((id) => id !== foodId)
        : [...prev, foodId];
      
    
      if (!prev.includes(foodId)) {
        setSelectedQuantities(prev => ({
          ...prev,
          [foodId]: 1 
        }));
      }
      
      return newSelected;
    });
  };

  const handleQuantityChange = (foodId: number, change: number) => {
    const food = foods.find(f => f.id === foodId);
    if (!food) return;

    setSelectedQuantities(prev => {
      const currentQty = prev[foodId] || 1;
      const newQty = Math.max(1, Math.min(currentQty + change, food.quantity));
      return {
        ...prev,
        [foodId]: newQty
      };
    });
  };

  const generateRecipe = async () => {
    if (selectedFoods.length === 0) {
      Alert.alert('Peringatan', 'Harap pilih makanan terlebih dahulu');
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      const ingredients = selectedFoods.map(foodId => ({
        id: foodId,
        quantity: selectedQuantities[foodId] || 1
      }));

      const response = await axios.post(
        `${BASE_URL}/recipe`,
        { ingredients },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data && response.data.recipe) {
        const cleanRecipe = response.data.recipe.replace(/[#*]/g, '');
        setRecipe(cleanRecipe);
      } else {
        Alert.alert('Error', 'Format resep tidak valid');
      }
    } catch (error: any) {
      console.error('Error generating recipe:', error);
      const errorMessage = error.response?.data?.error || 'Gagal membuat resep';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateFertilizer = async () => {
    if (selectedFoods.length === 0) {
      Alert.alert('Peringatan', 'Harap pilih makanan terlebih dahulu');
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      const ingredients = selectedFoods.map(foodId => ({
        id: foodId,
        quantity: selectedQuantities[foodId] || 1
      }));

      const response = await axios.post(
        `${BASE_URL}/fertilizer`,
        { ingredients },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data && response.data.fertilizer) {
        const cleanFertilizer = response.data.fertilizer.replace(/[#*]/g, '');
        setFertilizer(cleanFertilizer);
      } else {
        Alert.alert('Error', 'Format pupuk tidak valid');
      }
    } catch (error: any) {
      console.error('Error generating fertilizer:', error);
      const errorMessage = error.response?.data?.error || 'Gagal membuat pupuk';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Group foods by expiry status
  const groupFoodsByStatus = () => {
    const fresh: Food[] = [];
    const warning: Food[] = [];
    const expired: Food[] = [];

    foods.forEach(food => {
      if (food.expiry_date) {
        const status = getExpiryStatus(food.expiry_date);
        switch (status.status) {
          case 'fresh':
            fresh.push(food);
            break;
          case 'warning':
            warning.push(food);
            break;
          case 'expired':
            expired.push(food);
            break;
        }
      } else {
        // If no expiry date, treat as fresh
        fresh.push(food);
      }
    });

    return { fresh, warning, expired };
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.lottieContainer}> 
          <LottieView
            source={foodAnimation}
            autoPlay
            loop
            style={styles.lottieAnimation}
            resizeMode="contain"
          />
        </View>
        <Animated.Text entering={FadeInDown.duration(500)} style={styles.title}>
          Daftar Makanan
        </Animated.Text>

        {loading && <ActivityIndicator size="large" color="#388e3c" style={{ marginBottom: 20 }} />}

        {(!foods || foods.length === 0) && !loading && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Belum ada data makanan tersimpan</Text>
            <Text style={styles.emptySubText}>Silakan tambahkan makanan terlebih dahulu</Text>
          </View>
        )}

        {Array.isArray(foods) && foods.length > 0 && (() => {
          const { fresh, warning, expired } = groupFoodsByStatus();
          
          const renderFoodItem = (item: Food, index: number) => (
            <Animated.View
              entering={FadeInUp.delay(index * 150).duration(500)}
              key={item.id?.toString() || index.toString()}
              style={styles.foodItem}
            >
              <CustomSwitch
                value={selectedFoods.includes(item.id)}
                onChange={() => handleCheckboxChange(item.id)}
              />
              <View style={styles.foodDetails}>
                <Text style={styles.foodName}>{item.name || 'Nama tidak tersedia'}</Text>
                <Text style={styles.foodInfo}>Jumlah tersedia: {item.quantity || 0}</Text>
                <Text style={styles.foodInfo}>Kategori: {item.category_name || 'Tidak ada kategori'}</Text>
                <View style={styles.expiryContainer}>
                  <Text style={styles.expiryDate}>
                    Kadaluarsa: {item.expiry_date || 'Tanggal tidak tersedia'}
                  </Text>
                  {item.expiry_date && (
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getExpiryStatus(item.expiry_date).color }
                    ]}>
                      <Text style={styles.statusText}>
                        {getExpiryStatus(item.expiry_date).message}
                      </Text>
                    </View>
                  )}
                </View>
                {selectedFoods.includes(item.id) && (
                  <View style={styles.quantitySelector}>
                    <Text style={styles.quantityLabel}>Jumlah untuk resep:</Text>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleQuantityChange(item.id, -1)}
                      >
                        <Text style={styles.quantityButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>
                        {selectedQuantities[item.id] || 1}
                      </Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleQuantityChange(item.id, 1)}
                      >
                        <Text style={styles.quantityButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  item.expiry_date && getExpiryStatus(item.expiry_date).status === 'expired' ? styles.deleteButtonUrgent:null
                ]}
                onPress={() => item.id && deleteFood(item.id)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="delete-outline" size={22} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          );

          return (
            <View style={styles.foodSections}>
              {/* Expired Section */}
              {expired.length > 0 && (
                <View style={styles.section}>
                  <SectionHeader
                    title="Kadaluarsa"
                    count={expired.length}
                    color="#d32f2f"
                  />
                  {expired.map((item, index) => renderFoodItem(item, index))}
                </View>
              )}

              {/* Warning Section */}
              {warning.length > 0 && (
                <View style={styles.section}>
                  <SectionHeader
                    title="Segera Kadaluarsa"
                    count={warning.length}
                    color="#f57c00"
                  />
                  {warning.map((item, index) => renderFoodItem(item, index))}
                </View>
              )}

              {/* Fresh Section */}
              {fresh.length > 0 && (
                <View style={styles.section}>
                  <SectionHeader
                    title="Segar"
                    count={fresh.length}
                    color="#388e3c"
                  />
                  {fresh.map((item, index) => renderFoodItem(item, index))}
                </View>
              )}
            </View>
          );
        })()}

        {foods.length > 0 && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={generateRecipe} 
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>🍳 Buat Resep</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.fertilizerButton]} 
              onPress={generateFertilizer} 
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>🌱 Buat Pupuk</Text>
            </TouchableOpacity>
          </View>
        )}

        {recipe && (
          <View style={styles.recipeBox}>
            <Text style={styles.recipeTitle}>📋 Resep:</Text>
            <Text style={styles.recipeText}>{recipe}</Text>
          </View>
        )}

        {fertilizer && (
          <View style={styles.fertilizerBox}>
            <Text style={styles.fertilizerTitle}>🌱 Pupuk:</Text>
            <Text style={styles.fertilizerText}>{fertilizer}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.homeButton]}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>🏠 Kembali ke Beranda</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e8f5e9',
  },
  lottieContainer: {
    width: '85%',
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    zIndex: -1,
  },
  lottieAnimation: {
    width: '100%',
    height: '100%',
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#388e3c',
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 18,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
  },
  foodDetails: {
    flex: 1,
    marginLeft: 16,
  },
  foodName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#388e3c',
    marginBottom: 4,
  },
  foodInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  expiryContainer: {
    flexDirection: 'column',
    marginTop: 4,
  },
  expiryDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ef5350',
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  deleteButtonUrgent: {
    backgroundColor: '#d32f2f',
    shadowColor: '#d32f2f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  switchContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    padding: 3,
  },
  switchTrackActive: {
    backgroundColor: '#4caf50',
  },
  switchThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  emptyContainer: {
    marginVertical: 50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#388e3c',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#388e3c',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  fertilizerButton: {
    backgroundColor: '#8bc34a',
  },
  homeButton: {
    backgroundColor: '#66bb6a',
  },
  recipeBox: {
    backgroundColor: '#c8e6c9',
    padding: 18,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#2e7d32',
  },
  recipeText: {
    fontSize: 16,
    color: '#2e7d32',
  },
  fertilizerBox: {
    backgroundColor: '#dcedc8',
    padding: 18,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
  },
  fertilizerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#33691e',
  },
  fertilizerText: {
    fontSize: 16,
    color: '#33691e',
  },
  quantitySelector: {
    marginTop: 8,
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 8,
  },
  quantityLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#388e3c',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 12,
    color: '#388e3c',
    fontWeight: 'bold',
  },
  foodSections: {
    width: '100%',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '500',
  },
});
