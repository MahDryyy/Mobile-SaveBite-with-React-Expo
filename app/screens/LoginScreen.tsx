import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import foodAnimation from '../../assets/animasion/drop.json';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../../lib/api';

type FormData = {
  username: string;
  password: string;
};

const LoginScreen = ({ navigation }: any) => {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const username = data.username.trim();
    const password = data.password.trim();

    try {
      const response = await axios.post(
        `${BASE_URL}/login`,
        { username, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      if (response.data && response.data.token && response.data.role) {
        await Promise.all([
          AsyncStorage.setItem('userToken', response.data.token),
          AsyncStorage.setItem('userRole', response.data.role),
          AsyncStorage.setItem('username', username)
        ]);

        const storedToken = await AsyncStorage.getItem('userToken');
        if (!storedToken) {
          throw new Error('Failed to store authentication data');
        }

        const role = response.data.role;
        const adminRoles = ['super_admin', 'admin_inventori', 'admin_resep', 'admin_user'];
        
        if (adminRoles.includes(role)) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'AdminHome' }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        }
      } else {
        throw new Error('Invalid response format: missing token or role');
      }
    } catch (error: any) {
      await AsyncStorage.multiRemove(['userToken', 'userRole', 'username']);

      let errorMessage = 'Username atau password salah.';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Koneksi timeout. Pastikan server berjalan.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Tidak dapat terhubung ke server. Pastikan server berjalan dan alamat benar.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Login gagal', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.lottieContainer}>
          <LottieView
            source={foodAnimation}
            autoPlay
            loop
            style={styles.lottieAnimation}
            resizeMode="contain"
          />
        </View>

        <Animated.Text entering={FadeInDown.duration(600)} style={styles.title}>SaveBite</Animated.Text>

        <Animated.View entering={FadeInUp.delay(200).duration(400)} style={{ width: '100%' }}>
          <Controller
            control={control}
            name="username"
            rules={{ required: 'Username wajib diisi' }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Username"
                placeholderTextColor="#999"
                style={[styles.input, errors.username && styles.errorInput]}
                onChangeText={onChange}
                value={value}
                autoCapitalize="none"
              />
            )}
          />
          {errors.username && <Text style={styles.errorText}>{errors.username.message}</Text>}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(400)} style={{ width: '100%' }}>
          <Controller
            control={control}
            name="password"
            rules={{ required: 'Password wajib diisi' }}
            render={({ field: { onChange, value } }) => (
              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#999"
                  style={[styles.passwordInput, errors.password && styles.errorInput]}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={24} 
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            )}
          />
          {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).duration(400)} style={{ width: '100%' }}>
          {loading ? (
            <ActivityIndicator size="large" color="#388e3c" style={{ marginTop: 16 }} />
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        <Animated.View entering={FadeIn.delay(500).duration(500)} style={styles.registerContainer}>
          <Text style={styles.text}>Belum punya akun?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerText}> Daftar</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.Text entering={FadeIn.delay(700).duration(600)} style={styles.copyright}>
          © 2025 SaveBite. All rights reserved.
        </Animated.Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f9f1',
  },
  scrollContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  lottieContainer: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    zIndex: -1,
  },
  lottieAnimation: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#388e3c',
    marginBottom: 32,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 16,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  errorInput: {
    borderColor: '#f44336',
  },
  errorText: {
    color: '#f44336',
    alignSelf: 'flex-start',
    marginBottom: 12,
    fontSize: 13,
  },
  button: {
    backgroundColor: '#388e3c',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    marginTop: 24,
    alignItems: 'center',
  },
  text: {
    color: '#666',
    fontSize: 14,
  },
  registerText: {
    color: '#388e3c',
    fontSize: 14,
    fontWeight: '600',
  },
  copyright: {
    color: '#999',
    fontSize: 12,
    marginTop: 32,
  },
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  eyeIcon: {
    padding: 10,
  },
});

export default LoginScreen;
