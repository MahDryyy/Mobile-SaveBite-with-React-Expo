import React, { useState } from 'react';
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
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

type RootStackParamList = {
  Home: undefined;
  Foods: undefined;
  AddFood: undefined;
};

export default function AddFoodScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [name, setName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirmDate = (date: Date) => {
    const formatted = date.toISOString().split('T')[0]; 
    setExpiryDate(formatted);
    hideDatePicker();
  };

  const handleAddFood = async () => {
    if (!name || !expiryDate) {
      Alert.alert('Peringatan', 'Semua field harus diisi');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');

      await axios.post(
        'https://reactgo-production-68cd.up.railway.app/foods',
        {
          name,
          expiry_date: expiryDate,
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'android' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>🍽️ Tambah Makanan Baru</Text>

      
        <View style={styles.inputContainer}>
          <FontAwesomeIcon name="cutlery" size={20} color="#fff" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Nama Makanan"
            value={name}
            onChangeText={setName}
          />
        </View>


        <TouchableOpacity onPress={showDatePicker} activeOpacity={0.8}>
          <View style={styles.inputContainer}>
            <FontAwesomeIcon name="calendar" size={20} color="#fff" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Tanggal Expired"
              value={expiryDate}
              editable={false}
            />
          </View>
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmDate}
          onCancel={hideDatePicker}
        />

        <TouchableOpacity style={styles.button} onPress={handleAddFood}>
          <Text style={styles.buttonText}>+ Tambah Makanan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Kembali</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fffdd0',
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: '#f9f5ed',
    paddingHorizontal: 16,
    height: 52,
  },
  icon: {
    marginRight: 10,
    backgroundColor: '#f4d29a',
    padding: 8,
    borderRadius: 50,
  },
  input: {
    flex: 1,
    color: '#91627b',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#6200ea',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#6200ea',
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
  backButton: {
    backgroundColor: '#e0e0e0',
  },
  backButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
});
