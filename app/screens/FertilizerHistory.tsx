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
import foodAnimation from '../../assets/animasion/plant.json';
import { BASE_URL } from '../../lib/api';

type RootStackParamList = {
  Home: undefined;
  Foods: undefined;
  Login: undefined;
};

type Fertilizer = {
  id: number;
  fertilizer: string;
  ingredients: string[] | string;
  createdAt: string;
  created_by?: string;
};

const FertilizerHistoryScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [fertilizers, setFertilizers] = useState<Fertilizer[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFertilizers = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Token tidak ditemukan', 'Silakan login terlebih dahulu');
        navigation.navigate('Login');
        return;
      }

      const response = await axios.get(`${BASE_URL}/fertilizers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        console.log('Raw fertilizers data:', response.data);
        const cleanedFertilizers = response.data.map((fertilizer: any) => {
        
          
          return {
            ...fertilizer,
            fertilizer: fertilizer.fertilizer.replace(/[#*]/g, ''),
            // Map ingredients to string if it's an array
            ingredients: Array.isArray(fertilizer.ingredients) 
              ? fertilizer.ingredients.join(', ') 
              : fertilizer.ingredients || 'Tidak ada bahan'
          };
        });
        setFertilizers(cleanedFertilizers);
      } else {
        console.log('No fertilizers data in response');
        setFertilizers([]);
      }
    } catch (error: any) {
      console.error('Error fetching fertilizers:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Gagal mengambil data pupuk'
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteFertilizer = async (id: number) => {
    Alert.alert(
      'Konfirmasi',
      'Apakah Anda yakin ingin menghapus pupuk ini?',
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

              await axios.delete(`${BASE_URL}/fertilizers/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              setFertilizers(prev => prev.filter(fertilizer => fertilizer.id !== id));
              Alert.alert('Sukses', 'Pupuk berhasil dihapus');
            } catch (error: any) {
              console.error('Error deleting fertilizer:', error);
              console.error('Error response:', error.response?.data);
              Alert.alert(
                'Error',
                error.response?.data?.error || 'Gagal menghapus pupuk'
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
    fetchFertilizers();
  }, []);

  const formatDate = (dateString: string | undefined | null) => {
    try {
      // Check if dateString exists and is not null/undefined
      if (!dateString || typeof dateString !== 'string') {
        console.log('DateString is null/undefined:', dateString);
        return null; // Return null instead of string for fallback
      }
      
      console.log('Formatting date:', dateString);
      
      // Handle MySQL datetime format: "2025-10-18 18:17:36"
      let date: Date;
      
      if (dateString.includes(' ') && dateString.includes(':')) {
        // MySQL datetime format: "2025-10-18 18:17:36"
        // Convert to ISO format by replacing space with T
        const isoString = dateString.replace(' ', 'T');
        console.log('Converted to ISO:', isoString);
        date = new Date(isoString);
      } else {
        // Standard ISO format or other formats
        date = new Date(dateString);
      }
      
      console.log('Parsed date:', date);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.log('Invalid date detected');
        return null; // Return null for fallback    
      }
      
      const formatted = date.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      

    } catch (error) {
      console.error('Error formatting date:', error);
      return null; 
    }
  };

  const getTitleFromFertilizer = (fertilizerText: string) => {
    const words = fertilizerText.trim().split(/\s+/);
    const firstFiveWords = words.slice(0, 5).join(' ');
    return firstFiveWords.length > 50 ? firstFiveWords.substring(0, 50) + '...' : firstFiveWords;
  };

  const renderFertilizer = ({ item, index }: { item: Fertilizer; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 100)} style={styles.fertilizerContainer}>
      <Text style={styles.fertilizerTitle}>🌱 {getTitleFromFertilizer(item.fertilizer)}</Text>
       <Text style={styles.timestamp}>Dibuat: {formatDate(item.createdAt) || item.createdAt || 'Tidak diketahui'}</Text>
      {item.ingredients && (
        <Text style={styles.ingredients}>
          Bahan: {item.ingredients}
        </Text>
      )}
      <Text style={styles.fertilizerText}>{item.fertilizer}</Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteFertilizer(item.id)}
      >
        <Text style={styles.deleteButtonText}>Hapus</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>History Pupuk</Text>
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
            data={fertilizers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderFertilizer}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Belum ada pupuk tersimpan</Text>
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={fetchFertilizers}
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
  fertilizerContainer: {
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
  fertilizerTitle: {
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
  fertilizerText: {
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

export default FertilizerHistoryScreen;
