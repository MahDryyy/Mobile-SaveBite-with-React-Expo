import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  Easing,
  withRepeat,
  withTiming,
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

type FormData = {
  username: string;
  password: string;
};

const LoginScreen = ({ navigation }: any) => {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [loading, setLoading] = useState(false);

  const size = 256;
  const screenWidth = 400;

  const r = useSharedValue(0);
  const movement = useSharedValue(-size);

  const animatedCircleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: movement.value },
      ],
    };
  });

  useEffect(() => {
    movement.value = withRepeat(
      withTiming(screenWidth + size, {
        duration: 3000,
        easing: Easing.linear,
      }),
      -1,
      true
    );
  }, [movement, screenWidth, size]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    const username = data.username.trim();
    const password = data.password.trim();

    try {
      const response = await axios.post('https://reactgo-production-68cd.up.railway.app/login', {
        username,
        password,
      });

      const { token, role } = response.data;

      if (role === 'admin') {
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userRole', role);
        Alert.alert('Login berhasil', 'Welcome Admin!');
        navigation.navigate('AdminHome');
      } else {
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userRole', role);
        Alert.alert('Login berhasil', 'Welcome User!');
        navigation.navigate('Home');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Login gagal', 'Username atau password salah.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View style={[styles.canvas, animatedCircleStyle]}>
          <View style={styles.circle} />
        </Animated.View>

        <Text style={styles.title}>Login</Text>

        <Controller
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.input, errors.username && styles.errorInput]}
              placeholder="Username"
              value={value}
              onChangeText={onChange}
            />
          )}
          name="username"
          rules={{ required: 'Username is required' }}
        />
        {errors.username && (
          <Text style={styles.errorText}>{errors.username.message}</Text>
        )}

        <Controller
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.input, errors.password && styles.errorInput]}
              placeholder="Password"
              secureTextEntry
              value={value}
              onChangeText={onChange}
            />
          )}
          name="password"
          rules={{ required: 'Password is required' }}
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password.message}</Text>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.text}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerText}>Register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f9',
    padding: 20,
  },
  canvas: {
    position: 'absolute',
    top: '40%', 
    left: '30%',
    transform: [{ translateX: -128 }, { translateY: -128 }], 
    zIndex: -1,
  },
  circle: {
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: 'cyan',
  },
  scrollContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6200ea',
    marginBottom: 30,
  },
  input: {
    width: 300,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  errorInput: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#6200ea',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: 300,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
  },
  registerText: {
    fontSize: 16,
    color: '#6200ea',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
