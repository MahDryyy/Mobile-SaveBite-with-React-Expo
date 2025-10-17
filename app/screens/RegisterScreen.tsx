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
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import foodAnimation from '../../assets/animasion/regis.json';
import { BASE_URL } from '../../lib/api';
type FormData = {
  username: string;
  email: string;
  password: string;
};

const RegisterScreen = ({ navigation }: any) => {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    
    const registrationData = {
      username: data.username.trim(),
      email: data.email.trim(),
      password: data.password.trim(),
      role: 'user',
    };

    console.log('Attempting registration:', {
      username: registrationData.username,
      email: registrationData.email,
    });
      console.log('API URL:', `${BASE_URL}/register`);

    try {
      console.log('Sending registration request...');
      const response = await axios.post(`${BASE_URL}/register`, 
        registrationData,
        {
        headers: {
          'Content-Type': 'application/json',
        },
          timeout: 10000, // 10 second timeout
        }
      );

      console.log('Registration response:', {
        status: response.status,
        data: response.data,
      });

      Alert.alert('Registrasi berhasil', 'Silakan login dengan akun Anda');
      navigation.navigate('Login');
    } catch (error: any) {
      console.error('Registration error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
        }
      });

      let errorMessage = 'Gagal mendaftar. Coba lagi.';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Koneksi timeout. Pastikan server berjalan.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Tidak dapat terhubung ke server. Pastikan server berjalan dan alamat benar.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      Alert.alert('Gagal', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
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

        <Animated.Text entering={FadeInDown.duration(600)} style={styles.title}>Buat Akun SaveBite</Animated.Text>

        <Animated.View entering={FadeInUp.delay(100).duration(400)} style={{ width: '100%' }}>
          <Controller
            control={control}
            name="username"
            rules={{ 
              required: 'Username wajib diisi',
              minLength: { value: 3, message: 'Username minimal 3 karakter' }
            }}
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

        <Animated.View entering={FadeInUp.delay(200).duration(400)} style={{ width: '100%' }}>
          <Controller
            control={control}
            name="email"
            rules={{
              required: 'Email wajib diisi',
              pattern: {
                value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: 'Format email tidak valid',
              },
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Email"
                placeholderTextColor="#999"
                style={[styles.input, errors.email && styles.errorInput]}
                onChangeText={onChange}
                value={value}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            )}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(400)} style={{ width: '100%' }}>
          <Controller
            control={control}
            name="password"
            rules={{
              required: 'Password wajib diisi',
              minLength: { value: 8, message: 'Password minimal 8 karakter' },
              pattern: {
                value: /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}[\]:;<>,.?/~`\-=])/,
                message: 'Password harus memiliki huruf besar dan simbol'
              }
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Password"
                placeholderTextColor="#999"
                style={[styles.input, errors.password && styles.errorInput]}
                onChangeText={onChange}
                value={value}
                secureTextEntry
                autoCapitalize="none"
              />
            )}
          />
          {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).duration(400)} style={{ width: '100%' }}>
          {loading ? (
            <ActivityIndicator size="large" color="#388e3c" style={{ marginTop: 16 }} />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
              <Text style={styles.buttonText}>Daftar</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        <Animated.View entering={FadeIn.delay(500).duration(500)} style={styles.loginContainer}>
          <Text style={styles.text}>Sudah punya akun?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}> Masuk</Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#388e3c',
    marginBottom: 32,
  },
  lottieContainer: {
    width: '100%',
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    zIndex: -1,
  },
  lottieAnimation: {
    width: '80%',
    height: '100%',
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
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#388e3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    marginTop: 24,
  },
  text: {
    fontSize: 15,
    color: '#555',
  },
  loginText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#388e3c',
  },
  copyright: {
    fontSize: 12,
    color: '#999',
    marginTop: 40,
    textAlign: 'center',
  },
});

export default RegisterScreen;
