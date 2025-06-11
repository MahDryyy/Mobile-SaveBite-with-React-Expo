import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

// 1. Minta izin notifikasi dari user
export async function requestNotificationPermission() {
  const settings = await Notifications.getPermissionsAsync();
  if (!settings.granted) {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin ditolak', 'Aplikasi tidak bisa mengirim notifikasi');
    }
  }
}

// 2. Jadwalkan satu notifikasi makanan
export async function scheduleFoodReminder(foodName: string, expiryDate: string) {
  const expireTime = new Date(expiryDate);
  const oneDayBefore = new Date(expireTime);
  oneDayBefore.setDate(oneDayBefore.getDate() - 1);
  oneDayBefore.setHours(9, 0, 0); // 09:00 pagi

  if (oneDayBefore <= new Date()) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Reminder Makanan',
      body: `${foodName} akan kadaluarsa besok!`,
      sound: true,
    },
    trigger: {
      type: 'date',
      date: oneDayBefore,
    } as Notifications.DateTriggerInput // ✅ assertion untuk validasi TypeScript
  });
}

// 3. Jadwalkan semua makanan sekaligus
export async function scheduleAllReminders(
  foods: { name: string; expiry_date: string }[]
) {
  for (const food of foods) {
    await scheduleFoodReminder(food.name, food.expiry_date);
  }
}

// 4. Batalkan semua notifikasi
export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
