import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  FadeInDown,
  FadeInUp,
  interpolate,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import foodAnimation from '../../assets/animasion/icon.json';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../lib/api';
const { width } = Dimensions.get('window');

type RootStackParamList = {
  Home: undefined;
  Foods: undefined;
  AddFood: undefined;
  History: undefined;
  FertilizerHistory: undefined;
  Login: undefined; // Pastikan Login ada di navigator
};

const icon = () => {
  return (
    <View style={styles.iconContainer}>
      <LottieView
        source={foodAnimation}
        autoPlay
        loop
        style={styles.icon}
      />
    </View>
  );
};

const StatCard = ({ title, value, icon, color, subtitle }: { 
  title: string; 
  value: number; 
  icon: string; 
  color: string; 
  subtitle?: string;
}) => (
  <Animated.View entering={FadeInUp.duration(600)} style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={styles.statHeader}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
    <Text style={styles.statTitle}>{title}</Text>
    {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
  </Animated.View>
);


type MaterialIconName = 'restaurant-menu' | 'add-circle-outline' | 'history' | 'eco';

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // State
  const [title, setTitle] = useState<'Expired' | 'Waste' | 'SaveBite'>('Expired');
  const [clickCount, setClickCount] = useState(0);
  const [currentDate, setCurrentDate] = useState('');
  const [message, setMessage] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [messages, setMessages] = useState<Array<{
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
  }>>([]);
  const [statistics, setStatistics] = useState({
    totalFoods: 0,
    totalRecipes: 0,
    totalFertilizers: 0,
    expiredFoods: 0,
    warningFoods: 0,
    freshFoods: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);


  const backgroundAnim = useSharedValue(0);
  const titleScale = useSharedValue(1);
  const titleTranslateY = useSharedValue(0);
  const lightOpacity = useSharedValue(0);
  const lightScale = useSharedValue(1);


  useEffect(() => {
    const date = new Date();
    setCurrentDate(date.toLocaleDateString());
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setStatsLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      // Fetch all data in parallel
      const [foodsResponse, recipesResponse, fertilizersResponse] = await Promise.all([
        axios.get(`${BASE_URL}/foods`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${BASE_URL}/recipes`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${BASE_URL}/fertilizers`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const foods = foodsResponse.data || [];
      const recipes = recipesResponse.data || [];
      const fertilizers = fertilizersResponse.data || [];

      // Calculate food status counts
      let expiredCount = 0;
      let warningCount = 0;
      let freshCount = 0;

      foods.forEach((food: any) => {
        if (food.expiry_date) {
          const today = new Date();
          const expiry = new Date(food.expiry_date);
          const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilExpiry < 0) {
            expiredCount++;
          } else if (daysUntilExpiry <= 3) {
            warningCount++;
          } else {
            freshCount++;
          }
        } else {
          freshCount++;
        }
      });

      setStatistics({
        totalFoods: foods.length,
        totalRecipes: recipes.length,
        totalFertilizers: fertilizers.length,
        expiredFoods: expiredCount,
        warningFoods: warningCount,
        freshFoods: freshCount
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setStatsLoading(false);
    }
  };
  useEffect(() => {
    backgroundAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 8000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);


  useEffect(() => {
    if (title === 'SaveBite') {
      lightOpacity.value = withSequence(
        withTiming(1, { duration: 400 }),
        withDelay(800, withTiming(0, { duration: 400 }))
      );
      lightScale.value = withSequence(
        withTiming(1.4, { duration: 800, easing: Easing.out(Easing.exp) }),
        withDelay(800, withTiming(1, { duration: 400 }))
      );
    } else {
      lightOpacity.value = withTiming(0, { duration: 400 });
    }
  }, [title]);

  
  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: interpolate(backgroundAnim.value, [0, 1], [0.15, 0.4]),
    transform: [
      {
        translateY: interpolate(backgroundAnim.value, [0, 1], [-40, 40]),
      },
    ],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: titleScale.value },
      { translateY: titleTranslateY.value },
    ],
    opacity: title === 'SaveBite' ? 1 : 0.9,
  }));

  const lightAnimatedStyle = useAnimatedStyle(() => ({
    opacity: lightOpacity.value,
    transform: [{ scale: lightScale.value }],
  }));

 
  const handleClick = () => {
    if (clickCount === 0) {
      setTitle('Waste');
      titleTranslateY.value = withSequence(
        withTiming(-30, { duration: 300, easing: Easing.out(Easing.bounce) }),
        withTiming(0, { duration: 300, easing: Easing.out(Easing.elastic(1)) })
      );
      titleScale.value = withSequence(
        withTiming(1.5, { duration: 200 }),
        withTiming(1, { duration: 200 })
      );
    } else if (clickCount === 1) {
      setTitle('SaveBite');
      titleScale.value = withSequence(
        withTiming(1.3, { duration: 400 }),
        withTiming(1, { duration: 400 })
      );
    } else {
      setTitle('Expired');
    }
    setClickCount((prev) => (prev + 1) % 3);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.post(
        `${BASE_URL}/chat`,
        { message: message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.response) {
        const cleanResponse = response.data.response.replace(/[#*]/g, '');
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          text: cleanResponse,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Gagal mengirim pesan' 
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

 
  const navItems: { icon: MaterialIconName; label: string; screen: keyof RootStackParamList }[] = [
    { icon: 'restaurant-menu', label: 'Foods', screen: 'Foods' },
    { icon: 'add-circle-outline', label: 'Add Food', screen: 'AddFood' },
    { icon: 'history', label: 'History Resep', screen: 'History' },
    { icon: 'eco', label: 'History Pupuk', screen: 'FertilizerHistory' },
  ];

  const renderMessage = (msg: any) => (
    <View key={msg.id} style={[
      styles.messageContainer,
      msg.isUser ? styles.userMessageContainer : styles.aiMessageContainer
    ]}>
      {!msg.isUser && (
        <View style={styles.aiIconSmall}>
          <Text style={styles.aiIconText}>🤖</Text>
        </View>
      )}
      <View style={[
        styles.messageBubble,
        msg.isUser ? styles.userBubble : styles.aiBubble
      ]}>
        <Text style={[
          styles.messageText,
          msg.isUser ? styles.userMessageText : styles.aiMessageText
        ]}>{msg.text}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f9f1" />
      <Animated.View style={[styles.animatedBackground, backgroundStyle]} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
              <Text style={styles.headerText}> SaveBite</Text>
            </TouchableOpacity>

            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>{currentDate}</Text>
            </View>
          </Animated.View>

          {title === 'SaveBite' && (
            <Animated.View style={[styles.lightEffect, lightAnimatedStyle]} />
          )}

          <Animated.View style={titleAnimatedStyle}>
            <Text style={styles.title} onPress={handleClick}>
              {title === 'SaveBite' && icon()}
              {title}
            </Text>
          </Animated.View>

          {/* Statistics Section */}
          <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.statsSection}>
            <View style={styles.statsHeader}>
              <Text style={styles.statsTitle}>📊 Statistik Anda</Text>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={fetchStatistics}
                activeOpacity={0.7}
              >
                <MaterialIcons name="refresh" size={20} color="#4caf50" />
              </TouchableOpacity>
            </View>
            {statsLoading ? (
              <View style={styles.statsLoading}>
                <ActivityIndicator size="small" color="#4caf50" />
                <Text style={styles.statsLoadingText}>Memuat data...</Text>
              </View>
            ) : (
              <View style={styles.statsGrid}>
                <StatCard
                  title="Total Makanan"
                  value={statistics.totalFoods}
                  icon="🍽️"
                  color="#4caf50"
                  subtitle={`${statistics.freshFoods} segar, ${statistics.warningFoods} warning, ${statistics.expiredFoods} expired`}
                />
                <StatCard
                  title="Resep Dibuat"
                  value={statistics.totalRecipes}
                  icon="🍳"
                  color="#ff9800"
                />
                <StatCard
                  title="Pupuk Dibuat"
                  value={statistics.totalFertilizers}
                  icon="🌱"
                  color="#8bc34a"
                />
              </View>
            )}
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300).duration(600)} style={styles.navCard}>
            {navItems.map(({ icon, label, screen }, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.navButton}
                onPress={() => navigation.navigate(screen)}
                activeOpacity={0.7}
              >
                <MaterialIcons name={icon} size={24} color="#fff" />
                <Text style={styles.buttonText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.cardInfo}>
            <Text style={styles.extraTitle}>🍽️ Tips Anti Food Waste</Text>
            <Text style={styles.extraText}>• Rencanakan menu & belanja bijak</Text>
            <Text style={styles.extraText}>• Simpan sisa makanan dengan baik</Text>
            <Text style={styles.extraText}>• Konsumsi sesuai prioritas tanggal</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(500).duration(600)} style={styles.cardInfoAlt}>
            <Text style={styles.extraTitle}>💬 Kata Mereka</Text>
            <Text style={styles.extraText}>
              "Sejak pakai SaveBite, tidak ada lagi makanan mubazir di rumah saya!"
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(600).duration(600)} style={styles.footer}>
            <Text style={styles.footerText}>© 2025 SaveBite. All rights reserved By MocaByte.</Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating AI Button */}
      <TouchableOpacity
        style={styles.aiButton}
        onPress={() => setShowChatModal(true)}
      >
        <Text style={styles.aiButtonText}>AI</Text>
      </TouchableOpacity>

      {/* Chat Modal */}
      <Modal
        visible={showChatModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowChatModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={styles.chatModal}>
            <View style={styles.chatHeader}>
              <View style={styles.chatHeaderContent}>
                <View style={styles.aiIconContainer}>
                  <Text style={styles.aiIcon}>🤖</Text>
                </View>
                <View>
                  <Text style={styles.chatTitle}>SaveBite Assistant</Text>
                  <Text style={styles.chatSubtitle}>
                    Tanyakan seputar penyimpanan dan ketahanan makanan anda
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowChatModal(false);
                  setMessages([]);
                }}
              >
                <MaterialIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView
              ref={scrollViewRef}
              style={styles.chatContent}
              contentContainerStyle={styles.chatContentContainer}
            >
              {messages.length === 0 ? (
                <View style={styles.messageContainer}>
                  <View style={styles.aiIconSmall}>
                    <Text style={styles.aiIconText}>🤖</Text>
                  </View>
                  <View style={[styles.messageBubble, styles.aiBubble]}>
                    <Text style={[styles.messageText, styles.aiMessageText]}>
                      Halo! 👋 Selamat datang di SaveBite Assistant.{'\n\n'}
                      Saya siap membantu Anda dengan informasi tentang:{'\n'}
                      • Cara menyimpan makanan dengan benar{'\n'}
                      • Tips menjaga ketahanan makanan{'\n'}
                      • Informasi masa kadaluarsa{'\n'}
                      • Cara menghindari makanan terbuang{'\n\n'}
                      Silakan tanyakan apa saja tentang makanan Anda! 😊
                    </Text>
                  </View>
                </View>
              ) : (
                messages.map(msg => renderMessage(msg))
              )}
            </ScrollView>

            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.chatInput}
                  placeholder="Tulis pesan..."
                  placeholderTextColor="#999"
                  value={message}
                  onChangeText={setMessage}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.sendButton, { opacity: message.trim() ? 1 : 0.7 }]}
                  onPress={handleSendMessage}
                  disabled={!message.trim() || isLoading}
                >
                  <Text style={styles.sendButtonText}>Kirim</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  icon: {
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f9f1',
  },
  animatedBackground: {
    position: 'absolute',
    top: -60,
    left: width / 4,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#a5d6a7',
    zIndex: -5,
  },
  scrollContainer: {
    alignItems: 'center',
    paddingBottom: 60,
  },
  header: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4e7d32',
  },
  dateContainer: {
    backgroundColor: 'rgba(56, 142, 60, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#2e7d32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  title: {
    fontSize: 52,
    fontWeight: '900',
    color: '#1e7d32',
    backgroundColor: '#e8f5e9',
    paddingVertical: 20,
    paddingHorizontal: 36,
    borderRadius: 40,
    marginVertical: 28,
    textAlign: 'center',
    elevation: 6,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightEffect: {
    position: 'absolute',
    top: 110,
    left: width / 2 - 100,
    width: 200,
    height: 200,
    backgroundColor: 'rgba(76, 175, 80, 0.4)',
    borderRadius: 100,
    zIndex: -1,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
  },
  navCard: {
    backgroundColor: '#4caf50',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 12,
    width: '90%',
    elevation: 6,
    marginBottom: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#388e3c',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 14,
  },
  cardInfo: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 22,
    marginTop: 16,
    width: '90%',
    elevation: 4,
  },
  cardInfoAlt: {
    backgroundColor: '#e8f5e9',
    borderRadius: 20,
    padding: 22,
    marginTop: 14,
    width: '90%',
    elevation: 3,
  },
  extraTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2e7d32',
    marginBottom: 12,
  },
  extraText: {
    fontSize: 17,
    color: '#555',
    marginBottom: 8,
  },
  footer: {
    marginTop: 48,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#888',
  },
  chatSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    marginVertical: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chatTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  chatSubtitle: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    paddingBottom: Platform.OS === 'ios' ? 30 : 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#000000',
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#8BC34A',
    borderRadius: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  responseContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  responseText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  aiButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 70,
    height: 70,
    borderRadius: 25,
    backgroundColor: 'rgba(56, 142, 60, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  aiButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatModal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatHeader: {
    backgroundColor: '#4CAF50',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  chatHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiIcon: {
    fontSize: 24,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: Platform.OS === 'ios' ? 50 : 16,
    padding: 4,
  },
  chatContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatContentContainer: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
    marginLeft: 50,
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
    marginRight: 50,
  },
  aiIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  aiIconText: {
    fontSize: 16,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    maxWidth: '100%',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  userBubble: {
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#F5F5F5',
    borderBottomLeftRadius: 4,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: '#000000',
  },
  inputWrapper: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  statsSection: {
    width: '90%',
    marginBottom: 20,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2e7d32',
  },
  refreshButton: {
    backgroundColor: '#f0f8f0',
    padding: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  statsLoadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
});
