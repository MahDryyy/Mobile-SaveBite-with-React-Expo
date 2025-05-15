import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit'; 
import axios from 'axios';

const AdminHomeScreen = ({ navigation }: any) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loginData, setLoginData] = useState<number[]>([]); 
  const [loading, setLoading] = useState<boolean>(true); 

  const checkTokenAndRole = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const role = await AsyncStorage.getItem('userRole');

      if (!token) {
        Alert.alert('Akses Ditolak', 'Anda harus login terlebih dahulu.');
        navigation.navigate('Login');
        return;
      }

      if (role !== 'admin') {
        Alert.alert('Akses Ditolak', 'Anda tidak memiliki hak akses sebagai admin.');
        navigation.navigate('Login');
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Terjadi kesalahan saat memverifikasi token dan peran', error);
      Alert.alert('Error', 'Terjadi kesalahan saat memverifikasi peran Anda.');
    }
  };

  const fetchLoginData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken'); 

     
      const response = await axios.get('https://reactgo-production-68cd.up.railway.app/login-logs', {
        headers: {
          Authorization: `Bearer ${token}`,  
        },
      });

      console.log('Login Data:', response.data); 

      if (response.data && response.data.login_logs) {
       
        const dailyLogins = processLoginLogs(response.data.login_logs);
        setLoginData(dailyLogins);
      } else {
        setLoginData([]); 
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching login data', error);
      Alert.alert('Error', 'Terjadi kesalahan saat mengambil data login.');
      setLoading(false); 
    }
  };

  const processLoginLogs = (logs: any[]) => {
    const loginCounts = new Array(7).fill(0);
    logs.forEach((log) => {
      const loginDate = new Date(log.LoginTime);
      const dayOfWeek = loginDate.getDay();
      loginCounts[dayOfWeek] += 1;
    });
    return loginCounts;
  };

  useEffect(() => {
    checkTokenAndRole();
    fetchLoginData(); 
  }, []);

  if (!isAdmin) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.title}>Anda tidak memiliki hak akses admin untuk mengakses halaman ini.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#6200ea" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Admin Dashboard</Text>


      <View style={styles.cardContainer}>
        <Text style={styles.chartTitle}>Jumlah Login Harian</Text>
        <LineChart
          data={{
            labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
            datasets: [
              {
                data: loginData,
              },
            ],
          }}
          width={350} 
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: '#f7f7f7',
            backgroundGradientFrom: '#f7f7f7',
            backgroundGradientTo: '#f7f7f7',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(56, 102, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
              paddingRight: 20,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#ffa726',
            },
          }}
          bezier
        />
      </View>

    
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('UserList')}>
          <Text style={styles.buttonText}>Daftar Pengguna</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('LoginLogs')}>
          <Text style={styles.buttonText}>Login Logs</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',  
    alignItems: 'center',      
    backgroundColor: '#f4f4f9',
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center', 
    alignItems: 'center',     
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6200ea',
    marginBottom: 20,
    textAlign: 'center',
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 30,
    alignItems: 'center',
    width: '90%',  
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 40,
    width: '100%',
  },
  button: {
    backgroundColor: '#6200ea',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 8,
    width: '45%',
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminHomeScreen;
