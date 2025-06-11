import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import animasi from '../../assets/animasion/first.json'


type RootStackParamList = {
    Login: undefined;
    Register: undefined;
}

const { width } = Dimensions.get('window');

const FirstScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const gologin = () => {
        navigation.navigate('Login')
    };

    const goRegister = () => {
        navigation.navigate('Register')
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome To Savebite</Text>
                    <Text style={styles.subtitle}>Save Food, For You Life</Text>
                </View>

                <LottieView 
                    style={styles.animasi}
                    source={animasi}
                    autoPlay
                    loop
                    resizeMode='contain'
                />

                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={styles.loginButton}
                        onPress={goRegister}
                    >
                        <Text style={styles.buttonText}>Sing Up</Text>
                    </TouchableOpacity>
                    <Text style={styles.text}>Already have an account? <Text style={styles.loginText} onPress={gologin}>Sing In</Text></Text>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f9f1',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        paddingVertical: 40,
    },
    header: {
        alignItems: 'center',
        marginTop: 20,
        fontFamily: 'Poppins-Bold',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 8,
    },
    animasi: {
        width: width * 0.7,
        height: width * 0.7,
        alignSelf: 'center',
    },
    buttonContainer: {
        gap: 15,
        marginTop: 20,
        paddingHorizontal: 20,
    },
    loginButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        elevation: 3,

    },
    text: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    loginText: {
        color: '#4CAF50',
    },
    buttonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
    registerText: {
        color: '#4CAF50',
    }
})

export default FirstScreen; 