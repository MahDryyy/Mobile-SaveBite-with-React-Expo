import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config/api';
type User = {
  id: number;
  username: string;
  email: string;
  role: string;
};

type RootStackParamList = {
  Login: undefined;
};

const ROLES = [
  { id: 2, value: 'admin_inventori', label: 'Admin Inventori' },
  { id: 3, value: 'admin_resep', label: 'Admin Resep' },
  { id: 4, value: 'admin_user', label: 'Admin User' },
  { id: 5, value: 'user', label: 'Regular User' },
];

const UserListScreen = ({ navigation }: any) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: number; username: string } | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      const role = await AsyncStorage.getItem('userRole');
      if (!role || !['super_admin', 'admin_user'].includes(role)) {
        Alert.alert('Akses Ditolak', 'Anda tidak memiliki akses ke halaman ini');
        navigation.goBack();
        return;
      }
      setUserRole(role);
      fetchUsers();
    };
    checkAccess();
  }, []);

  const fetchUsers = async () => {
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

      const response = await axios.get(`${BASE_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.users) {
        setUsers(response.data.users);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 403) {
        Alert.alert('Akses Ditolak', 'Anda tidak memiliki izin untuk melihat daftar user');
        navigation.goBack();
      } else {
        Alert.alert('Error', error.response?.data?.error || 'Gagal mengambil data user');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (userRole !== 'super_admin') {
      Alert.alert('Akses Ditolak', 'Hanya super admin yang dapat menghapus user');
      return;
    }

    Alert.alert(
      'Konfirmasi',
      `Apakah Anda yakin ingin menghapus user ${username}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              await axios.delete(`${BASE_URL}/admin/users/${userId}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              Alert.alert('Sukses', 'User berhasil dihapus');
              fetchUsers();
            } catch (error: any) {
              console.error('Error deleting user:', error);
              if (error.response?.status === 403) {
                Alert.alert('Akses Ditolak', 'Anda tidak memiliki izin untuk menghapus user');
              } else {
                Alert.alert('Error', error.response?.data?.error || 'Gagal menghapus user');
              }
            }
          },
        },
      ]
    );
  };

  const handlePromoteUser = async (userId: number, username: string) => {
    if (userRole !== 'super_admin') {
      Alert.alert('Akses Ditolak', 'Hanya super admin yang dapat mengubah role user');
      return;
    }

    // Get current user's ID from AsyncStorage
    const currentUserId = await AsyncStorage.getItem('userId');

    // Check if trying to modify own role
    if (currentUserId && parseInt(currentUserId) === userId) {
      Alert.alert('Akses Ditolak', 'Anda tidak dapat mengubah role diri sendiri');
      return;
    }

    // Check if target user is a super admin
    const targetUser = users.find(user => user.id === userId);
    if (targetUser?.role === 'super_admin') {
      Alert.alert('Akses Ditolak', 'Tidak dapat mengubah role Super Admin');
      return;
    }

    setSelectedUser({ id: userId, username });
    setShowRoleModal(true);
  };

  const handleRoleSelect = async (role: string) => {
    if (!selectedUser) return;

    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.post(
        `${BASE_URL}/admin/promote`,
        {
          target_user_id: selectedUser.id,
          new_role_name: role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Alert.alert('Sukses', 'Role user berhasil diubah');
      fetchUsers();
    } catch (error: any) {
      console.error('Error promoting user:', error);
      if (error.response?.status === 403) {
        Alert.alert('Akses Ditolak', 'Anda tidak memiliki izin untuk mengubah role user');
      } else {
        Alert.alert('Error', error.response?.data?.error || 'Gagal mengubah role user');
      }
    } finally {
      setShowRoleModal(false);
      setSelectedUser(null);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#388e3c" />
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <Text style={styles.role}>Role: {item.role}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.promoteButton]}
          onPress={() => handlePromoteUser(item.id, item.username)}
        >
          <Text style={styles.buttonText}>Ubah Role</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => handleDeleteUser(item.id, item.username)}
        >
          <Text style={styles.buttonText}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Manajemen User</Text>
        </View>

        <Modal
          visible={showRoleModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            setShowRoleModal(false);
            setSelectedUser(null);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Promosi User: {selectedUser?.username}
              </Text>
              <Text style={styles.modalSubtitle}>Pilih role baru:</Text>

              {ROLES.map((role) => (
                <TouchableOpacity
                  key={role.id}
                  style={styles.roleButton}
                  onPress={() => handleRoleSelect(role.value)}
                >
                  <Text style={styles.roleButtonText}>{role.label}</Text>
                  <Text style={styles.roleButtonSubtext}>{role.value}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <FlatList
          contentContainerStyle={styles.listContainer}
          data={users}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>Tidak ada user</Text>
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
  listContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userInfo: {
    marginBottom: 12,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#388e3c',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  role: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  promoteButton: {
    backgroundColor: '#388e3c',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: Dimensions.get('window').width * 0.9,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  roleButton: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#388e3c',
    marginBottom: 4,
  },
  roleButtonSubtext: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default UserListScreen;
