import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { BASE_URL } from '../config/api';

type RootStackParamList = {
  Login: undefined;
  AdminHome: undefined;
};

type LoginLog = {
  id: number;
  username: string;
  email: string;
  role: string;
  login_time: string;
  ip_address: string;
};

const LoginLogsScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Token tidak ditemukan');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return;
      }

      console.log('Fetching logs with token:', token.substring(0, 20) + '...');
      
      const response = await axios.get(`${BASE_URL}/admin/logs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Raw response:', response);
      console.log('Response status:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));

      let logsData = response.data;

      
      if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data)) {
          logsData = response.data;
        } else if (response.data.logs) {
          logsData = response.data.logs;
        } else if (response.data.data) {
          logsData = response.data.data;
        } 
      }

      console.log('Processed logs data:', JSON.stringify(logsData, null, 2));

      if (Array.isArray(logsData)) {
        console.log(`Found ${logsData.length} logs`);
        
       
        const formattedLogs = logsData.map(log => ({
          id: log.id || Math.random(),
          username: log.username || '',
          email: log.email || '',
          role: log.role || '',
          login_time: log.login_time || '',
          ip_address: log.ip_address || ''
        }));

        console.log('Formatted logs:', JSON.stringify(formattedLogs, null, 2));
        setLogs(formattedLogs);
      } else {
        console.error('Invalid response format. Expected array, got:', typeof logsData);
        setLogs([]);
      }
    } catch (error: any) {
      console.error('Error fetching logs:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      if (error.response?.status === 403) {
        Alert.alert('Akses Ditolak', 'Anda tidak memiliki izin untuk melihat log login');
        navigation.goBack();
      } else {
        Alert.alert(
          'Error',
          error.response?.data?.error || 'Gagal mengambil data log login'
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  useEffect(() => {
    const checkAccess = async () => {
      const role = await AsyncStorage.getItem('userRole');
      console.log('Current user role:', role);
      if (!role || !['super_admin', 'admin_user'].includes(role)) {
        Alert.alert('Akses Ditolak', 'Anda tidak memiliki akses ke halaman ini');
        navigation.goBack();
        return;
      }
      fetchLogs();
    };
    checkAccess();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#388e3c" />
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).replace(/\./g, ':').replace(/\//g, '-');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const renderItem = ({ item }: { item: LoginLog }) => {
    if (!item) return null;
    
    return (
      <View style={styles.logCard}>
        <View style={styles.mainContent}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.email}>{item.email}</Text>
          <View style={styles.detailsRow}>
            <Text style={styles.timestamp}>{formatDate(item.login_time)}</Text>
            <Text style={styles.ipAddress}>IP: {item.ip_address}</Text>
          </View>
        </View>
        <View style={styles.roleContainer}>
          <Text style={styles.roleText}>{item.role}</Text>
        </View>
      </View>
    );
  };

  console.log(`Rendering ${logs.length} logs`);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Log Aktivitas Login</Text>
        </View>

        <FlatList
          data={logs}
          renderItem={renderItem}
          keyExtractor={(item) => `${item?.username}-${item?.login_time}`}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#388e3c']}
              tintColor="#388e3c"
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Tidak ada log login</Text>
              <Text style={styles.emptySubText}>Tarik ke bawah untuk memuat ulang</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#388e3c',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f9f1',
  },
  header: {
    backgroundColor: '#388e3c',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 20) + 10 : 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  mainContent: {
    flex: 1,
    marginRight: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#388e3c',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  ipAddress: {
    fontSize: 12,
    color: '#666',
  },
  roleContainer: {
    backgroundColor: '#388e3c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginBottom: 8,
  },
  emptySubText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
  },
});

export default LoginLogsScreen;
