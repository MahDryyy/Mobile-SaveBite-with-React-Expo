import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import foodAnimation from '../../assets/animasion/add.json';
import { BASE_URL } from '../config/api';

type RootStackParamList = {
  Home: undefined;
  Foods: undefined;
  AddFood: undefined;
};

type Category = {
  id: number;
  name: string;
};

export default function AddFoodScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [expiryDate, setExpiryDate] = useState('');
  const [expiryDateISO, setExpiryDateISO] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        console.log('No token found');
        Alert.alert('Error', 'Silakan login terlebih dahulu');
        return;
      }
      
      
        const response = await axios.get(`${BASE_URL}/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

    
      
      if (Array.isArray(response.data)) {
        setCategories(response.data);
        if (response.data.length > 0) {
          setCategoryId(response.data[0].id);
          setSelectedCategory(response.data[0].name);
        }
      } else {
        console.log('Invalid response format:', response.data);
        Alert.alert('Error', 'Format data kategori tidak valid');
      }
    } catch (error: any) {
      console.log('Error type:', typeof error);
      console.log('Error message:', error.message);
      
      if (error.response) {
       
        console.log('Error status:', error.response.status);
        console.log('Error data:', error.response.data);
      } else if (error.request) {
   
        console.log('No response received');
        console.log('Request:', error.request);
      } else {
     
        console.log('Error setting up request:', error.message);
      }
      
      Alert.alert(
        'Error',
        'Gagal mengambil data kategori. Pastikan server berjalan dan Anda terhubung ke internet.'
      );
    }
  };

  const handleSelectCategory = (category: Category) => {
    setCategoryId(category.id);
    setSelectedCategory(category.name);
    setIsDropdownOpen(false);
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirmDate = (date: Date) => {
    const formattedLocal = date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const formattedISO = date.toISOString().split('T')[0];

    setExpiryDate(formattedLocal);
    setExpiryDateISO(formattedISO);
    hideDatePicker();
  };

  const handleAddFood = async () => {
    if (!name || !expiryDateISO || !quantity) {
      Alert.alert('Peringatan', 'Semua field harus diisi');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.post(
        `${BASE_URL}/foods`,
        {
          name,
          expiry_date: expiryDateISO,
          quantity: parseInt(quantity),
          category_id: categoryId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      Alert.alert('Sukses', 'Makanan berhasil ditambahkan');
      navigation.navigate('Foods');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal menambahkan makanan');
    }
  };

  const renderDropdownItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => handleSelectCategory(item)}
    >
      <Text style={styles.dropdownItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'android' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Animated.Text entering={FadeInDown.duration(500)} style={styles.title}>
          🍽️ Tambah Makanan Baru
        </Animated.Text>
        <View style={styles.lottieContainer}> 
          <LottieView
            source={foodAnimation}
            autoPlay
            loop
            style={styles.lottieAnimation}
            resizeMode="contain"
          />
        </View>

        <Animated.View entering={FadeInUp.delay(200).duration(400)} style={{ width: '100%' }}>
          <Text style={styles.label}>Nama Makanan</Text>
          <View style={styles.inputContainer}>
            <FontAwesomeIcon name="cutlery" size={20} color="#fff" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Contoh: Nasi Goreng"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#81c784"
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(250).duration(400)} style={{ width: '100%' }}>
          <Text style={styles.label}>Jumlah</Text>
          <View style={styles.inputContainer}>
            <FontAwesomeIcon name="shopping-basket" size={20} color="#fff" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Masukkan jumlah"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholderTextColor="#81c784"
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(400)} style={{ width: '100%' }}>
          <Text style={styles.label}>Pilih Kategori:</Text>
          <View style={styles.categoryContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  categoryId === category.id && styles.selectedCategoryButton
                ]}
                onPress={() => handleSelectCategory(category)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  categoryId === category.id && styles.selectedCategoryButtonText
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(350).duration(400)} style={{ width: '100%' }}>
          <Text style={styles.label}>Tanggal Kadaluarsa</Text>
          <TouchableOpacity onPress={showDatePicker} activeOpacity={0.8}>
            <View style={styles.inputContainer}>
              <FontAwesomeIcon name="calendar" size={20} color="#fff" style={styles.icon} />
              <Text style={[styles.dateText, !expiryDate && styles.placeholderText]}>
                {expiryDate || 'Pilih tanggal'}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          display={Platform.OS === 'android' ? 'spinner' : 'default'}
          onConfirm={handleConfirmDate}
          onCancel={hideDatePicker}
        />

        <Modal
          visible={isDropdownOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsDropdownOpen(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1} 
            onPress={() => setIsDropdownOpen(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Pilih Kategori</Text>
                <TouchableOpacity onPress={() => setIsDropdownOpen(false)}>
                  <FontAwesomeIcon name="times" size={20} color="#388e3c" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={categories}
                renderItem={renderDropdownItem}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        <Animated.View entering={FadeInUp.delay(400).duration(400)} style={{ width: '100%' }}>
          <TouchableOpacity style={styles.button} onPress={handleAddFood}>
            <Text style={styles.buttonText}>+ Tambah Makanan</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
    padding: 24,
    backgroundColor: '#e8f5e9',
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
    color: '#388e3c',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#388e3c',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: '#a5d6a7',
    paddingHorizontal: 16,
    height: 52,
  },
  icon: {
    marginRight: 10,
    backgroundColor: '#81c784',
    padding: 8,
    borderRadius: 50,
  },
  input: {
    flex: 1,
    color: '#388e3c',
    fontSize: 14,
  },
  dateText: {
    fontSize: 14,
    color: '#388e3c',
  },
  placeholderText: {
    color: '#81c784',
  },
  button: {
    backgroundColor: '#388e3c',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#388e3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#388e3c',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#388e3c',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#388e3c',
    backgroundColor: 'white',
  },
  selectedCategoryButton: {
    backgroundColor: '#388e3c',
    borderColor: '#388e3c',
  },
  categoryButtonText: {
    color: '#388e3c',
    fontSize: 14,
  },
  selectedCategoryButtonText: {
    color: 'white',
  },
});
