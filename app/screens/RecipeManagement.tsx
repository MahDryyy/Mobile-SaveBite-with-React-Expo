import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../../lib/api';
interface Recipe {
  id: number;
  recipe: string;
  createdAt: string;
  createdBy: string;
  ingredients: string[];
}

const RecipeManagement = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  const checkAdminAccess = async () => {
    try {
      const role = await AsyncStorage.getItem('userRole');
      if (role !== 'super_admin' && role !== 'admin_inventori') {
        Alert.alert('Access Denied', 'Only admin can access this page');
        navigation.goBack();
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigation.goBack();
      return false;
    }
  };

  const fetchRecipes = async () => {
    try {
      const hasAccess = await checkAdminAccess();
      if (!hasAccess) return;

      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${BASE_URL}/admin/recipes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let recipesData = response.data;
      if (Array.isArray(response.data)) {
        recipesData = response.data;
      } else if (response.data.recipes) {
        recipesData = response.data.recipes;
      }

      // Membersihkan format dari karakter # dan * untuk setiap resep
      const cleanedRecipes = recipesData.map((recipe: any) => ({
        ...recipe,
        recipe: recipe.recipe.replace(/[#*]/g, '')
      }));

      setRecipes(cleanedRecipes);
      setFilteredRecipes(cleanedRecipes);
    } catch (error: any) {
      console.error('Error fetching recipes:', error);
      Alert.alert('Error', 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredRecipes(recipes);
    } else {
      const filtered = recipes.filter(recipe => 
        recipe.createdBy.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredRecipes(filtered);
    }
  };

  const handleDeleteRecipe = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.delete(`${BASE_URL}/recipes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'Recipe deleted successfully');
      fetchRecipes(); // Refresh the list
    } catch (error) {
      console.error('Error deleting recipe:', error);
      Alert.alert('Error', 'Failed to delete recipe');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4318FF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Manajemen Resep</Text>
          <Text style={styles.subtitle}>Dashboard Resep Admin</Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari berdasarkan pembuat..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#666"
          />
          {searchQuery !== '' && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => handleSearch('')}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {filteredRecipes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'Tidak ada resep dari pembuat ini' : 'Tidak ada resep'}
            </Text>
          </View>
        ) : (
          filteredRecipes.map((recipe) => (
            <View key={recipe.id} style={styles.recipeCard}>
              <View style={styles.recipeHeader}>
                <Text style={styles.recipeId}>#{recipe.id}</Text>
                <Text style={styles.recipeDate}>{formatDate(recipe.createdAt)}</Text>
              </View>

              <Text style={styles.createdBy}>Created by: {recipe.createdBy}</Text>

              <Text style={styles.recipeTitle}>Recipe Instructions</Text>
              <Text style={styles.recipeText}>{recipe.recipe}</Text>

              <Text style={styles.ingredientsTitle}>Ingredients Used:</Text>
              <View style={styles.ingredientsContainer}>
                {recipe.ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientPill}>
                    <Text style={styles.ingredientText}>{ingredient}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
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
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 20) + 10 : 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  searchContainer: {
    margin: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    color: '#666',
    fontSize: 18,
  },
  emptyState: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    color: '#666',
    fontSize: 16,
  },
  recipeCard: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  recipeId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4318FF',
  },
  recipeDate: {
    fontSize: 12,
    color: '#666',
  },
  createdBy: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  recipeText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 15,
  },
  ingredientsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  ingredientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  ingredientPill: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    margin: 4,
  },
  ingredientText: {
    fontSize: 12,
    color: '#444',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RecipeManagement;
