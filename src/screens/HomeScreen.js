import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, SafeAreaView, StatusBar, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as Location from 'expo-location';
import axios from 'axios';
import { db } from '../Firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Header from '../components/Header';

const HomeScreen = ({ navigation }) => {
  const [weather, setWeather] = useState(null);
  const [locationDetails, setLocationDetails] = useState(null);
  const [buses, setBuses] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedMode, setSelectedMode] = useState('HomeScreen');

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
    const interval = setInterval(fetchBuses, 60000);
    return () => clearInterval(interval);
  }, []);

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
      const relevantWords = Object.values(locationDetails)
        .join(' ')
        .toLowerCase()
        .replace(/,/g, '')
        .split(/\s+/);

      const filtered = buses.filter((bus) => {
        if (Array.isArray(bus.major_cities)) {
          const citiesArray = bus.major_cities.flatMap(city =>
            city.split(',').map(cityName => cityName.trim().toLowerCase())
          );

          return relevantWords.some(word => citiesArray.includes(word));
        }
        return false;
      });

      setFilteredBuses(filtered);
    }
  }, [locationDetails, buses]);

  const renderBusItem = ({ item }) => {
    return (
      <View style={[styles.busItemContainer, getOccupancyStyles(item.occupancy)]}>
        <View style={styles.busItemContent}>
          <TouchableOpacity
            style={styles.busArrow}
            onPress={() => navigation.navigate('MapScreen', { busId: item.id, busName: item.bus_name })}
          >
            <FontAwesome name="map-marker" size={30} color="white" />
          </TouchableOpacity>
          <View style={styles.busInfo}>
            <Text style={styles.busName}>{item.bus_name}</Text>
            <Text style={styles.busText}>Bus Number: {item.bus_number}</Text>
            <Text style={styles.busText}>Route: {item.route}</Text>
            <Text style={styles.seatStatus}>{item.occupancy}</Text>
          </View>
        </View>
      </View>
    );
  };

  const getOccupancyStyles = (occupancy) => {
    switch (occupancy) {
      case 'Overcrowded':
        return { backgroundColor: 'red' };
      case 'Fully Seated':
        return { backgroundColor: '#42a7eb' };
      case 'Less Busy':
        return { backgroundColor: 'green' };
      default:
        return { backgroundColor: 'gray' };
    }
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <Header
        weather={weather}
        locationDetails={locationDetails}
        weatherIconMap={weatherIconMap}
        selectedMode={selectedMode}
        onModeChange={setSelectedMode}
        navigation={navigation}
      />
      <Text style={styles.busStopsText}>Nearby Buses</Text>

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
    paddingTop: 40,
    backgroundColor: 'white',
    paddingBottom: 20,
  },
  busStopsText: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 15,
    marginBottom: 5,
    marginTop: 10,
    color: 'black',
  },
  busList: {
    padding: 10,
  },
  busItemContainer: {
    borderRadius: 15,
    marginVertical: 10,
    padding: 10,
    overflow: 'hidden',
  },
  busItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 15,
  },
  busInfo: {
    flex: 1,
  },
  busName: {
    fontSize: 16,
    fontWeight: '900',
    color: 'white',
  },
  busText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  seatStatus: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  busArrow: {
    padding: 10,
    marginRight: 30,
  },
});

export default HomeScreen;
