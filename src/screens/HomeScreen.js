import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Image, TouchableOpacity, Text, SafeAreaView, StatusBar, Animated, Dimensions } from 'react-native';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import * as Location from 'expo-location';
import axios from 'axios';
import Header from '../components/Header';
import { db } from '../Firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';

const HomeScreen = ({ navigation }) => {
  const [weather, setWeather] = useState(null);
  const [locationDetails, setLocationDetails] = useState(null);
  const [selectedMode, setSelectedMode] = useState('HomeScreen');
  const [buses, setBuses] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [darkMode, setDarkMode] = useState(true); // Dark mode state
  const [fadeAnim] = useState(new Animated.Value(0));

  const weatherIconMap = {
    Sunny: 'weather-sunny',
    'Partly cloudy': 'weather-partly-cloudy',
    Cloudy: 'weather-cloudy',
    Rain: 'weather-rainy',
    Thunderstorm: 'weather-lightning',
    Snow: 'weather-snowy',
    Fog: 'weather-fog',
  };

  // Fetch buses every minute
  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'buses'));
        const busesList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setBuses(busesList);
      } catch (error) {
        console.error('Error fetching buses:', error);
      }
    };

    fetchBuses();
    const interval = setInterval(fetchBuses, 60000); // Re-fetch buses every 1 minute
    return () => clearInterval(interval);
  }, []);

  // Fetch location and weather data
  useEffect(() => {
    const fetchLocationAndWeather = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permission to access location was denied');
          return;
        }

        const userLocation = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = userLocation.coords;

        const locationResponse = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (locationResponse.length > 0) {
          setLocationDetails(locationResponse[0]);
        }

        const weatherResponse = await axios.get(
          `http://api.weatherapi.com/v1/current.json?key=f3ff6d04c96747d9b68100825251201&q=${latitude},${longitude}&aqi=no`
        );
        setWeather(weatherResponse.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchLocationAndWeather();
  }, []);

  useEffect(() => {
    if (locationDetails) {
      const { formattedAddress } = locationDetails;
  
      // Remove extra commas properly before processing
      const addressParts = formattedAddress.split(',').map(part => part.trim());
  
      // Join back into a clean string and remove all commas before splitting words
      const relevantAddress = addressParts.slice(0, 7).join(' ').toLowerCase();
  
      // Now split into individual words properly
      const relevantWords = relevantAddress.replace(/,/g, '').split(/\s+/); 
  
      const filtered = buses.filter((bus) => {
        if (Array.isArray(bus.major_cities)) {
          const citiesArray = bus.major_cities.flatMap(city =>
            city.split(',').map(cityName => cityName.trim().toLowerCase())
          );
  
          const matches = relevantWords.some(word => citiesArray.includes(word));
          console.log(relevantWords, citiesArray);
  
          return matches;
        }
        return false;
      });
  
      setFilteredBuses(filtered);
    }
  }, [locationDetails, buses]);
  
  
  

  console.log("Location",locationDetails)
  const renderBusItem = ({ item }) => {
    const occupancyStyles = getOccupancyStyle(item.occupancy);
    const statusStyles = getBusStatusStyle(item.bus_status);

    return (
      <Animated.View style={[styles.busItem, occupancyStyles.background, { opacity: fadeAnim }]}>
        <View style={styles.busIconContainer}>
          <Image source={require('../../assets/images/Main-logo.png')} style={styles.busIcon} />
        </View>
        <View style={styles.busInfo}>
          <Text style={styles.busName}>{item.bus_name}</Text>
          <Text style={[styles.busText, occupancyStyles.text]}>Bus Number: {item.bus_number}</Text>
          <Text style={[styles.busText, occupancyStyles.text]}>Route: {item.route}</Text>
          <Text style={[styles.busText, occupancyStyles.text]}>Status: <Text style={statusStyles.statusText}>{item.status }</Text></Text>
          <Text style={[styles.seatStatus, occupancyStyles.text]}>
            {item.occupancy}
          </Text>
        </View>
        <TouchableOpacity
  style={styles.busArrow}
  onPress={() => navigation.navigate('MapScreen', { 
    busId: item.id, // Pass the bus_id to MapScreen
    busName: item.bus_name
  })}
>
  <FontAwesome name="map-marker" size={20} color="#FFFFFF" />
</TouchableOpacity>

      </Animated.View>
    );
  };

  const getOccupancyStyle = (occupancy) => {
    switch (occupancy) {
      case 'Overcrowded':
        return {
          background: { backgroundColor: '#D32F2F' },
          text: { color: '#FFFFFF' }
        };
      case 'Fully Seated':
        return {
          background: { backgroundColor: '#4CAF50' },
          text: { color: '#FFFFFF' }
        };
      case 'Less Busy':
        return {
          background: { backgroundColor: '#2196F3' },
          text: { color: '#FFFFFF' }
        };
      default:
        return {
          background: { backgroundColor: '#FFFFFF' },
          text: { color: '#000' }
        };
    }
  };

  const getBusStatusStyle = (status) => {
    switch (status) {
      case 'Running':
        return {
          statusText: { color: '#388E3C' }
        };
      case 'Breakdown':
        return {
          statusText: { color: '#B71C1C' }
        };
      case 'Delayed':
        return {
          statusText: { color: '#D84315' }
        };
      default:
        return {
          statusText: { color: '#FF6F00' }
        };
    }
  };

  // Dark/Light mode toggle
  const toggleMode = () => {
    setDarkMode(!darkMode);
  };

  // Fade-in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.darkMode]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} backgroundColor={darkMode ? "#212121" : "#FFFFFF"} />

      <Header
        weather={weather}
        locationDetails={locationDetails}
        weatherIconMap={weatherIconMap}
        selectedMode={selectedMode}
        onModeChange={setSelectedMode}
        navigation={navigation}
      />

      {/* Overlay Burger Menu and Dark Mode Toggle Button */}
      {/* <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuButton} onPress={toggleMode}>
          <FontAwesome5
            name={darkMode ? "moon" : "sun"}
            size={18}
            color={darkMode ? "#FFDD00" : "#FFA500"}
          />
        </TouchableOpacity>
      </View> */}

      <Text style={[styles.busStopsText, { color: '#fff' }]}>Nearby Buses</Text>

      <FlatList
        data={filteredBuses}
        renderItem={renderBusItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.busList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40, // Space for header
    backgroundColor: 'black',
    paddingBottom: 20,
  },
  darkMode: {
    backgroundColor: 'black', // Dark mode background
  },
  menuContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  menuButton: {
    backgroundColor: '#31473A',
    padding: 5,
    borderRadius: 50,
  },
  busStopsText: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 15,
    marginBottom: 5,
    marginTop:10
  },
  busList: {
    padding: 10,
  },
  busItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    marginVertical: 10,
    padding: 5,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  busIconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDEDED',
    borderRadius: 15,
    marginRight: 15,
  },
  busIcon: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
  busInfo: {
    flex: 1,
  },
  busName: {
    fontSize: 16,
    fontWeight: '700',
    color: ' #1b1716 ',
  },
  busText: {
    fontSize: 12,
    marginVertical: 5,
  },
  seatStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 10,
  },
  busArrow: {
    backgroundColor: '#580e1b',
    padding: 12,
    borderRadius: 30,
  },
});

export default HomeScreen;
