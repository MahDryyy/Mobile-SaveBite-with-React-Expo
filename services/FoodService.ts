import AsyncStorage from '@react-native-async-storage/async-storage';

// Ambil makanan dari backend dengan token user
export async function getFoodsWithToken(): Promise<{ name: string; expiry_date: string }[]> {
  try {
    const token = await AsyncStorage.getItem('userToken');

    const response = await fetch('https://reactgo-production-68cd.up.railway.app/foods', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Gagal mengambil data makanan');
      return [];
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Error fetching foods:', err);
    return [];
  }
}
