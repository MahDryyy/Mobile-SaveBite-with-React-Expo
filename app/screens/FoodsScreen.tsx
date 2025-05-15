import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  Home: undefined;
  Foods: undefined;
  Login: undefined;
};

const CustomSwitch = ({ value, onChange }: { value: boolean; onChange: () => void }) => {
  return (
    <TouchableOpacity onPress={onChange} style={styles.switchContainer}>
      <View
        style={[styles.switchTrack, { backgroundColor: value ? '#2e9942' : '#333' }]}>
        <View
          style={[styles.switchThumb, { alignSelf: value ? 'flex-end' : 'flex-start' }]}/>
      </View>
    </TouchableOpacity>
  );
};

const FoodsScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [foods, setFoods] = useState<any[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<string | null>(null);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const response = await axios.get('https://reactgo-production-68cd.up.railway.app/foods', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFoods(response.data);
      } else {
        Alert.alert('Token tidak ditemukan', 'Silakan login terlebih dahulu');
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal mengambil data makanan');
    } finally {
      setLoading(false);
    }
  };

  const deleteFood = async (foodId: number) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const response = await axios.delete(
          `https://reactgo-production-68cd.up.railway.app/foods/${foodId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200) {
          Alert.alert('Sukses', 'Makanan berhasil dihapus');
          fetchFoods();
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal menghapus makanan');
    } finally {
      setLoading(false);
    }
  };

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

  const handleCheckboxChange = (foodId: number) => {
    setSelectedFoods((prevSelected) => {
      if (prevSelected.includes(foodId)) {
        return prevSelected.filter((id) => id !== foodId);
      } else {
        return [...prevSelected, foodId];
      }
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
      const response = await axios.post(
        'https://reactgo-production-68cd.up.railway.app/recipe',
        { food_id: selectedFoods },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setRecipe(response.data.recipe);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal membuat resep');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fffdd0' }}> 
      <FlatList
        contentContainerStyle={styles.container}
        data={foods}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Daftar Makanan</Text>
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.foodItem}>
            <CustomSwitch
              value={selectedFoods.includes(item.id)}
              onChange={() => handleCheckboxChange(item.id)}
            />
            <View style={styles.foodDetails}>
              <Text style={styles.foodName}>{item.name}</Text>
              <Text>Expiry Date: {item.expiry_date}</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteFood(item.id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <ScrollView contentContainerStyle={styles.footerContainer}>
        <View style={styles.buttonContainer}>
          <Button title="Generate Recipe" onPress={generateRecipe} color="#6200ea" />
        </View>

        {recipe && (
          <View style={styles.recipeContainer}>
            <Text style={styles.recipeTitle}>Resep yang Dihasilkan:</Text>
            <Text>{recipe}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title="Ke Halaman Home"
            onPress={() => navigation.navigate('Home')}
            color="#6200ea"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  foodDetails: {
    marginLeft: 15,
    flex: 1,
  },
  foodName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#ff4081',
    padding: 8,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
  },
  recipeContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e0f7fa',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  recipeTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
    switchContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchTrack: {
    width: 40,
    height: 20,
    borderRadius: 20,
    padding: 3,
    backgroundColor: '#333',
    justifyContent: 'center',
  },
  switchThumb: {
    width: 14,
    height: 14,
    borderRadius: 14 / 2,
    backgroundColor: '#fff',
  },
  footerContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
    backgroundColor: '#fffdd0',  
  },
});

export default FoodsScreen;
