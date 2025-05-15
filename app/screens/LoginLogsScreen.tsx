import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginLogsScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [loginLogs, setLoginLogs] = useState<any[]>([]);

  const fetchLoginLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://reactgo-production-68cd.up.railway.app/login-logs', {
        headers: {
          Authorization: 'Bearer ' + await AsyncStorage.getItem('userToken')
        }
      });

    
      if (response.data && response.data.login_logs) {
        setLoginLogs(response.data.login_logs);
      } else {
        setLoginLogs([]); 
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Gagal mengambil login logs');
    }
  };

  useEffect(() => {
    fetchLoginLogs();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Login Logs</Text>

   
      {loginLogs.length > 0 ? (
        <View style={styles.dataContainer}>
          {loginLogs.map((log) => (
            <View key={log.ID} style={styles.dataItem}>
              <Text style={styles.logText}>ID: <Text style={styles.boldText}>{log.ID}</Text></Text>
              <Text style={styles.logText}>Username: <Text style={styles.boldText}>{log.Username}</Text></Text>
              <Text style={styles.logText}>Waktu Login: <Text style={styles.boldText}>{log.LoginTime}</Text></Text>
              <Text style={styles.logText}>Alamat IP: <Text style={styles.boldText}>{log.IPAddress}</Text></Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noDataText}>Tidak ada login logs yang tersedia.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f9',
    paddingTop: 50, 
  },
  backButton: {
    backgroundColor: '#6200ea',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    position: 'absolute', 
    top: 20,
    left: 20,
    zIndex: 1, 
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#6200ea',
    marginBottom: 20,
    textAlign: 'center',
  },
  dataContainer: {
    marginTop: 20,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dataItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  logText: {
    fontSize: 16,
    color: '#333',
  },
  boldText: {
    fontWeight: 'bold',
  },
  noDataText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default LoginLogsScreen;
