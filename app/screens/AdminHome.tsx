import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../config/api';

type RootStackParamList = {
  Login: undefined;
  UserList: undefined;

  
  CategoryManagement: undefined;
  LoginLogs: undefined;
  FoodManagement: undefined;
  RecipeManagement: undefined;
  Home: undefined;
};

const AdminHomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    todayLogins: 0,
    failedLogins: 0
  });
  const [newCategory, setNewCategory] = useState('');
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);

  const loadUserData = async () => {
    try {
      const storedRole = await AsyncStorage.getItem('userRole');
      const storedUsername = await AsyncStorage.getItem('username');
      
      if (storedRole && storedUsername) {
        setUserRole(storedRole);
        setUsername(storedUsername);
        await fetchStats();
        await fetchCategories();
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return;
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Gagal memuat data pengguna');
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      // Fetch total users
      const usersResponse = await axios.get(`${BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Fetch login logs
      const logsResponse = await axios.get(`${BASE_URL}/admin/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Get today's date
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      
      const logs = Array.isArray(logsResponse.data) ? logsResponse.data : [];
      
      const todayLogins = logs.filter((log: any) => {
        try {
          if (!log.timestamp) return false;
          
          // Convert timestamp to date object
          const logTime = new Date(log.timestamp);
          const logDate = new Date(logTime.getFullYear(), logTime.getMonth(), logTime.getDate()).getTime();
          
          return logDate === today && log.status === 'success';
        } catch {
          return false;
        }
      }).length;

      const failedLogins = logs.filter((log: any) => log.status === 'failed').length;

      const totalUsers = Array.isArray(usersResponse.data) ? usersResponse.data.length : 0;

      console.log('Stats calculated:', {
        totalUsers,
        todayLogins,
        failedLogins,
        today: new Date(today).toISOString()
      });

      setStats({
        totalUsers,
        todayLogins,
        failedLogins
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      Alert.alert('Error', 'Gagal memuat statistik. Silakan coba lagi.');
    }
  };

  const fetchCategories = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('Fetching categories...');
      const response = await axios.get(`${BASE_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Categories response:', response.data);

      // Pastikan data kategori dalam format yang benar
      let categoriesData = response.data;
      if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data)) {
          categoriesData = response.data;
        } else if (response.data.categories) {
          categoriesData = response.data.categories;
        } else if (response.data.data) {
          categoriesData = response.data.data;
        }
      }

      // Map data ke format yang dibutuhkan
      const formattedCategories = categoriesData.map((category: any) => ({
        id: category.id || category.category_id,
        name: category.name || category.category_name
      }));

      console.log('Formatted categories:', formattedCategories);
      setCategories(formattedCategories);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      Alert.alert('Error', error.response?.data?.error || 'Gagal mengambil data kategori');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      Alert.alert('Error', 'Nama kategori tidak boleh kosong');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('Adding new category:', newCategory);
      
      const response = await axios.post(
        `${BASE_URL}/admin/category`,
        { name: newCategory },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log('Add category response:', response.data);

      if (response.data && response.data.message) {
        Alert.alert('Sukses', response.data.message);
        setNewCategory('');
        fetchCategories(); // Refresh daftar kategori
      } else {
        throw new Error('Respons tidak valid dari server');
      }
    } catch (error: any) {
      console.error('Error adding category:', error);
      console.error('Error details:', error.response?.data);
      
      // Tampilkan pesan error dari backend atau pesan default
      const errorMessage = error.response?.data?.error || 'Gagal menambahkan kategori';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    console.log('handleDeleteCategory called with id:', id);
    
    Alert.alert(
      'Konfirmasi',
      'Apakah Anda yakin ingin menghapus kategori ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const token = await AsyncStorage.getItem('userToken');
              
              if (!token) {
                Alert.alert('Error', 'Sesi telah berakhir. Silakan login kembali.');
                return;
              }

              const response = await axios.delete(
                `${BASE_URL}/admin/category/${id}`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  }
                }
              );

              if (response.status === 200) {
                Alert.alert('Sukses', 'Kategori berhasil dihapus');
                await fetchCategories();
              }
            } catch (error: any) {
              console.error('Delete error:', error);
              const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Gagal menghapus kategori';
              Alert.alert('Error', errorMessage);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    loadUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#388e3c" />
      </View>
    );
  }

  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  console.log('Current categories:', categories);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Admin Dashboard</Text>
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Selamat datang, {username}</Text>
            <Text style={styles.dateText}>{getCurrentDate()}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{userRole}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.blueCard]}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>👥</Text>
            </View>
            <Text style={styles.statLabel}>Total Users</Text>
            <Text style={styles.statValue}>{stats.totalUsers}</Text>
          </View>

          <View style={[styles.statCard, styles.greenCard]}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>✅</Text>
            </View>
            <Text style={styles.statLabel}>Today's Logins</Text>
            <Text style={styles.statValue}>{stats.todayLogins}</Text>
          </View>

          <View style={[styles.statCard, styles.redCard]}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>❌</Text>
            </View>
            <Text style={styles.statLabel}>Failed Logins</Text>
            <Text style={styles.statValue}>{stats.failedLogins}</Text>
          </View>
        </View>

        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Manajemen Kategori</Text>
          <Text style={styles.sectionSubtitle}>Kelola kategori makanan dalam sistem</Text>
          
          <View style={styles.categoryInputContainer}>
            <TextInput
              style={styles.categoryInput}
              placeholder="Nama kategori baru"
              value={newCategory}
              onChangeText={setNewCategory}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={styles.addCategoryButton}
              onPress={handleAddCategory}
            >
              <Text style={styles.addCategoryButtonText}>Tambah Kategori</Text>
            </TouchableOpacity>
          </View>

          {categories.length > 0 ? (
            <View style={styles.categoryTable}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>ID</Text>
                <Text style={[styles.tableHeaderCell, styles.nameCell]}>NAMA KATEGORI</Text>
                <Text style={styles.tableHeaderCell}>AKSI</Text>
              </View>
              {categories.map((category) => (
                <View key={category.id} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{category.id}</Text>
                  <Text style={[styles.tableCell, styles.nameCell]}>{category.name}</Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                      console.log('Delete button pressed for category:', category.id);
                      handleDeleteCategory(category.id);
                    }}
                  >
                    <Text style={styles.deleteButtonText}>Hapus</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Belum ada kategori</Text>
            </View>
          )}
        </View>

        <View style={styles.menuGrid}>
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => navigation.navigate('FoodManagement')}
          >
            <Text style={styles.menuIcon}>🛒</Text>
            <Text style={styles.menuTitle}>Food Management</Text>
            <Text style={styles.menuDescription}>Kelola inventori makanan dan kategori</Text>
            <View style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View All Foods</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => navigation.navigate('RecipeManagement')}
          >
            <Text style={styles.menuIcon}>📖</Text>
            <Text style={styles.menuTitle}>Recipe Management</Text>
            <Text style={styles.menuDescription}>Kelola resep dan panduan memasak</Text>
            <View style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View All Recipes</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => navigation.navigate('UserList')}
          >
            <Text style={styles.menuIcon}>👥</Text>
            <Text style={styles.menuTitle}>User Management</Text>
            <Text style={styles.menuDescription}>Kelola pengguna dan hak akses</Text>
            <View style={styles.viewButton}>
              <Text style={styles.viewButtonText}>Manage Users</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => navigation.navigate('LoginLogs')}
          >
            <Text style={styles.menuIcon}>📋</Text>
            <Text style={styles.menuTitle}>Activity Logs</Text>
            <Text style={styles.menuDescription}>Monitor aktivitas sistem</Text>
            <View style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View Activity Logs</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#4318FF',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f9f1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#4318FF',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 20 : 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  userInfo: {
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#fff',
  },
  dateText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    marginTop: -30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  blueCard: {
    backgroundColor: '#4318FF',
  },
  greenCard: {
    backgroundColor: '#05CD99',
  },
  redCard: {
    backgroundColor: '#EE5D50',
  },
  statIconContainer: {
    marginBottom: 5,
  },
  statIcon: {
    fontSize: 24,
  },
  statLabel: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 5,
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  categorySection: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  categoryInputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  categoryInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    fontSize: 14,
    color: '#333',
  },
  addCategoryButton: {
    backgroundColor: '#4318FF',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addCategoryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  categoryTable: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableHeaderCell: {
    flex: 1,
    fontWeight: '600',
    color: '#444',
  },
  nameCell: {
    flex: 2,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  tableCell: {
    flex: 1,
    padding: 4,
  },
  actionCell: {
    flex: 1,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  menuGrid: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuCard: {
    backgroundColor: '#fff',
    width: '48%',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuIcon: {
    fontSize: 24,
    marginBottom: 10,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  menuDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  viewButton: {
    backgroundColor: '#4318FF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4318FF',
  },
  addButtonText: {
    color: '#4318FF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginTop: 10,
  },
  emptyStateText: {
    color: '#666',
    fontSize: 14,
  },
});

export default AdminHomeScreen;
