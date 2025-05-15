import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  Home: undefined;
  Foods: undefined;
  AddFood: undefined;
  History: undefined;
};

const { height } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const ufoTranslate = useRef(new Animated.Value(-height)).current;
  const ufo = useRef(new Animated.Value(0)).current;
  const cahayaOpacity = useRef(new Animated.Value(0)).current;
  const cahayaScale = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current; // For scaling effect
  const [title, setTitle] = useState('❌ Expired ❌');
  const [clickCount, setClickCount] = useState(0);
  const [showCahaya, setShowCahaya] = useState(false);
  const [isSaveBiteClicked, setIsSaveBiteClicked] = useState(false); 
  const [fadeAnim] = useState(new Animated.Value(1)); 

  useEffect(() => {
    if (title === '🌿SaveBite') {
      setIsSaveBiteClicked(true); 
      setShowCahaya(true);
      cahayaOpacity.setValue(0);
      ufoTranslate.setValue(-height);
      ufo.setValue(0);
      Animated.sequence([
        Animated.timing(cahayaOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cahayaScale, {
          toValue: 1.4,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(ufoTranslate, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
            easing: Easing.out(Easing.exp),
          }),
          Animated.timing(ufo, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(cahayaOpacity, {
          toValue: 0,
          duration: 400,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setShowCahaya(false));
    }
  }, [title]);

  const handleClick = () => {
    if (isSaveBiteClicked) return; 

    if (clickCount === 0) {
      setTitle('❌ Waste ❌');
      Animated.sequence([
       
        Animated.timing(ufoTranslate, {
          toValue: -height / 2, 
          duration: 500,
          useNativeDriver: true,
          easing: Easing.bounce, 
        }),
       
        Animated.timing(scaleAnim, {
          toValue: 1.5, 
          duration: 200,
          useNativeDriver: true,
        }),
      
        Animated.timing(ufoTranslate, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.elastic(1), 
        }),
      
        Animated.timing(scaleAnim, {
          toValue: 1, 
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (clickCount === 1) {
      setTitle('🌿SaveBite');
    } else {
      setTitle('❌ Expired ❌');
      setShowCahaya(false);
    }
    setClickCount((prev) => (prev + 1) % 3);
  };

  const animatedStyle = title === '🌿SaveBite'
    ? {
        transform: [{ translateY: ufoTranslate }, { scale: scaleAnim }],
        opacity: ufo,
      }
    : {
        opacity: fadeAnim, // fade effect
      };

  return (
    <View style={styles.container}>
      {showCahaya && (
        <Animated.View
          style={[styles.cahaya, {
            opacity: cahayaOpacity,
            transform: [{ scale: cahayaScale }],
          }]}
        />
      )}

      <Animated.Text
        style={[styles.title, animatedStyle]}
        onPress={handleClick}
      >
        {title}
      </Animated.Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Foods')}
      >
        <Text style={styles.buttonText}>Go to Foods</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button]}
        onPress={() => navigation.navigate('AddFood')}
      >
        <Text style={styles.buttonText}>Add Food</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button]}
        onPress={() => navigation.navigate('History')}
      >
        <Text style={styles.buttonText}>View History</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5ed56',
    paddingTop: 40,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#14cc2d',
    fontFamily: 'Roboto',
    textAlign: 'center',
    marginBottom: 40,
    zIndex: 2,
  },
  cahaya: {
    position: 'absolute',
    top: 0,
    width: 200,
    height: '100%',
    backgroundColor: 'rgba(4, 255, 255, 0.81)',
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    zIndex: 0,
    shadowColor: '#00fff7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 60,
    elevation: 20,
  },
  button: {
    backgroundColor: '#6200ea',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6200ea',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
