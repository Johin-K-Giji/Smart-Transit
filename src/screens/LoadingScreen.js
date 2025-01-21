import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Text, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LoadingScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  
  // Dot animation for loading dots
  const dot1 = new Animated.Value(0);
  const dot2 = new Animated.Value(0);
  const dot3 = new Animated.Value(0);

  // Animation for dots
  const animateDots = (dot) => {
    Animated.sequence([
      Animated.timing(dot, {
        toValue: 1,
        duration:1111,
        useNativeDriver: true,
      }),
      Animated.timing(dot, {
        toValue: 0,
        duration: 1111,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    // Start the dot animations
    animateDots(dot1);
    animateDots(dot2);
    animateDots(dot3);

    // Simulate loading delay and navigate to HomeScreen after 2 seconds
    setTimeout(() => {
      setLoading(false); 
      navigation.navigate('HomeScreen'); 
    }, 2000);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Logo with background */}
      <View style={styles.logoContainer}>
        <View style={styles.logoBackground}>
          <Image source={require('../../assets/images/Main-logo.png')} style={styles.logo} />
        </View>
      </View>

      {/* Custom Dot Loading Animation */}
      {loading && (
        <View style={styles.loader}>
          <Animated.Text style={[styles.dot, { opacity: dot1 }]}>.</Animated.Text>
          <Animated.Text style={[styles.dot, { opacity: dot2 }]}>.</Animated.Text>
          <Animated.Text style={[styles.dot, { opacity: dot3 }]}>.</Animated.Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#31473A', // Dark green background
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40, // Space between logo and spinner
  },
  logoBackground: {
    backgroundColor: '#FFFFFF', // White background for logo
    padding: 20, // Space around the logo
    borderRadius: 15, // Rounded corners
  },
  logo: {
    width: 200, // Logo width
    height: 200, // Logo height
    resizeMode: 'contain', // Maintain aspect ratio
  },
  loader: {
    flexDirection: 'row', // Arrange dots horizontally
    marginTop: 20, // Space between logo and dots
  },
  dot: {
    fontSize: 40, // Size of the dot
    color: '#FFFFFF', // Dot color
    marginHorizontal: 5, // Space between dots
  },
});

export default LoadingScreen;
