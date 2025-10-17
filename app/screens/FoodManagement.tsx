import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  ScrollView,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../lib/api';

type Food = {
  food_id: number;
  food_name: string;
  quantity: number;
  expiry_date: string;
  username: string;
  category_name: string;
};

type RootStackParamList = {
  Login: undefined;
  AdminHome: undefined;
};

const FoodManagement = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [foods, setFoods] = useState<Food[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<{ id: number; name: string; }[]>([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    checkAccess();
  }, []);

  useEffect(() => {
    filterFoods();
  }, [foods, searchUsername, selectedCategory]);

  const checkAccess = async () => {
    const role = await AsyncStorage.getItem('userRole');
    if (!role || !['super_admin', 'admin_inventori'].includes(role)) {
      Alert.alert('Akses Ditolak', 'Anda tidak memiliki akses ke halaman ini');
      navigation.goBack();
      return;
    }
    fetchFoods();
    fetchCategories();
  };

  const fetchCategories = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${BASE_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Error', 'Gagal mengambil data kategori');
    }
  };

  const fetchFoods = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${BASE_URL}/admin/foods`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      let foodsData = response.data;
      if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data)) {
          foodsData = response.data;
        } else if (response.data.foods) {
          foodsData = response.data.foods;
        } else if (response.data.data) {
          foodsData = response.data.data;
        }
      }

      const formattedFoods = foodsData.map((food: any) => ({
        food_id: food.id,
        food_name: food.name,
        quantity: food.quantity,
        expiry_date: food.expiryDate,
        username: food.user,
        category_name: food.category
      }));

      setFoods(formattedFoods);
      setFilteredFoods(formattedFoods);
    } catch (error: any) {
      console.error('Error fetching foods:', error);
      Alert.alert('Error', error.response?.data?.error || 'Gagal mengambil data makanan');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterFoods = () => {
    let filtered = [...foods];

    // Filter by username
    if (searchUsername) {
      filtered = filtered.filter(food => 
        food.username.toLowerCase().includes(searchUsername.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(food => 
        food.category_name === selectedCategory
      );
    }

    setFilteredFoods(filtered);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Tanggal tidak valid';
      }
      
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Tanggal tidak valid';
    }
  };

  const renderItem = ({ item }: { item: Food }) => (
    <View style={styles.foodCard}>
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.food_name || 'Tidak ada nama'}</Text>
        <View style={styles.detailsContainer}>
          <Text style={styles.foodDetail}>
            <Text style={styles.labelText}>Jumlah:</Text> {item.quantity}
          </Text>
          <Text style={styles.foodDetail}>
            <Text style={styles.labelText}>Kategori:</Text> {item.category_name || 'Tidak ada kategori'}
          </Text>
          <Text style={styles.foodDetail}>
            <Text style={styles.labelText}>Kadaluarsa:</Text> {formatDate(item.expiry_date)}
          </Text>
          {item.username && (
            <Text style={styles.foodDetail}>
              <Text style={styles.labelText}>Ditambahkan oleh:</Text> {item.username}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#388e3c" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Manajemen Makanan</Text>
        </View>

        <View style={styles.filterContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari berdasarkan username..."
            value={searchUsername}
            onChangeText={setSearchUsername}
          />
          <View style={styles.categoryFilter}>
            <Text style={styles.filterLabel}>Filter Kategori:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  !selectedCategory && styles.categoryChipSelected
                ]}
                onPress={() => setSelectedCategory('')}
              >
                <Text style={[
                  styles.categoryChipText,
                  !selectedCategory && styles.categoryChipTextSelected
                ]}>
                  Semua
                </Text>
              </TouchableOpacity>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.name && styles.categoryChipSelected
                  ]}
                  onPress={() => setSelectedCategory(category.name)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    selectedCategory === category.name && styles.categoryChipTextSelected
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <FlatList
          data={filteredFoods}
          renderItem={renderItem}
          keyExtractor={(item) => item.food_id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchFoods();
              }}
              colors={['#388e3c']}
              tintColor="#388e3c"
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Tidak ada data makanan</Text>
              <Text style={styles.emptySubText}>Tarik ke bawah untuk memuat ulang</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#388e3c',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f9f1',
  },
  header: {
    backgroundColor: '#388e3c',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 20) + 10 : 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  filterContainer: {
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  categoryFilter: {
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#388e3c',
    marginBottom: 8,
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#388e3c',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  categoryChipSelected: {
    backgroundColor: '#388e3c',
  },
  categoryChipText: {
    color: '#388e3c',
    fontSize: 14,
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#388e3c',
    marginBottom: 8,
  },
  detailsContainer: {
    gap: 4,
  },
  foodDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  labelText: {
    fontWeight: '500',
    color: '#444',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
  },
});

export default FoodManagement;
