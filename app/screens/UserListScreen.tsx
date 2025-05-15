import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserListScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://reactgo-production-68cd.up.railway.app/users', {
        headers: {
          Authorization: 'Bearer ' + await AsyncStorage.getItem('userToken')
        }
      });
      setUsers(response.data.users);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Gagal mengambil data pengguna');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <ScrollView style={styles.container}>
   
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Users</Text>

      {users.length > 0 ? (
        <View style={styles.dataContainer}>
          {users.map((user) => (
            <View key={user.id} style={styles.dataItem}>
              <Text style={styles.userText}>ID: <Text style={styles.boldText}>{user.id}</Text></Text>
              <Text style={styles.userText}>Username: <Text style={styles.boldText}>{user.username}</Text></Text>
              <Text style={styles.userText}>Role: <Text style={styles.boldText}>{user.role}</Text></Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noDataText}>Tidak ada data pengguna yang tersedia.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f9',
    paddingTop: 60, 
  },
  backButton: {
    backgroundColor: '#6200ea',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    position: 'absolute',
    top: 30, 
    left: 20, 
    zIndex: 1, 
    elevation: 4, 
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
  userText: {
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

export default UserListScreen;
