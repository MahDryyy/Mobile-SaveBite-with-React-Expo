import React, { useState , useEffect} from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import Animated, {
  Easing,
  withRepeat,
  withTiming,
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

type FormData = {
  username: string;
  email: string;
  password: string;
};

const RegisterScreen = ({ navigation }: any) => {
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
    try {
      const response = await axios.post('https://reactgo-production-68cd.up.railway.app/register', {
        username: data.username,
        email: data.email,
        password: data.password,
        role: 'user', 
      }, {
        headers: {
          'Content-Type': 'application/json',  
        }
      });

      Alert.alert('Registration successful');
      navigation.navigate('Login');
    } catch (error: any) {
      setLoading(false);
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      Alert.alert('Registration failed', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >


      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[styles.canvas, animatedCircleStyle]}>
                  <View style={styles.circle} />
        </Animated.View>
        
        <Text style={styles.title}>Register</Text>

        <Controller
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.username && styles.errorInput]}
              placeholder="Username"
              value={value}
              onChangeText={onChange}
            />
          )}
          name="username"
          rules={{ required: 'Username is required' }}
        />
        {errors.username && <Text style={styles.errorText}>{errors.username.message}</Text>}

        <Controller
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.email && styles.errorInput]}
              placeholder="Email"
              value={value}
              onChangeText={onChange}
            />
          )}
          name="email"
          rules={{
            required: 'Email is required',
            pattern: {
              value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
              message: 'Invalid email format',
            }
          }}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

        <Controller
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.password && styles.errorInput]}
              placeholder="Password"
              secureTextEntry
              value={value}
              onChangeText={onChange}
            />
          )}
          name="password"
          rules={{
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters long',
            },
          }}
        />
        {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

        {loading ? (
          <ActivityIndicator size="large" color="#6200ea" style={styles.loading} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        )}

        <View style={styles.loginContainer}>
          <Text style={styles.text}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Login</Text>
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
    flexGrow: 1,              
    justifyContent: 'center',  
    alignItems: 'center',     
    padding: 20,               
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6200ea',
    marginBottom: 30,
  },
  input: {
    width: '100%',
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
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#6200ea',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loading: {
    marginTop: 15,
  },
  loginContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
  },
  loginText: {
    fontSize: 16,
    color: '#6200ea',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
