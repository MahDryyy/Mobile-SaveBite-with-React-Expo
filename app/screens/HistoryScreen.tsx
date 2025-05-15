import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, Button, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  Home: undefined;
  Foods: undefined;
  Login: undefined;
};

const HistoryScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>(); 
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  
  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const response = await axios.get('https://reactgo-production-68cd.up.railway.app/recipes', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRecipes(response.data.recipes);
      } else {
        Alert.alert('Token tidak ditemukan', 'Silakan login terlebih dahulu');
        navigation.navigate('Login'); 
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal mengambil data resep');
    } finally {
      setLoading(false);
    }
  };

 
  const deleteRecipe = async (id: number) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        await axios.delete(`https://reactgo-production-68cd.up.railway.app/recipes/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
       
        setRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.id !== id));
        Alert.alert('Sukses', 'Resep berhasil dihapus');
      } else {
        Alert.alert('Token tidak ditemukan', 'Silakan login terlebih dahulu');
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal menghapus resep');
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    fetchRecipes();
  }, []);

  
  const renderRecipe = ({ item }: { item: any }) => (
    <View style={styles.recipeContainer}>
      <Text style={styles.recipeTitle}>Resep </Text>
      <Text style={styles.recipeText}>{item.recipe}</Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteRecipe(item.id)}
      >
        <Text style={styles.deleteButtonText}>Hapus</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>History Resep</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRecipe}
        />
      )}

   
      <Button
        title="Kembali ke Home"
        onPress={() => navigation.navigate('Home')}
        color="#6200ea"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  recipeContainer: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  recipeText: {
    fontSize: 14,
    color: '#333',
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: '#e53935',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HistoryScreen;
