import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as Location from 'expo-location';
import axios from 'axios';
import Header from '../components/Header';
  import {db} from '../Firebase/firebase' 
import { collection, getDocs } from 'firebase/firestore';


const HomeScreen = ({ navigation }) => {
  const [weather, setWeather] = useState(null);
  const [locationDetails, setLocationDetails] = useState(null);
  const [selectedMode, setSelectedMode] = useState('HomeScreen'); // Default mode is 'home'
  const [buses, setBuses] = useState([]);

  const weatherIconMap = {
    Sunny: 'weather-sunny',
    'Partly cloudy': 'weather-partly-cloudy',
    Cloudy: 'weather-cloudy',
    Rain: 'weather-rainy',
    Thunderstorm: 'weather-lightning',
    Snow: 'weather-snowy',
    Fog: 'weather-fog',
  };

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'buses'));
        const busesList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setBuses(busesList);
      } catch (error) {
        console.error('Error fetching buses:', error);
        Alert.alert('Error', 'Failed to load bus data.');
      }
    };

    fetchBuses();
  }, []);


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

  

  const renderBusItem = ({ item }) => (
    <View style={styles.busItem}>
      <View style={styles.busIconContainer}>
        <Image source={require('../../assets/images/Main-logo.png')} style={styles.busIcon} />
      </View>
      <View style={styles.busInfo}>
            <Text style={styles.busText}>{item.bus_name}</Text>
            <Text style={styles.busText}>Bus Number: {item.bus_number}</Text>
            <Text style={styles.busText}>Status: {item.status}</Text>
        <Text style={[styles.seatStatus, getSeatStatusStyle(item.seatStatus)]}>
          {item.seatStatus}
        </Text>
      </View>
      <TouchableOpacity
  style={styles.busArrow}
  onPress={() => navigation.navigate('MapScreen', { bus: item })}
>
  <FontAwesome name="map-marker" size={20} color="#FFFFFF" />
</TouchableOpacity>
    </View>
  );

  const getSeatStatusStyle = (status) => {
    switch (status) {
      case 'Filled':
        return { color: '#D32F2F' }; // Red
      case 'Partially Filled':
        return { color: '#FFA000' }; // Orange
      case 'Available':
        return { color: '#34A853' }; // Green
      default:
        return { color: '#000' }; // Default color
    }
  };

  return (
    <View style={styles.container}>
      <Header
        weather={weather}
        locationDetails={locationDetails}
        weatherIconMap={weatherIconMap}
        selectedMode={selectedMode}
        onModeChange={setSelectedMode}
        navigation={navigation} // Pass navigation prop to Header
      />

      {/* Add Bus Stops Text */}
      <Text style={styles.busStopsText}>Buses</Text>

      <FlatList
        data={buses}
        renderItem={renderBusItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.busList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#31473A',
    paddingTop: 190, // Space for header
  },
  busStopsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginVertical: 10,
  },
  busList: {
    backgroundColor: '#31473A',
    padding: 10,
  },
  busItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginVertical: 8,
    padding: 10,
  },
  busIconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#C1C1C1',
    borderRadius: 8,
  },
  busIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  busInfo: {
    flex: 1,
    marginHorizontal: 10,
  },
  busName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  busRoute: {
    fontSize: 14,
    color: '#6F6F',
  },
  busTime: {
    fontSize: 14,
    color: '#34A853',
  },
  seatStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  busArrow: {
    backgroundColor: '#31473A',
    padding: 8,
    borderRadius: 8,
  },
});

export default HomeScreen;
